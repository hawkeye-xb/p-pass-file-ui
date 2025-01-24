<script setup lang="ts">
import { useConnectionsStore } from '@/stores/connections';

const connectionsStore = useConnectionsStore();
</script>
<template>
	<div class="home-view" v-for="conn in connectionsStore.connections">
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
					<a-typography-text>{{ conn.peer }}</a-typography-text>
				</span>
				<a-badge :status="conn.open ? 'success' : 'danger'" :text="conn.open ? '已连接' : '未连接'" />
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

	flex: 1;
}

.connection-view-card {
	width: 460px;
	height: 62px;
}
</style>
