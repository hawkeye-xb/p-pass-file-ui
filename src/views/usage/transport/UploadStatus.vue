<script setup lang="ts">
import { PATH_TYPE } from '@/const';
import { UploadStatusEnum, type UploadRecordType, type UploadStatusType } from '@/services/usage/upload';
import { convertBytes, dateFormat } from '@/utils';
import { ref, onBeforeUnmount, watch, type PropType, computed } from 'vue';
import { useUploadRecordStore } from '@/stores/usage/uploadRecord';
import type { LargeFileUploadAbstractClass } from '@/services/upload/LargeFileUploadAbstractClass';

const uploadRecordStore = useUploadRecordStore();
const props = defineProps({
	uploadRecord: {
		type: Object as PropType<UploadRecordType>,
		required: true,
	},
})

const progressVisible = ref(false);

const progress = ref(0);
const speed = ref(''); // bytes/s
const statusText = ref('');

watch(() => props.uploadRecord, (newValue) => {
	const status = newValue.status;
	speed.value = '';
	if (status === UploadStatusEnum.Uploading) {
		progressVisible.value = true;
	} else {
		progressVisible.value = false;
	}
	if (status === UploadStatusEnum.Paused) {
		speed.value = 'Paused';
	}
	if (props.uploadRecord.status === UploadStatusEnum.Uploading) {
		progressVisible.value = true;
	}
	if (props.uploadRecord.status === UploadStatusEnum.Paused) {
		progressVisible.value = true;
		speed.value = 'Paused';
	}

	// statusText
	if (props.uploadRecord.type === PATH_TYPE.DIR) {
		statusText.value = '-';
	} else if (status === UploadStatusEnum.Completed) {
		statusText.value = dateFormat(props.uploadRecord.etime, 'YY-MM-DD ')
	} else {
		statusText.value = props.uploadRecord.status.toString()
	}
}, { immediate: true, deep: true })

let uploader: LargeFileUploadAbstractClass | undefined = undefined;
watch(() => useUploadRecordStore().largeFileUploadersChange, () => {
	uploader = uploadRecordStore.getLargeFileUploader(props.uploadRecord.id);
	if (uploader) {
		uploader.onProgress = undefined;
		uploader.onProgress = (p, s) => {
			// 保留两位小数
			progress.value = Math.round(p * 100) / 100;
			speed.value = convertBytes(s) + '/s';
		}
	}
}, { immediate: true })

onBeforeUnmount(() => {
	if (uploader) {
		uploader.onProgress = undefined;
	}
})
</script>
<template>
	<div>
		<div v-if="progressVisible" style="display: flex;">
			<div style="width: 160px; margin-right: 8px;">
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