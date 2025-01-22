<script setup lang="ts">
import { ref } from 'vue';
import { getConfig } from '@/services/index';
import { IconCopy } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';

const deviceId = ref('')
deviceId.value = getConfig('deviceId') || '';

const handleCopyDeviceId = () => {
	const input = document.createElement('input');
	input.value = deviceId.value;
	document.body.appendChild(input);
	input.select();
	document.execCommand('copy');
	document.body.removeChild(input);

	Message.success('Copied!');
}
</script>
<template>
	<div class="settings-list-item">
		<div class="settings-list-item-label">Device Id</div>
		<div class="settings-list-item-content">
			<div>{{ deviceId }}</div>
		</div>
		<a-space class="settings-list-item-options">
			<!-- <a-tooltip content="Edit">
				<a-button>
					<template #icon>
						<IconEdit />
					</template>
				</a-button>
			</a-tooltip>
			<a-tooltip content="Refresh">
				<a-button>
					<template #icon>
						<IconRefresh />
					</template>
				</a-button>
			</a-tooltip> -->
			<a-button @click="handleCopyDeviceId">
					<template #icon>
						<IconCopy />
					</template>
				</a-button>
		</a-space>
	</div>
</template>
<style lang="css" scoped>
@import url('@/assets/settings.css');
</style>