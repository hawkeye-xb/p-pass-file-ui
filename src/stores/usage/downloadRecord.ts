import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from "uuid";
import { getConfig } from '@/services';
import type { MetadataType } from '@/types';
import { DownloadStatusEnum, getAllDownloadRecord, setAllDownloadRecord, type DownloadRecordType } from '@/services/usage/download';
import { PATH_TYPE } from '@/const';
import { ClientLargeFileDownloader } from '@/services/download/ClientLargeFileDownloader';
import { createDir, createTemporaryDir, getMetadata, preUploadValidate, uploadFile, usageDownloadFile } from '@/ctrls';
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

	function remove(record: DownloadRecordType) {
		const records = handleRecordUpdate(downloadRecord.value, record, (item) => {
			item.status = DownloadStatusEnum.Canceled;
			item.children?.forEach((child) => remove(child));

			pendingQueue.value = pendingQueue.value.filter((el) => el.id !== record.id); // 从等待队列中移除
			processingQueue.value = processingQueue.value.filter((el) => el.id !== record.id); // 从任务队列中移除

			if (largeFileDownloaderMap.has(record.id)) {
				const downloader = largeFileDownloaderMap.get(record.id);
				downloader?.pause(); // 暂停下载
				setTimeout(() => {
					downloader?.destroy(); // 销毁下载器
				}, 0);
				largeFileDownloaderMap.delete(record.id); // 删除下载器
				largeFileDownloaderSize.value = largeFileDownloaderMap.size; // 更新下载器数量
			}

			return undefined;
		})

		return records;
	}

	function removeRecord(record: DownloadRecordType) {
		downloadRecord.value = remove(record);
		syncRecord();
		run();
	}

	function paused(record: DownloadRecordType) {
		const records = handleRecordUpdate(downloadRecord.value, record, (item) => {
			item.status = DownloadStatusEnum.Paused;

			if (largeFileDownloaderMap.has(record.id)) {
				const downloader = largeFileDownloaderMap.get(record.id);
				downloader?.pause(); // 暂停下载
			}

			pendingQueue.value.forEach(item => item.id === record.id && (item.status = DownloadStatusEnum.Paused)); // 更新等待队列的状态
			processingQueue.value = processingQueue.value.filter((el) => el.id !== record.id); // 从任务执行队列中移除

			item.children?.forEach((child) => paused(child));
			return item;
		})

		return records;
	}
	function pausedRecord(record: DownloadRecordType) {
		downloadRecord.value = paused(record);
		syncRecord();
		run();
	}

	function resume(record: DownloadRecordType) {
		const records = handleRecordUpdate(downloadRecord.value, record, (item) => {
			item.status = DownloadStatusEnum.Waiting;

			// 在handle 函数会resume & start
			pendingQueue.value.forEach(item => item.id === record.id && (item.status = DownloadStatusEnum.Waiting)); // 更新等待队列的状态

			item.children?.forEach((child) => resume(child));
			return item;
		})
		return records;
	}

	function resumeRecord(record: DownloadRecordType) {
		downloadRecord.value = resume(record);
		syncRecord();
		run();
	}

	function run() {
		if (pendingQueue.value.length === 0) { return; }
		if (processingQueue.value.length >= taskNum) { return; }

		for (const record of pendingQueue.value) {
			if (processingQueue.value.some(el => el.id === record.id)) { continue; }
			if (record.status === DownloadStatusEnum.Downloading) {
				processingQueue.value.push(record);
				handle(record);
				run();
				return;
			}
			if (record.status === DownloadStatusEnum.Waiting) {
				record.status = DownloadStatusEnum.Downloading;
				record.stime = record.stime || Date.now();

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
		run();
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
		callback: (item: DownloadRecordType) => DownloadRecordType | undefined
	): DownloadRecordType[] {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.id === target.id) {
				const res = callback(item);
				return res === undefined
					? items.filter((_, index) => index !== i) // 直接返回不包含索引 i 的新数组
					: Array.from(items, (item, index) => (index === i ? res : item)); // 创建新数组并替换指定索引的元素
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

		const [resumeErr, options] = await resumeFormBroken(record);
		if (resumeErr) {
			console.warn(resumeErr);
			handleCompleted(record, DownloadStatusEnum.Error);
			return;
		}

		if (!record.locationTemporaryPath) {
			const tempPathRes = await createTemporaryDir();
			const tempPathResJson = await tempPathRes.json();
			if (tempPathResJson.code !== 0) {
				console.warn(tempPathResJson);
				handleCompleted(record, DownloadStatusEnum.Error);
				return;
			}
			record.locationTemporaryPath = tempPathResJson.data.path;
			update({ ...record });
		}

		const largeFileDownloader = new ClientLargeFileDownloader({
			...options,
			currentChunkIndex: options.currentChunkIndex + 1,
			downloadRecord: record,
		});
		largeFileDownloaderMap.set(record.id, largeFileDownloader);
		largeFileDownloaderSize.value = largeFileDownloaderMap.size;

		const completedAndDestroy = (status: DownloadStatusEnum) => {
			handleCompleted(record, status);
			largeFileDownloaderMap.delete(record.id);
			largeFileDownloaderSize.value = largeFileDownloaderMap.size;

			setTimeout(() => {
				largeFileDownloader.destroy();
			}, 0);
		}
		largeFileDownloader.onCompleted = () => completedAndDestroy(DownloadStatusEnum.Completed);
		largeFileDownloader.onError = () => completedAndDestroy(DownloadStatusEnum.Error);

		largeFileDownloader.start();
	}
	return {
		init,
		run,
		downloadRecord,
		add,
		pendingQueue,
		pausedRecord,
		resumeRecord,
		removeRecord,
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


async function resumeFormBroken(record: DownloadRecordType) {
	const defaultResumeInfo: {
		downloadedSize: number;
		currentChunkIndex: number;
		downloadedChunkFilePaths: {
			index: number;
			path: string;
		}[];
	} = {
		downloadedSize: 0,
		currentChunkIndex: 0,
		downloadedChunkFilePaths: [],
	}
	if (!record.locationTemporaryPath) { return [null, defaultResumeInfo]; }

	const metadataRes = await getMetadata({
		target: record.locationTemporaryPath,
		depth: 100,
	})
	const metadataResJson = await metadataRes.json();
	if (metadataResJson.code !== 0) { return [metadataResJson, defaultResumeInfo]; }
	const metadata = metadataResJson.data as MetadataType;

	const result = (metadata.children || []).reduce((acc, cur) => {
		if (cur.name.startsWith(`${record.name}.part.`)) {
			const chunkIndex = parseInt(cur.name.split('.').pop()!, 10);
			if (!isNaN(chunkIndex)) {
				acc.currentChunkIndex = Math.max(acc.currentChunkIndex, chunkIndex);
				acc.downloadedChunkFilePaths.push({
					index: chunkIndex,
					path: cur.path,
				});
			}

			acc.downloadedSize += cur.size;
			return acc;
		}
		return acc;
	}, defaultResumeInfo)

	return [null, result];
}
