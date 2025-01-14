import { getConfig } from "../config";
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { useConnectionsStore } from '@/stores/connections';
import { PeerInstance } from '../peer';
import type { DataConnection } from "peerjs";
import { ActionType } from "../peer/type";

export const usageServiceInit = () => {
	const deviceId = getConfig('deviceId');
	if (!deviceId) { return; }

	const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	const linkStore = useLinkStore();
	const connectionsStore = useConnectionsStore();

	const peerInstance = PeerInstance.getInstance();
	const connect = () => {
		const connDeviceId = getConfig('connDeviceId');
		if (!connDeviceId) { return; }
		linkStore.updateLink('webRTC', 'processing')
		peerInstance.connect({
			connDeviceId,
			onConnClose: () => { linkStore.updateLink('webRTC', 'warning') },
			onConnError: () => { linkStore.updateLink('webRTC', 'danger') },
			onConnOpen: () => { linkStore.updateLink('webRTC', 'success') },
			onConnData: (_conn: DataConnection, ctx: any) => {
				if (ctx.action === ActionType.Notify) {
					console.info('收到通知:', ctx);
					metadataStore.updateMetadatas(ctx.request.body);
				}
			}
		})
	}
	peerInstance.init({
		deviceId,
		onPeerOpen: () => {
			linkStore.updateLink('signaling', 'success');
			connect();
		},
		onPeerClosed: () => { linkStore.updateLink('signaling', 'warning') },
		onPeerError: () => { linkStore.updateLink('signaling', 'danger') },
		onPeerReceivedConn: (conn: DataConnection) => {
			connectionsStore.addConnection(conn);
		}
	});
}