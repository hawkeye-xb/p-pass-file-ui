import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 传输结束之后再进记录；目录不做记录。如果不记录，整体的目录结构就没有了
interface UploadRecordType {
	id: string; // 传输记录id
	status: 'finished' | 'cancel'; // 记录只有完成和取消
	name: string; // 传输的文件名
}
export const useUploadRecordStore = defineStore('uploadRecord', () => {
	const uploadRecord = ref<number[]>([])
	const getUploadRecord = computed(() => {
		return uploadRecord.value
	})
	const addUploadRecord = (num: number) => {
		uploadRecord.value.push(num)
	}
	return { uploadRecord, getUploadRecord, addUploadRecord }
})
