<script setup lang="ts">
import { UploadStatusEnum, type UploadRecordType, type UploadStatusType } from '@/services/usage/upload';
import { UploadScheduler } from '@/services/usage/UploadScheduler';
import { convertBytes, dateFormat } from '@/utils';
import { ref, onBeforeUnmount, watch, type PropType, computed } from 'vue';

const props = defineProps({
	uploadRecord: {
		type: Object as PropType<UploadRecordType>,
		required: true,
	},
})

const progressVisible = ref(false);

const progress = ref(0);
const speed = ref(''); // bytes/s

const uploader = UploadScheduler.getInstance().getUploader(props.uploadRecord.id);
if (uploader) {
	uploader.onProgress = (p, s) => {
		// 保留两位小数
		progress.value = Math.round(p * 100) / 100;
		speed.value = convertBytes(s) + '/s';
	}

	if (props.uploadRecord.status === UploadStatusEnum.Uploading) {
		progressVisible.value = true;
	}
	if (props.uploadRecord.status === UploadStatusEnum.Paused) {
		progressVisible.value = true;
		speed.value = 'Paused';
	}
}

const statusText = computed(() => {
	console.log(props.uploadRecord.status, 'statusText');
	if (props.uploadRecord.status === UploadStatusEnum.Completed) {
		return dateFormat(props.uploadRecord.etime, 'YY-MM-DD ')
	}

	return props.uploadRecord.status;
});

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