/*
三种下载方式
1. 下载文件
2. 下载目录
 2.1 下载目录下的所有文件，按照目录结构（客户端）
 2.2 下载目录下的ZIP（浏览器端）

两类状态：1. 完成 2. 未完成
完成就是全量的数据更新
未完成则有拍平的队列

一个处理队列；事件循环队列；需要与未完成队列同步
*/

import { v4 as uuidv4 } from "uuid";
import { TransportStatus, type TransportItemType } from "@/ctrls";
import type { MetadataType } from "@/types";
import { PATH_TYPE } from "@/const";
import path from 'path-browserify';

interface DownloadQueueType {
	name: string, // 如果当前是目录，创建目录的名称；如果是文件，上传的文件名称
	target: string, // 目标路径; 只能是目录
	type: string, // PATH_TYPE
	size: number, // 文件大小
	status: TransportStatus, // 状态
}
const downloadQueue: DownloadQueueType[] = [];

function generateDownloadItem(record: MetadataType, savePath?: string): TransportItemType;
function generateDownloadItem(record: MetadataType, savePath?: string): TransportItemType | undefined;
function generateDownloadItem(record: MetadataType, savePath?: string): TransportItemType | undefined {
	if (record.type === PATH_TYPE.DIR && !savePath) {
		// todo: 先不支持，使用客户端吧。
		return undefined;
	}

	const item: TransportItemType = {
		id: uuidv4(),
		metadata: { ...record, children: undefined },
		savePath: savePath || '',
		stime: 0,
		etime: 0,
		status: TransportStatus.waiting,
	}

	// 业务拦截
	downloadQueue.push({
		name: record.name,
		target: savePath || '',
		type: record.type,
		size: record.size,
		status: TransportStatus.waiting,
	});

	if (record.children) {
		const targetPath = path.join(savePath || '', record.name);
		item.children = record.children
			.map(child => generateDownloadItem(child, targetPath))
			.filter((child): child is TransportItemType => child !== undefined)
	}

	return item;
}

