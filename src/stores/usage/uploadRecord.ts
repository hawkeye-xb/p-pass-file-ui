// 菜单，头部等会需要这里的信息，与本地同步放在这里
import { v4 as uuidv4 } from "uuid";
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getAllUploadRecord, setAllUploadRecord, UploadStatusEnum, type UploadRecordType } from '@/services/usage/upload'
import { downloadFile, getMetadata, usageAggregateFiles, usageCreateDir, usageCreateTemporaryDir, usagePreUploadValidate, usageUploadFile } from '@/ctrls'
import type { MetadataType } from '@/types'
import { PATH_TYPE } from "@/const";
import type { LargeFileUploadAbstractClass } from "@/services/upload/LargeFileUploadAbstractClass";
import { ClientLargeFileUploader } from "@/services/upload/ClientLargeFileUploader";

const taskNum = 2;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
export const useUploadRecordStore = defineStore('uploadRecord', () => {
	const uploadRecord = ref<UploadRecordType[]>([])
	const uploadFlatRecord = ref<UploadRecordType[]>([]) // 待执行的任务
	const setUploadFlatRecord = () => {
		uploadFlatRecord.value = [];
		// 持有引用的扁平化
		const flat = (items: UploadRecordType[]) => {
			items.forEach(item => {
				if (item.status !== UploadStatusEnum.Completed && item.status !== UploadStatusEnum.Error) {
					uploadFlatRecord.value.push(item)
				}
				if (item.children) {
					flat(item.children)
				}
			})
		}
		flat(uploadRecord.value)
	};

	const uploadTask: UploadRecordType[] = [];
	const largeFileUploaderMap = new Map<string, LargeFileUploadAbstractClass>();
	function getLargeFileUploader(id: string) {
		return largeFileUploaderMap.get(id)
	}

	function add(record: UploadRecordType) {
		uploadRecord.value.push(record)
		setAllUploadRecord(uploadRecord.value)
		init()
	}

	function remove(id: string) {
		if (uploadTask.some(task => task.id === id)) {
			uploadTask.forEach((task, idx) => {
				if (task.id === id) {
					// 取消发送
					uploadTask.splice(idx, 1)
				}
			})
		}

		const removeItemFromRecord = (items: UploadRecordType[]) => {
			return items.filter(item => {
				if (item.id === id) {
					return false
				}
				if (item.children) {
					item.children = removeItemFromRecord(item.children)
				}
				return true
			})
		}
		const res = removeItemFromRecord(uploadRecord.value)
		setAllUploadRecord(res)
		init()
	}

	function update(r: UploadRecordType) { // todo: rename to updateStatus
		// 更新状态需要重新调度
		const idx = uploadFlatRecord.value.findIndex(item => item.id === r.id)
		if (idx === -1) {
			console.warn('update record not found', r)
			return
		}
		uploadFlatRecord.value[idx].status = r.status
		uploadFlatRecord.value[idx].uploadTempraryPath = r.uploadTempraryPath

		setAllUploadRecord(uploadRecord.value)

		if (r.status === UploadStatusEnum.Completed || r.status === UploadStatusEnum.Error) {
			uploadFlatRecord.value.splice(idx, 1)
		}
		if (r.status === UploadStatusEnum.Paused && uploadTask.some(task => task.id === r.id)) {
			uploadTask.splice(uploadTask.findIndex(task => task.id === r.id), 1)

			if (largeFileUploaderMap.has(r.id)) {
				largeFileUploaderMap.get(r.id)?.pause();
			}

			run()
		}
	}

	function init() {
		const records = getAllUploadRecord()
		uploadRecord.value = records
		setUploadFlatRecord()
		run();
	}

	// todo: 先不做优先！
	function run() {
		if (uploadTask.length >= taskNum) {
			return;
		}

		for (const item of uploadFlatRecord.value) {
			if (item.status === UploadStatusEnum.Uploading && !uploadTask.some(task => task.id === item.id)) { // 并且没有实例，则补充实例
				uploadTask.push(item);
				handleUpload(item);
				run();
				return;
			}

			if (item.status === UploadStatusEnum.Waiting && !uploadTask.some(task => task.id === item.id)) {
				item.status = UploadStatusEnum.Uploading;
				update(item);
				uploadTask.push(item);
				handleUpload(item);
				run();
				return;
			}
		}
	}

	function uploadSuccess(record: UploadRecordType) {
		record.status = UploadStatusEnum.Completed;
		record.etime = Date.now();
		update(record); // 已经从队列中移除了
		uploadTask.splice(uploadTask.findIndex(task => task.id === record.id), 1); // 移除已经完成的任务
		run();
	}
	async function handleUpload(record: UploadRecordType) {
		if (record.type === PATH_TYPE.DIR) {
			const ctx = await usageCreateDir({
				target: record.uploadTargetPath,
				name: record.name,
			})
			const res = ctx.response.body;
			if (res.code !== 0) {
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
				console.warn(result.message)
				return;
			}

			uploadSuccess(record);
			return;
		}
		/**
		 * 大文件上传
		 */
		console.info('大文件上传')
		if (largeFileUploaderMap.has(record.id)) {
			largeFileUploaderMap.get(record.id)?.start();
			return;
		}

		const preUploadValidateRes = await usagePreUploadValidate({
			target: record.uploadTargetPath,
			name: record.name,
			size: record.size.toString(),
		})
		const preUploadValidateResult = preUploadValidateRes.response.body;
		if (preUploadValidateResult.code !== 0) {
			console.warn(preUploadValidateResult.message)
			return;
		}

		const tempRes = await usageCreateTemporaryDir();
		const tempResult = tempRes.response.body;
		if (tempResult.code !== 0) {
			console.warn(tempResult.message)
			return;
		}

		const tempPath = tempResult.data.path;
		record.uploadTempraryPath = tempPath;
		record.status = UploadStatusEnum.Uploading;
		update(record);

		const largeFileUploaderInstance = new ClientLargeFileUploader({
			uploadRecord: record,
		});
		largeFileUploaderMap.set(record.id, largeFileUploaderInstance);
		largeFileUploaderInstance.onCompleted = () => {
			uploadSuccess(record);
			largeFileUploaderMap.delete(record.id);	// 移除已经完成的任务
		}
		largeFileUploaderInstance.start();
	}

	return {
		init,
		uploadRecord,
		add,
		remove,
		update,
		getLargeFileUploader
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
		console.log(info, parentPaths)
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
