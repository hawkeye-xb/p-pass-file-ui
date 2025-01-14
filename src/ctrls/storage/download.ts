import type { MetadataType } from "@/types";

export enum DownloadStatus {
	'waiting' = 0, // 等待中
	'transporting' = 1, // 传输中
	'paused' = 2, // 暂停; 被动暂停
	'finished' = 3, // 完成
	'failed' = 4, // 失败
	'cancelled' = 5, // 取消
	'holded' = 6, // 等待中，但是不执行；主动暂停
}

export interface DownloadItemType {
	id: string, // 唯一标识
	metadata: MetadataType, // 基本的元数据信息
	savedPath: string, // 保存的路径；用于跳转到目录，如果是存储侧则可以跳转到文件夹; 有这个是不是就可以终止续传了
	stime: number, // 开始时间
	etime: number, // 结束时间
	status: DownloadStatus, // 状态
	children?: DownloadItemType[], // 子项
}

const itemKey = 'downloadItems'
export const getDownloadItems = (): DownloadItemType[] => {
	try {
		const item = localStorage.getItem(itemKey)
		if (item) {
			return JSON.parse(item)
		}

		return []
	} catch (error) {
		console.warn(error)
		return []
	}
}

export const setDownloadItems = (item: DownloadItemType[]) => {
	try {
		localStorage.setItem(itemKey, JSON.stringify(item))
	} catch (error) {
		console.warn(error)
	}
}


export interface DownloadQueueType {
	id: string, // 唯一标识
	name: string, // 如果当前是目录，创建目录的名称；如果是文件，上传的文件名称
	target: string, // 目标路径; 只能是目录
	type: string, // PATH_TYPE
	size: number, // 文件大小
	status: DownloadStatus, // 状态
}
const downloadQueueKey = 'downloadQueue'
export const getDownloadQueueItems = (): DownloadQueueType[] => {
	try {
		const item = localStorage.getItem(downloadQueueKey)
		if (item) {
			return JSON.parse(item)
		}
		return []
	} catch (error) {
		console.warn(error)
		return []
	}
}
export const setDownloadQueueItems = (item: DownloadQueueType[]) => {
	try {
		localStorage.setItem(downloadQueueKey, JSON.stringify(item))
	} catch (error) {
		console.warn(error)
	}
}

