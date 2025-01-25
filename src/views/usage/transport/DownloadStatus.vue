<script setup lang="ts">
import { ref, onBeforeUnmount, watch, type PropType, computed } from 'vue';
import { useDownloadRecordStore } from '@/stores/usage/downloadRecord';
import { DownloadStatusEnum, type DownloadRecordType } from '@/services/usage/download';
import { PATH_TYPE } from '@/const';
import { convertBytes, dateFormat } from '@/utils';
import type { ClientLargeFileDownloader } from '@/services/download/ClientLargeFileDownloader';

const downloadRecordStore = useDownloadRecordStore();
const props = defineProps({
	downloadRecord: {
		type: Object as PropType<DownloadRecordType>,
		required: true,
	},
})

const progressVisible = ref(false);
const progress = ref(0);
const speed = ref(''); // bytes/s
const statusText = ref('');
if (props.downloadRecord.type === PATH_TYPE.DIR) {
	statusText.value = '-';
}

watch(() => props.downloadRecord, (newValue) => {
	const status = newValue.status;
	speed.value = '';
	if (status === DownloadStatusEnum.Downloading) {
		progressVisible.value = true;
	} else {
		progressVisible.value = false;
	}

	if (status === DownloadStatusEnum.Paused) {
		speed.value = 'Paused';
	}

	if (props.downloadRecord.type === PATH_TYPE.DIR) { return; }
	if (status === DownloadStatusEnum.Completed) {
		statusText.value = dateFormat(props.downloadRecord.etime, 'YY-MM-DD HH:mm:ss')
	} else {
		statusText.value = props.downloadRecord.status.toString()
	}
}, { immediate: true, deep: true })

let downloader: ClientLargeFileDownloader | undefined;
watch(() => downloadRecordStore.largeFileDownloaderSize, () => {
	downloader = downloadRecordStore.getLargeFileDownloader(props.downloadRecord);
	if (downloader) {
		downloader.onProgress = undefined;
		downloader.onProgress = (p, s) => {
			progress.value = Math.round(p * 100) / 100;
			speed.value = convertBytes(s) + '/s';
		}
	}
}, { immediate: true })

onBeforeUnmount(() => {
	if (downloader) {
		downloader.onProgress = undefined;
	}
})
</script>

<template>
	<div>
		<div v-if="progressVisible" style="display: flex;">
			<div style="width: 152px; margin-right: 8px;">
				<a-progress :percent="progress" :show-text="false">
				</a-progress>
			</div>
			<span>{{ speed }}</span>
		</div>
		<div v-else>
			{{ statusText }}
		</div>
	</div>
</template>