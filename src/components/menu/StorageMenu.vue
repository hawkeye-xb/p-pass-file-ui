<script setup lang="ts">
import {
	IconFolder,
	IconSettings,
	IconApps,
	IconSwap,
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
		<a-menu-item key="/storage/connections" v-on:click="() => { Router.push('/storage/connections') }">
			<template #icon>
				<IconApps></IconApps>
			</template>
			Connections
		</a-menu-item>
		<!-- <a-menu-item key="/storage/folder" v-on:click="() => { Router.push('/storage/folder') }">
			<template #icon>
				<IconFolder></IconFolder>
			</template>
			Folder
		</a-menu-item> -->
		<!-- <a-menu-item key="/storage/transport" v-on:click="() => { Router.push('/storage/transport') }">
			<template #icon>
				<IconSwap></IconSwap>
			</template>
			Transport
		</a-menu-item> -->
		<a-menu-item key="/storage/settings" v-on:click="() => { Router.push('/storage/settings') }">
			<template #icon>
				<IconSettings></IconSettings>
			</template>
			Settings
		</a-menu-item>
	</a-menu>
</template>
