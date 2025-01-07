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

const props = defineProps({
	record: {
		type: Object,
		default: () => MetadataTypeDefaultValue,
	}
});

enum DOPTION_VALUES { Share, Link, Copy, Paste, Export, Rename, MoveTo, Download, Delete }

const handleSelect: ((value: string | number | Record<string, any> | undefined, ev: Event) => any) | undefined
	= (key) => {
		if (key === undefined)
			return;
		if (key === DOPTION_VALUES.MoveTo) {
			console.log('move to');
			return;
		}
		if (key === DOPTION_VALUES.Delete) {
			console.log('delete');
			return;
		}
		if (key === DOPTION_VALUES.Rename) {
			console.log('rename');
			return;
		}
		if (key === DOPTION_VALUES.Download) {
			console.log('download');
			return;
		}
		if (key === DOPTION_VALUES.Export) {
			console.log('export');
			return;
		}
		if (key === DOPTION_VALUES.Paste) {
			console.log('paste');
			return;
		}
		if (key === DOPTION_VALUES.Copy) {
			console.log('copy');
			return;
		}
		if (key === DOPTION_VALUES.Link) {
			console.log('link');
			return;
		}
		if (key === DOPTION_VALUES.Share) {
			console.log('share');
			return;
		}
		console.log('unknown');
	};
</script>

<template>
	<a-dropdown @select="handleSelect" :popup-max-height="false">
		<IconMore style="cursor: pointer;" />
		<template #content>
			<a-doption :value="DOPTION_VALUES.Share">
				<template #icon>
					<IconShareInternal />
				</template>
				<template #default>Share</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Link">
				<template #icon>
					<IconLink />
				</template>
				<template #default>Copy Link</template>
			</a-doption>
			<a-divider style="margin: 0;" />

			<a-doption :value="DOPTION_VALUES.Copy">
				<template #icon>
					<IconCopy />
				</template>
				<template #default>Copy</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Paste" v-show="props.record.type === 'directory'">
				<template #icon>
					<IconPaste />
				</template>
				<template #default>Paste</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Export">
				<template #icon>
					<IconExport />
				</template>
				<template #default>Move To</template>
			</a-doption>
			<a-doption :value="DOPTION_VALUES.Rename">
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
			<a-divider style="margin: 0;" />

			<a-doption :value="DOPTION_VALUES.Delete">
				<template #icon>
					<IconDelete />
				</template>
				<template #default>Delete</template>
			</a-doption>
		</template>
	</a-dropdown>
</template>