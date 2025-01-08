import { MetadataTypeDefaultValue, type MetadataType } from "@/types";

export enum DOPTION_VALUES { Share, Link, Copy, Paste, Export, Rename, MoveTo, Download, Delete }

export function getCurrentFolder(metadatas: MetadataType[], names: string[]) {
	let currentFolder: MetadataType | null = null;
	for (const name of names) {
		const node = metadatas.find((el: { name: string; }) => el.name === name);
		if (node) {
			currentFolder = node;
			metadatas = node.children || [];
		} else {
			break;
		}
	}

	return currentFolder || {
		...MetadataTypeDefaultValue,
		children: metadatas,
	};
}