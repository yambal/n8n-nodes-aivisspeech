import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../helpers';
import { UserDict } from '../types';

export async function getUserDict(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const response = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		'/user_dict',
		{},
		itemIndex,
		'ユーザー辞書の取得に失敗しました',
	);
	const userDict = (await response.json()) as UserDict;

	return { json: { userDict } };
}

export async function addUserDictWord(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const surface = executeFunctions.getNodeParameter('surface', itemIndex) as string;
	const pronunciation = executeFunctions.getNodeParameter('pronunciation', itemIndex) as string;
	const accentType = executeFunctions.getNodeParameter('accentType', itemIndex) as number;
	const wordType = executeFunctions.getNodeParameter('wordType', itemIndex) as string;
	const priority = executeFunctions.getNodeParameter('priority', itemIndex) as number;

	const params = new URLSearchParams({
		surface,
		pronunciation,
		accent_type: accentType.toString(),
		word_type: wordType,
		priority: priority.toString(),
	});

	const response = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/user_dict_word?${params.toString()}`,
		{ method: 'POST' },
		itemIndex,
		'単語の追加に失敗しました',
	);
	const wordUuid = (await response.json()) as string;

	return { json: { success: true, wordUuid, surface, pronunciation } };
}

export async function updateUserDictWord(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const wordUuid = executeFunctions.getNodeParameter('wordUuid', itemIndex) as string;
	const surface = executeFunctions.getNodeParameter('surface', itemIndex) as string;
	const pronunciation = executeFunctions.getNodeParameter('pronunciation', itemIndex) as string;
	const accentType = executeFunctions.getNodeParameter('accentType', itemIndex) as number;
	const wordType = executeFunctions.getNodeParameter('wordType', itemIndex) as string;
	const priority = executeFunctions.getNodeParameter('priority', itemIndex) as number;

	const params = new URLSearchParams({
		surface,
		pronunciation,
		accent_type: accentType.toString(),
		word_type: wordType,
		priority: priority.toString(),
	});

	await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/user_dict_word/${wordUuid}?${params.toString()}`,
		{ method: 'PUT' },
		itemIndex,
		'単語の更新に失敗しました',
	);

	return { json: { success: true, wordUuid, surface, pronunciation } };
}

export async function deleteUserDictWord(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const wordUuid = executeFunctions.getNodeParameter('wordUuid', itemIndex) as string;

	await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		`/user_dict_word/${wordUuid}`,
		{ method: 'DELETE' },
		itemIndex,
		'単語の削除に失敗しました',
	);

	return { json: { success: true, wordUuid, deleted: true } };
}
