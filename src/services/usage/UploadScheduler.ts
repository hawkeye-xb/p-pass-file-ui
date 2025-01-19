// todo: 整合到store的状态管理中去？

import { v4 as uuidv4 } from "uuid";
import { usageAggregateFiles, usageCreateTemporaryDir, usagePreUploadValidate, usageUploadFile } from "@/ctrls/usage";
import type { MetadataType } from "@/types";
import Message from "@arco-design/web-vue/es/message";
import { LargeFileUploader } from "../upload/LargeFileUploader";
import { type UploadRecordType } from "./upload";
import { useUploadRecordStore } from "@/stores/usage/uploadRecord";
import { PATH_TYPE } from "@/const";

/**
 * 全局唯一的上传调度器；UI 层通过来控制上传
 */
export class UploadScheduler {
	private static instance: UploadScheduler;
	private MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	private uploaders: Map<string, LargeFileUploader> = new Map();

	private constructor() { }
	public static getInstance(): UploadScheduler {
		if (!UploadScheduler.instance) {
			UploadScheduler.instance = new UploadScheduler();
		}
		return UploadScheduler.instance;
	}

	public getUploader(id: string) {
		return this.uploaders.get(id);
	}

	public async generateUploader(metadata: MetadataType) {
		try {
			// 创建一条上传记录
			// 需要换成 Electron 的操作
			// @ts-ignore
			const [fileHandle] = await window.showOpenFilePicker();
			const file = await fileHandle.getFile();

			const record: UploadRecordType = {
				id: uuidv4(),
				uploadSourcePath: '',
				uploadTargetPath: metadata.path,
				uploadTempraryPath: '',
				name: file.name,
				status: 'waiting',
				stime: Date.now(),
				etime: 0,
				size: file.size,
				type: PATH_TYPE.DIRECTORY,
			}

			if (file.size < this.MAX_FILE_SIZE) {
				this.littleFileUploader(file, metadata, record);
			} else {
				this.genLargeFileUploader(file, metadata, record);
			}
		} catch (error) {

		}
	}

	private async littleFileUploader(file: File, metadata: MetadataType, record: UploadRecordType) {
		const arrayBuffer = await file.arrayBuffer();
		const res = await usageUploadFile({
			content: new Uint8Array(arrayBuffer),
			target: metadata.path,
			name: file.name,
		})
		const result = res.response.body
		record.etime = Date.now();
		if (result.code !== 0) {
			Message.error(result.message);
			record.status = 'error';
		} else {
			Message.success('上传成功');
			record.status = 'completed';
		}

		const uploadRecordStore = useUploadRecordStore();
		uploadRecordStore.add(record);
	}
	private async genLargeFileUploader(file: File, metadata: MetadataType, record: UploadRecordType) {

		const preUploadValidateRes = await usagePreUploadValidate({
			target: metadata.path,
			name: file.name,
			size: file.size.toString(),
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

		const tempPath = result.data.path;
		record.uploadTempraryPath = tempPath;
		const uploadRecordStore = useUploadRecordStore();

		const filePaths: { index: number; path: any; }[] = [];
		const aggregateFiles = async () => {
			const res = await usageAggregateFiles({
				filePaths,
				target: metadata.path,
				name: file.name,
			})
			const result = res.response.body;
			if (result.code !== 0) {
				Message.error(result.message);
				return;
			}
			Message.success('上传成功');
			record.etime = Date.now();
			record.status = 'completed';
			uploadRecordStore.update({ ...record });
		}

		const largeFileUploader = new LargeFileUploader(file, {
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
					// 出现错误就要销毁了
					return;
				}
				filePaths.push({
					index: options.currentChunkIndex,
					path: result.data.path
				});
				done();
			}
		})
		largeFileUploader.onCompleted = () => {
			aggregateFiles();
		}

		this.uploaders.set(record.id, largeFileUploader);
		uploadRecordStore.add(record);

		largeFileUploader.start(); // todo: 做调度
		record.status = 'uploading';
		uploadRecordStore.update(record);
	}
}