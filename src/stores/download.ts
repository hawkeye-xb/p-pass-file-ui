/*
提供状态管理。必须与保存的信息一致
创建任务与执行任务分开
*/
import { setTransportAllItem, TransportDirection, TransportStatus, type TransportItemType } from "@/ctrls";
import type { MetadataType } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDownloadStore = defineStore("download", () => {
	const download = ref<TransportItemType[]>([]);
	const resetDownload = (items?: TransportItemType[]) => {
		download.value = items || []
	}
	const updateToStorage = () => {
		setTransportAllItem(TransportDirection.download, download.value)
	}

	const updateItemStatus = (id: string, status: TransportStatus) => {
		const index = download.value.findIndex(item => item.id === id)
		if (index === -1) {
			return
		}
		download.value[index].status = status
		updateToStorage()
	}

	return {
		download,
		resetDownload,
		updateItemStatus,
	};
});