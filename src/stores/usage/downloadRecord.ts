import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from "uuid";
import { getConfig } from '@/services';
import type { MetadataType } from '@/types';
import { DownloadStatusEnum, getAllDownloadRecord, setAllDownloadRecord, type DownloadRecordType } from '@/services/usage/download';
import { PATH_TYPE } from '@/const';
import { ClientLargeFileDownloader } from '@/services/download/ClientLargeFileDownloader';
import { createDir, createTemporaryDir, preUploadValidate, uploadFile, usageDownloadFile } from '@/ctrls';
import path from 'path-browserify';

const taskNum = 2;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
export const useDownloadRecordStore = defineStore('downloadRecord', () => {
	const downloadRecord: Ref<DownloadRecordType[]> = ref([]);

	const pendingQueue: Ref<DownloadRecordType[]> = ref([]);
	const processingQueue: Ref<DownloadRecordType[]> = ref([]); // 任务队列

	const largeFileDownloaderMap: Map<string, ClientLargeFileDownloader> = new Map();
	const largeFileDownloaderSize = ref(0);

	function getLargeFileDownloader(record: DownloadRecordType) {
		return largeFileDownloaderMap.get(record.id);
	}

	function update(record: DownloadRecordType) {
		downloadRecord.value = handleRecordUpdate(downloadRecord.value, record, (item) => record);
		syncRecord();
	}

	function paused(record: DownloadRecordType) {
		const records = handleRecordUpdate(downloadRecord.value, record, (item) => {
			item.status = DownloadStatusEnum.Paused;
			item.children?.forEach((child) => paused(child));
			return item;
		})

		return records;
	}
	function pausedRecord(record: DownloadRecordType) {
		downloadRecord.value = paused(record);
		syncRecord();
	}

	function resume(record: DownloadRecordType) {
		const records = handleRecordUpdate(downloadRecord.value, record, (item) => {
			item.status = DownloadStatusEnum.Waiting;
			item.children?.forEach((child) => resume(child));
			return item;
		})
		return records;
	}

	function resumeRecord(record: DownloadRecordType) {
		downloadRecord.value = resume(record);
		syncRecord();
	}

	function run() {
		if (pendingQueue.value.length === 0) { return; }
		if (processingQueue.value.length >= taskNum) { return; }

		for (const record of pendingQueue.value) {
			if (processingQueue.value.some(el => el.id === record.id)) { continue; }
			if (record.status === DownloadStatusEnum.Downloading) {
				console.warn('record is already in processingQueue'); // 目前不支持
				return;
			}
			if (record.status === DownloadStatusEnum.Waiting) {
				record.status = DownloadStatusEnum.Downloading;
				record.stime = Date.now();

				processingQueue.value.push(record);
				handle(record);
				update({ ...record });

				run();
				return;
			}
		}
	}

	function add(record: DownloadRecordType) {
		downloadRecord.value.push(record);
		syncRecord();

		setRecordToPendingQueue(record);
		// run();
	}

	function init() {
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

	function handleRecordUpdate(
		items: DownloadRecordType[], target: DownloadRecordType,
		callback: (item: DownloadRecordType) => DownloadRecordType
	): DownloadRecordType[] {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.id === target.id) {
				items[i] = callback(item);
				return [...items]; // 新数组
			}

			if (item.children) {
				const children = handleRecordUpdate(item.children, target, callback); // 如果返回新数组
				if (children !== item.children) {
					item.children = children;
					return [...items];
				}
			}
		}

		return items;
	}

	function handleCompleted(record: DownloadRecordType, status: DownloadStatusEnum) {
		// 大文件移除在完成的时候就调用了
		pendingQueue.value = pendingQueue.value.filter((item) => item.id !== record.id); // 从 pendingQueue 移除
		processingQueue.value = processingQueue.value.filter((item) => item.id !== record.id); // 从 processingQueue 移除

		update({
			...record,
			status,
			etime: Date.now(),
		});

		run();
	}

	async function handle(record: DownloadRecordType) {
		if (largeFileDownloaderMap.has(record.id)) {
			const downloader = largeFileDownloaderMap.get(record.id);
			downloader?.resume();
			downloader?.start();
			return;
		}
		if (record.type === PATH_TYPE.DIR) {
			const createDirRes = await createDir({
				target: record.locationSavePath,
				name: record.name,
				parentPaths: record.parentPaths,
			});
			const createDirResJson = await createDirRes.json();

			handleCompleted(record, createDirResJson.code !== 0 ? DownloadStatusEnum.Error : DownloadStatusEnum.Completed);
			if (createDirResJson.code !== 0) { console.warn(createDirResJson); }
			return;
		}

		const preUploadValidateRes = await preUploadValidate({
			target: record.parentPaths?.length ? path.join(record.locationSavePath, ...record.parentPaths) : record.locationSavePath,
			name: record.name,
			size: record.size.toString(),
		})
		const preUploadValidateResJson = await preUploadValidateRes.json();
		if (preUploadValidateResJson.code !== 0) {
			console.warn(preUploadValidateResJson);
			handleCompleted(record, DownloadStatusEnum.Error);
			return;
		}

		if (record.size < MAX_FILE_SIZE) {
			const res = await fileDownload(record);
			handleCompleted(record, res !== null ? DownloadStatusEnum.Error : DownloadStatusEnum.Completed);
			return;
		}

		const tempPathRes = await createTemporaryDir();
		const tempPathResJson = await tempPathRes.json();
		if (tempPathResJson.code !== 0) {
			console.warn(tempPathResJson);
			handleCompleted(record, DownloadStatusEnum.Error);
			return;
		}
		record.locationTemporaryPath = tempPathResJson.data.path;
		update({ ...record });

		const largeFileDownloader = new ClientLargeFileDownloader({
			downloadRecord: record,
		});
		largeFileDownloaderMap.set(record.id, largeFileDownloader);
		largeFileDownloaderSize.value = largeFileDownloaderMap.size;

		const completedAndDestroy = () => {
			handleCompleted(record, DownloadStatusEnum.Completed);
			largeFileDownloaderMap.delete(record.id);
			largeFileDownloaderSize.value = largeFileDownloaderMap.size;

			setTimeout(() => {
				largeFileDownloader.destroy();
			}, 0);
		}
		largeFileDownloader.onCompleted = completedAndDestroy;
		largeFileDownloader.onError = completedAndDestroy;

		largeFileDownloader.start();
	}
	return {
		init,
		downloadRecord,
		add,
		pendingQueue,
		pausedRecord,
		resumeRecord,
		largeFileDownloaderSize,
		getLargeFileDownloader,
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
			locationSavePath: downloadPath,
			locationTemporaryPath: '',
			parentPaths,
			children: info.children?.map((child) => gcRecord(child, [...parentPaths, info.name])) || undefined,
		}
	}

	return gcRecord(downloadTarget, []);
}

async function fileDownload(record: DownloadRecordType) {
	try {
		const ctx = await usageDownloadFile({
			target: record.downloadSourcePath,
		});
		const body = ctx.response.body;
		if (body.code !== 0) {
			return body;
		}
		const arrayBuffer = body.data;

		const blob = new Blob([arrayBuffer]);
		const saveRes = await uploadFile({
			target: record.parentPaths?.length ? path.join(record.locationSavePath, ...record.parentPaths) : record.locationSavePath,
			name: record.name,
			file: new File([blob], record.name, { type: 'application/octet-stream' }),
		});
		const saveResJson = await saveRes.json();
		if (saveResJson.code !== 0) {
			return saveResJson;
		}
		return null;
	} catch (error) {
		return error
	}
}