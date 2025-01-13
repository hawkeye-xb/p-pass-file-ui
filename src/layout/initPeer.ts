import { useConnectionsStore } from '@/stores/connections'
import { useLinkStore } from '@/stores/link'
import { useMetadatasStore } from '@/stores/metadatas'
import type { DataConnection } from 'peerjs';
import { PeerInstance } from '@/services/peer';
import { getConfig } from '@/services';
import { initRegister } from '@/router/webRTCStorageRoutes';

export const initPeer = () => {
	const connectionsStore = useConnectionsStore();
	const linkStore = useLinkStore();

	const deviceId = getConfig('deviceId') || '';
	if (!deviceId) { return; }
	const peerInstance = PeerInstance.getInstance();
	peerInstance.init({
		deviceId,
		onPeerOpen: () => { linkStore.updateLink('signaling', 'success') },
		onPeerClosed: () => { linkStore.updateLink('signaling', 'warning') },
		onPeerError: () => { linkStore.updateLink('signaling', 'danger') },
		onPeerReceivedConn: (conn: DataConnection) => {
			connectionsStore.addConnection(conn);
		// 是否需要
		// conn.on('close', () => {
		// 	connectionsStore.removeConnection(conn);
		// })
		// conn.on('error', (err) => {
		// 	console.warn(err);
		// })
		}
	})

	// storage 注册路由
	initRegister();
}