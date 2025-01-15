import { CustomPeer } from '@/services/peer/CustomPeer';
import { getConfig } from '../config';
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { on, emit, off } from '@/services/peer/listeners';
import type { DataConnection } from 'peerjs';
import { ActionType, type WebRTCContextType } from '../peer/type';
import { createDir, createTemporaryDir, deleteRes, getWatchTargetsMetadata, moveRes, preUploadValidate, renameDir, renameFile } from '@/ctrls';
import { useConnectionsStore } from '@/stores/connections';
import { initWs } from './ws';

export const storageService = () => {
	const deviceId = getConfig('deviceId');
	if (!deviceId) { return; }

	const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	const linkStore = useLinkStore();
	const connectionsStore = useConnectionsStore();
	const sendMetadata = (conn: DataConnection) => {
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
	const peer = new CustomPeer(deviceId);
	peer.oninit = () => { linkStore.updateLink('ws', 'processing'); }
	peer.onopen = () => { linkStore.updateLink('signaling', 'success'); }
	peer.onclose = () => { linkStore.updateLink('signaling', 'warning'); }
	peer.onerror = () => { linkStore.updateLink('signaling', 'danger'); }
	peer.ondisconnected = () => { linkStore.updateLink('signaling', 'warning'); }

	peer.onconnection = (conn: DataConnection) => {
		conn.on('open', () => {
			connectionsStore.addConnectionMap(conn);

			sendMetadata(conn);
		});
		conn.on('close', () => {
			connectionsStore.removeConnectionMap(conn);
		});
		// 存储侧接收到数据
		conn.on('data', async (d) => {
			try {
				const data = d as WebRTCContextType;
				if (data.action === ActionType.Notify) return;

				await emit(data.action, data, conn); // 处理接收到的数据
				conn.send(data); // 内容一起返回
			} catch (error) {
				console.warn(error);
			}
		})
	}

	initPeerResponse();

	const notifyAllConns = () => {
		const conns = connectionsStore.getConnectionsMap() as Map<string, DataConnection>;
		for (const [key, conn] of conns) {
			sendMetadata(conn);
		}
	}

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
}

function handleRouteResponseMiddle(fn: any) {
	return async (ctx: WebRTCContextType) => {
		try {
			const res = await fn(ctx.request.body);
			const result = await res.json();
			ctx.response.body = result;
		} catch (error) {
			ctx.response.body = { code: 500, message: 'handleRouteResponseMiddle error' + error };
		}
	}
}

function initPeerResponse() {
	on(ActionType.MoveRes, handleRouteResponseMiddle(moveRes))
	on(ActionType.DeleteRes, handleRouteResponseMiddle(deleteRes))
	// 获取元数据两个接口先不处理

	on(ActionType.CreateTemporaryDir, handleRouteResponseMiddle(createTemporaryDir))
	on(ActionType.CreateDir, handleRouteResponseMiddle(createDir))
	on(ActionType.RenameDir, handleRouteResponseMiddle(renameDir))
	// 下载目录接口

	on(ActionType.PreUploadValidate, handleRouteResponseMiddle(preUploadValidate))
	// 上传文件接口
	on(ActionType.RenameFile, handleRouteResponseMiddle(renameFile))
}
