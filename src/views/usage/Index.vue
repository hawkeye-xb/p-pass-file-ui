<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from '@/components/menu/UsageMenu.vue'
import StatusBar from '@/components/LayoutHeaderStatusBar.vue'
import { IconSettings, IconUser } from '@arco-design/web-vue/es/icon';
import { usageServiceInit } from '@/services/index';

usageServiceInit()
</script>
<template>
	<div class="index-layout">
		<a-page-header :style="{ background: 'var(--color-bg-2)', borderBottom: '1px solid var(--color-neutral-3)' }"
			title="Pigeon" :show-back="false">
			<template #subtitle>
				<StatusBar :style="{ paddingLeft: '24px' }" />
			</template>
			<template #extra>
				<div>
					<a-space>
						<RouterLink to="/usage/settings">
							<a-button shape="circle">
								<IconSettings />
							</a-button>
						</RouterLink>

						<a-avatar :style="{ backgroundColor: '#3370ff' }">
							<IconUser />
						</a-avatar>
					</a-space>
				</div>
			</template>
		</a-page-header>
		<div class="index-layout-body">
			<Menu style="border-right: 1px solid var(--color-neutral-3)" />
			<RouterView style="flex: 1;" />
		</div>
	</div>
</template>
<style scoped>
@import url('@/assets/layout.css');
</style>