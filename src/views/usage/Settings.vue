<script setup lang="ts">
import { ref } from 'vue';
import { getConfig, setConfig, ClientType } from '@/services/index';
import { IconDelete, IconRefresh, IconEdit, IconCopy, IconSave } from '@arco-design/web-vue/es/icon';
import BaseSettings from '@/components/BaseSettings.vue';

// download path
const downloadPath = ref('')
downloadPath.value = getConfig('downloadPath') || '';

const connDeviceId = ref('')
connDeviceId.value = getConfig('connDeviceId') || '';
const saveConnDeviceId = () => {
	setConfig('connDeviceId', connDeviceId.value)
}
</script>
<template>
	<div style="padding-top: 24px; flex: 1">
		<BaseSettings></BaseSettings>
		<a-divider />
		<div class="settings-list-item">
			<div class="settings-list-item-label">Conn Device Id</div>
			<a-input v-model:model-value="connDeviceId" placeholder="Please enter something" allow-clear
				style="max-width: 640px" />
			<a-space class="settings-list-item-options">
				<a-tooltip content="Save">
					<a-button @click="saveConnDeviceId">
						<template #icon>
							<IconSave />
						</template>
					</a-button>
				</a-tooltip>
			</a-space>
		</div>

		<div class="settings-list-item">
			<div class="settings-list-item-label">Max Download Task</div>
			<div>5</div>
		</div>

		<div class="settings-list-item">
			<div class="settings-list-item-label">Download Path</div>
			<div class="settings-list-item-content">
				<div>{{ downloadPath }}</div>
			</div>

		</div>
	</div>
</template>

<style lang="css" scoped>
@import url('@/assets/settings.css');
</style>