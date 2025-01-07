<script setup lang="ts">
import { reactive, ref } from 'vue';
import { addWatchTarget, removeWatchTarget, getWatchTargets, getConfig, setConfig } from '@/services/index';
import { IconDelete, IconRefresh } from '@arco-design/web-vue/es/icon';

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

const trash = ref(true)
trash.value = getConfig('trash') || true;
const handleTrashConfigChange = (value: string | number | boolean) => {
	trash.value = Boolean(value);
	setConfig('trash', Boolean(value))
}

</script>
<template>
	<div>
		<div v-for="target in targets" :key="target" class="settings-list-item">
			<div class="settings-list-item-label">Watch Target:</div>
			<div class="settings-list-item-content">
				<div>{{ target }}</div>
			</div>
			<a-space class="settings-list-item-options">
				<!-- <a-button>
						<template #icon>
							<IconRefresh />
						</template>
</a-button> -->
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

		<a-divider />
		<div class="settings-list-item">
			<div class="settings-list-item-label">Move To Trash</div>
			<a-switch :model-value="trash" type="round" @change="handleTrashConfigChange" />
		</div>

		<a-modal v-model:visible="visible" title="Add Watch Target" @cancel="handleCancel" @before-ok="handleBeforeOk">
			<a-form :model="form" :ref="formRef">
				<a-form-item field="target" label="Target" :rules="[
					{
						required: true,
						message: 'Please input target!',
					}
					// todo: check target is path
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
	max-width: 800px;
}

.settings-list-item-options {
	margin: 0 10px;
}
</style>