// 菜单，头部等会需要这里的信息，与本地同步放在这里
import { v4 as uuidv4 } from "uuid";
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { addUploadRecord, getAllUploadRecord, removeUploadRecord, setAllUploadRecord, UploadStatusEnum, type UploadRecordType } from '@/services/usage/upload'
import { getMetadata } from '@/ctrls'
import type { MetadataType } from '@/types'
import { PATH_TYPE } from "@/const";

export const useUploadRecordStore = defineStore('uploadRecord', () => {
	const uploadRecord = ref<UploadRecordType[]>([])
	const uploadFlatRecord = ref<UploadRecordType[]>([])

	function add(record: UploadRecordType) {
		uploadRecord.value.push(record)
		setAllUploadRecord(uploadRecord.value)
		init()
	}

	function remove(id: string) {
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

	function update(r: UploadRecordType) {
		// 更新状态需要重新调度
		const idx = uploadFlatRecord.value.findIndex(item => item.id === r.id)
		if (idx === -1) {
			console.warn('update record not found', r)
			return
		}
		uploadFlatRecord.value[idx].status = r.status

		setAllUploadRecord(uploadRecord.value)
	}

	function init() {
		const records = getAllUploadRecord()
		uploadRecord.value = records

		uploadFlatRecord.value = [];
		// 持有引用的扁平化
		const flat = (items: UploadRecordType[]) => {
			items.forEach(item => {
				uploadFlatRecord.value.push(item)
				if (item.children) {
					flat(item.children)
				}
			})
		}
		flat(records)

		console.log('init uploadRecord', uploadRecord.value, uploadFlatRecord.value)
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
			uploadTempraryPath: '', // 开始上传了再给临时目录
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
