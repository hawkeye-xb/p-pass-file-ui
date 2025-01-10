<script setup lang="ts">
import { useLinkStore } from '@/stores/link'

const linkStore = useLinkStore();
</script>
<template>
	<a-space size="large">
		<a-tooltip :content="`Web Socket Link Status: ${linkStore.wsLink}`">
			<a-badge :status="linkStore.wsLink" text="WS Service"></a-badge>
		</a-tooltip>
	</a-space>
</template>