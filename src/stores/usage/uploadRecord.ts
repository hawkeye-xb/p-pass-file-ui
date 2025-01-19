// 菜单，头部等会需要这里的信息，与本地同步放在这里
import { v4 as uuidv4 } from "uuid";
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { addUploadRecord, getUploadRecord, removeUploadRecord, updateUploadRecord, UploadStatusEnum, type UploadRecordType } from '@/services/usage/upload'
import { getMetadata } from '@/ctrls'
import type { MetadataType } from '@/types'
import type { PATH_TYPE } from "@/const";

export const useUploadRecordStore = defineStore('uploadRecord', () => {
	const uploadRecord = ref<UploadRecordType[]>([])
	function add(record: UploadRecordType) {
		uploadRecord.value.push(record)
		addUploadRecord(record)
	}

	function remove(id: string) {
		uploadRecord.value = uploadRecord.value.filter(record => record.id !== id)
		removeUploadRecord(id)
	}

	function update(r: UploadRecordType) {
		// 更新状态需要重新调度
		const record = { ...r }; // 避免成功的时候，还是同样的引用
		const index = uploadRecord.value.findIndex(r => r.id === record.id)
		if (index !== -1) {
			uploadRecord.value[index] = record
			updateUploadRecord(record.id, record)
		}
	}

	function init() {
		const records = getUploadRecord()
		uploadRecord.value = records
	}

	return {
		init,
		uploadRecord,
		add,
		remove,
		update
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
	const gcRecord = (info: MetadataType): UploadRecordType => {
		return {
			id: uuidv4(),
			uploadSourcePath: info.path,
			uploadTargetPath: uploadTraget.path,
			uploadTempraryPath: '',
			name: info.name,
			status: UploadStatusEnum.Waiting,
			stime: 0,
			etime: 0,
			size: info.size,
			type: info.type as PATH_TYPE,
			children: info.children?.map(gcRecord) || undefined
		}
	}
	return gcRecord(srcMetadata)
}
