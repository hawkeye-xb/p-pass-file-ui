<script setup lang="ts">
import {
	IconFolder,
	IconSettings,
	IconSwap,
	IconUpload,
	IconDownload,
} from '@arco-design/web-vue/es/icon';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const Router = useRouter();

const selectedKeys = ref([route.path]);

// 监听路由变化，更新选中的菜单项
watch(
	() => route.path,
	(newPath) => {
		selectedKeys.value = [newPath];
	}
);
</script>

<template>
	<a-menu :style="{
		width: '200px',
		height: '100%',
}" show-collapse-button breakpoint="xl" :selectedKeys="selectedKeys">
		<a-menu-item key="/usage/folder" v-on:click="() => { Router.push('/usage/folder') }">
			<template #icon>
				<IconFolder></IconFolder>
			</template>
			Folder
		</a-menu-item>
		<a-sub-menu key="/usage/transport">
			<template #icon>
				<IconSwap></IconSwap>
			</template>
			<template #title>Transport</template>
			<a-menu-item key="/usage/transport/upload" v-on:click="() => { Router.push('/usage/transport/upload') }">
				<template #icon>
					<IconUpload></IconUpload>
				</template>
				Upload
			</a-menu-item>
			<a-menu-item key="/usage/transport/download" v-on:click="() => { Router.push('/usage/transport/download') }">
				<template #icon>
					<IconDownload></IconDownload>
				</template>
				Download
			</a-menu-item>
		</a-sub-menu>
		<a-menu-item key="/usage/settings" v-on:click="() => { Router.push('/usage/settings') }">
			<template #icon>
				<IconSettings></IconSettings>
			</template>
			Settings
		</a-menu-item>
	</a-menu>
</template>
