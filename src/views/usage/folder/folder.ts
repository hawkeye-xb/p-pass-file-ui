import { usageDeleteRes } from "@/ctrls/index";
import type { MetadataType } from "@/types";
import { Message } from "@arco-design/web-vue";
import { DOPTION_VALUES, processStream } from "./utils";
import { getConfig } from '@/services/index'
import { usageCreateDir } from "@/ctrls/usage";
import { dateFormat } from "@/utils";

export async function handleCreateDir(target: string) {
	usageCreateDir({
		target,
		name: '新建文件夹 ' + dateFormat(Date.now(), "YYYYMMDD HHmmss"),
	})
}

export const unlink = async (targets: string[]) => {
	const trashConfig = getConfig('trash')
	await usageDeleteRes({
		targets,
		trash: false,
		force: trashConfig
	})
}
export const handleOptionSelected = (key: string | number | Record<string, any> | undefined, record: MetadataType) => {
	if (key === DOPTION_VALUES.Delete) {
		unlink([record.path]);
		return;
	}
	if (key === DOPTION_VALUES.Download) {
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
}