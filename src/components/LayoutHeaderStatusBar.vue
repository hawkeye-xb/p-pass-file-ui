<script setup lang="ts">
import { useLinkStore } from '@/stores/link'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
	linkStore.customConn?.restart();
}
</script>

<template>
	<a-space size="large">
		<a-dropdown trigger="hover" v-if="linkStore.wsLink">
			<a-badge :status="linkStore.wsLink" :text="t('status.services.ws')"></a-badge>
			<template #content>
				<a-doption @click="wsReconnect">{{ t('status.actions.reconnect') }}</a-doption>
				<a-doption @click="wsClose">{{ t('status.actions.close') }}</a-doption>
			</template>
		</a-dropdown>
		<a-dropdown trigger="hover" v-if="linkStore.signalingLink">
			<a-badge :status="linkStore.signalingLink" :text="t('status.services.signaling')"></a-badge>
			<template #content>
				<a-doption @click="signalingReconnect">{{ t('status.actions.reconnect') }}</a-doption>
				<a-doption @click="signalingReflesh">{{ t('status.actions.refresh') }}</a-doption>
			</template>
		</a-dropdown>
		<a-dropdown trigger="hover" v-if="linkStore.webRTCLink">
			<a-badge :status="linkStore.webRTCLink" :text="t('status.services.storage')"></a-badge>
			<template #content>
				<a-doption @click="webRtcReconnect">{{ t('status.actions.refresh') }}</a-doption>
			</template>
		</a-dropdown>
	</a-space>
</template>