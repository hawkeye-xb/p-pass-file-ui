<script setup lang="ts">
import { ref } from 'vue';
import { getConfig } from '@/services/index';
import { IconCopy } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const deviceId = ref('')
deviceId.value = getConfig('deviceId') || '';

const handleCopyDeviceId = () => {
	const input = document.createElement('input');
	input.value = deviceId.value;
	document.body.appendChild(input);
	input.select();
	document.execCommand('copy');
	document.body.removeChild(input);

	Message.success(t('settings.deviceId.copy.success'));
}
</script>
<template>
	<div class="settings-list-item">
		<div class="settings-list-item-label">{{ t('settings.deviceId.label') }}</div>
		<div class="settings-list-item-content">
			<div>{{ deviceId }}</div>
		</div>
		<a-space class="settings-list-item-options">
			<a-tooltip :content="t('settings.deviceId.copy.tooltip')">
				<a-button @click="handleCopyDeviceId">
					<template #icon>
						<IconCopy />
					</template>
				</a-button>
			</a-tooltip>
		</a-space>
	</div>
</template>
<style lang="css" scoped>
@import url('@/assets/settings.css');
</style>