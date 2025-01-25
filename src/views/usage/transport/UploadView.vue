<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUploadRecordStore } from '@/stores/usage/uploadRecord';
import UploadStatus from './UploadStatus.vue';
import UploadSize from './UploadSize.vue';
import type { UploadRecordType } from '@/services/usage/upload';
import { PATH_TYPE } from '@/const';

const uploadRecordStore = useUploadRecordStore();

const selectedKeys = ref<number[]>([]);
const data = computed(() => {
	return filterEmptyDir(uploadRecordStore.uploadRecord).reverse();
})

function filterEmptyDir(rs: UploadRecordType[]) {
	return rs.filter((item: UploadRecordType) => {
		if (item.type === PATH_TYPE.DIR) {
			if (!item.children || item.children.length === 0) { return false; }
			item.children = filterEmptyDir(item.children);
			if (item.children.length === 0) { return false; }
		}

		return true;
	}).map(el => ({ ...el }));
}
</script>
<template>
	<div style="margin: 8px 16px;">
		<!-- <div class="download-view-table-top">
			<a-space>
				<span>Process(13)</span>
				<span>Finished(100)</span>
			</a-space>
			<a-space>
				<span>Total Progrss: 10%</span>
				<span>Speed: 100KB/s</span>
			</a-space>
		</div> -->
		<!-- <div class="download-view-table-top">
			<a-space>
				<a-button>Cleanup Completed</a-button>
			</a-space>
		</div> -->
		<a-table :data="data" row-key="id" :pagination="{
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
						<UploadSize :uploadRecord="record" />
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
	margin-bottom: 8px;
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
