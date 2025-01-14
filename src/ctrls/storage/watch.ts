import { request, jsonHeaders as headers } from "@/apis/request";

interface WatchTargetType {
	target: string,
}
export const watchTarget = (data: WatchTargetType) => {
	return request('/watch', {
		method: 'POST',
		headers,
		body: JSON.stringify(data)
	})
}

export const unwatchTarget = (data: WatchTargetType) => {
	return request('/watch', {
		method: 'DELETE',
		headers,
		body: JSON.stringify(data)
	})
}

export const getWatchTargetsMetadata = () => {
	return request('/watch/metadata', {
		method: 'GET',
	})
}