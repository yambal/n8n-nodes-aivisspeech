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

interface UserDictWord {
	surface: string;
	pronunciation: string;
	accent_type: number;
	word_type?: string;
	priority?: number;
}

interface UserDict {
	[uuid: string]: UserDictWord;
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
						name: '音声合成（簡略）',
						value: 'synthesize',
						description: 'テキストから音声を合成（AudioQuery取得と合成を自動実行）',
						action: 'テキストから音声を合成',
					},
					{
						name: 'AudioQuery取得',
						value: 'audioQuery',
						description: 'テキストからAudioQuery（読み方・アクセント情報）を取得',
						action: 'AudioQueryを取得',
					},
					{
						name: '音声合成（AudioQueryから）',
						value: 'synthesisFromQuery',
						description: 'AudioQueryから音声を合成',
						action: 'AudioQueryから音声を合成',
					},
					{
						name: 'ユーザー辞書一覧取得',
						value: 'getUserDict',
						description: 'ユーザー辞書に登録されている単語一覧を取得',
						action: 'ユーザー辞書一覧を取得',
					},
					{
						name: 'ユーザー辞書単語追加',
						value: 'addUserDictWord',
						description: 'ユーザー辞書に単語を追加',
						action: 'ユーザー辞書に単語を追加',
					},
					{
						name: 'ユーザー辞書単語更新',
						value: 'updateUserDictWord',
						description: 'ユーザー辞書の単語を更新',
						action: 'ユーザー辞書の単語を更新',
					},
					{
						name: 'ユーザー辞書単語削除',
						value: 'deleteUserDictWord',
						description: 'ユーザー辞書から単語を削除',
						action: 'ユーザー辞書から単語を削除',
					},
				],
				default: 'synthesize',
			},
			// 音声合成（簡略）用パラメータ
			{
				displayName: 'テキスト',
				name: 'text',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['synthesize', 'audioQuery'],
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
						operation: ['synthesize', 'audioQuery', 'synthesisFromQuery'],
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
						operation: ['synthesize', 'synthesisFromQuery'],
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
						operation: ['synthesize', 'synthesisFromQuery'],
					},
				},
				description: '出力ファイル名（空の場合は自動生成）',
			},
			// AudioQueryから音声合成用パラメータ
			{
				displayName: 'AudioQuery (JSON)',
				name: 'audioQueryJson',
				type: 'json',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['synthesisFromQuery'],
					},
				},
				description: 'AudioQuery取得で得たJSONデータ',
			},
			// ユーザー辞書用パラメータ
			{
				displayName: '単語UUID',
				name: 'wordUuid',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['updateUserDictWord', 'deleteUserDictWord'],
					},
				},
				description: '更新・削除対象の単語UUID',
			},
			{
				displayName: '表記',
				name: 'surface',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['addUserDictWord', 'updateUserDictWord'],
					},
				},
				description: '単語の表記（例: 東京）',
			},
			{
				displayName: '読み（カタカナ）',
				name: 'pronunciation',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['addUserDictWord', 'updateUserDictWord'],
					},
				},
				description: '単語の読み（カタカナ、例: トウキョウ）',
			},
			{
				displayName: 'アクセント型',
				name: 'accentType',
				type: 'number',
				default: 0,
				typeOptions: {
					minValue: 0,
				},
				displayOptions: {
					show: {
						operation: ['addUserDictWord', 'updateUserDictWord'],
					},
				},
				description: 'アクセント核の位置（0から読みのモーラ数まで）',
				hint: '0=平板型（下がらない）、1以上=そのモーラで音が下がる。モーラは拍の単位（例: トウキョウ=4モーラ、ト・ウ・キョ・ウ）。「ん」「ー」「っ」も1モーラ。',
			},
			{
				displayName: '単語の種類',
				name: 'wordType',
				type: 'options',
				options: [
					{ name: '固有名詞', value: 'PROPER_NOUN' },
					{ name: '普通名詞', value: 'COMMON_NOUN' },
					{ name: '動詞', value: 'VERB' },
					{ name: '形容詞', value: 'ADJECTIVE' },
					{ name: '接尾辞', value: 'SUFFIX' },
				],
				default: 'PROPER_NOUN',
				displayOptions: {
					show: {
						operation: ['addUserDictWord', 'updateUserDictWord'],
					},
				},
				description: '単語の品詞',
			},
			{
				displayName: '優先度',
				name: 'priority',
				type: 'number',
				default: 5,
				typeOptions: {
					minValue: 0,
					maxValue: 10,
				},
				displayOptions: {
					show: {
						operation: ['addUserDictWord', 'updateUserDictWord'],
					},
				},
				description: '単語の優先度（0-10、高いほど優先）',
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
				} else if (operation === 'audioQuery') {
					// AudioQuery取得のみ
					const text = this.getNodeParameter('text', i) as string;
					const speakerId = this.getNodeParameter('speakerId', i) as number;

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

					returnData.push({
						json: {
							audioQuery,
							text,
							speakerId,
						},
					});
				} else if (operation === 'synthesisFromQuery') {
					// AudioQueryから音声合成
					const speakerId = this.getNodeParameter('speakerId', i) as number;
					const outputDir = this.getNodeParameter('outputDir', i) as string;
					let filename = this.getNodeParameter('filename', i) as string;
					const audioQueryJson = this.getNodeParameter('audioQueryJson', i) as object;

					if (!filename) {
						filename = `tts_${Date.now()}.wav`;
					}
					if (!filename.endsWith('.wav')) {
						filename += '.wav';
					}

					const synthesisUrl = `${baseUrl}/synthesis?speaker=${speakerId}`;
					const synthesisResponse = await fetch(synthesisUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(audioQueryJson),
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

					await fs.mkdir(outputDir, { recursive: true });
					await fs.writeFile(filePath, Buffer.from(audioBuffer));

					returnData.push({
						json: {
							success: true,
							filePath,
							speakerId,
						},
					});
				} else if (operation === 'getUserDict') {
					// ユーザー辞書一覧取得
					const response = await fetch(`${baseUrl}/user_dict`);
					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${response.status}: ユーザー辞書の取得に失敗しました`,
							{ itemIndex: i }
						);
					}
					const userDict = (await response.json()) as UserDict;

					returnData.push({
						json: {
							userDict,
						},
					});
				} else if (operation === 'addUserDictWord') {
					// ユーザー辞書単語追加
					const surface = this.getNodeParameter('surface', i) as string;
					const pronunciation = this.getNodeParameter('pronunciation', i) as string;
					const accentType = this.getNodeParameter('accentType', i) as number;
					const wordType = this.getNodeParameter('wordType', i) as string;
					const priority = this.getNodeParameter('priority', i) as number;

					const params = new URLSearchParams({
						surface,
						pronunciation,
						accent_type: accentType.toString(),
						word_type: wordType,
						priority: priority.toString(),
					});

					const response = await fetch(`${baseUrl}/user_dict_word?${params.toString()}`, {
						method: 'POST',
					});
					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${response.status}: 単語の追加に失敗しました`,
							{ itemIndex: i }
						);
					}
					const wordUuid = (await response.json()) as string;

					returnData.push({
						json: {
							success: true,
							wordUuid,
							surface,
							pronunciation,
						},
					});
				} else if (operation === 'updateUserDictWord') {
					// ユーザー辞書単語更新
					const wordUuid = this.getNodeParameter('wordUuid', i) as string;
					const surface = this.getNodeParameter('surface', i) as string;
					const pronunciation = this.getNodeParameter('pronunciation', i) as string;
					const accentType = this.getNodeParameter('accentType', i) as number;
					const wordType = this.getNodeParameter('wordType', i) as string;
					const priority = this.getNodeParameter('priority', i) as number;

					const params = new URLSearchParams({
						surface,
						pronunciation,
						accent_type: accentType.toString(),
						word_type: wordType,
						priority: priority.toString(),
					});

					const response = await fetch(`${baseUrl}/user_dict_word/${wordUuid}?${params.toString()}`, {
						method: 'PUT',
					});
					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${response.status}: 単語の更新に失敗しました`,
							{ itemIndex: i }
						);
					}

					returnData.push({
						json: {
							success: true,
							wordUuid,
							surface,
							pronunciation,
						},
					});
				} else if (operation === 'deleteUserDictWord') {
					// ユーザー辞書単語削除
					const wordUuid = this.getNodeParameter('wordUuid', i) as string;

					const response = await fetch(`${baseUrl}/user_dict_word/${wordUuid}`, {
						method: 'DELETE',
					});
					if (!response.ok) {
						throw new NodeOperationError(
							this.getNode(),
							`HTTP ${response.status}: 単語の削除に失敗しました`,
							{ itemIndex: i }
						);
					}

					returnData.push({
						json: {
							success: true,
							wordUuid,
							deleted: true,
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
