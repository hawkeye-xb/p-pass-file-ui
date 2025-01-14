<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMetadatasStore } from '@/stores/metadatas'
import type { MetadataType } from '@/types';
import { PATH_TYPE } from '@/const';
import { usageMoveRes } from '@/ctrls';
import { Message } from '@arco-design/web-vue';
import type { WebRTCContextType } from '@/services/peer/type';

const metadataStore = useMetadatasStore();

const props = defineProps<{
	visible: boolean; // v-model 绑定的值
	src: string[];	// 源路径
}>();

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void; // v-model 更新事件
}>();

interface TreeNodeType {
	title: string,
	key: string, // uni
	children?: TreeNodeType[],
	record: MetadataType,
}
const changeMetadataToTreeNode = (metadatas: MetadataType[]) => {
	return metadatas.filter((el) => el.type === PATH_TYPE.DIR).map((el) => {
		const res: TreeNodeType = {
			title: el.name,
			key: el.ino.toString(),
			record: el,
		}
		if (el.children) {
			res.children = changeMetadataToTreeNode(el.children);
		}

		return res;
	})
}
const treeData = computed(() => {
	return changeMetadataToTreeNode(metadataStore.metadatas)
});

const moveTo = ref('')
const handleTreeSelect = ((selectedKeys: (string | number)[], data: any) => {
	moveTo.value = data.node.record.path;
})

// modal
const handleCancel = () => {
	emit('update:visible', false);
};

const handleMove = async () => {
	if (!moveTo.value) return;

	const ctx = await usageMoveRes({
		src: props.src,
		dest: moveTo.value,
	});
	if (ctx.response.body.code !== 0) {
		return Message.error(ctx.response.body.message);
	}
	emit('update:visible', false);
}
</script>
<template>
	<a-modal v-model:visible="props.visible" @cancel="handleCancel" unmountOnClose title="Move To"
		modal-class="move-to-modal-class" :render-to-body="true">
		<div>
			<a-tree blockNode :data="treeData" :default-expand-all="false" :show-line="true"
				@select="handleTreeSelect"></a-tree>
		</div>
		<template #footer>
			<div class="move-to-modal-footer">
				<a-button @click="() => {

				}">Create Dir</a-button>

				<a-space>
					<a-button @click="() => {
						emit('update:visible', false)
					}">Cancel</a-button>
					<a-button type="primary" @click="handleMove">Move</a-button>
				</a-space>
			</div>
		</template>
	</a-modal>
</template>

<style lang="css" scoped>
/* todo: 处理样式 */
:global(.move-to-modal-class) {
	min-width: 560px;
	width: 80vw;
	max-width: 80vw;
}

.move-to-modal-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

/* :global(.arco-tree-node-selected .arco-tree-node-title) {
	background-color: var(--primary-2) !important;
} */
</style>