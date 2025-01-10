<script setup lang="ts">
import { PATH_TYPE } from '@/const';
import { TransportStatus, type TransportItemType } from '@/ctrls';
import { useDownloadStore } from '@/stores/download';
import { computed, ref } from 'vue';
import {
	IconDelete,
	IconFolder,
} from '@arco-design/web-vue/es/icon';

const downloadStore = useDownloadStore();

function filterEmptyDir(items: TransportItemType[]) {
	return items.filter((item) => {
		if (item.metadata.type === PATH_TYPE.DIR) {
			if (!item.children || item.children.length === 0) {
				return false;
			} else {
				item.children = filterEmptyDir(item.children);
			}
		}
		return true;
	});
}
const data = computed(() => {
	return filterEmptyDir(downloadStore.download);
})

const selectedKeys = ref<number[]>([]);
</script>
<template>
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
				<a-table-column title="Size" data-index="size" :width="120">
					<template #cell="{ record }">
						<div class="size-cell">
							<a-space class="hover-hook">
								<a-tooltip content="Show in folder">
									<IconFolder class="icon" />
								</a-tooltip>
								<a-tooltip content="Delete from download history">
									<IconDelete class="icon" />
								</a-tooltip>
							</a-space>
							<span class="hover-hook-span">{{ record.metadata.type === PATH_TYPE.DIR ? '-' : 'readed / total' }}</span>
						</div>
					</template>
				</a-table-column>
				<a-table-column title="Status" data-index="status" :width="280">
					<template #cell="{ record }">
						<!-- {{ record.status }} -->
						<div v-if="record.metadata.type !== PATH_TYPE.DIR">
							<a-progress :percent="0.8">
								<template v-slot:text="scope">
									downloading
								</template>
							</a-progress>
						</div>
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
	width: 88px;
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
