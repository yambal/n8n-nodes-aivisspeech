import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, resolveFilename } from '../helpers';
import { AudioQuery } from '../types';

export async function synthesize(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const text = executeFunctions.getNodeParameter('text', itemIndex) as string;
	const speakerId = executeFunctions.getNodeParameter('speakerId', itemIndex) as number;
	const filename = resolveFilename(
		executeFunctions.getNodeParameter('filename', itemIndex) as string,
	);

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
	audioQuery.speedScale = executeFunctions.getNodeParameter('speedScale', itemIndex) as number;
	audioQuery.pitchScale = executeFunctions.getNodeParameter('pitchScale', itemIndex) as number;
	audioQuery.intonationScale = executeFunctions.getNodeParameter('intonationScale', itemIndex) as number;
	audioQuery.volumeScale = executeFunctions.getNodeParameter('volumeScale', itemIndex) as number;
	audioQuery.prePhonemeLength = executeFunctions.getNodeParameter('prePhonemeLength', itemIndex) as number;
	audioQuery.postPhonemeLength = executeFunctions.getNodeParameter('postPhonemeLength', itemIndex) as number;
	audioQuery.outputSamplingRate = executeFunctions.getNodeParameter('outputSamplingRate', itemIndex) as number;
	audioQuery.outputStereo = executeFunctions.getNodeParameter('outputStereo', itemIndex) as boolean;

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
	const binaryData = await executeFunctions.helpers.prepareBinaryData(buffer, filename, 'audio/wav');

	return {
		json: { success: true, text, speakerId },
		binary: { data: binaryData },
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
	const filename = resolveFilename(
		executeFunctions.getNodeParameter('filename', itemIndex) as string,
	);
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
	const binaryData = await executeFunctions.helpers.prepareBinaryData(buffer, filename, 'audio/wav');

	return {
		json: { success: true, speakerId },
		binary: { data: binaryData },
	};
}
