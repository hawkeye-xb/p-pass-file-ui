<script setup lang="ts">
import type { UploadRecordType } from '@/services/usage/upload';
import { computed, onBeforeUnmount, ref, watch, type PropType } from 'vue';
import {
	IconDelete,
	IconClose,
	IconFolder,
	IconPause,
	IconPlayArrow,
} from '@arco-design/web-vue/es/icon';
import { UploadStatusEnum } from '@/services/usage/upload';
import { useUploadRecordStore } from '@/stores/usage/uploadRecord';
import { convertBytes } from '@/utils';
import type { LargeFileUploadAbstractClass } from '@/services/upload/LargeFileUploadAbstractClass';
import { PATH_TYPE } from '@/const';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const uploadRecordStore = useUploadRecordStore();

const props = defineProps({
	uploadRecord: {
		type: Object as PropType<UploadRecordType>,
		required: true,
	},
})

const sizeText = ref('-');
let uploader: LargeFileUploadAbstractClass | undefined = undefined;
watch(() => uploadRecordStore.largeFileUploaderSize, () => {
	if (props.uploadRecord.type === PATH_TYPE.DIR || props.uploadRecord.size < 3 * 1024 * 1024) {
		return;
	}

	uploader = uploadRecordStore.getLargeFileUploader(props.uploadRecord.id);
	if (uploader) {
		uploader.onUploadedSizeChange = undefined;
		uploader.onUploadedSizeChange = (size) => {
			sizeText.value = convertBytes(size) + '/' + convertBytes(props.uploadRecord.size || 0);
		}
	}
}, { immediate: true })

onBeforeUnmount(() => {
	if (uploader) {
		uploader.onUploadedSizeChange = undefined;
	}
})

const deleteIconVisible = ref(false);
const deleteFromUploadRecord = () => {
	uploadRecordStore.removeRecord(props.uploadRecord);
}

const pausedIconVisible = ref(false);
const handlePaused = () => {
	uploadRecordStore.parsedRecord(props.uploadRecord)
}

const resumeIconVisible = ref(false);
const handleResume = () => {
	uploadRecordStore.resumeRecord(props.uploadRecord)
}

const cancelIconVisible = ref(false);
// const handleCancel = () => {
// 	// 取消是否要删除已经下载的数据
// 	// 取消直接删除记录？还是可以重新发起下载？
// 	uploadRecordStore.update({
// 		...props.uploadRecord,
// 		status: UploadStatusEnum.Canceled,
// 	})
// }

watch(() => props.uploadRecord, (newValue, oldValue) => {
	const status = newValue.status;
	deleteIconVisible.value = false;
	pausedIconVisible.value = false;
	resumeIconVisible.value = false;
	cancelIconVisible.value = false;

	if (status === UploadStatusEnum.Completed) {
		if (props.uploadRecord.type !== PATH_TYPE.DIR) sizeText.value = convertBytes(props.uploadRecord.size || 0);
		uploader && (uploader.onUploadedSizeChange = undefined);

		deleteIconVisible.value = true;
		cancelIconVisible.value = true;
	}
	if (status === UploadStatusEnum.Waiting || status === UploadStatusEnum.Uploading) {
		pausedIconVisible.value = true;
	}
	if (status === UploadStatusEnum.Paused) {
		resumeIconVisible.value = true;
	}
	if (status !== UploadStatusEnum.Error) {
		cancelIconVisible.value = true;
	}
}, { immediate: true, deep: true })

</script>
<template>
  <div class="size-cell">
    <a-space class="hover-hook">
      <a-tooltip :content="t('transport.download.showInFolder')">
        <IconFolder class="icon" />
      </a-tooltip>
      <a-tooltip :content="t('transport.download.pause')" v-if="pausedIconVisible">
        <IconPause class="icon" @click="handlePaused" />
      </a-tooltip>
      <a-tooltip :content="t('transport.download.resume')" v-if="resumeIconVisible">
        <IconPlayArrow class="icon" @click="handleResume" />
      </a-tooltip>
      <a-tooltip :content="t('transport.download.cancel')" v-if="cancelIconVisible">
        <IconClose class="icon" @click="deleteFromUploadRecord" />
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