<script setup lang="ts">
import { reactive, ref } from 'vue';
import { addWatchTarget, removeWatchTarget, getWatchTargets, getConfig, setConfig, ClientType } from '@/services/index';
import { IconDelete, IconRefresh, IconEdit, IconCopy, IconSave } from '@arco-design/web-vue/es/icon';
import BaseSettings from '@/components/BaseSettings.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


// config
const deviceId = ref('')
deviceId.value = getConfig('deviceId') || '';
const cType = ref('')
cType.value = getConfig('clientType') || '';

// storage watch targets
const targets = ref([])

const visible = ref(false);
const formRef = ref(undefined);
const form = reactive({
	target: '',
});

const handleClick = () => {
	visible.value = true;
};
const handleBeforeOk = (done: any) => {
	// todo: 表单验证
	window.setTimeout(() => {
		done()
		// prevent close
		// done(false)
		addWatchTarget(form.target)
		init()
	}, 1000)
};
const handleCancel = () => {
	visible.value = false;
}

const handleRemove = (target: string) => {
	removeWatchTarget(target)
	init()
}

function init() {
	targets.value = getWatchTargets()
}
init()

// trash switch；是否两侧都可设置？
const trash = ref(true)
trash.value = getConfig('trash') || true;
const handleTrashConfigChange = (value: string | number | boolean) => {
	trash.value = Boolean(value);
	setConfig('trash', Boolean(value))
}

// download path
const downloadPath = ref('')
downloadPath.value = getConfig('downloadPath') || '';
</script>
<template>
	<div style="padding-top: 24px; flex: 1; background: var(--color-bg-2);">
		<BaseSettings />

		<!-- storage settings -->
		<div v-if="cType === ClientType.Storage">
			<a-divider />
			<div v-for="target in targets" :key="target" class="settings-list-item">
				<div class="settings-list-item-label">{{ t('settings.watchTarget.title') }}:</div>
				<div class="settings-list-item-content">
					<div>{{ target }}</div>
				</div>
				<a-space class="settings-list-item-options">
					<a-button @click="handleRemove(target)">
						<template #icon>
							<IconDelete />
						</template>
					</a-button>
				</a-space>
			</div>
			<div class="settings-list-item">
				<div class="settings-list-item-label"></div>
				<a-space>
					<a-button @click="handleClick">{{ t('settings.watchTarget.add') }}</a-button>
				</a-space>
			</div>

			<div class="settings-list-item">
				<div class="settings-list-item-label">{{ t('settings.moveToTrash') }}</div>
				<a-switch :model-value="trash" type="round" @change="handleTrashConfigChange" />
			</div>
		</div>

		<a-modal v-model:visible="visible" :title="t('settings.watchTarget.modal.title')" @cancel="handleCancel" @before-ok="handleBeforeOk">
			<a-form :model="form" :ref="formRef">
				<a-form-item field="target" :label="t('settings.watchTarget.modal.label')" :rules="[
					{
						required: true,
						message: t('settings.watchTarget.modal.required'),
					}
				]">
					<a-input v-model="form.target" :placeholder="t('settings.watchTarget.modal.placeholder')" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<style lang="css" scoped>
@import url('@/assets/settings.css');
</style>