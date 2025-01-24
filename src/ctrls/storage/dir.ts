import { request, jsonHeaders as headers } from "@/apis/request";
import path from "path-browserify";

export const createTemporaryDir = () => {
	return request('/dir/temporary', {
		method: 'POST',
	})
}

interface CreateDirType {
	target: string,
	name: string,
	parentPaths?: string[],
}
export const createDir = (data: CreateDirType) => {
	if (data.parentPaths?.length) {
		data.target = path.join(data.target, ...data.parentPaths);
		delete data.parentPaths;
	}

	return request('/dir', {
		method: 'POST',
		headers,
		body: JSON.stringify(data)
	})
}

interface RenameDirType {
	target: string,
	name: string,
}
export const renameDir = (data: RenameDirType) => {
	return request('/dir', {
		method: 'PATCH',
		headers,
		body: JSON.stringify(data)
	})
}

export const downloadDirZip = (data: {
	target: string
}) => {
	const url = `/dir/download?target=${data.target}`
	return request(url, {
		method: 'Get',
	})
}
