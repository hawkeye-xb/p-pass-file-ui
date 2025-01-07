
import type { MetadataType } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useMetadatasStore = defineStore('metadatas', () => {
	const metadatas = ref<MetadataType[]>([]);

	const updateMetadatas = (value: MetadataType[]) => {
		metadatas.value = value;
	}

	return {
		metadatas,
		updateMetadatas,
	}
})