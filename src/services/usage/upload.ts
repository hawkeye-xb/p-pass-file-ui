import type { PATH_TYPE } from "@/const";

// export type UploadStatusType = 'waiting' | 'uploading' | 'paused' | 'completed' | 'error' | 'canceled' | 'holded'
export enum UploadStatusEnum {
	Waiting = 'waiting',
	Uploading = 'uploading',
	// Holded = 'holded', // 被动的暂停
	Paused = 'paused', // 主动的暂停 ，这个才更应该叫 holded
	Completed = 'completed',
	Error = 'error',
	Canceled = 'canceled'
}
export type UploadStatusType = `${UploadStatusEnum}`;

export interface UploadRecordType {
	id: string;
	name: string;
	status: UploadStatusType;
	stime: number;
	etime: number;
	size: number;
	type: PATH_TYPE;
	children?: UploadRecordType[];

	parentPaths: string[];
	uploadSourcePath: string;
	uploadTargetPath: string;
	uploadTemporaryPath: string; // 大文件上传的临时路径
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

export const setAllUploadRecord = (records: UploadRecordType[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}