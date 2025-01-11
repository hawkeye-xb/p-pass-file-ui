import { peerInstance, onConnectionOpen } from '@/services/peer_back/index'
import { useConnectionsStore } from '@/stores/connections'
import { useLinkStore } from '@/stores/link'
import type { DataConnection } from 'peerjs';

let uniConnInitBackup: (() => void) | undefined = undefined;
export const initPeer = () => {
	const linkStore = useLinkStore();
	const connectionsStore = useConnectionsStore();

	// 设置状态值
	linkStore.updateLink('signaling', 'processing')
	peerInstance.on('open', (id) => {
		linkStore.updateLink('signaling', 'success')

		// 重连
		if (uniConnInitBackup) {
			uniConnInitBackup();
		}
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

export let uniConn: DataConnection | undefined = undefined;
const handleConnect = (cid: string) => {
	if (!peerInstance) return console.warn('peerInstance 不存在')
	if (uniConn) return console.warn('已经存在连接')

	const uc = peerInstance.connect(cid);
	const linkStore = useLinkStore();

	linkStore.updateLink('webRTC', 'processing')
	uc.on('open', () => {
		linkStore.updateLink('webRTC', 'success')
		uniConn = uc;
	})
	uc.on('error', () => {
		linkStore.updateLink('webRTC', 'danger')
	})
	uc.on('close', () => {
		linkStore.updateLink('webRTC', 'warning')
	})
}
export const connect = (cid: string) => {
	if (peerInstance) {
		if (uniConn) {
			// todo, change cid
			return console.warn('已经存在连接')
		}

		if (peerInstance.open) {
			return handleConnect(cid)
		}

		uniConnInitBackup = () => {
			handleConnect(cid)
		}
	}
}
