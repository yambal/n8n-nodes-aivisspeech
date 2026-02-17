import { INodeProperties } from 'n8n-workflow';

export const synthesisProperties: INodeProperties[] = [
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
		displayName: 'ベース話者ID',
		name: 'speakerId',
		type: 'number',
		default: 888753760,
		required: true,
		displayOptions: {
			show: {
				operation: ['multiSynthesis'],
			},
		},
		description: 'ベースの話者スタイルID（個別設定がないテキストはこのIDを使用）',
	},
	{
		displayName: 'ベース音声設定',
		name: 'baseAudioParams',
		type: 'collection',
		default: {},
		placeholder: 'ベース設定を追加',
		displayOptions: {
			show: {
				operation: ['multiSynthesis'],
			},
		},
		description: '全テキスト共通のベース音声設定。個別設定がないテキストはこの値を使用',
		options: [
			{
				displayName: 'ベース話速',
				name: 'speedScale',
				type: 'number',
				default: 1.0,
				typeOptions: { minValue: 0.5, maxValue: 2.0, numberStepSize: 0.1 },
				description: 'ベースの話す速さ（0.5〜2.0、デフォルト: 1.0）',
			},
			{
				displayName: 'ベース音高',
				name: 'pitchScale',
				type: 'number',
				default: 0.0,
				typeOptions: { minValue: -0.15, maxValue: 0.15, numberStepSize: 0.01 },
				description: 'ベースの声の高さ（-0.15〜0.15、デフォルト: 0.0）',
			},
			{
				displayName: 'ベース抑揚',
				name: 'intonationScale',
				type: 'number',
				default: 1.0,
				typeOptions: { minValue: 0.0, maxValue: 2.0, numberStepSize: 0.1 },
				description: 'ベースの抑揚の強さ（0.0〜2.0、デフォルト: 1.0）',
			},
			{
				displayName: 'ベース音量',
				name: 'volumeScale',
				type: 'number',
				default: 1.0,
				typeOptions: { minValue: 0.0, maxValue: 2.0, numberStepSize: 0.1 },
				description: 'ベースの音量（0.0〜2.0、デフォルト: 1.0）',
			},
			{
				displayName: 'ベース開始無音',
				name: 'prePhonemeLength',
				type: 'number',
				default: 0.1,
				typeOptions: { minValue: 0.0, maxValue: 1.5, numberStepSize: 0.1 },
				description: 'ベースの音声開始前の無音の長さ（秒、デフォルト: 0.1）',
			},
			{
				displayName: 'ベース終了無音',
				name: 'postPhonemeLength',
				type: 'number',
				default: 0.1,
				typeOptions: { minValue: 0.0, maxValue: 1.5, numberStepSize: 0.1 },
				description: 'ベースの音声終了後の無音の長さ（秒、デフォルト: 0.1）',
			},
		],
	},
	{
		displayName: 'バイナリプロパティ名',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				operation: ['synthesize', 'synthesisFromQuery', 'multiSynthesis'],
			},
		},
		description: 'バイナリ出力のプロパティ名（後続ノードで $binary.この名前 で参照）',
	},
	// multiSynthesis 専用パラメータ
	{
		displayName: '入力方式',
		name: 'inputMode',
		type: 'options',
		options: [
			{ name: 'GUI入力', value: 'gui' },
			{ name: 'JSON入力', value: 'json' },
		],
		default: 'gui',
		displayOptions: {
			show: {
				operation: ['multiSynthesis'],
			},
		},
		description: 'テキスト一覧の入力方式',
	},
	{
		displayName: 'テキスト一覧',
		name: 'texts',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		displayOptions: {
			show: {
				operation: ['multiSynthesis'],
				inputMode: ['gui'],
			},
		},
		description: '合成するテキストの一覧',
		options: [
			{
				displayName: 'テキスト',
				name: 'textItems',
				values: [
					{
						displayName: 'テキスト',
						name: 'text',
						type: 'string',
						default: '',
						required: true,
						description: '読み上げるテキスト',
					},
					{
						displayName: '個別設定',
						name: 'overrides',
						type: 'collection',
						default: {},
						placeholder: '個別設定を追加',
						options: [
							{
								displayName: '話者ID',
								name: 'speakerId',
								type: 'number',
								default: 888753760,
								description: '個別の話者ID。未設定の場合はベースの話者IDを使用',
							},
							{
								displayName: '話速',
								name: 'speedScale',
								type: 'number',
								default: 1.0,
								typeOptions: { minValue: 0.5, maxValue: 2.0, numberStepSize: 0.1 },
								description: '個別の話速。未設定の場合はベースの値を使用',
							},
							{
								displayName: '音高',
								name: 'pitchScale',
								type: 'number',
								default: 0.0,
								typeOptions: { minValue: -0.15, maxValue: 0.15, numberStepSize: 0.01 },
								description: '個別の音高。未設定の場合はベースの値を使用',
							},
							{
								displayName: '抑揚',
								name: 'intonationScale',
								type: 'number',
								default: 1.0,
								typeOptions: { minValue: 0.0, maxValue: 2.0, numberStepSize: 0.1 },
								description: '個別の抑揚。未設定の場合はベースの値を使用',
							},
							{
								displayName: '音量',
								name: 'volumeScale',
								type: 'number',
								default: 1.0,
								typeOptions: { minValue: 0.0, maxValue: 2.0, numberStepSize: 0.1 },
								description: '個別の音量。未設定の場合はベースの値を使用',
							},
							{
								displayName: '開始無音',
								name: 'prePhonemeLength',
								type: 'number',
								default: 0.1,
								typeOptions: { minValue: 0.0, maxValue: 1.5, numberStepSize: 0.1 },
								description: '個別の開始無音（秒）。未設定の場合はベースの値を使用',
							},
							{
								displayName: '終了無音',
								name: 'postPhonemeLength',
								type: 'number',
								default: 0.1,
								typeOptions: { minValue: 0.0, maxValue: 1.5, numberStepSize: 0.1 },
								description: '個別の終了無音（秒）。未設定の場合はベースの値を使用',
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'テキスト一覧 (JSON)',
		name: 'textsJson',
		type: 'json',
		default: '[\n  { "text": "テキスト1" },\n  { "text": "テキスト2" }\n]',
		required: true,
		displayOptions: {
			show: {
				operation: ['multiSynthesis'],
				inputMode: ['json'],
			},
		},
		description: 'テキスト一覧のJSON配列。各要素: { "text": "...", "speakerId"?: 数値, "speedScale"?: 数値, "pitchScale"?: 数値, "intonationScale"?: 数値, "volumeScale"?: 数値, "prePhonemeLength"?: 数値, "postPhonemeLength"?: 数値 }',
	},
	// AudioQueryパラメータ（音声合成簡略用オプション）
	{
		displayName: '音声設定',
		name: 'audioParams',
		type: 'collection',
		default: {},
		placeholder: '設定を追加',
		displayOptions: {
			show: {
				operation: ['synthesize'],
			},
		},
		description: '音声のパラメータ設定。未設定の場合はAPIデフォルト値を使用',
		options: [
			{
				displayName: '話速',
				name: 'speedScale',
				type: 'number',
				default: 1.0,
				typeOptions: { minValue: 0.5, maxValue: 2.0, numberStepSize: 0.1 },
				description: '話す速さ（0.5〜2.0、デフォルト: 1.0）',
			},
			{
				displayName: '音高',
				name: 'pitchScale',
				type: 'number',
				default: 0.0,
				typeOptions: { minValue: -0.15, maxValue: 0.15, numberStepSize: 0.01 },
				description: '声の高さ（-0.15〜0.15、デフォルト: 0.0）',
			},
			{
				displayName: '抑揚',
				name: 'intonationScale',
				type: 'number',
				default: 1.0,
				typeOptions: { minValue: 0.0, maxValue: 2.0, numberStepSize: 0.1 },
				description: '抑揚の強さ（0.0〜2.0、デフォルト: 1.0）',
			},
			{
				displayName: '音量',
				name: 'volumeScale',
				type: 'number',
				default: 1.0,
				typeOptions: { minValue: 0.0, maxValue: 2.0, numberStepSize: 0.1 },
				description: '音量（0.0〜2.0、デフォルト: 1.0）',
			},
			{
				displayName: '開始無音',
				name: 'prePhonemeLength',
				type: 'number',
				default: 0.1,
				typeOptions: { minValue: 0.0, maxValue: 1.5, numberStepSize: 0.1 },
				description: '音声開始前の無音の長さ（秒、デフォルト: 0.1）',
			},
			{
				displayName: '終了無音',
				name: 'postPhonemeLength',
				type: 'number',
				default: 0.1,
				typeOptions: { minValue: 0.0, maxValue: 1.5, numberStepSize: 0.1 },
				description: '音声終了後の無音の長さ（秒、デフォルト: 0.1）',
			},
		],
	},
	{
		displayName: 'ステレオ出力',
		name: 'outputStereo',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: ['synthesize', 'multiSynthesis'],
			},
		},
		description: 'ステレオ（2ch）で出力するか（デフォルト: モノラル）',
	},
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
];
