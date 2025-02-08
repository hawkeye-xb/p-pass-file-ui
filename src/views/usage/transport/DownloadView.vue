<script setup lang="ts">
import { PATH_TYPE } from '@/const';
import { computed, ref } from 'vue';
import type { DownloadRecordType } from '@/services/usage/download';
import { useDownloadRecordStore } from '@/stores/usage/downloadRecord';
import DownloadStatus from './DownloadStatus.vue';
import DownloadSize from './DownloadSize.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const downloadRecordStore = useDownloadRecordStore();

function filterEmptyDir(rs: DownloadRecordType[]) {
	return rs.filter((item: DownloadRecordType) => {
		if (item.type === PATH_TYPE.DIR) {
			if (!item.children || item.children.length === 0) { return false; }
			item.children = filterEmptyDir(item.children);
			if (item.children.length === 0) { return false; }
		}

		return true;
	}).map(el => ({ ...el }));
}
const data = computed(() => {
	return filterEmptyDir(downloadRecordStore.downloadRecord);
})

const selectedKeys = ref<number[]>([]);
</script>
<template>
	<div style="margin: 8px 16px;">
		<!-- <div class="download-view-table-top">
			<a-space>
				<span>{{ t('transport.download.process') }}(13)</span>
				<span>{{ t('transport.download.finished') }}(100)</span>
			</a-space>
			<a-space>
				<span>{{ t('transport.download.totalProgress') }}: 10%</span>
				<span>{{ t('transport.download.speed') }}: 100KB/s</span>
			</a-space>
		</div> -->
		<a-table :data="data" row-key="id" :pagination="{
			defaultPageSize: 15
		}" v-model:selectedKeys="selectedKeys">
			<template #columns>
				<a-table-column :title="t('transport.download.title') " data-index="name">
					<template #cell="{ record }">
						{{ record.name }}
					</template>
				</a-table-column>
				<a-table-column :title="t('transport.download.size')" data-index="size" :width="200">
					<template #cell="{ record }">
						<DownloadSize :download-record="record"></DownloadSize>
					</template>
				</a-table-column>
				<a-table-column :title="t('transport.download.status')" data-index="status" :width="280">
					<template #cell="{ record }">
						<DownloadStatus :download-record="record"></DownloadStatus>
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
