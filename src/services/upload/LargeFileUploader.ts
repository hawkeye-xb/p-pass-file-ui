type OnUploadFunctionType = (chunk: Blob, options: {
	filename: string;
	currentChunkIndex: number;
}, done: () => void) => Promise<void>;
interface UploadConfig {
	chunkSize?: number; // 每个文件块的大小，默认 512KB
	onProgress?: (progress: number, speed: number) => void; // 上传进度和速率回调
	onStatusChange?: (status: string) => void; // 状态变更回调
	onUpload?: OnUploadFunctionType;
};

type UploadStatusType = 'uploading' | 'paused' | 'completed' | 'failed';
export class LargeFileUploader {
	private file: File;
	private chunkSize: number;
	private uploadedSize: number = 0; // 已经上传的大小
	private onProgress?: (progress: number, speed: number) => void;
	private onStatusChange?: (status: UploadStatusType) => void;
	private paused: boolean = false;
	private currentChunkIndex: number = 0; // 当前上传的文件块索引
	private onUpload?: OnUploadFunctionType;

	constructor(file: File, config: UploadConfig) {
		this.file = file;
		this.chunkSize = config.chunkSize || 512 * 1024; // 默认 512KB
		this.onProgress = config.onProgress;
		this.onStatusChange = config.onStatusChange;
		this.onUpload = config.onUpload;

		console.debug('LargeFileUploader init', file.size, this.chunkSize, this.chunkSize / file.size);
	}

	public start() {
		this.updateStatus('uploading');

		const startTime = Date.now();
		const chunk = this.splitChunk();
		const done = () => {
			const endTime = Date.now();
			const duration = endTime - startTime;
			const speed = chunk.size / duration;
			this.onProgress?.(this.uploadedSize / this.file.size, speed);

			this.uploadedSize += chunk.size;
			this.currentChunkIndex++;

			if (this.uploadedSize < this.file.size) {
				if (this.paused) { return; }

				this.start();
			} else {
				this.updateStatus('completed');
			}
		}

		this.onUpload?.(chunk, {
			filename: this.file.name,
			currentChunkIndex: this.currentChunkIndex
		}, done.bind(this));
	}

	public pause() { }
	public resume() { }

	private splitChunk() {
		const start = this.uploadedSize;
		const end = Math.min(start + this.chunkSize - 1, this.file.size);
		const chunk = this.file.slice(start, end);
		return chunk;
	}

	private updateStatus(status: UploadStatusType) {
		this.onStatusChange?.(status);
	}
}