import { INodeProperties } from 'n8n-workflow';

export const userDictProperties: INodeProperties[] = [
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
];
