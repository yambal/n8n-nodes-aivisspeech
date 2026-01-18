import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Speaker {
	name: string;
	speaker_uuid: string;
	styles: Array<{
		name: string;
		id: number;
		type: string;
	}>;
	version: string;
}

interface AudioQuery {
	accent_phrases: unknown[];
	speedScale: number;
	pitchScale: number;
	intonationScale: number;
	volumeScale: number;
	prePhonemeLength: number;
	postPhonemeLength: number;
	outputSamplingRate: number;
	outputStereo: boolean;
	kana: string;
}

export class AivisSpeech implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AivisSpeech',
		name: 'aivisSpeech',
		icon: 'file:aivisspeech.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'AivisSpeech (VOICEVOX互換) テキスト読み上げ',
		defaults: {
			name: 'AivisSpeech',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'aivisSpeechApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: '操作',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '話者一覧取得',
						value: 'getSpeakers',
						description: '利用可能な話者の一覧を取得',
						action: '話者一覧を取得',
					},
					{
						name: '音声合成',
						value: 'synthesize',
						description: 'テキストから音声を合成',
						action: 'テキストから音声を合成',
					},
				],
				default: 'synthesize',
			},
			// 音声合成用パラメータ
			{
				displayName: 'テキスト',
				name: 'text',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				description: '読み上げるテキスト',
			},
			{
				displayName: '話者ID',
				name: 'speakerId',
				type: 'number',
				default: 888753760,
				required: true,
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				description: '話者のスタイルID（話者一覧取得で確認可能）',
			},
			{
				displayName: '出力ディレクトリ',
				name: 'outputDir',
				type: 'string',
				default: '/workspace/tts',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				description: 'WAVファイルの保存先ディレクトリ',
			},
			{
				displayName: 'ファイル名',
				name: 'filename',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['synthesize'],
					},
				},
				description: '出力ファイル名（空の場合は自動生成）',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('aivisSpeechApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'getSpeakers') {
					const response = await fetch(`${baseUrl}/speakers`);
					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${response.status}: 話者一覧の取得に失敗しました`,
							{ itemIndex: i }
						);
					}
					const speakers = (await response.json()) as Speaker[];

					// 話者情報を整形
					const formattedSpeakers = speakers.map((speaker) => ({
						name: speaker.name,
						uuid: speaker.speaker_uuid,
						styles: speaker.styles.map((style) => ({
							name: style.name,
							id: style.id,
							type: style.type,
						})),
					}));

					returnData.push({
						json: {
							speakers: formattedSpeakers,
						},
					});
				} else if (operation === 'synthesize') {
					const text = this.getNodeParameter('text', i) as string;
					const speakerId = this.getNodeParameter('speakerId', i) as number;
					const outputDir = this.getNodeParameter('outputDir', i) as string;
					let filename = this.getNodeParameter('filename', i) as string;

					if (!filename) {
						filename = `tts_${Date.now()}.wav`;
					}
					if (!filename.endsWith('.wav')) {
						filename += '.wav';
					}

					// Step 1: AudioQuery取得
					const queryUrl = `${baseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`;
					const queryResponse = await fetch(queryUrl, { method: 'POST' });
					if (!queryResponse.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${queryResponse.status}: AudioQuery取得に失敗しました`,
							{ itemIndex: i }
						);
					}
					const audioQuery = (await queryResponse.json()) as AudioQuery;

					// Step 2: 音声合成
					const synthesisUrl = `${baseUrl}/synthesis?speaker=${speakerId}`;
					const synthesisResponse = await fetch(synthesisUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(audioQuery),
					});
					if (!synthesisResponse.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${synthesisResponse.status}: 音声合成に失敗しました`,
							{ itemIndex: i }
						);
					}

					// WAVデータを取得してファイルに保存
					const audioBuffer = await synthesisResponse.arrayBuffer();
					const filePath = path.join(outputDir, filename);

					// ディレクトリが存在しない場合は作成
					await fs.mkdir(outputDir, { recursive: true });
					await fs.writeFile(filePath, Buffer.from(audioBuffer));

					returnData.push({
						json: {
							success: true,
							filePath,
							text,
							speakerId,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
