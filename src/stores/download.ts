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

	const downloadQueue = ref<DownloadQueueType[]>([]); // 下载任务队列
	const max = 5;
	const tasks = ref<DownloadQueueType[]>([]); // 在处理的任务；注意引用状态
	const syncStatus = (items: DownloadItemType[]) => { // downloadQueue 所有状态 同步到 download 中
		items.forEach(item => {
			const task = downloadQueue.value.find(task => task.id === item.id);
			if (task) {
				item.status = task.status;
			}
			if (item.children) {
				syncStatus(item.children);
			}
		})
	}
	const run = () => {
		if (tasks.value.length >= max) {
			return;
		}

		const processQueue = (statusFilters: DownloadStatus[]) => {
			let index = 0;
			while (tasks.value.length < max && index < downloadQueue.value.length) {
				const item = downloadQueue.value[index];
				index++;

				if (!item) continue;
				if (tasks.value.find(task => task.id === item.id)) continue;

				if (statusFilters.includes(item.status)) {
					item.status = DownloadStatus.transporting;
					downloadQueue.value[index - 1].status = DownloadStatus.transporting;
					tasks.value.push(item);
				}
			}
		};

		processQueue([DownloadStatus.transporting]);
		processQueue([DownloadStatus.waiting, DownloadStatus.paused]);

		setDownloadQueueItems(downloadQueue.value);
	};
	const paused = (id: string) => { // 被动终止
		// todo: pause action
		downloadQueue.value.find(task => task.id === id)!.status = DownloadStatus.paused; // change status
		tasks.value = tasks.value.filter(task => task.id !== id); // remove task
	};
	const hold = (id: string) => { // 主动终止
		// todo: hold action
		const item = downloadQueue.value.find(task => task.id === id);
		if (!item) {
			console.warn('task not found', id, downloadQueue.value);
			return;
		}
		item.status = DownloadStatus.holded;

		tasks.value = tasks.value.filter(task => task.id !== id);

		run(); // will update setDownloadQueueItems(downloadQueue.value);
	};
	const cancel = (id: string) => {
		// todo: cancel action
		tasks.value = tasks.value.filter(task => {
			if (task.id === id) { task.status = DownloadStatus.cancelled; }
			return task.id !== id
		}); // remove task

		downloadQueue.value.find(task => task.id === id)!.status = DownloadStatus.cancelled; // change status
		syncStatus(download.value); // sync status
		setDownloadItems(download.value); // save to local storage

		downloadQueue.value = downloadQueue.value.filter(task => task.id !== id); // remove from queue

		// todo: change item status to canceled from download item list
		run(); // setDownloadQueueItems(downloadQueue.value);
	};
	const resume = (id: string) => {
		downloadQueue.value.find(task => task.id === id)!.status = DownloadStatus.waiting;

		run(); // setDownloadQueueItems(downloadQueue.value);
	};
	const priority = (id: string) => {
		const item = downloadQueue.value.find(task => task.id === id);
		if (!item) {
			return;
		}

		if (tasks.value.length < max) {
			const idx = tasks.value.findIndex(task => task.id === id);
			if (idx !== -1) {
				const [moved] = tasks.value.splice(idx, 1);
				tasks.value.unshift(moved);
			}
			return;
		}

		paused(tasks.value[tasks.value.length - 1].id!)
		tasks.value = [item, ...tasks.value];

		setDownloadQueueItems(downloadQueue.value);
	};

	const resetDownloadQueue = (items?: DownloadQueueType[]) => {
		downloadQueue.value = items || [];

		run();
	}

	const createDownloadTask = (record: MetadataType, savedPath: string) => {
		const tasks = generateDownloadItem(record, savedPath, (item: DownloadItemType) => {
			downloadQueue.value.push({
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

		download.value.push(tasks);

		setDownloadItems(download.value);
		setDownloadQueueItems(downloadQueue.value);

		run();
	}

	return {
		download,
		resetDownload,
		downloadQueue,
		resetDownloadQueue,
		createDownloadTask,
		paused,
		hold,
		cancel,
		resume,
		priority
	};
});