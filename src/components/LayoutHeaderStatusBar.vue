<script setup lang="ts">
import { useLinkStore } from '@/stores/link'

const linkStore = useLinkStore();

const wsReconnect = () => {
	linkStore.updateLink('ws', 'processing');
	linkStore.wsInstance?.reconnect();
}
const wsClose = () => {
	linkStore.wsInstance?.close();
}
</script>
<template>
	<a-space size="large">
		<a-dropdown trigger="hover">
			<a-badge v-show="linkStore.wsLink" :status="linkStore.wsLink" text="WS Service"></a-badge>
			<template #content>
				<a-doption @click="wsReconnect">reconnect</a-doption>
				<a-doption @click="wsClose">close</a-doption>
			</template>
		</a-dropdown>
		<a-tooltip :content="`signaling Link Status: ${linkStore.signalingLink}`">
			<a-badge :status="linkStore.signalingLink" text="signaling"></a-badge>
		</a-tooltip>
		<a-tooltip :content="`Storage Device Link Status: ${linkStore.webRTCLink}`">
			<a-badge v-show="linkStore.webRTCLink" :status="linkStore.webRTCLink" text="storage device"></a-badge>
		</a-tooltip>
	</a-space>
</template>