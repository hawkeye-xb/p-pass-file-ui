<script setup lang="ts">
const data: never[] = [];

const cellClick = (record: any) => {
	console.log('cellClick', record);
};
</script>

<template>
	<div>
		<a-table :data="data">
			<template #columns>
				<a-table-column title="Name" data-index="mtime">
					<template #cell="{ record }">
						<span class="home-view-table-file-name-class" v-on:click="cellClick(record)">
							{{ record.name }}
						</span>
					</template>
				</a-table-column>
				<a-table-column title="Size" data-index="size" :width="180">
					<template #cell="{ record }">
						{{ record.isDirectory ? '-' : record.readableSize }}
					</template>
				</a-table-column>
				<a-table-column title="Mtime" data-index="mtime" :width="180"></a-table-column>
			</template>
		</a-table>
	</div>
</template>
<style scoped></style>