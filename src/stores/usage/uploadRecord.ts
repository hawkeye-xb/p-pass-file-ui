// 菜单，头部等会需要这里的信息，与本地同步放在这里
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { addUploadRecord, getUploadRecord, removeUploadRecord, updateUploadRecord, type UploadRecordType } from '@/services/usage/upload'

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
