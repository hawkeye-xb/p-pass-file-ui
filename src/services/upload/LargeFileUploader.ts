type OnUploadFunctionType = (chunk: Blob, options: {
	filename: string;
	currentChunkIndex: number;
}, done: () => void) => Promise<void>;
interface UploadConfig {
	chunkSize?: number; // 每个文件块的大小，默认 512KB
	onProgress?: ((progress: number, speed: number) => void) | undefined;
	onStatusChange?: (status: string) => void; // 状态变更回调
	onUpload?: OnUploadFunctionType;
};

type UploadStatusType = 'uploading' | 'paused' | 'completed' | 'failed';
export class LargeFileUploader {
	private file: File;
	private chunkSize: number;
	private uploadedSize: number = 0; // 已经上传的大小
	public onProgress: ((progress: number, speed: number) => void) | undefined = undefined;
	private onStatusChange?: (status: UploadStatusType) => void;
	private paused: boolean = false;
	private currentChunkIndex: number = 0; // 当前上传的文件块索引
	private onUpload?: OnUploadFunctionType;

	public onCompleted: (() => void) | undefined;

	public destroy() {
		this.onCompleted = undefined;
		this.onCompleted = undefined;
	}

	constructor(file: File, config: UploadConfig) {
		this.file = file;
		this.chunkSize = config.chunkSize || 512 * 1024; // 默认 512KB
		this.onStatusChange = config.onStatusChange;
		this.onUpload = config.onUpload;
	}

	public start() {
		this.updateStatus('uploading');

		const startTime = Date.now();
		const chunk = this.splitChunk();
		const done = () => {
			const endTime = Date.now();
			const duration = endTime - startTime;
			const speed = chunk.size / duration * 1000;
			this.onProgress?.(this.uploadedSize / this.file.size, speed);

			this.uploadedSize += chunk.size;
			this.currentChunkIndex++;

			if (this.uploadedSize < this.file.size) {
				if (this.paused) { return; }

				this.start();
			} else {
				this.updateStatus('completed');
				this.onCompleted?.();
			}
		}

		this.onUpload?.(chunk, {
			filename: this.file.name,
			currentChunkIndex: this.currentChunkIndex
		}, done.bind(this));
	}

	public pause() {
		this.paused = true;
		this.updateStatus('paused');
	}
	public resume() {
		this.paused = false;
		this.updateStatus('uploading');
		this.start();
	}

	private splitChunk() {
		const start = this.uploadedSize;
		const end = Math.min(start + this.chunkSize, this.file.size);
		const chunk = this.file.slice(start, end); // 包含start，不包含end
		return chunk;
	}

	private updateStatus(status: UploadStatusType) {
		this.onStatusChange?.(status);
	}
}