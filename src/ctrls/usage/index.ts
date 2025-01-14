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