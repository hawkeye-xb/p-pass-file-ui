import type { PATH_TYPE } from "@/const";

export type UploadStatusType = 'waiting' | 'uploading' | 'paused' | 'completed' | 'error' | 'canceled' | 'holded'
export enum UploadStatusEnum {
	Waiting = 'waiting',
	Uploading = 'uploading',
	Holded = 'holded', // 被动的暂停
	Paused = 'paused', // 主动的暂停 ，这个才更应该叫 holded
	Completed = 'completed',
	Error = 'error',
	Canceled = 'canceled'
}

export interface UploadRecordType {
	id: string;
	uploadSourcePath: string;
	uploadTargetPath: string;
	uploadTempraryPath: string; // 大文件上传的临时路径
	name: string;
	status: UploadStatusType;
	stime: number;
	etime: number;
	size: number;
	type: PATH_TYPE;
	children?: UploadRecordType[];
	// 其他的元数据信息
}

const STORAGE_KEY = 'uploadRecord'

export const getAllUploadRecord = () => {
	const record = localStorage.getItem(STORAGE_KEY)
	if (record) {
		return JSON.parse(record) as UploadRecordType[]
	}
	return [] as UploadRecordType[]
}

export const addUploadRecord = (record: UploadRecordType) => {
	const records = getAllUploadRecord()
	records.push(record)
	localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export const removeUploadRecord = (id: string) => {
	const records = getAllUploadRecord()
	const index = records.findIndex(record => record.id === id)
	if (index !== -1) {
		records.splice(index, 1)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
	}
}

export const setAllUploadRecord = (records: UploadRecordType[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// 已经完成的不能更新
export const updateUploadRecord = (id: string, record: UploadRecordType) => {
	const records = getAllUploadRecord()
	const index = records.findIndex(record => record.id === id)
	if (index !== -1) {
		records[index] = record
		localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
	}
}