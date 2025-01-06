import { request, jsonHeaders as headers } from "@/apis/request";

// todo:
interface MoveResType {
	src: [string], // 源路径
	dest: string, // 目标路径
}
export const moveRes = (data: MoveResType) => {
	return request('/move', {
		method: 'POST',
		headers,
		body: JSON.stringify(data)
	})
}

interface DeleteResType {
	targets: string[], // 目标路径
	force?: boolean, // 是否强制删除; default: false
	trash?: boolean, // 是否移动到回收站; default: true
}
export const deleteRes = (data: DeleteResType) => {
	return request('/res', {
		method: 'DELETE',
		headers,
		body: JSON.stringify(data)
	})
}

interface GetMetadataType {
	target: string, // 目标路径，可以是文件或目录
	depth?: number, // 目录深度，默认为 1，表示只获取当前目录的元数据
}
export const getMetadata = (data: GetMetadataType) => {
	const params = new URLSearchParams()
	params.append('target', data.target)
	if (data.depth) {
		params.append('depth', data.depth.toString())
	}

	const url = `/metadata?${params.toString()}`
	return request(url, {
		method: 'GET',
	})
}