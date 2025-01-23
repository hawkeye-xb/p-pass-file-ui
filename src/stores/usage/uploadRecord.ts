// 菜单，头部等会需要这里的信息，与本地同步放在这里
import { v4 as uuidv4 } from "uuid";
import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { getAllUploadRecord, setAllUploadRecord, UploadStatusEnum, type UploadRecordType, type UploadStatusType } from '@/services/usage/upload'
import { downloadFile, getMetadata, usageCreateDir, usageCreateTemporaryDir, usageGetMetadata, usagePreUploadValidate, usageUploadFile } from '@/ctrls'
import type { MetadataType } from '@/types'
import { PATH_TYPE } from "@/const";
import type { LargeFileUploadAbstractClass } from "@/services/upload/LargeFileUploadAbstractClass";
import { ClientLargeFileUploader } from "@/services/upload/ClientLargeFileUploader";

const taskNum = 2;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
export const useUploadRecordStore = defineStore('uploadRecord', () => {
	const uploadRecord = ref<UploadRecordType[]>([])

	let pendingQueue: UploadRecordType[] = [] // 所有未处理的
	const processingQueue: Map<string, UploadRecordType> = new Map();

	const setRecordToPendingQueue = (record: UploadRecordType) => {
		if (record.status === UploadStatusEnum.Waiting || record.status === UploadStatusEnum.Uploading || record.status === UploadStatusEnum.Paused) {
			pendingQueue.push(record)
		}
		record.children && record.children.forEach(child => {
			setRecordToPendingQueue(child)
		})
	}

	const largeFileUploaderMap: Map<string, LargeFileUploadAbstractClass> = new Map();
	const largeFileUploadersChange = ref(0);
	function getLargeFileUploader(id: string) {
		return largeFileUploaderMap.get(id)
	}

	function syncRecord() {
		setAllUploadRecord(uploadRecord.value)
	}
	function add(record: UploadRecordType) {
		uploadRecord.value.push(record)
		syncRecord()

		setRecordToPendingQueue(record)
		run();
	}

	function remove(id: string) {
		const removeItemFromRecord = (items: UploadRecordType[]) => {
			return items.filter(item => {
				if (item.children) {
					item.children = removeItemFromRecord(item.children)
				}

				if (item.id === id) {
					// 移除上传器
					if (largeFileUploaderMap.has(id)) {
						const uploader = getLargeFileUploader(id)
						largeFileUploaderMap.delete(id)
						largeFileUploadersChange.value = Date.now()

						uploader?.pause()
						setTimeout(() => {
							uploader?.destroy()
						}, 200);
					}
					// 移除队列
					for (const item of pendingQueue) {
						if (item.id === id) {
							pendingQueue.splice(pendingQueue.indexOf(item), 1);
							break;
						}
					}
					if (processingQueue.has(id)) {
						processingQueue.delete(id);
					}

					return false
				}
				return true
			})
		}
		uploadRecord.value = removeItemFromRecord(uploadRecord.value) // 
		syncRecord()
	}

	function removeRecord(record: UploadRecordType) {
		remove(record.id)
		run()
	}

	function update(record: UploadRecordType) {
		const updateItem = (items: UploadRecordType[]) => {
			return items.map(item => {
				if (item.id === record.id) {
					return record;
				}
				if (item.children) {
					item.children = updateItem(item.children)
				}
				return item;
			})
		}
		uploadRecord.value = updateItem(uploadRecord.value)
		syncRecord()
	}

	function parsed(r: UploadRecordType) {
		if (processingQueue.has(r.id)) {
			processingQueue.delete(r.id); // 从任务队列中删除
		}
		update({ ...r, status: UploadStatusEnum.Paused }); // 更新状态为暂停
		for (const item of pendingQueue) {
			if (item.id === r.id) {
				item.status = UploadStatusEnum.Paused; // 更新状态为暂停
				break;
			}
		}

		if (largeFileUploaderMap.has(r.id)) { // 如果有上传器，暂停上传
			const uploader = getLargeFileUploader(r.id)
			uploader?.pause()
		}

		// 如果是文件夹，递归处理子项
		if (r.type === PATH_TYPE.DIR) {
			r.children = r.children || [];
			r.children.forEach(child => {
				parsed(child)
			})
		}
	}
	function parsedRecord(record: UploadRecordType) {
		parsed(record);
		run();
	}

	function resume(r: UploadRecordType) {
		update({ ...r, status: UploadStatusEnum.Waiting, });
		for (const item of pendingQueue) {
			if (item.id === r.id) {
				item.status = UploadStatusEnum.Waiting;
				break;
			}
		}

		if (r.type === PATH_TYPE.DIR) {
			r.children = r.children || [];
			r.children.forEach(child => {
				resume(child)
			})
		}
	}
	function resumeRecord(record: UploadRecordType) {
		resume(record);
		run();
	}


	function init() {
		const records = getAllUploadRecord()
		uploadRecord.value = records

		initPendingQueue();
	}

	function initPendingQueue() {
		uploadRecord.value.forEach(record => {
			setRecordToPendingQueue(record)
		})
	}

	// todo: 先不做优先！
	function run() {
		if (pendingQueue.length === 0) { return; } // 没有要处理的
		if (processingQueue.size >= taskNum) { return; } // 已经处理的数量大于等于最大处理数量

		for (const record of pendingQueue) { // 进执行队列的
			if (processingQueue.has(record.id)) { continue; } // 处理中
			if (record.status === UploadStatusEnum.Uploading) {

				processingQueue.set(record.id, record);
				handleUpload(record);
				// 处理中的状态就不用更新了
				run();
				break;
			}

			if (record.status === UploadStatusEnum.Waiting) {
				processingQueue.set(record.id, record);
				handleUpload(record);

				record.status = UploadStatusEnum.Uploading; // 持有的是引用，更新状态
				update(record); // 等待中的状态更新为处理中
				run();
				break;
			}
		}
	}

	function uploaded(record: UploadRecordType, status: UploadStatusType) {
		processingQueue.delete(record.id); // 移除处理中的任务
		pendingQueue = pendingQueue.filter(item => item.id !== record.id); // 从 pending 队列中移除

		update({
			...record,
			status,
			etime: Date.now(),
		}); // 更新状态
		run(); // 继续处理下一个任务
	}
	function uploadSuccess(record: UploadRecordType) {
		uploaded(record, UploadStatusEnum.Completed);
	}
	function uploadError(record: UploadRecordType) {
		uploaded(record, UploadStatusEnum.Error);
	}

	async function handleUpload(record: UploadRecordType) {
		if (largeFileUploaderMap.has(record.id)) {
			largeFileUploaderMap.get(record.id)?.resume(); // 恢复会立马上传，应该区分开的。
			return;
		}

		if (record.type === PATH_TYPE.DIR) {
			const ctx = await usageCreateDir({
				target: record.uploadTargetPath,
				name: record.name,
			})
			const res = ctx.response.body;
			if (res.code !== 0) {
				uploadError(record);
				console.warn(res.message)
				return;
			}
			uploadSuccess(record);
			return;
		}
		// 小文件上传
		if (record.size !== undefined && record.size < MAX_FILE_SIZE) {
			const res = await downloadFile({
				target: record.uploadSourcePath,
			})
			const arrayBuffer = await res.arrayBuffer();
			const ctx = await usageUploadFile({
				content: new Uint8Array(arrayBuffer),
				target: record.uploadTargetPath,
				name: record.name,
				parentPaths: record.parentPaths
			})
			const result = ctx.response.body;
			if (result.code !== 0) {
				uploadError(record);
				console.warn(result.message)
				return;
			}

			uploadSuccess(record);
			return;
		}
		/**
		 * 大文件上传
		 */
		if (largeFileUploaderMap.has(record.id)) {
			largeFileUploaderMap.get(record.id)?.start();
			return;
		}

		// 预上传校验
		const [preErr, tempPath] = await preUploadValidate(record);
		if (preErr) {
			uploadError(record);
			return;
		}

		const [resumeErr, options] = await resumeFormBroken(record);
		if (resumeErr) {
			uploadError(record);
			return;
		}

		record.uploadTempraryPath = tempPath;
		const largeFileUploaderInstance = new ClientLargeFileUploader({
			...options,
			currentChunkIndex: options.currentChunkIndex + 1, // 从下一个开始，个数怎么处理？
			uploadRecord: record,
		});
		largeFileUploaderMap.set(record.id, largeFileUploaderInstance);
		largeFileUploadersChange.value = Date.now();

		largeFileUploaderInstance.onCompleted = () => {
			uploadSuccess(record);
			largeFileUploaderMap.delete(record.id);	// 移除已经完成的任务
			largeFileUploadersChange.value = Date.now();

			setTimeout(() => {
				largeFileUploaderInstance.destroy();
			}, 200);
		}
		// 如果是断点续传的，状态没有发生改变，怎么处理？
		update({
			...record,
			status: UploadStatusEnum.Uploading,
		})

		largeFileUploaderInstance.start();
	}

	return {
		init,
		uploadRecord,
		add,
		removeRecord,
		update,
		parsedRecord,
		resumeRecord,
		largeFileUploadersChange,
		getLargeFileUploader,
	}
})

export const generateUploadRecord = async (uploadSrcPath: string, uploadTraget: MetadataType) => {
	const res = await getMetadata({
		target: uploadSrcPath,
		// recursive: false // todo: 应该提供这个参数的
		depth: 100
	})
	const result = await res.json();
	if (result.code !== 0) {
		console.warn(result.message)
		return;
	}
	const srcMetadata = result.data as MetadataType;
	const gcRecord = (info: MetadataType, parentPaths: string[]): UploadRecordType => {
		return {
			id: uuidv4(),
			uploadSourcePath: info.path,
			uploadTargetPath: uploadTraget.path,
			parentPaths: parentPaths,
			uploadTempraryPath: '', // 开始上传了再给临时目录
			name: info.name,
			status: UploadStatusEnum.Waiting,
			stime: 0,
			etime: 0,
			size: info.size,
			type: info.type as PATH_TYPE,
			children: info.children?.map(item => gcRecord(item, [...parentPaths, info.type === PATH_TYPE.DIR ? info.name : '']))
		}
	}

	return gcRecord(srcMetadata, [])
}

async function preUploadValidate(record: UploadRecordType) {
	if (record.uploadTempraryPath) return [null, record.uploadTempraryPath];

	const preUploadValidateRes = await usagePreUploadValidate({
		target: record.uploadTargetPath,
		name: record.name,
		size: record.size.toString(),
	})
	const preUploadValidateResult = preUploadValidateRes.response.body;
	if (preUploadValidateResult.code !== 0) {
		console.warn(preUploadValidateResult.message)
		return [preUploadValidateResult.message];
	}

	const tempRes = await usageCreateTemporaryDir();
	const tempResult = tempRes.response.body;
	if (tempResult.code !== 0) {
		console.warn(tempResult.message)
		return [tempResult.message];
	}

	return [null, tempResult.data.path];
}

async function resumeFormBroken(record: UploadRecordType) {
	const defultResumeInfo: {
		uploadedSize: number;
		currentChunkIndex: number;
		uploadedChunkFilePaths: { index: number; path: string; }[];
	} = {
		uploadedSize: 0,
		currentChunkIndex: 0,
		uploadedChunkFilePaths: [], // { index: number; path: string; }[]
	}
	if (!record.uploadTempraryPath) return [null, defultResumeInfo];

	const metadataCtx = await usageGetMetadata({
		target: record.uploadTempraryPath,
		depth: 100,
	});
	const metadataResult = metadataCtx.response.body;
	if (metadataResult.code !== 0) {
		console.warn(metadataResult.message)
		return [metadataResult.message];
	}
	const metadata = metadataResult.data as MetadataType;
	const result = (metadata.children || []).reduce((acc, cur) => {
		if (cur.name.startsWith(`${record.name}.part.`)) {
			const chunkIndex = parseInt(cur.name.split('.').pop()!, 10);
			if (!isNaN(chunkIndex)) {
				acc.currentChunkIndex = Math.max(acc.currentChunkIndex, chunkIndex);
				acc.uploadedChunkFilePaths.push({
					index: chunkIndex,
					path: cur.path,
				});
			}
		}

		acc.uploadedSize += cur.size;
		return acc;
	}, defultResumeInfo)

	return [null, result];
}