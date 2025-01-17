import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { LargeFileUploader } from '@/services/upload'

interface UploaderItemType {
	id: string;
	uploadSourcePath?: string;
	uploadTargetPath?: string;
	name?: string;
	status?: 'uploading' | 'paused' | 'completed' | 'error';
	progress?: number;
	startTime?: number;
	speed?: number;
	completedTime?: number;
	uploader?: LargeFileUploader;
}
export const useUsageUploaderStore = defineStore('usageUploader', () => {
	const uploaderItems = ref<LargeFileUploader[]>
})