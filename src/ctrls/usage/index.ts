import { PeerInstance } from '@/services/peer/index'
import { ActionType } from '@/services/peer/type'

interface CreateDirType {
	target: string,
	name: string,
}
export const usageCreateDir = (data: CreateDirType) => {
	const peerInstance = PeerInstance.getInstance()
	return peerInstance.request(ActionType.CreateDir, data, {})

}

interface RenameType {
	target: string,
	name: string,
}
export const usageRenameDir = (data: RenameType) => {
	const peerInstance = PeerInstance.getInstance()
	return peerInstance.request(ActionType.RenameDir, data, {})
}
export const usageRenameFile = (data: RenameType) => {
	const peerInstance = PeerInstance.getInstance()
	return peerInstance.request(ActionType.RenameFile, data, {})
}

interface DeleteResType {
	targets: string[], // 目标路径
	force?: boolean, // 是否强制删除; default: false
	trash?: boolean, // 是否移动到回收站; default: true
}
export const usageDeleteRes = (data: DeleteResType) => {
	const peerInstance = PeerInstance.getInstance()
	return peerInstance.request(ActionType.DeleteRes, data, {})
}