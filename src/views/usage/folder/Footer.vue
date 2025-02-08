<script setup lang="ts">
import { DOPTION_VALUES } from './utils';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits<{
	(e: 'selected', message: DOPTION_VALUES): void
}>();
</script>

<template>
	<div class="folder-view-footer">
		<a-space>
			<!-- <a-button @click="emit('selected', DOPTION_VALUES.Share)">{{ t('folder.options.share') }}</a-button> -->
			<a-button @click="emit('selected', DOPTION_VALUES.Download)">{{ t('folder.options.download') }}</a-button>
			<!-- <a-button @click="emit('selected', DOPTION_VALUES.Copy)">{{ t('folder.options.copy') }}</a-button> -->
			<a-button @click="emit('selected', DOPTION_VALUES.MoveTo)">{{ t('folder.options.moveTo') }}</a-button>
			<a-button status="danger" @click="emit('selected', DOPTION_VALUES.Delete)">{{ t('folder.options.delete') }}</a-button>
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
	padding: 0 16px;
}
</style>