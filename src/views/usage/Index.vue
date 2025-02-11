<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/UsageMenu.vue'
import StatusBar from '@/components/LayoutHeaderStatusBar.vue'
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import ThemeSwitch from '@/components/ThemeSwitch.vue'
import { IconSettings, IconUser } from '@arco-design/web-vue/es/icon';
import { usageService, getConn } from '@/services/usage/main';
import { onBeforeUnmount } from 'vue';
import { useUploadRecordStore } from "@/stores/usage/uploadRecord";
import { useDownloadRecordStore } from '@/stores/usage/downloadRecord';

const uploadRecordStore = useUploadRecordStore();
const downloadRecordStore = useDownloadRecordStore();
uploadRecordStore.init();
downloadRecordStore.init();

usageService()

onBeforeUnmount(() => {
	console.log('usage layout before unmount');
	// getConn()?.destory();
})
</script>
<template>
	<div class="index-layout">
		<a-page-header :style="{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-neutral-3)' }"
			title="P-Pass File" :show-back="false">
			<template #subtitle>
				<StatusBar :style="{ paddingLeft: '24px' }" />
			</template>
			<template #extra>
				<div>
					<a-space>
						<ThemeSwitch />
						<LanguageSwitch />
						<RouterLink to="/usage/settings">
							<a-button shape="circle">
								<IconSettings />
							</a-button>
						</RouterLink>
					</a-space>
				</div>
			</template>
		</a-page-header>
		<div class="index-layout-body">
			<Menu style="border-right: 1px solid var(--color-neutral-3)" />
			<!-- style="flex: 1;" -->
			<RouterView />
		</div>
	</div>
</template>
<style scoped>
@import url('@/assets/layout.css');
</style>