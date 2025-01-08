import { getWatchTargets } from "@/services";
import { MetadataTypeDefaultValue, type MetadataType } from "@/types";

export enum DOPTION_VALUES { Share, Link, Copy, Paste, Rename, MoveTo, Download, Delete }

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
export function processStream(stream: ReadableStream<Uint8Array>, filename: string = 'archive.zip'): void {
	const reader = stream.getReader();
	let chunks: Uint8Array[] = [];

	function pump(): Promise<void> {
		return reader.read().then(({ done, value }: { done: boolean; value?: Uint8Array }) => {
			if (done) {
				// 所有数据读取完毕
				const blob = new Blob(chunks, { type: 'application/octet-stream' });
				// 创建一个下载链接
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = filename; // 设置下载文件名
				document.body.appendChild(a); // 将链接添加到 DOM 中
				a.click(); // 触发下载
				document.body.removeChild(a); // 移除链接
				URL.revokeObjectURL(url); // 释放 URL 对象
				return;
			}

			// 将读取到的数据块保存到数组中
			if (value) {
				chunks.push(value);
			}
			return pump();
		});
	}

	pump().catch((error: Error) => {
		console.error('Error reading stream:', error);
	});
}

export function rootPath(target: string): boolean {
	const roots = getWatchTargets();
	return roots.includes(target);
}
