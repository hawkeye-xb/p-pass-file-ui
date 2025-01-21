
export interface OptionsType { chunkSize?: number; currentChunkIndex?: number; uploadedSize?: number; };
export abstract class LargeFileUploadAbstractClass {
	chunkSize: number = 512 * 1024;
	paused: boolean = true;
	currentChunkIndex: number = 0;
	uploadedSize: number = 0;

	constructor(options: OptionsType) {
		if (options.chunkSize) { this.chunkSize = options.chunkSize; }
		if (options.currentChunkIndex) { this.currentChunkIndex = options.currentChunkIndex; }
		if (options.uploadedSize) { this.uploadedSize = options.uploadedSize; }
	}

	public onProgress?: (progress: number, speed: number) => void;
	public onCompleted?: () => void;
	public onUploadedSizeChange?: (size: number) => void;
	public onError?: (error: Error) => void;

	abstract start(): void;
	abstract pause(): void;
	abstract resume(): void;

	destroy() {
		this.onCompleted = undefined;
		this.onProgress = undefined;
		this.onUploadedSizeChange = undefined;
		this.onError = undefined;

		this.paused = true;
		this.currentChunkIndex = 0;
		this.uploadedSize = 0;
	}
}