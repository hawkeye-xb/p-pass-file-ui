
import type { MetadataType } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useMetadatasStore = defineStore('metadatas', () => {
	const metadatas = ref<MetadataType[]>([]);

	const updateMetadatas = (value: MetadataType[]) => {
		metadatas.value = value;
	}

	function findMetadataByIno(metadatas: MetadataType[], targetIno: number): MetadataType | null {
		// 遍历数组中的每个节点
		for (const metadata of metadatas) {
			// 如果当前节点的 ino 匹配目标 ino，返回当前节点
			if (metadata.ino === targetIno) {
				return metadata;
			}

			// 如果当前节点有子节点，递归查找子节点
			if (metadata.children && metadata.children.length > 0) {
				const result = findMetadataByIno(metadata.children, targetIno);
				if (result) {
					return result;
				}
			}
		}

		// 如果没有找到匹配的节点，返回 null
		return null;
	}

	return {
		metadatas,
		updateMetadatas,
		findMetadataByIno,
	}
})