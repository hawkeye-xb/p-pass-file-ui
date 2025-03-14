import { downloadFile, usageAggregateFiles, usageUploadFile } from "@/ctrls";
import type { UploadRecordType } from "../usage/upload";
import { LargeFileUploadAbstractClass, type OptionsType } from "./LargeFileUploadAbstractClass";

interface ConstructorOptionsType extends OptionsType {
	uploadRecord: UploadRecordType;
	uploadedChunkFilePaths?: { index: number; path: string; }[];
}
export class ClientLargeFileUploader extends LargeFileUploadAbstractClass {
	private uploadRecord: UploadRecordType;
	private uploadedChunkFilePaths: { index: number; path: string; }[] = [];
	// private chunkTatalNumber: number = 0;

	constructor(options: ConstructorOptionsType) {
		super(options);
		this.uploadRecord = options.uploadRecord;
		if (options.uploadedChunkFilePaths) {
			this.uploadedChunkFilePaths = options.uploadedChunkFilePaths;
		}
		this.paused = false;

		// this.chunkTatalNumber = Math.ceil(this.uploadRecord.size / this.chunkSize);
	}

	public destroy(): void {
		super.destroy();
		this.uploadedChunkFilePaths = [];
	}

	public start() {
		this.run();
	}

	public pause() {
		this.paused = true;
	}

	public resume() {
		this.paused = false;
		this.run();
	}

	private async run() {
		if (this.paused) { return; }
		// if (this.currentChunkIndex >= this.chunkTatalNumber) { return; }

		const stime = Date.now();
		const chunk = await this.splitChunk();

		const ctx = await usageUploadFile({
			content: new Uint8Array(chunk),
			target: this.uploadRecord.uploadTemporaryPath,
			name: `${this.uploadRecord.name}.part.${this.currentChunkIndex}`,
			// parentPaths: [], // 临时目录不需要前缀
		});
		const result = ctx.response.body;
		if (result.code !== 0) {
			this.paused = true;
			this.onError?.(result.message);

			throw new Error(result.message);
		}

		this.uploadedChunkFilePaths.push({
			index: this.currentChunkIndex,
			path: result.data.path
		});
		const etime = Date.now();
		const duration = etime - stime;
		const speed = chunk.byteLength / duration * 1000;
		this.onProgress?.(this.uploadedSize / this.uploadRecord.size, speed);

		this.uploadedSize += chunk.byteLength;
		this.onUploadedSizeChange?.(this.uploadedSize);

		this.currentChunkIndex++;

		if (this.uploadedSize < this.uploadRecord.size) {
			this.run();
		} else {
			// res upload finish
			this.aggregateFiles();
		}
	}

	private async splitChunk() {
		const res = await downloadFile({
			target: this.uploadRecord.uploadSourcePath,
			offset: this.uploadedSize,
			size: Math.min(this.chunkSize, this.uploadRecord.size - this.uploadedSize),
		})
		// todo: error?
		return await res.arrayBuffer();
	}

	private async aggregateFiles() {
		const ctx = await usageAggregateFiles({
			filePaths: this.uploadedChunkFilePaths,
			target: this.uploadRecord.uploadTargetPath,
			name: this.uploadRecord.name,
			parentPaths: this.uploadRecord.parentPaths,
			temporaryPath: this.uploadRecord.uploadTemporaryPath,
		});
		const result = ctx.response.body;
		if (result.code !== 0) {
			this.onError?.(result.message);
			throw new Error(result.message);
		}
		this.onCompleted?.();
	}
}