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
		displayName: 'バイナリ名',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: ['synthesize', 'synthesisFromQuery'],
			},
		},
		description: 'バイナリ出力のファイル名（空の場合は自動生成）',
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
