import { usageAggregateFiles, usageCreateTemporaryDir, usagePreUploadValidate, usageUploadFile } from "@/ctrls/usage";
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

	const preUploadValidateRes = await usagePreUploadValidate({
		target: currentFolder.path,
		name: file.name,
		size: file.size,
	})
	const preUploadValidateResult = preUploadValidateRes.response.body;
	if (preUploadValidateResult.code !== 0) {
		Message.error(preUploadValidateResult.message);
		return;
	}

	const tempRes = await usageCreateTemporaryDir();
	const result = tempRes.response.body;
	if (result.code !== 0) {
		Message.error(result.message);
		return;
	}
	console.log('temp path', result.data);

	const tempPath = result.data.path;
	const filePaths: { index: number; path: any; }[] = [];
	const aggregateFiles = async () => {
		const res = await usageAggregateFiles({
			filePaths,
			target: currentFolder.path,
			name: file.name,
		})
		const result = res.response.body;
		if (result.code !== 0) {
			Message.error(result.message);
			return;
		}
	}

	const largeFileUploader = new LargeFileUploader(file, {
		onProgress: (progress: number, speed: number) => { console.log('on progress', progress, speed) },
		onStatusChange: (status: string) => {
			console.log('on status change', status)
			if (status === 'completed') {
				aggregateFiles();
				// 添加新记录
				// 移除正在上传的
				// 销毁实例
			}
		},
		onUpload: async (chunk, options, done) => {
			const arrayBuffer = await chunk.arrayBuffer();
			const res = await usageUploadFile({
				content: new Uint8Array(arrayBuffer),
				target: tempPath,
				name: `${options.filename}.part${options.currentChunkIndex}`,
			})
			const result = res.response.body
			if (result.code !== 0) {
				Message.error(result.message);
				return;
			}
			filePaths.push({
				index: options.currentChunkIndex,
				path: result.data.path
			});
			done();
		}
	})
	largeFileUploader.start();
}