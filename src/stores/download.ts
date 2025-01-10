/*
提供状态管理。必须与保存的信息一致
创建任务与执行任务分开
*/
import { setTransportAllItem, TransportDirection, TransportStatus, type TransportItemType } from "@/ctrls";
import { generateDownloadItem } from "@/services/download";
import type { MetadataType } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDownloadStore = defineStore("download", () => {
	const download = ref<TransportItemType[]>([]); // 所有下载任务的信息
	const resetDownload = (items?: TransportItemType[]) => {
		download.value = items || []
	}
	const appendDownloadItem = (item: TransportItemType) => {
		download.value.push(item);
		setTransportAllItem(TransportDirection.download, download.value);
	}

	const createDownloadTask = (record: MetadataType, savedPath: string | undefined) => {
		const tasks = generateDownloadItem(record, savedPath);
		if (!tasks) {
			return;
		}
		appendDownloadItem(tasks);
	}

	return {
		download,
		resetDownload,
		createDownloadTask
	};
});