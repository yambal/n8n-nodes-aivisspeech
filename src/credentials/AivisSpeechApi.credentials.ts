import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AivisSpeechApi implements ICredentialType {
	name = 'aivisSpeechApi';
	displayName = 'AivisSpeech API';
	documentationUrl = 'https://github.com/Aivis-Project/AivisSpeech';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:10101',
			description: 'AivisSpeech APIのベースURL',
		},
	];
}
