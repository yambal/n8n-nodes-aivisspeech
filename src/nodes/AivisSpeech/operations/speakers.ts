import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest } from '../helpers';
import { Speaker } from '../types';

export async function getSpeakers(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const response = await apiRequest(
		executeFunctions.getNode(),
		baseUrl,
		'/speakers',
		{},
		itemIndex,
		'話者一覧の取得に失敗しました',
	);
	const speakers = (await response.json()) as Speaker[];

	const formattedSpeakers = speakers.map((speaker) => ({
		name: speaker.name,
		uuid: speaker.speaker_uuid,
		styles: speaker.styles.map((style) => ({
			name: style.name,
			id: style.id,
			type: style.type,
		})),
	}));

	return { json: { speakers: formattedSpeakers } };
}
