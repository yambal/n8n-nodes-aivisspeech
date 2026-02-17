import { OperationHandler } from '../types';
import { getSpeakers } from './speakers';
import { synthesize, audioQuery, synthesisFromQuery, multiSynthesize } from './synthesis';
import { getUserDict, addUserDictWord, updateUserDictWord, deleteUserDictWord } from './userDict';
import { getParameterGuide } from './parameterGuide';
import { getFormatGuide } from './formatGuide';

export const operationHandlers: Record<string, OperationHandler> = {
	getSpeakers,
	synthesize,
	audioQuery,
	synthesisFromQuery,
	getUserDict,
	addUserDictWord,
	updateUserDictWord,
	deleteUserDictWord,
	multiSynthesis: multiSynthesize,
	getParameterGuide,
	getFormatGuide,
};
