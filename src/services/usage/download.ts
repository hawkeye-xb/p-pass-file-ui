import type { PATH_TYPE } from "@/const";

export enum DownloadStatusEnum {
	Waiting = 'waiting',
	Downloading = 'downloading',
	Paused = 'paused',
	Completed = 'completed',
	Error = 'error',
	Canceled = 'canceled'
}
export type DownloadStatusType = `${DownloadStatusEnum}`

export type DownloadRecordType = {
	id: string;
	name: string;
	status: DownloadStatusType;
	stime: number;
	etime: number;
	size: number;
	type: PATH_TYPE;
	children?: DownloadRecordType[];

	parentPaths: string[];
	downloadSourcePath: string; // 资源路径
	downloadTargetPath: string; // 下载到的目录
	downloadTempraryPath: string; // 本地临时目录
}

const STORAGE_KEY = 'downloadRecord'
export const getAllDownloadRecord = () => {
	const record = localStorage.getItem(STORAGE_KEY)
	if (record) {
		return JSON.parse(record) as DownloadRecordType[]
	}
	return [] as DownloadRecordType[]
}

export const setAllDownloadRecord = (records: DownloadRecordType[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}
