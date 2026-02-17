import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, saveWavFile, resolveFilename } from '../helpers';
import { AudioQuery } from '../types';

export async function synthesize(
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
): Promise<INodeExecutionData> {
	const text = executeFunctions.getNodeParameter('text', itemIndex) as string;
	const speakerId = executeFunctions.getNodeParameter('speakerId', itemIndex) as number;
	const outputDir = executeFunctions.getNodeParameter('outputDir', itemIndex) as string;
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

	const audioBuffer = await synthesisResponse.arrayBuffer();
	const filePath = await saveWavFile(outputDir, filename, audioBuffer);

	return { json: { success: true, filePath, text, speakerId } };
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
	const outputDir = executeFunctions.getNodeParameter('outputDir', itemIndex) as string;
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

	const audioBuffer = await response.arrayBuffer();
	const filePath = await saveWavFile(outputDir, filename, audioBuffer);

	return { json: { success: true, filePath, speakerId } };
}
