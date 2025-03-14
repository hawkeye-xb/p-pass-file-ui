import { CustomPeer } from '@/services/peer/CustomPeer';
import { getConfig } from '../config';
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { on, emit, off } from '@/services/peer/listeners';
import { PeerErrorType, type DataConnection, type PeerError } from 'peerjs';
import { ActionType, type WebRTCContextType } from '../peer/type';
import { aggregateFiles, createDir, createTemporaryDir, deleteRes, downloadFile, getMetadata, getWatchTargetsMetadata, moveRes, preUploadValidate, renameDir, renameFile, uploadFile } from '@/ctrls';
import { useConnectionsStore } from '@/stores/connections';
import { initWs } from './ws';
import { initWatchTargets } from './watchs';
import path from 'path-browserify';
import { Notification } from '@arco-design/web-vue';

export const storageService = () => {
	const deviceId = getConfig('deviceId');
	if (!deviceId) { return; }

	initWatchTargets(); // 初始化监听

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
	peer.init();
	linkStore.setCustomPeer(peer);
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
			console.debug('conn open', conn);

			connectionsStore.addConnection(conn);
			sendMetadata(conn);
		});
		conn.on('close', () => {
			console.warn('conn close', conn);

			// 这里应该是主动发起的 close 监听
			connectionsStore.removeConnection(conn);
		});
		conn.on('error', (err) => {
			console.warn('conn error', err);
		});
		conn.on('iceStateChanged', (state) => {
			console.debug('conn iceStateChanged', state);

			if (state === 'disconnected') {
				connectionsStore.removeConnection(conn);
			}
		});

		// 存储侧接收到数据
		conn.on('data', async (d) => {
			try {
				const data = d as WebRTCContextType;
				if (data.action === ActionType.Notify) return;

				console.debug('storage on data, will action with:', data);
				await emit(data.action, data, conn); // 处理接收到的数据
				conn.send(data); // 内容一起返回
			} catch (error) {
				console.warn(error);
			}
		})
	}

	initPeerResponse();

	const notifyAllConns = () => {
		const conns = connectionsStore.connections as DataConnection[];
		for (const conn of conns) {
			sendMetadata(conn);
		}
	}

	linkStore.updateLink('ws', 'processing')
	const ws = initWs({
		onmessage: async () => { // 接受推送，重新获取元数据
			const res = await getWatchTargetsMetadata();
			const result = await res.json();
			if (result.code !== 0) {
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

// interface FileUploadReqBodyType {
// 	content: ArrayBuffer;
// 	filename: string;
// }
async function handleFileUpload(ctx: WebRTCContextType) { // todo: 传输中断的数据怎么处理？
	try {
		const body = ctx.request.body as any;
		const uint8array = new Uint8Array(body.content);
		const blob = new Blob([uint8array]);
		// body.filename 是没有的，所以服务端没有后缀
		const file = new File([blob], body.filename, { type: 'application/octet-stream' });

		const target = body.parentPaths?.length ? path.join(body.target, ...body.parentPaths) : body.target;

		const res = await uploadFile({
			target,
			name: body.name,
			file: file,
		});
		const result = await res.json();
		ctx.request.body = null;
		ctx.response.body = result;
	} catch (error) {
		ctx.request.body = null;
		ctx.response.body = { code: 500, message: 'handleRouteResponseMiddle error' + error };
	}
}

async function handleFileDownload(ctx: WebRTCContextType) {
	try {
		const res = await downloadFile(ctx.request.body as any);
		const buffer = await res.arrayBuffer();
		ctx.response.body = {
			code: 0,
			data: buffer,
			message: 'success',
		};
	} catch (error) {
		ctx.response.body = { code: 500, message: 'handleRouteResponseMiddle error' + error };
	}
}

function initPeerResponse() {
	on(ActionType.Metadata, handleRouteResponseMiddle(getMetadata))
	// 获取监听的元数据信息先不处理，直接推送了

	on(ActionType.MoveRes, handleRouteResponseMiddle(moveRes))
	on(ActionType.DeleteRes, handleRouteResponseMiddle(deleteRes))

	on(ActionType.CreateTemporaryDir, handleRouteResponseMiddle(createTemporaryDir))
	on(ActionType.CreateDir, handleRouteResponseMiddle(createDir))
	on(ActionType.RenameDir, handleRouteResponseMiddle(renameDir))
	// 下载目录接口

	on(ActionType.PreUploadValidate, handleRouteResponseMiddle(preUploadValidate))
	on(ActionType.UploadFile, handleFileUpload)
	on(ActionType.AggregateFiles, handleRouteResponseMiddle(aggregateFiles))
	on(ActionType.RenameFile, handleRouteResponseMiddle(renameFile))
	on(ActionType.DownloadFile, handleFileDownload)
}

function handlePeerError(error: PeerError<`${PeerErrorType}`>) {
	switch (error.type) {
		case PeerErrorType.PeerUnavailable: // 尝试连接的对等端不存在；另外一端主动断开连接
			console.warn("目标 Peer 不可用，可能离线或不存在");
			console.warn("PeerUnavailable:", error); // 使用侧断连？无影响. 可以检测联通性，处理展示的连接数据
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
			Notification.error({
				id: error.type,
				title: error.name,
				content: error.message,
				duration: 0,
				closable: true,
			})
			throw error;
	}
}
