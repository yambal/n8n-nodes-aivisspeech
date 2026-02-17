import { OperationHandler } from '../types';
import { getSpeakers } from './speakers';
import { synthesize, audioQuery, synthesisFromQuery } from './synthesis';
import { getUserDict, addUserDictWord, updateUserDictWord, deleteUserDictWord } from './userDict';

export const operationHandlers: Record<string, OperationHandler> = {
	getSpeakers,
	synthesize,
	audioQuery,
	synthesisFromQuery,
	getUserDict,
	addUserDictWord,
	updateUserDictWord,
	deleteUserDictWord,
};
