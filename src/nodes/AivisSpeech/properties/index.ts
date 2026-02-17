import { INodeProperties } from 'n8n-workflow';
import { speakersProperties } from './speakers.properties';
import { synthesisProperties } from './synthesis.properties';
import { userDictProperties } from './userDict.properties';

const operationProperty: INodeProperties = {
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
};

export const nodeProperties: INodeProperties[] = [
	operationProperty,
	...speakersProperties,
	...synthesisProperties,
	...userDictProperties,
];
