import { aggregateFiles, uploadFile, usageDownloadFile } from "@/ctrls";
import type { DownloadRecordType } from "../usage/download";

export interface OptionsType {
	chunkSize?: number;
	currentChunkIndex?: number;
	downloadedSize?: number;
	downloadRecord: DownloadRecordType;
}

export class ClientLargeFileDownloader {
	private chunkSize: number = 512 * 1024;
	private paused: boolean = false;
	private currentChunkIndex: number = 0;
	private downloadedSize: number = 0;

	private downloadRecord: DownloadRecordType;
	private downloadedChunkFilePaths: { index: number; path: string; }[] = [];

	public onError?: (error: Error) => void;
	public onProgress?: (progress: number, speed: number) => void;
	public onDownloadSizeChange?: (size: number) => void;
	public onCompleted?: () => void;

	constructor(options: OptionsType) {
		if (options.chunkSize) { this.chunkSize = options.chunkSize; }
		if (options.currentChunkIndex) { this.currentChunkIndex = options.currentChunkIndex; }
		if (options.downloadedSize) { this.downloadedSize = options.downloadedSize; }
		this.downloadRecord = options.downloadRecord;
	}

	public start() {
		this.run();
	}
	public pause() {
		this.paused = true;
	}
	public resume() {
		this.paused = false;
	}
	public destroy() {
		this.paused = true;
		this.downloadedChunkFilePaths = [];
		this.currentChunkIndex = 0;
		this.downloadedSize = 0;

		this.onError = undefined;
		this.onProgress = undefined;
		this.onDownloadSizeChange = undefined;
		this.onCompleted = undefined;
	}

	private async run() {
		if (this.paused) { return; }

		const chunk = await this.splitChunk();

		const stime = Date.now();
		const blob = new Blob([chunk]);
		const uploadRes = await uploadFile({
			target: this.downloadRecord.downloadTempraryPath,
			name: `${this.downloadRecord.name}.part.${this.currentChunkIndex}`,
			file: new File([blob], `${this.downloadRecord.name}.part.${this.currentChunkIndex}`, { type: 'application/octet-stream' }),
		})
		const uploadResJson = await uploadRes.json();
		if (uploadResJson.code !== 0) {
			this.paused = true;
			this.onError?.(uploadResJson.message);

			throw new Error(uploadResJson.message);
		}

		this.downloadedChunkFilePaths.push({
			index: this.currentChunkIndex,
			path: uploadResJson.data.path,
		})
		const etime = Date.now();
		const duration = etime - stime;
		const speed = this.chunkSize / duration * 1000;
		this.onProgress?.(this.downloadedSize / this.downloadRecord.size, speed);

		this.downloadedSize += chunk.byteLength;
		this.onDownloadSizeChange?.(this.downloadedSize);

		this.currentChunkIndex++;
		if (this.downloadedSize < this.downloadRecord.size) {
			this.run();
		} else {
			this.aggregateFiles();
		}
	}

	private async splitChunk() {
		const ctx = await usageDownloadFile({
			target: this.downloadRecord.downloadSourcePath,
			offset: this.downloadedSize,
			size: Math.min(this.chunkSize, this.downloadRecord.size - this.downloadedSize),
		})
		const res = ctx.response.body;
		// todo: error handle
		return res.data as ArrayBuffer;
	}

	private async aggregateFiles() {
		const res = await aggregateFiles({
			filePaths: this.downloadedChunkFilePaths,
			target: this.downloadRecord.downloadTargetPath,
			name: this.downloadRecord.name,
			parentPaths: this.downloadRecord.parentPaths,
			tempraryPath: this.downloadRecord.downloadTempraryPath,
		})
		const resJson = await res.json();
		if (resJson.code !== 0) {
			this.onError?.(resJson.message);
			throw new Error(resJson.message);
		}
		this.onCompleted?.();
	}
}