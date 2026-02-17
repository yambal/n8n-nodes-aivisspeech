import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { nodeProperties } from './properties';
import { operationHandlers } from './operations';

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
		properties: nodeProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('aivisSpeechApi');
		const baseUrl = credentials.baseUrl as string;

		const handler = operationHandlers[operation];
		if (!handler) {
			throw new NodeOperationError(
				this.getNode(),
				`未対応の操作です: ${operation}`,
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const result = await handler(this, baseUrl, i);
				returnData.push(result);
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
