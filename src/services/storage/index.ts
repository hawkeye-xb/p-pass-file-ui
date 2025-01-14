export * from './watchs'; // 提供settings 使用

import { initWatchTargets } from './watchs';
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { initWs } from './ws';
import { getWatchTargetsMetadata } from '@/ctrls/index';
import { getConfig } from '../config';
import { PeerInstance } from '../peer';
import type { DataConnection } from 'peerjs';
import { useConnectionsStore } from '@/stores/connections';
import { initRegister } from '@/router/webRTCStorageRoutes';
import { ActionType, type WebRTCContextType } from '../peer/type';

// todo: 断连和重连的操作
export const storageServiceInit = () => {
	const deviceId = getConfig('deviceId');
	if (!deviceId) { return; }

	initWatchTargets(); // 初始化监听

	const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	const linkStore = useLinkStore();
	const connectionsStore = useConnectionsStore();

	const peerInstance = PeerInstance.getInstance();
	const pushMetadata = (conn: DataConnection) => {
		const metadatas = metadataStore.metadatas;
		const data: WebRTCContextType = {
			action: ActionType.Notify,
			request: {
				id: `${new Date()}_notify_metadatas_by_${deviceId}`,
				body: metadatas,
			},
			response: {} as any,
		}
		conn.send(data);
	}
	const notifyAllConns = () => {
		const conns = peerInstance.getConnectionsMap();
		for (const [key, conn] of conns) {
			pushMetadata(conn);
		}
	}
	peerInstance.init({
		deviceId,
		onPeerOpen: () => { linkStore.updateLink('signaling', 'success') },
		onPeerClosed: () => { linkStore.updateLink('signaling', 'warning') },
		onPeerError: () => { linkStore.updateLink('signaling', 'danger') },
		onPeerDisconnected: () => { linkStore.updateLink('signaling', 'warning') },
		onPeerReceivedConn: (conn: DataConnection) => {
			connectionsStore.addConnection(conn);

			notifyAllConns();
		}
	})
	initRegister();

	linkStore.updateLink('ws', 'processing')
	const ws = initWs({
		onmessage: async () => { // 接受推送，重新获取元数据
			const res = await getWatchTargetsMetadata();
			const result = await res.json();
			if (result.code !== 200) {
				return;
			}
			metadataStore.updateMetadatas(result.data)

			notifyAllConns();
		},
		onopen: () => { linkStore.updateLink('ws', 'success') },
		onerror: () => { linkStore.updateLink('ws', 'danger') },
		onclose: () => { linkStore.updateLink('ws', 'warning') }
	})
	ws.onreconnecting = () => { linkStore.updateLink('ws', 'processing') }
	ws.onreconnected = (err) => {
		if (err) {
			console.log('ws reconnect error', err);
			linkStore.updateLink('ws', 'danger')
		} else {
			linkStore.updateLink('ws', 'success')
		}
	}
	linkStore.setWs(ws); // 唯一实例，不用删除

	console.info('storageServiceInit done', deviceId, peerInstance);
}
