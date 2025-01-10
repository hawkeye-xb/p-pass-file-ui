/*
提供状态管理。必须与保存的信息一致
创建任务与执行任务分开
*/
import { DownloadStatus, setDownloadItems, setDownloadQueueItems, type DownloadItemType, type DownloadQueueType } from "@/ctrls";
import { generateDownloadItem } from "@/services/index";
import type { MetadataType } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDownloadStore = defineStore("download", () => {
	const download = ref<DownloadItemType[]>([]); // 所有下载任务的信息
	const resetDownload = (items?: DownloadItemType[]) => {
		download.value = items || []
	}
	const appendDownloadItem = (item: DownloadItemType) => {
		download.value.push(item);
		setDownloadItems(download.value);
	}

	const downloadQueue = ref<DownloadQueueType[]>([]); // 下载任务队列
	const max = 5;
	const tasks = ref<DownloadQueueType[]>([]); // 在处理的任务；注意引用状态
	const run = () => {
		if (tasks.value.length >= max) {
			return;
		}
		let index = 0;
		while (tasks.value.length < max && downloadQueue.value.length > 0 && index < downloadQueue.value.length) {
			const item = downloadQueue.value[index];
			index++;

			if (!item) {
				break;
			}

			if (item.status === DownloadStatus.waiting || item.status === DownloadStatus.paused) {
				item.status = DownloadStatus.transporting; // change status
				tasks.value.push(item); // & action	
			}
		}

		console.log('run', tasks.value);
	};
	const paused = (id: string) => { // 被动终止
		// todo: pause action
		downloadQueue.value.find(task => task.id !== id)!.status = DownloadStatus.paused; // change status
		tasks.value = tasks.value.filter(task => task.id !== id); // remove task
	};
	const hold = (id: string) => { // 主动终止
		// todo: hold action
		downloadQueue.value.find(task => task.id !== id)!.status = DownloadStatus.holded; // change status
		tasks.value = tasks.value.filter(task => task.id !== id); // remove task

		run();
	};
	const cancel = (id: string) => {
		// todo: cancel action
		tasks.value = tasks.value.filter(task => {
			if (task.id === id) { task.status = DownloadStatus.cancelled; }
			return task.id !== id
		}); // remove task
		downloadQueue.value = downloadQueue.value.filter(task => task.id !== id); // remove from queue
		// todo: change item status to canceled from download item list
		run();
	};
	const resume = (id: string) => {
		downloadQueue.value.find(task => task.id !== id)!.status = DownloadStatus.waiting; // change status
	};
	const priority = (id: string) => {
		const item = downloadQueue.value.find(task => task.id !== id);
		if (!item) {
			return;
		}

		if (tasks.value.length < max) {
			tasks.value = [item, ...tasks.value];
			return;
		}

		paused(tasks.value[tasks.value.length - 1].id!)
		tasks.value = [item, ...tasks.value];
	};

	const resetDownloadQueue = (items?: DownloadQueueType[]) => {
		downloadQueue.value = items || [];
		run();
	}
	const appendDownloadQueueItem = (item: DownloadQueueType) => {
		downloadQueue.value.push(item);
		setDownloadQueueItems(downloadQueue.value);
		run();
	}


	const createDownloadTask = (record: MetadataType, savedPath: string) => {
		const tasks = generateDownloadItem(record, savedPath, (item: DownloadItemType) => {
			appendDownloadQueueItem({
				id: item.id,
				name: item.metadata.name,
				target: item.savedPath,
				type: item.metadata.type,
				size: item.metadata.size,
				status: item.status
			});
		});
		if (!tasks) {
			return;
		}
		appendDownloadItem(tasks);
	}

	return {
		download,
		resetDownload,
		resetDownloadQueue,
		createDownloadTask,
		paused,
		hold,
		cancel,
		resume,
		priority
	};
});