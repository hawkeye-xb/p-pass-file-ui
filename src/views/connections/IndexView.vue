<script setup lang="ts">
// import { IconRefresh } from '@arco-design/web-vue/es/icon';
</script>
<template>
	<div class="home-view">
		<a-card hoverable class="connection-view-card">
			<div :style="{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				height: 62
			}">
				<span :style="{ display: 'flex', alignItems: 'center', color: '#1D2129' }">
					<a-avatar :style="{ marginRight: '8px', backgroundColor: '#165DFF' }" :size="28">
						Web
					</a-avatar>
					<a-typography-text>{{ 'Template' }}</a-typography-text>
				</span>
				<a-badge :status="'danger'" :text="'未连接'" />
			</div>
		</a-card>
		<a-card hoverable class="connection-view-card">
			<div :style="{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				height: 62
			}">
				<span :style="{ display: 'flex', alignItems: 'center', color: '#1D2129' }">
					<a-avatar :style="{ marginRight: '8px', backgroundColor: '#165DFF' }" :size="28">
						Web
					</a-avatar>
					<a-typography-text>{{ 'Template' }}</a-typography-text>
				</span>
				<a-badge :status="'danger'" :text="'未连接'" />
			</div>
		</a-card>
	</div>
</template>
<style scoped>
.home-view {
	margin: 8px 16px;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
	gap: 20px;
	justify-content: center;
	justify-items: center;
	grid-auto-flow: dense;
	align-content: start;
}

.connection-view-card {
	width: 460px;
	height: 62px;
}
</style>
