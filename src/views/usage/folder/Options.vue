<script setup lang="ts">
import { MetadataTypeDefaultValue } from '@/types';
import {
	IconDelete,
	IconDownload,
	IconEdit,
	IconMore,
	IconCopy,
	IconLink,
	IconShareInternal,
	IconExport,
	IconPaste,
} from '@arco-design/web-vue/es/icon';
import { getConfig } from '@/services/index'
import { DOPTION_VALUES, rootPath } from './utils'
import { computed } from 'vue';

const trashConfig = getConfig('trash')

const props = defineProps({
	record: {
		type: Object,
		default: () => MetadataTypeDefaultValue,
	}
});

const emit = defineEmits<{
	(e: 'selected', message: string | number | Record<string, any> | undefined): void
}>();
// todo：把这些操作的代码提取出去，避免创建多份

const handleSelect: ((value: string | number | Record<string, any> | undefined, ev: Event) => any) | undefined
	= (key) => {
		if (key === undefined)
			return;
		emit('selected', key)
		return;
	};

const isRoot = computed(() => {
	return rootPath(props.record.path)
});
</script>

<template>
	<a-dropdown @select="handleSelect" :popup-max-height="false" position="br">
		<IconMore style="cursor: pointer;" />
		<template #content>
			<!-- <a-doption :value="DOPTION_VALUES.Share">
				<template #icon>
					<IconShareInternal />
				</template>
				<template #default>Share (todo)</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Link">
				<template #icon>
					<IconLink />
				</template>
				<template #default>Copy Link (todo)</template>
			</a-doption>
			<a-divider style="margin: 0;" />

			<a-doption :value="DOPTION_VALUES.Copy" v-if="!isRoot">
				<template #icon>
					<IconCopy />
				</template>
				<template #default>Copy (todo)</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Paste" v-if="props.record.type === 'directory'">
				<template #icon>
					<IconPaste />
				</template>
				<template #default>Paste (todo)</template>
			</a-doption> -->
			<a-doption :value="DOPTION_VALUES.MoveTo" v-if="!isRoot">
				<template #icon>
					<IconExport />
				</template>
				<template #default>Move To</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Rename" v-if="!isRoot">
				<template #icon>
					<IconEdit />
				</template>
				<template #default>Rename</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Download">
				<template #icon>
					<IconDownload />
				</template>
				<template #default>Download</template>
			</a-doption>
			<a-divider style="margin: 0;" v-if="!isRoot" />

			<a-doption :value="DOPTION_VALUES.Delete" v-if="!isRoot">
				<template #icon>
					<IconDelete />
				</template>
				<template #default>{{ trashConfig ? 'Move To Trash' : 'Delete' }}</template>
			</a-doption>
		</template>
	</a-dropdown>
</template>