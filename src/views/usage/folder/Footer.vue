<script setup lang="ts">
import { DOPTION_VALUES } from './utils';

const emit = defineEmits<{
	(e: 'selected', message: DOPTION_VALUES): void
}>();
</script>
<template>
	<div class="folder-view-footer">
		<a-space>
			<a-button @click="emit('selected', DOPTION_VALUES.Share)">Share</a-button>
			<a-button @click="emit('selected', DOPTION_VALUES.Download)">Download</a-button>
			<a-button @click="emit('selected', DOPTION_VALUES.Copy)">Copy</a-button>
			<a-button @click="emit('selected', DOPTION_VALUES.MoveTo)">Move To</a-button>
			<a-button status="danger" @click="emit('selected', DOPTION_VALUES.Delete)">Delete</a-button>
		</a-space>
	</div>
</template>
<style scoped>
.folder-view-footer {
	width: 100%;
	height: 56px;
	position: absolute;
	bottom: 0;
	border-top: 1px solid var(--color-neutral-3);
	display: flex;
	align-items: center;
}
</style>