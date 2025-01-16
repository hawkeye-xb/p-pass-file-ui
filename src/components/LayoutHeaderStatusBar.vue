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

const signalingReconnect = () => {
	linkStore.customPeer?.reconnect();
}
const signalingReflesh = () => {
	linkStore.customPeer?.restart();
}

const webRtcReconnect = () => {
	linkStore.customPeer?.restart();
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
		<a-dropdown trigger="hover">
			<a-badge v-show="linkStore.signalingLink" :status="linkStore.signalingLink" text="Signaling"></a-badge>
			<template #content>
				<a-doption @click="signalingReconnect">reconnect</a-doption>
				<a-doption @click="signalingReflesh">reflesh</a-doption>
			</template>
		</a-dropdown>
		<a-dropdown trigger="hover">
			<a-badge v-show="linkStore.webRTCLink" :status="linkStore.webRTCLink" text="storage device"></a-badge>
			<template #content>
				<a-doption @click="webRtcReconnect">reflesh</a-doption>
				<!-- <a-doption @click="webRtcClose">close</a-doption> -->
			</template>
		</a-dropdown>
	</a-space>
</template>