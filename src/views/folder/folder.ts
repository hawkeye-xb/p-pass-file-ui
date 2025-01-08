import { createDir, deleteRes } from "@/ctrls/index";
import type { MetadataType } from "@/types";
import { Message } from "@arco-design/web-vue";
import { DOPTION_VALUES } from "./utils";
import { getConfig } from '@/services/index'

// todo: 统一处理下请求返回信息
export async function handleCreateDir(target: string) {
	const res = await createDir({
		target,
		name: '新建文件夹' + new Date(),
	});
	const result = await res.json();
	if (res.status !== 200 || result.code !== 0) {
		Message.error(result.message);
		return;
	}
}

export const handleOptionSelected = (key: string | number | Record<string, any> | undefined, record: MetadataType) => {
	if (key === DOPTION_VALUES.MoveTo) {
		console.log('move to');
		return;
	}
	if (key === DOPTION_VALUES.Delete) {
		const unlink = async () => {
			const trashConfig = getConfig('trash')
			const res = await deleteRes({
				targets: [record.path],
				trash: trashConfig,
				force: trashConfig
			})
			const result = await res.json()
			if (res.status !== 200 || result.code !== 0) {
				Message.error(result.message);
				return;
			}
		}
		unlink();
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
}