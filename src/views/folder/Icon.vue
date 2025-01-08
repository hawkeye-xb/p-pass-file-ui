<script setup lang="ts">
import {
	IconFolder,
	IconFile,
	IconFileAudio,
	IconFileImage,
	IconFilePdf,
	IconFileVideo,
} from '@arco-design/web-vue/es/icon';
import path from 'path-browserify';
import { computed } from 'vue';

const props = defineProps({
	type: {
		type: String,
		default: 'file',
	},
	path: {
		type: String,
		default: '',
	}
});

const Icon = computed(() => {
	if (props.type === 'file') {
		const ext = path.extname(props.path);
		switch (ext) {
			case '.mp3':
				return IconFileAudio;
			case '.jpg':
			case '.png':
			case '.gif':
			case '.jpeg':
				return IconFileImage;
			case '.pdf':
				return IconFilePdf;
			case '.mp4':
				return IconFileVideo;
			default:
				return IconFile;
		}
	} else {
		return IconFolder;
	}
});
</script>
<template>
	<Icon style="margin-right: 8px;" />
</template>