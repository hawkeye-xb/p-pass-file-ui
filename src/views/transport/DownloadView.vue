<script setup lang="ts">
import { TransportStatus, type TransportItemType } from '@/ctrls';
import { ref } from 'vue';

const data = ref([
	{
		id: '1',
		metadata: {
			ctime: "2023-01-08T11:02:02.883Z",
			ino: 142583371,
			mtime: "2025-01-08T11:02:02.883Z",
			name: "NAS",
			parent: null,
			path: "/Users/lixixi/github/my-network-disk/file-server/NAS",
			size: 640,
			type: "directory",
		},
		savePath: 'string', // 保存的路径；用于跳转到目录，如果是存储侧则可以跳转到文件夹; 有这个是不是就可以终止续传了
		stime: 1, // 开始时间
		etime: 1, // 结束时间
		status: TransportStatus.cancelled, // 状态
	},
])
const selectedKeys = ref<number[]>([]);
</script>
<template>
	<div>
		<div>
			<span>Process(13)</span>
			<span>Finished(100)</span>
			<span>Total Progrss: 10%</span>
			<span>Speed: 100KB/s</span>
		</div>
		<a-table :data="data" row-key="ino" :row-selection="{
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
				<a-table-column title="Size" data-index="size">
					<template #cell="{ record }">
						{{ 'readed / total' }}
					</template>
				</a-table-column>
				<a-table-column title="Status" data-index="status">
					<template #cell="{ record }">
						<!-- {{ record.status }} -->
						<div>
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
