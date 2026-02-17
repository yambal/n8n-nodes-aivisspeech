import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

export interface Speaker {
	name: string;
	speaker_uuid: string;
	styles: Array<{
		name: string;
		id: number;
		type: string;
	}>;
	version: string;
}

export interface AudioQuery {
	accent_phrases: unknown[];
	speedScale: number;
	pitchScale: number;
	intonationScale: number;
	volumeScale: number;
	prePhonemeLength: number;
	postPhonemeLength: number;
	pauseLength: number | null;
	pauseLengthScale: number;
	tempoDynamicsScale: number;
	outputSamplingRate: number;
	outputStereo: boolean;
	kana: string;
}

export interface UserDictWord {
	surface: string;
	pronunciation: string;
	accent_type: number;
	word_type?: string;
	priority?: number;
}

export interface UserDict {
	[uuid: string]: UserDictWord;
}

export type OperationHandler = (
	executeFunctions: IExecuteFunctions,
	baseUrl: string,
	itemIndex: number,
) => Promise<INodeExecutionData>;
