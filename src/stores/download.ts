import { v4 as uuidv4 } from "uuid";
import { TransportStatus, type TransportItemType } from "@/ctrls";
import type { MetadataType } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDownloadStore = defineStore("download", () => {
	const download = ref<TransportItemType[]>([]);

	const resetDownload = (items?: TransportItemType[]) => {
		download.value = items || []
	}

	const appendDownload = (record: MetadataType, target?: string) => {
		const item: TransportItemType = {
			id: uuidv4(),
			metadata: record,
			savePath: target || '', // 下载到的目录; 无值怎么办？浏览器的
			stime: Date.now(),
			etime: 0,
			status: TransportStatus.waiting,
		}
		download.value.push(item)
		// 任何操作都更新本地存储
		// 再触发下载事件
	}

	const updateItemStatus = (id: string, status: TransportStatus) => {
		const index = download.value.findIndex(item => item.id === id)
		if (index === -1) {
			return
		}
		download.value[index].status = status
	}

	return {
		download,
		resetDownload,
		appendDownload,
		updateItemStatus,
	};
});