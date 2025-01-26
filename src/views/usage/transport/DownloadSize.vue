<script setup lang="ts">
import { DownloadStatusEnum, type DownloadRecordType } from '@/services/usage/download';
import { onBeforeUnmount, ref, watch, type PropType } from 'vue';
import {
	IconDelete,
	IconClose,
	IconFolder,
	IconPause,
	IconPlayArrow,
} from '@arco-design/web-vue/es/icon';
import { convertBytes } from '@/utils';
import { useDownloadRecordStore } from '@/stores/usage/downloadRecord';
import type { ClientLargeFileDownloader } from '@/services/download/ClientLargeFileDownloader';
import { Message } from '@arco-design/web-vue';
import path from 'path-browserify';
import { PATH_TYPE } from '@/const';

const downloadRecordStore = useDownloadRecordStore();

const props = defineProps({
	downloadRecord: {
		type: Object as PropType<DownloadRecordType>,
		required: true,
	},
})

const sizeText = ref('-');

const handleDelete = () => {
	downloadRecordStore.removeRecord(props.downloadRecord);
}
const pausedIconVisible = ref(false);
const handlePaused = () => {
	downloadRecordStore.pausedRecord(props.downloadRecord);
}
const resumeIconVisible = ref(false);
const handleResume = () => {
	downloadRecordStore.resumeRecord(props.downloadRecord);
}
watch(() => props.downloadRecord, (newValue, oldValue) => {
	const status = newValue.status;
	pausedIconVisible.value = false;
	resumeIconVisible.value = false;

	if (status === DownloadStatusEnum.Completed && props.downloadRecord.type === PATH_TYPE.FILE) {
		sizeText.value = convertBytes(props.downloadRecord.size || 0)
	}
	if (status === DownloadStatusEnum.Waiting || status === DownloadStatusEnum.Downloading) {
		pausedIconVisible.value = true;
	}
	if (status === DownloadStatusEnum.Paused) {
		resumeIconVisible.value = true;
	}
}, { immediate: true, deep: true })

let downloader: ClientLargeFileDownloader | undefined;
const totalSize = convertBytes(props.downloadRecord.size || 0);
watch(() => downloadRecordStore.largeFileDownloaderSize, () => {
	if (props.downloadRecord.type !== PATH_TYPE.FILE || props.downloadRecord.size < 3 * 1024 * 1024) { // todo: 统一设置大文件阈值
		return;
	}

	downloader = downloadRecordStore.getLargeFileDownloader(props.downloadRecord);
	if (downloader) {
		downloader.onDownloadSizeChange = undefined;
		downloader.onDownloadSizeChange = (size) => {
			sizeText.value = convertBytes(size) + '/' + totalSize;
		}
	}
}, { immediate: true })

onBeforeUnmount(() => {
	if (downloader) {
		downloader.onDownloadSizeChange = undefined;
	}
})

const handleOpenFolder = () => {
	if (!window.electron) {
		Message.error('打开文件夹需要在客户端环境使用');
		return;
	}
	const fullPath = props.downloadRecord.parentPaths.length > 0
		? path.join(props.downloadRecord.locationSavePath, ...props.downloadRecord.parentPaths, props.downloadRecord.name)
		: path.join(props.downloadRecord.locationSavePath, props.downloadRecord.name);
	window.electron.showItemInFolder(fullPath);
}
</script>
<template>
	<div class="size-cell">
		<a-space class="hover-hook">
			<a-tooltip content="Show in folder(todo)">
				<IconFolder class="icon" @click="handleOpenFolder" />
			</a-tooltip>
			<a-tooltip content="cancel & delete download">
				<IconClose class="icon" @click="handleDelete" />
			</a-tooltip>
			<a-tooltip content="Pause upload" v-if="pausedIconVisible">
				<IconPause class="icon" @click="handlePaused" />
			</a-tooltip>
			<a-tooltip content="Resume upload" v-if="resumeIconVisible">
				<IconPlayArrow class="icon" @click="handleResume" />
			</a-tooltip>
		</a-space>
		<span class="hover-hook-span">{{ sizeText }}</span>
	</div>
</template>

<style scoped>
.size-cell {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
	/* width: 88px; */
	height: 22px;
}

.hover-hook {
	display: none;
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.size-cell:hover .hover-hook {
	display: flex;
}

.hover-hook-span {
	display: block;
}

.size-cell:hover .hover-hook-span {
	display: none;
}
</style>