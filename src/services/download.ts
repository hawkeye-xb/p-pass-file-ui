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

/*
Scheduler:
：待执行任务；每次操作都更新本地存储；
所有任务状态都是waited
1. 按照顺序执行（修改状态为processing）
2. 优先传输，立即执行（修改状态为processing），被动终止当前执行队尾（修改状态为paused）；同时将优先任务放到队头；
3. 任何执行完成之后，任务状态更新为finished；重新从待执行任务中获取任务；（waited 和 paused）的状态的
4. 强行终止等待的和执行的任务；（修改状态为canceled）
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

export function generateDownloadItem(record: MetadataType, savedPath?: string): TransportItemType;
export function generateDownloadItem(record: MetadataType, savedPath?: string): TransportItemType | undefined;
export function generateDownloadItem(record: MetadataType, savedPath?: string): TransportItemType | undefined {
	if (record.type === PATH_TYPE.DIR && !savedPath) {
		// todo: 先不支持，使用客户端吧。
		return undefined;
	}

	const item: TransportItemType = {
		id: uuidv4(),
		metadata: { ...record },
		savedPath: savedPath || '',
		stime: 0,
		etime: 0,
		status: TransportStatus.waiting,
	}

	// 业务拦截
	downloadQueue.push({
		name: record.name,
		target: savedPath || '',
		type: record.type,
		size: record.size,
		status: TransportStatus.waiting,
	});

	if (record.children) {
		const targetPath = path.join(savedPath || '', record.name);
		item.children = record.children
			.map(child => generateDownloadItem(child, targetPath))
			.filter((child): child is TransportItemType => child !== undefined)

		item.metadata.children = undefined;
	}

	return item;
}

