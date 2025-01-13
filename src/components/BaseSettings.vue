<script setup lang="ts">
import { ref } from 'vue';
import { getConfig } from '@/services/index';
import { IconRefresh, IconEdit, IconCopy } from '@arco-design/web-vue/es/icon';

const deviceId = ref('')
deviceId.value = getConfig('deviceId') || '';
</script>
<template>
	<div class="settings-list-item">
		<div class="settings-list-item-label">Device Id</div>
		<div class="settings-list-item-content">
			<div>{{ deviceId }}</div>
		</div>
		<a-space class="settings-list-item-options">
			<a-tooltip content="Edit">
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
			</a-tooltip>
			<a-tooltip content="Copy">
				<a-button>
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