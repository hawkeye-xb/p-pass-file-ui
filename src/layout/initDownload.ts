import { getDownloadItems, getDownloadQueueItems } from '@/ctrls/index'
import { useDownloadStore } from '@/stores/download'

export const initDownload = () => {
	const downloadStore = useDownloadStore();
	downloadStore.resetDownload(getDownloadItems())
	downloadStore.resetDownloadQueue(getDownloadQueueItems())
}