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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
      <a-doption :value="DOPTION_VALUES.MoveTo" v-if="!isRoot">
        <template #icon><IconExport /></template>
        <template #default>{{ t('folder.options.moveTo') }}</template>
      </a-doption>
      <a-doption :value="DOPTION_VALUES.Rename" v-if="!isRoot">
        <template #icon><IconEdit /></template>
        <template #default>{{ t('folder.options.rename') }}</template>
      </a-doption>
      <a-doption :value="DOPTION_VALUES.Download">
        <template #icon><IconDownload /></template>
        <template #default>{{ t('folder.options.download') }}</template>
      </a-doption>
      <a-divider style="margin: 0;" v-if="!isRoot" />
      <a-doption :value="DOPTION_VALUES.Delete" v-if="!isRoot">
        <template #icon><IconDelete /></template>
        <template #default>{{ trashConfig ? t('folder.options.moveToTrash') : t('folder.options.delete') }}</template>
      </a-doption>
    </template>
  </a-dropdown>
</template>