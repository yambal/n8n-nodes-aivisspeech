import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../helpers';
import { AudioQuery } from '../types';

/** per-textオーバーライド可能なAudioQueryパラメータ */
interface AudioQueryOverrides {
	speedScale?: number;
	pitchScale?: number;
	intonationScale?: number;
	volumeScale?: number;
	prePhonemeLength?: number;
	postPhonemeLength?: number;
}

/** AudioQueryパラメータをノードパラメータで上書きする */
function applyAudioQueryParams(
	audioQuery: AudioQuery,
	executeFunctions: IExecuteFunctions,
	itemIndex: number,
	overrides?: AudioQueryOverrides,
): void {
	audioQuery.speedScale = overrides?.speedScale ?? executeFunctions.getNodeParameter('speedScale', itemIndex) as number;
	audioQuery.pitchScale = overrides?.pitchScale ?? executeFunctions.getNodeParameter('pitchScale', itemIndex) as number;
	audioQuery.intonationScale = overrides?.intonationScale ?? executeFunctions.getNodeParameter('intonationScale', itemIndex) as number;
	audioQuery.volumeScale = overrides?.volumeScale ?? executeFunctions.getNodeParameter('volumeScale', itemIndex) as number;
	audioQuery.prePhonemeLength = overrides?.prePhonemeLength ?? executeFunctions.getNodeParameter('prePhonemeLength', itemIndex) as number;
	audioQuery.postPhonemeLength = overrides?.postPhonemeLength ?? executeFunctions.getNodeParameter('postPhonemeLength', itemIndex) as number;
	audioQuery.outputSamplingRate = executeFunctions.getNodeParameter('outputSamplingRate', itemIndex) as number;
	audioQuery.outputStereo = executeFunctions.getNodeParameter('outputStereo', itemIndex) as boolean;
}

export async function synthesize(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const text = executeFunctions.getNodeParameter('text', itemIndex) as string;
	const speakerId = executeFunctions.getNodeParameter('speakerId', itemIndex) as number;
	const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;

	// Step 1: AudioQuery取得
	const queryResponse = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
		{ method: 'POST' },
		itemIndex,
		'AudioQuery取得に失敗しました',
	);
	const audioQuery = (await queryResponse.json()) as AudioQuery;

	// AudioQueryパラメータを上書き
	applyAudioQueryParams(audioQuery, executeFunctions, itemIndex);

	// Step 2: 音声合成
	const synthesisResponse = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/synthesis?speaker=${speakerId}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(audioQuery),
		},
		itemIndex,
		'音声合成に失敗しました',
	);

	const buffer = Buffer.from(await synthesisResponse.arrayBuffer());
	const binaryData = await executeFunctions.helpers.prepareBinaryData(buffer, `tts_${Date.now()}.wav`, 'audio/wav');

	return {
		json: { success: true, text, speakerId },
		binary: { [binaryPropertyName]: binaryData },
	};
}

export async function audioQuery(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const text = executeFunctions.getNodeParameter('text', itemIndex) as string;
	const speakerId = executeFunctions.getNodeParameter('speakerId', itemIndex) as number;

	const response = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
		{ method: 'POST' },
		itemIndex,
		'AudioQuery取得に失敗しました',
	);
	const query = (await response.json()) as AudioQuery;

	return { json: { audioQuery: query, text, speakerId } };
}

export async function synthesisFromQuery(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const speakerId = executeFunctions.getNodeParameter('speakerId', itemIndex) as number;
	const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const audioQueryJson = executeFunctions.getNodeParameter('audioQueryJson', itemIndex) as object;

	const response = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/synthesis?speaker=${speakerId}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(audioQueryJson),
		},
		itemIndex,
		'音声合成に失敗しました',
	);

	const buffer = Buffer.from(await response.arrayBuffer());
	const binaryData = await executeFunctions.helpers.prepareBinaryData(buffer, `tts_${Date.now()}.wav`, 'audio/wav');

	return {
		json: { success: true, speakerId },
		binary: { [binaryPropertyName]: binaryData },
	};
}

interface TextItem {
	text: string;
	speakerId?: number;
	speedScale?: number;
	pitchScale?: number;
	intonationScale?: number;
	volumeScale?: number;
	prePhonemeLength?: number;
	postPhonemeLength?: number;
}

export async function multiSynthesize(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const baseSpeakerId = executeFunctions.getNodeParameter('speakerId', itemIndex) as number;
	const binaryPropertyName = executeFunctions.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const inputMode = executeFunctions.getNodeParameter('inputMode', itemIndex) as string;
	const baseAudioParams = executeFunctions.getNodeParameter('baseAudioParams', itemIndex, {}) as AudioQueryOverrides;

	// テキスト一覧を取得
	let textItems: TextItem[];
	if (inputMode === 'gui') {
		const textsData = executeFunctions.getNodeParameter('texts', itemIndex) as {
			textItems?: Array<{
				text: string;
				overrides?: AudioQueryOverrides & { speakerId?: number };
			}>;
		};
		textItems = (textsData.textItems ?? []).map((item) => ({
			text: item.text,
			speakerId: item.overrides?.speakerId,
			...item.overrides,
		}));
	} else {
		const jsonInput = executeFunctions.getNodeParameter('textsJson', itemIndex) as TextItem[];
		textItems = jsonInput.map((item) => ({
			text: item.text,
			speakerId: item.speakerId,
			speedScale: item.speedScale,
			pitchScale: item.pitchScale,
			intonationScale: item.intonationScale,
			volumeScale: item.volumeScale,
			prePhonemeLength: item.prePhonemeLength,
			postPhonemeLength: item.postPhonemeLength,
		}));
	}

	// 各テキストを合成してWAVバッファを収集
	const wavBase64List: string[] = [];
	for (const item of textItems) {
		const speakerId = item.speakerId ?? baseSpeakerId;

		// AudioQuery取得
		const queryResponse = await apiRequest(
			executeFunctions.getNode(),
			baseUrl,
			`/audio_query?text=${encodeURIComponent(item.text)}&speaker=${speakerId}`,
			{ method: 'POST' },
			itemIndex,
			`AudioQuery取得に失敗しました: ${item.text}`,
		);
		const audioQuery = (await queryResponse.json()) as AudioQuery;

		// AudioQueryパラメータを上書き（per-text > ベース設定 > APIデフォルト）
		audioQuery.speedScale = item.speedScale ?? baseAudioParams.speedScale ?? audioQuery.speedScale;
		audioQuery.pitchScale = item.pitchScale ?? baseAudioParams.pitchScale ?? audioQuery.pitchScale;
		audioQuery.intonationScale = item.intonationScale ?? baseAudioParams.intonationScale ?? audioQuery.intonationScale;
		audioQuery.volumeScale = item.volumeScale ?? baseAudioParams.volumeScale ?? audioQuery.volumeScale;
		audioQuery.prePhonemeLength = item.prePhonemeLength ?? baseAudioParams.prePhonemeLength ?? audioQuery.prePhonemeLength;
		audioQuery.postPhonemeLength = item.postPhonemeLength ?? baseAudioParams.postPhonemeLength ?? audioQuery.postPhonemeLength;
		audioQuery.outputSamplingRate = executeFunctions.getNodeParameter('outputSamplingRate', itemIndex) as number;
		audioQuery.outputStereo = executeFunctions.getNodeParameter('outputStereo', itemIndex) as boolean;

		// 音声合成
		const synthesisResponse = await apiRequest(
			executeFunctions.getNode(),
			baseUrl,
			`/synthesis?speaker=${speakerId}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(audioQuery),
			},
			itemIndex,
			`音声合成に失敗しました: ${item.text}`,
		);

		const buffer = Buffer.from(await synthesisResponse.arrayBuffer());
		wavBase64List.push(buffer.toString('base64'));
	}

	// /connect_waves で連結
	const connectResponse = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		'/connect_waves',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(wavBase64List),
		},
		itemIndex,
		'WAV結合に失敗しました',
	);

	const concatenatedBuffer = Buffer.from(await connectResponse.arrayBuffer());
	const binaryData = await executeFunctions.helpers.prepareBinaryData(
		concatenatedBuffer,
		`tts_multi_${Date.now()}.wav`,
		'audio/wav',
	);

	return {
		json: { success: true, textCount: textItems.length, speakerId: baseSpeakerId },
		binary: { [binaryPropertyName]: binaryData },
	};
}
