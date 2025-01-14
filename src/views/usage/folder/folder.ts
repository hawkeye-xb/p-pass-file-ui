import { deleteRes } from "@/ctrls/index";
import type { MetadataType } from "@/types";
import { Message } from "@arco-design/web-vue";
import { DOPTION_VALUES, processStream } from "./utils";
import { getConfig } from '@/services/index'
import { PATH_TYPE } from "@/const";
import path from 'path-browserify';
import { usageCreateDir } from "@/ctrls/usage";
import { dateFormat } from "@/utils";

// todo: 统一处理下请求返回信息
// export async function handleCreateDir(target: string) {
// 	const res = await createDir({
// 		target,
// 		name: '新建文件夹' + new Date(),
// 	});
// 	const result = await res.json();
// 	if (res.status !== 200 || result.code !== 0) {
// 		Message.error(result.message);
// 		return;
// 	}
// }
export async function handleCreateDir(target: string) {
	const res = await usageCreateDir({
		target,
		name: '新建文件夹 ' + dateFormat(Date.now()),
	})
	console.log(res);
}

export const unlink = async (targets: string[]) => {
	const trashConfig = getConfig('trash')
	const res = await deleteRes({
		targets,
		trash: trashConfig,
		force: trashConfig
	})
	const result = await res.json()
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
		unlink([record.path]);
		return;
	}
	if (key === DOPTION_VALUES.Rename) {
		console.log('rename');
		return;
	}
	if (key === DOPTION_VALUES.Download) {
		// const dl = async () => {
		// 	const params = {
		// 		target: record.path,
		// 		// offset, size not used
		// 	}
		// 	const fn = record.type === PATH_TYPE.DIR ? downloadDirZip : downloadFile
		// 	const filename = record.type === PATH_TYPE.DIR ? path.basename(record.path) + '.zip' : path.basename(record.path)
		// 	const res: any = await fn(params)
		// 	processStream(res.body, filename)
		// 	// todo: error
		// }
		// dl();
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