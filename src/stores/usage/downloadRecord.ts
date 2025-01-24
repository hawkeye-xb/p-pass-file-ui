import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from "uuid";
import { getConfig } from '@/services';
import type { MetadataType } from '@/types';
import { DownloadStatusEnum, getAllDownloadRecord, setAllDownloadRecord, type DownloadRecordType } from '@/services/usage/download';
import type { PATH_TYPE } from '@/const';

export const useDownloadRecordStore = defineStore('downloadRecord', () => {
	const downloadRecord: Ref<DownloadRecordType[]> = ref([]);

	const pendingQueue: Ref<DownloadRecordType[]> = ref([]);
	const processingQueue: Ref<DownloadRecordType[]> = ref([]); // 任务队列

	const add = (record: DownloadRecordType) => {
		downloadRecord.value.push(record);
		syncRecord();

		setRecordToPendingQueue(record);
		// run();
	}

	const init = () => {
		downloadRecord.value = getAllDownloadRecord();
		downloadRecord.value.forEach((record) => setRecordToPendingQueue(record));
	}
	function setRecordToPendingQueue(record: DownloadRecordType) {
		if (
			record.status === DownloadStatusEnum.Waiting
			|| record.status === DownloadStatusEnum.Downloading
			|| record.status === DownloadStatusEnum.Paused
		) {
			pendingQueue.value.push(record);
		}
		record.children?.forEach((child) => setRecordToPendingQueue(child));
	}
	function syncRecord() {
		setAllDownloadRecord(downloadRecord.value);
	}
	return {
		init,
		downloadRecord,
		add,
		// pendingQueue, processingQueue
	}
})

export const generateDownloadRecord = (downloadTarget: MetadataType): DownloadRecordType | undefined => {
	const downloadPath = getConfig('downloadPath');
	if (!downloadPath) { return; }

	// metadata 已经有 children信息
	const gcRecord = (info: MetadataType, parentPaths: string[]): DownloadRecordType => {
		return {
			id: uuidv4(),
			name: info.name,
			status: DownloadStatusEnum.Waiting,
			stime: 0,
			etime: 0,
			size: info.size,
			type: info.type as PATH_TYPE,
			downloadSourcePath: info.path,
			downloadTargetPath: downloadPath,
			downloadTempraryPath: '',
			parentPaths,
			children: info.children?.map((child) => gcRecord(child, [...parentPaths, info.name])) || undefined,
		}
	}

	return gcRecord(downloadTarget, []);
}