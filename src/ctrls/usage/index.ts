import { ActionType, type WebRTCContextType } from '@/services/peer/type'

let request: (arg0: ActionType, arg1: CreateDirType | DeleteResType | MoveResType, arg2: {}) => any;
export const setUsageCtrlRequest = (req: any) => {
	request = req
}

interface CreateDirType {
	target: string,
	name: string,
}
export const usageCreateDir = (data: CreateDirType) => {
	return request(ActionType.CreateDir, data, {})

}

interface RenameType {
	target: string,
	name: string,
}
export const usageRenameDir = (data: RenameType) => {
	return request(ActionType.RenameDir, data, {})
}
export const usageRenameFile = (data: RenameType) => {
	return request(ActionType.RenameFile, data, {})
}

interface DeleteResType {
	targets: string[], // 目标路径
	force?: boolean, // 是否强制删除; default: false
	trash?: boolean, // 是否移动到回收站; default: true
}
export const usageDeleteRes = (data: DeleteResType) => {
	return request(ActionType.DeleteRes, data, {})
}

interface MoveResType {
	src: string[], // 源路径
	dest: string, // 目标路径
}
export const usageMoveRes = (data: MoveResType): Promise<WebRTCContextType> => {
	return request(ActionType.MoveRes, data, {})
}

export const usageUploadFile = (data: {
	content: Uint8Array,
	target: string,
	name: string,
}) => {
	return request(ActionType.UploadFile, data, {})
}
