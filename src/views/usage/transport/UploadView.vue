<script setup lang="ts">
import { PATH_TYPE } from '@/const';
import { computed, ref } from 'vue';
import {
	IconDelete,
	IconClose,
	IconFolder,
	IconPause,
	IconPlayArrow,
} from '@arco-design/web-vue/es/icon';
import { convertBytes } from '@/utils';
import { useUploadRecordStore } from '@/stores/usage/uploadRecord';
import { UploadStatusEnum } from '@/services/usage/upload'
import UploadStatus from './UploadStatus.vue';

const uploadRecordStore = useUploadRecordStore();

const selectedKeys = ref<number[]>([]);
const data = computed(() => {
	return uploadRecordStore.uploadRecord;
})
</script>
<template>
	<div style="margin: 8px 16px;">
		<div class="download-view-table-top">
			<a-space>
				<span>Process(13)</span>
				<span>Finished(100)</span>
			</a-space>
			<a-space>
				<span>Total Progrss: 10%</span>
				<span>Speed: 100KB/s</span>
			</a-space>
		</div>
		<a-table :data="data" row-key="id" :row-selection="{
			type: 'checkbox',
			showCheckedAll: true,
			onlyCurrent: true,
		}" :pagination="{
			defaultPageSize: 15
		}" v-model:selectedKeys="selectedKeys">
			<template #columns>
				<a-table-column title="Name" data-index="name">
					<template #cell="{ record }">
						{{ record.name }}
					</template>
				</a-table-column>
				<a-table-column title="Size" data-index="size" :width="200">
					<template #cell="{ record }">
						<div class="size-cell">
							<a-space class="hover-hook">
								<a-tooltip content="Show in folder(todo)">
									<IconFolder class="icon" />
								</a-tooltip>
								<a-tooltip content="Delete from upload history"
									v-if="record.status === UploadStatusEnum.Completed || record.status === UploadStatusEnum.Canceled">
									<IconDelete class="icon" />
								</a-tooltip>
								<a-tooltip content="Pause download" v-if="record.status === UploadStatusEnum.Uploading">
									<IconPause class="icon" />
								</a-tooltip>
								<a-tooltip content="Resume download"
									v-if="record.status === UploadStatusEnum.Holded || record.status === UploadStatusEnum.Paused">
									<IconPlayArrow class="icon" />
								</a-tooltip>
								<a-tooltip content="Cancel download"
									v-if="record.status !== UploadStatusEnum.Completed && record.status !== UploadStatusEnum.Canceled">
									<IconClose class="icon" />
								</a-tooltip>
							</a-space>
							<span class="hover-hook-span">{{
								'speed'
							}}</span>
						</div>
					</template>
				</a-table-column>
				<a-table-column title="Status" data-index="status" :width="280">
					<template #cell="{ record }">
						<UploadStatus :uploadRecord="record" />
					</template>
				</a-table-column>
			</template>
		</a-table>
	</div>
</template>
<style scoped>
.download-view-table-top {
	color: var(--color-text-2);
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 32px;
}

.icon {
	cursor: pointer;
}

.icon:hover {
	color: rgb(var(--primary-5));
}

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
