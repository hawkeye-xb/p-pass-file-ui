<script setup lang="ts">
import { PATH_TYPE } from '@/const';
import { computed, ref } from 'vue';
import { DownloadStatus, type DownloadItemType } from '@/ctrls';
import { convertBytes } from '@/utils';
import {
	IconDelete,
	IconClose,
	IconFolder,
	IconPause,
	IconPlayArrow,
} from '@arco-design/web-vue/es/icon';

const selectedKeys = ref<number[]>([]);
const data = ref([])

const handleProgressText = (status: DownloadStatus) => { }
</script>
<template>
	<div style="flex: 1; padding: 8px 16px;">
		<div>
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
							{{ record.metadata.name }}
						</template>
					</a-table-column>
					<a-table-column title="Size" data-index="size" :width="200">
						<template #cell="{ record }">
							<div class="size-cell">
								<a-space class="hover-hook">
									<a-tooltip content="Show in folder(todo)">
										<IconFolder class="icon" />
									</a-tooltip>
									<a-tooltip content="Delete from download history"
										v-if="record.status === DownloadStatus.finished || record.status === DownloadStatus.cancelled">
										<IconDelete class="icon" />
									</a-tooltip>
									<a-tooltip content="Pause download" v-if="record.status === DownloadStatus.transporting">
										<IconPause class="icon" />
									</a-tooltip>
									<a-tooltip content="Resume download"
										v-if="record.status === DownloadStatus.holded || record.status === DownloadStatus.paused">
										<IconPlayArrow class="icon" />
									</a-tooltip>
									<a-tooltip content="Cancel download"
										v-if="record.status !== DownloadStatus.finished && record.status !== DownloadStatus.cancelled">
										<IconClose class="icon" />
									</a-tooltip>
								</a-space>
								<span class="hover-hook-span">{{
									record.metadata.type === PATH_TYPE.DIR
										? '-'
										: `0 / ${convertBytes(record.metadata.size)}`
								}}</span>
							</div>
						</template>
					</a-table-column>
					<a-table-column title="Status" data-index="status" :width="280">
						<template #cell="{ record }">
							<div v-if="record.metadata.type !== PATH_TYPE.DIR">

								<a-progress :percent="0.8" v-if="record.status === DownloadStatus.transporting">
									<!-- <template v-slot:text="scope">
								</template> -->
								</a-progress>
								<span v-else>{{ handleProgressText(record.status) }}</span>
							</div>
						</template>
					</a-table-column>
				</template>
			</a-table>
		</div>
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
