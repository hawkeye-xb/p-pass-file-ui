import { usageUploadFile } from "@/ctrls/usage";
import { LargeFileUploader } from "@/services/upload";
import type { MetadataType } from "@/types";
import { Message } from "@arco-design/web-vue";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const handleUsageUploadFile = async (file: any, currentFolder: MetadataType) => {
	if (!file) {
		Message.error('请选择文件');
		return;
	}

	if (file.size < MAX_FILE_SIZE) {
		const arrayBuffer = await file.arrayBuffer();
		const res = await usageUploadFile({
			content: new Uint8Array(arrayBuffer),
			target: currentFolder.path,
			name: file.name,
		})
		const result = res.response.body
		if (result.code !== 0) {
			Message.error(result.message);
			return;
		}
		Message.success('上传成功');
		return;
	}

	const largeFileUploader = new LargeFileUploader(file, {
		onProgress: (progress: number, speed: number) => { console.log('on progress', progress, speed) },
		onStatusChange: (status: string) => { console.log('on status change', status) },
		onUpload: async (chunk, options, done) => {
			const arrayBuffer = await chunk.arrayBuffer();
			const res = await usageUploadFile({
				content: new Uint8Array(arrayBuffer),
				target: currentFolder.path,
				name: `${options.filename}.part${options.currentChunkIndex}`,
			})
			const result = res.response.body
			if (result.code !== 0) {
				Message.error(result.message);
				return;
			}
			done();
		}
	})
	largeFileUploader.start();
}