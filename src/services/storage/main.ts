import { CustomPeer } from '@/services/peer/CustomPeer';
import { getConfig } from '../config';
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { on, emit, off } from '@/services/peer/listeners';
import { PeerErrorType, type DataConnection, type PeerError } from 'peerjs';
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
	peer.onerror = (err) => {
		linkStore.updateLink('signaling', 'danger');
		handlePeerError(err);
	}
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

function handlePeerError(error: PeerError<`${PeerErrorType}`>) {
	switch (error.type) {
		case PeerErrorType.PeerUnavailable: // 尝试连接的对等端不存在；另外一端主动断开连接
			console.warn("PeerUnavailable:", error); // 使用侧断连？无影响
			break;
		case PeerErrorType.InvalidID: // 传入 Peer 构造函数的 ID 包含非法字符
			console.warn("InvalidID:", error); // 自生成的，不处理
			break;
		case PeerErrorType.InvalidKey: // 传入 Peer 构造函数的 API 密钥包含非法字符或不在系统中（仅限云服务器）。
			console.warn("InvalidKey:", error);
			break;
		case PeerErrorType.UnavailableID: // 传递给 Peer 构造函数的 ID 已被占用。
			console.warn("UnavailableID:", error); // todo: 重置？
			break;
		case PeerErrorType.Disconnected: // 与信令断连
		case PeerErrorType.SocketError:
		case PeerErrorType.SocketClosed:
			// this.peer?.reconnect(); // 断连监听了，这里不需要再处理
			break;
		case PeerErrorType.SslUnavailable: // 正在安全使用，但云服务器不支持 SSL。请使用自定义 PeerServer。
		case PeerErrorType.BrowserIncompatible: // 浏览器不支持 WebRTC
		case PeerErrorType.Network:
		case PeerErrorType.ServerError:
		case PeerErrorType.WebRTC: // 原生 WebRTC 错误
		default:
			console.error("Unknown error:", error);
			throw error;
	}
}
