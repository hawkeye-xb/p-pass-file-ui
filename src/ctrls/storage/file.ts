import { request, jsonHeaders as headers } from "@/apis/request";
import path from "path-browserify";

interface RenameFileType {
	target: string, // 目标文件
	name: string, // 新名称
}
export const renameFile = (data: RenameFileType) => {
	return request('/file', {
		method: 'PATCH',
		headers,
		body: JSON.stringify(data)
	})
}

interface DownloadFileType {
	target: string, // 目标文件
	offset?: number, // 偏移量
	size?: number, // 大小
}
export const downloadFile = (data: DownloadFileType) => {
	const params = new URLSearchParams()
	params.append('target', data.target)
	if (data.offset) {
		params.append('offset', data.offset.toString())
	}
	if (data.size) {
		params.append('size', data.size.toString())
	}

	return request(`/file/download?${params.toString()}`, {
		method: 'GET',
	})
}

interface PreUploadValidateType extends Record<string, string> {
	target: string, // 目标目录
	size: string, // 文件大小
	name: string, // 文件名
}
export const preUploadValidate = (data: PreUploadValidateType) => {
	const params = new URLSearchParams(data)
	return request(`/file/pre-upload?${params.toString()}`, {
		method: 'GET',
	})
}

/*
	todo：修改这个问题
	为了保持后缀，文件上传会使用name + filename的后缀
*/ 
interface UploadFileFormDataType {
	target: string, // 目标目录
	name: string, // 文件名
	file: File, // 文件
}
export const uploadFile = (data: UploadFileFormDataType) => {
	const formData = new FormData();
	formData.append('target', data.target)
	formData.append('name', data.name)
	formData.append('file', data.file)

	return request('/file/upload', {
		method: 'POST',
		body: formData,
	})
}

interface AggregateFilesType {
	filePaths: {
		index: number, // 文件排序
		path: string, // 文件路径
	}[], // 需要聚合的文件
	target: string, // 目标目录
	name: string, // 文件名
	parentPaths?: string[], // 父目录
	temporaryPath?: string, // 临时目录
}
export const aggregateFiles = (data: AggregateFilesType) => {
	return request('/file/aggregate', {
		method: 'POST',
		headers,
		body: JSON.stringify({
			...data,
			target: data.parentPaths?.length ? path.join(data.target, ...data.parentPaths) : data.target,
			parentPaths: undefined,
		})
	})
}