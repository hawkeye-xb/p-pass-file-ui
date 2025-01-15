import Peer from 'peerjs';
import { PeerErrorType, type DataConnection, type PeerError } from 'peerjs';

export class CustomPeer {
	private deviceId: string = '';
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectInterval: number = 1000; // 重连间隔时间（毫秒）
	private reconnectTimeout: number | null = null;

	public peer: Peer | undefined = undefined;

	public onopen: (() => void) | null = null;
	public onclose: (() => void) | null = null;
	public onerror: ((err: string) => void) | null = null;
	public oninit: (() => void) | null = null;
	public ondisconnected: (() => void) | null = null;
	public onconnection: ((conn: DataConnection) => void) | null = null;

	constructor(deviceId: string, options?: {
		reconnectAttempts?: number;
		maxReconnectAttempts?: number;
		reconnectInterval?: number;
	}) {
		this.deviceId = deviceId;
		this.reconnectAttempts = options?.reconnectAttempts || 0;
		this.maxReconnectAttempts = options?.maxReconnectAttempts || 5;
		this.reconnectInterval = options?.reconnectInterval || 1000;
		this.init();
	}

	private init() {
		if (this.peer && this.peer.open && !this.peer.destroyed && !this.peer.disconnected) {
			console.warn('peer already init'); // 这里应该走不到
			return;
		}

		const afterGerenate = () => {
			if (import.meta.env.DEV) {
				// @ts-ignore
				window.peer = this.peer;
			}

			this.bindEvents();
			this.onopen?.(); // 主动发起一次状态改变
		}

		if (import.meta.env.DEV) {
			// @ts-ignore
			const winPeer = window.peer || undefined;
			if (winPeer && winPeer.open && !winPeer.destroyed && !winPeer.disconnected) {
				this.peer = winPeer;
				afterGerenate();
				return;
			}
		}

		this.oninit?.();
		this.peer = new Peer(this.deviceId, {
			// debug: 3,
			config: {
				iceServers: [
					{ urls: 'stun:stun.l.google.com:19302' }
				]
			}
		});
		afterGerenate();
	}

	private bindEvents() {
		this.peer?.on('open', this.handleOpen.bind(this));
		this.peer?.on('close', this.handleClose.bind(this));
		this.peer?.on('error', this.handleError.bind(this));
		this.peer?.on('disconnected', this.handleDisconnected.bind(this));
		this.peer?.on('connection', this.handleConnection.bind(this));
		// this.peer?.on('call') media stream used
	}

	private handleOpen(id: string) {
		this.reconnectAttempts = 0; // 重置重连次数
		this.onopen?.();
		// 是否需要直接发起conn，使用侧再处理
	}

	private handleClose() { // 断连或者销毁会触发
		this.onclose?.();

		if (this.peer && this.peer.destroyed) {
			this.handleErrorReconnect();
		}
	}

	private handleError(error: PeerError<`${PeerErrorType}`>) {
		console.warn('error name:', error.name, 'error type:', error.type, 'error msg:', error.message, 'error stack:', error.stack);

		switch (error.type) {
			case PeerErrorType.PeerUnavailable: // 尝试连接的对等端不存在
				console.warn("PeerUnavailable:", error);
				break;
			case PeerErrorType.InvalidID: // 传入 Peer 构造函数的 ID 包含非法字符
				console.warn("InvalidID:", error);
				break;
			case PeerErrorType.InvalidKey: // 传入 Peer 构造函数的 API 密钥包含非法字符或不在系统中（仅限云服务器）。
				console.warn("InvalidKey:", error);
				break;
			case PeerErrorType.UnavailableID: // 传递给 Peer 构造函数的 ID 已被占用。
				console.warn("UnavailableID:", error);
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

	private handleDisconnected() { // 应该属于心跳包断连
		this.ondisconnected?.();

		const timer = setTimeout(() => {
			clearTimeout(timer);
			this.peer?.reconnect();
		}, this.reconnectInterval);
	}


	private handleErrorReconnect() {
		if (this.reconnectTimeout) { return; }
		if (this.reconnectAttempts >= this.maxReconnectAttempts) { return; }

		this.reconnectAttempts++;
		this.reconnectTimeout = setTimeout(() => {
			clearTimeout(this.reconnectTimeout!);
			this.reconnectTimeout = null;

			this.init();
		}, this.reconnectInterval);
	}

	private handleConnection(conn: DataConnection) {
		this.onconnection?.(conn);
	}
}