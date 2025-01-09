import type { MetadataType } from "@/types";

// todo: 已经完成的应该和进行中的分离开，读写的内容能变少一些

// 怎么判断状态？不同状态需要的数据
export enum TransportStatus {
	'waiting' = 0, // 等待中
	'transporting' = 1, // 传输中
	'paused' = 2, // 暂停
	'finished' = 3, // 完成
	'failed' = 4, // 失败
}
export interface TransportItemType {
	id: string, // 唯一标识
	metadata: MetadataType, // 基本的元数据信息
	savePath: string, // 保存的路径；用于跳转到目录，如果是存储侧则可以跳转到文件夹; 有这个是不是就可以终止续传了
	stime: number, // 开始时间
	etime: number, // 结束时间
	status: TransportStatus, // 状态
}

export enum TransportDirection {
	'upload' = 0,
	'download' = 1,
}

export const getTransportItem = (type: TransportDirection): TransportItemType[] => {
	try {
		const itemKey = type === TransportDirection.upload ? 'upload' : 'download'
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

export const setTransportItem = (type: TransportDirection, item: TransportItemType) => {
	try {
		const itemKey = type === TransportDirection.upload ? 'upload' : 'download'
		const items = getTransportItem(type)
		items.push(item)
		localStorage.setItem(itemKey, JSON.stringify(items))
	} catch (error) {
		console.warn(error)
	}
}

export const setTransportAllItem = (type: TransportDirection, item: TransportItemType[]) => {
	try {
		const itemKey = type === TransportDirection.upload ? 'upload' : 'download'
		localStorage.setItem(itemKey, JSON.stringify(item))
	} catch (error) {
		console.warn(error)
	}
}
