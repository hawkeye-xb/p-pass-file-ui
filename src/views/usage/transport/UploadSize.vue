<script setup lang="ts">
import type { UploadRecordType } from '@/services/usage/upload';
import { computed, onBeforeUnmount, ref, type PropType } from 'vue';
import {
	IconDelete,
	IconClose,
	IconFolder,
	IconPause,
	IconPlayArrow,
} from '@arco-design/web-vue/es/icon';
import { UploadStatusEnum } from '@/services/usage/upload';
import { useUploadRecordStore } from '@/stores/usage/uploadRecord';
import { UploadScheduler } from '@/services/usage/UploadScheduler';
import { convertBytes } from '@/utils';

const uploadRecordStore = useUploadRecordStore();

const props = defineProps({
	uploadRecord: {
		type: Object as PropType<UploadRecordType>,
		required: true,
	},
})

const uploader = UploadScheduler.getInstance().getUploader(props.uploadRecord.id);

const sizeText = ref('-');
const initSizeText = () => {
	if (props.uploadRecord.status === UploadStatusEnum.Completed) {
		sizeText.value = convertBytes(props.uploadRecord.size || 0);
		return;
	}

	if (uploader) {
		uploader.onUploadedSizeChange = (size) => {
			sizeText.value = convertBytes(size) + '/' + convertBytes(props.uploadRecord.size || 0);
		}
	}

	return;
}
initSizeText();

onBeforeUnmount(() => {
	if (uploader) {
		uploader.onUploadedSizeChange = undefined;
	}
})

const deleteIconVisible = ref(false);
if (props.uploadRecord.status === UploadStatusEnum.Completed || props.uploadRecord.status === UploadStatusEnum.Canceled) {
	deleteIconVisible.value = true;
}
const deleteFromUploadRecord = () => {
	uploadRecordStore.remove(props.uploadRecord.id);
}

const pausedIconVisible = ref(false);
if (props.uploadRecord.status === UploadStatusEnum.Waiting || props.uploadRecord.status === UploadStatusEnum.Uploading) {
	pausedIconVisible.value = true;
}
const handlePaused = () => {
	UploadScheduler.getInstance().getUploader(props.uploadRecord.id)?.pause();
	uploadRecordStore.update({
		...props.uploadRecord,
		status: UploadStatusEnum.Paused,
	})
}

const resumeIconVisible = ref(false);
if (props.uploadRecord.status === UploadStatusEnum.Holded || props.uploadRecord.status === UploadStatusEnum.Paused) {
	resumeIconVisible.value = true;
}
const handleResume = () => {
	uploadRecordStore.update({
		...props.uploadRecord,
		status: UploadStatusEnum.Waiting,
	})
}

const cancelIconVisible = ref(false);
if (
	props.uploadRecord.status !== UploadStatusEnum.Completed
	&& props.uploadRecord.status !== UploadStatusEnum.Canceled
	&& props.uploadRecord.status !== UploadStatusEnum.Error
) {
	cancelIconVisible.value = true;
}
const handleCancel = () => {
	// 取消是否要删除已经下载的数据
	// 取消直接删除记录？还是可以重新发起下载？
	uploadRecordStore.update({
		...props.uploadRecord,
		status: UploadStatusEnum.Canceled,
	})
}

</script>
<template>
	<div class="size-cell">
		<a-space class="hover-hook">
			<!-- <a-tooltip content="Show in folder(todo)">
				<IconFolder class="icon" />
			</a-tooltip> -->
			<a-tooltip content="Delete from upload history" v-if="deleteIconVisible">
				<IconDelete class="icon" @click="deleteFromUploadRecord" />
			</a-tooltip>
			<a-tooltip content="Pause upload" v-if="pausedIconVisible">
				<IconPause class="icon" @click="handlePaused" />
			</a-tooltip>
			<a-tooltip content="Resume upload" v-if="resumeIconVisible">
				<IconPlayArrow class="icon" @click="handleResume" />
			</a-tooltip>
			<a-tooltip content="Cancel upload" v-if="cancelIconVisible">
				<IconClose class="icon" @click="handleCancel" />
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