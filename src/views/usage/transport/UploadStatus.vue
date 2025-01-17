<script setup lang="ts">
import { UploadStatusEnum, type UploadRecordType } from '@/services/usage/upload';
import { UploadScheduler } from '@/services/usage/UploadScheduler';
import { convertBytes } from '@/utils';
import { ref, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
	// UploadRecordType
	uploadRecord: {
		type: Object,
		required: true,
	},
})

const progress = ref(0);
const speed = ref('');

const uploader = UploadScheduler.getInstance().getUploader(props.uploadRecord.id);
if (uploader) {
	uploader.onProgress = (p, s) => {
		// 保留两位小数
		progress.value = Math.round(p * 100) / 100;
		speed.value = convertBytes(s)
	}
}

onBeforeUnmount(() => {
	if (uploader) {
		uploader.onProgress = undefined;
	}
})
</script>
<template>
	<div>
		<div v-if="uploadRecord.status === UploadStatusEnum.Uploading" style="display: flex;">
			<div style="width: 160px; margin-right: 8px;">
				<a-progress :percent="progress" :show-text="false">
				</a-progress>
			</div>
			<span>{{ speed }} / S </span>
		</div>
		<div v-else>
			{{ uploadRecord.status }}
		</div>
	</div>
</template>