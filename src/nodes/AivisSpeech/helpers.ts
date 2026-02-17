import { NodeOperationError, INode } from 'n8n-workflow';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * AivisSpeech API へのリクエストを送信し、レスポンスを返す。
 * レスポンスが ok でない場合は NodeOperationError をスローする。
 */
export async function apiRequest(
	node: INode,
	baseUrl: string,
	apiPath: string,
	options: RequestInit = {},
	itemIndex: number,
	errorMessage: string,
): Promise<Response> {
	const url = `${baseUrl}${apiPath}`;
	const response = await fetch(url, options);
	if (!response.ok) {
		throw new NodeOperationError(
			node,
			`HTTP ${response.status}: ${errorMessage}`,
			{ itemIndex },
		);
	}
	return response;
}

/**
 * WAVファイルを保存する。ディレクトリが存在しない場合は作成する。
 */
export async function saveWavFile(
	outputDir: string,
	filename: string,
	audioBuffer: ArrayBuffer,
): Promise<string> {
	const filePath = path.join(outputDir, filename);
	await fs.mkdir(outputDir, { recursive: true });
	await fs.writeFile(filePath, Buffer.from(audioBuffer));
	return filePath;
}

/**
 * ファイル名を解決する。空の場合はタイムスタンプで自動生成し、.wav拡張子を付与する。
 */
export function resolveFilename(filename: string): string {
	if (!filename) {
		filename = `tts_${Date.now()}.wav`;
	}
	if (!filename.endsWith('.wav')) {
		filename += '.wav';
	}
	return filename;
}
