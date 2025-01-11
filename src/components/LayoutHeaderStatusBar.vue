<script setup lang="ts">
import { useLinkStore } from '@/stores/link'

const linkStore = useLinkStore();
</script>
<template>
	<a-space size="large">
		<a-tooltip :content="`Web Socket Link Status: ${linkStore.wsLink}`">
			<a-badge v-show="linkStore.wsLink" :status="linkStore.wsLink" text="WS Service"></a-badge>
		</a-tooltip>
		<a-tooltip :content="`signaling Link Status: ${linkStore.signalingLink}`">
			<a-badge :status="linkStore.signalingLink" text="signaling"></a-badge>
		</a-tooltip>
	</a-space>
</template>