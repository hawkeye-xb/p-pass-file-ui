import { peerInstance, onConnectionOpen } from '@/services/peer/index'
import { useConnectionsStore } from '@/stores/connections'
import { useLinkStore } from '@/stores/link'

export const initPeer = () => {
	const linkStore = useLinkStore();
	const connectionsStore = useConnectionsStore();

	// 设置状态值
	linkStore.updateLink('signaling', 'processing')
	peerInstance.on('open', (id) => {
		linkStore.updateLink('signaling', 'success')
	})
	peerInstance.on('error', (err) => {
		linkStore.updateLink('signaling', 'danger')
	})
	peerInstance.on('disconnected', () => {
		linkStore.updateLink('signaling', 'warning')
	})
	peerInstance.on('close', () => {
		linkStore.updateLink('signaling', 'warning')
	})

	onConnectionOpen((conn) => {
		connectionsStore.addConnection(conn)
		conn.on('close', () => {
			connectionsStore.removeConnection(conn)
		})
		conn.on('error', () => {
			connectionsStore.removeConnection(conn)
		})
	})
}