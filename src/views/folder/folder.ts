import { createDir } from "@/ctrls/index";
import { Message } from "@arco-design/web-vue";

export async function handleCreateDir(target: string) {
	const res = await createDir({
		target,
		name: '新建文件夹' + new Date(),
	});
	const result = await res.json();
	if (res.status !== 200 || result.code !== 200) {
		Message.error(result.message);
		return;
	}
}