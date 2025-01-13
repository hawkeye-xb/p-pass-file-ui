<script setup lang="ts">
import { reactive, ref } from 'vue';
import { addWatchTarget, removeWatchTarget, getWatchTargets, getConfig, setConfig, ClientType } from '@/services/index';
import { IconDelete, IconRefresh, IconEdit, IconCopy, IconSave } from '@arco-design/web-vue/es/icon';

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
	<div style="padding-top: 24px;">
		<div class="settings-list-item">
			<div class="settings-list-item-label">Device Id</div>
			<div class="settings-list-item-content">
				<div>{{ deviceId }}</div>
			</div>
			<a-space class="settings-list-item-options">
				<a-tooltip content="Edit"><a-button><template #icon>
							<IconEdit />
						</template></a-button></a-tooltip>
				<a-tooltip content="Refresh"><a-button><template #icon>
							<IconRefresh />
						</template></a-button></a-tooltip>
				<a-tooltip content="Copy"><a-button><template #icon>
							<IconCopy />
						</template></a-button></a-tooltip>
			</a-space>
		</div>

		<!-- storage settings -->
		<div v-if="cType === ClientType.Storage">
			<a-divider />
			<div v-for="target in targets" :key="target" class="settings-list-item">
				<div class="settings-list-item-label">Watch Target:</div>
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
					<a-button @click="handleClick">Add Target</a-button>
				</a-space>
			</div>

			<div class="settings-list-item">
				<div class="settings-list-item-label">Move To Trash</div>
				<a-switch :model-value="trash" type="round" @change="handleTrashConfigChange" />
			</div>
		</div>

		<!-- usage settings -->
		<div v-if="cType === ClientType.Usage">
			<a-divider />
			<div class="settings-list-item">
				<div class="settings-list-item-label">Conn Device Id</div>
				<a-input placeholder="Please enter something" allow-clear style="max-width: 640px" />
				<a-space class="settings-list-item-options">
					<a-tooltip content="Save"><a-button><template #icon>
								<IconSave />
							</template></a-button></a-tooltip>
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
				<!-- <a-input default-value="/Users/lixixi/Downloads" style="max-width: 800px;"></a-input> -->
			</div>
		</div>

		<a-modal v-model:visible="visible" title="Add Watch Target" @cancel="handleCancel" @before-ok="handleBeforeOk">
			<a-form :model="form" :ref="formRef">
				<a-form-item field="target" label="Target" :rules="[
					{
						required: true,
						message: 'Please input target!',
	}
				]">
					<a-input v-model="form.target" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<style lang="css" scoped>
.settings-list-item {
	width: 100%;
	display: flex;
	align-items: center;
	height: 32px;
	margin-bottom: 8px;
	color: var(--color-text-2);
}

.settings-list-item-label {
	padding-right: 16px;
	text-align: right;
	width: 20%;
}

.settings-list-item-content {
	padding: 0 12px;
	background-color: var(--color-fill-2);
	height: 100%;
	display: flex;
	align-items: center;
	flex: 1;
	max-width: 640px;
	box-sizing: border-box;
}

.settings-list-item-options {
	margin: 0 10px;
}
</style>