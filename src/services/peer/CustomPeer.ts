import Peer from 'peerjs';
import { PeerErrorType, type DataConnection, type PeerError } from 'peerjs';
import { ActionType } from './type';

export class CustomPeer {
	private deviceId: string = '';
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectInterval: number = 1000; // 重连间隔时间（毫秒）
	private reconnectTimeout: number | null = null;

	public peer: Peer | undefined = undefined;

	// todo: 做成 EventEmitter
	public onopen: (() => void) | null = null;
	public onclose: (() => void) | null = null;
	public onerror: ((error: PeerError<`${PeerErrorType}`>) => void) | null = null;
	public oninit: (() => void) | null = null;
	public ondisconnected: (() => void) | null = null;
	public onconnection: ((conn: DataConnection) => void) | null = null;

	public destroy() {
		this.reconnectAttempts = this.maxReconnectAttempts + 1;
		this.peer?.destroy();
		this.peer = undefined;

		this.onclose?.();
	}

	public restart() {
		this.reconnectAttempts = 0;
		this.handleErrorReconnect();
	}

	public reconnect() {
		this.peer?.reconnect();
	}

	constructor(deviceId: string, options?: {
		reconnectAttempts?: number;
		maxReconnectAttempts?: number;
		reconnectInterval?: number;
	}) {
		this.deviceId = deviceId;
		this.reconnectAttempts = options?.reconnectAttempts || 0;
		this.maxReconnectAttempts = options?.maxReconnectAttempts || 5;
		this.reconnectInterval = options?.reconnectInterval || 1000;
	}

	public init() {
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
		console.debug('peer open:', id);

		this.reconnectAttempts = 0; // 重置重连次数
		this.onopen?.();
		// 是否需要直接发起conn，使用侧再处理
	}

	private handleClose() { // 断连或者销毁会触发
		console.debug('peer close');

		this.onclose?.();

		if (this.peer && this.peer.destroyed) {
			this.handleErrorReconnect();
		}
	}

	private handleError(error: PeerError<`${PeerErrorType}`>) {
		console.warn('error name:', error.name, 'error type:', error.type, 'error msg:', error.message);

		switch (error.type) {
			// 连接相关错误
			case PeerErrorType.PeerUnavailable:
				// 对方不在线或不存在，这种情况下应该停止重连
				this.reconnectAttempts = this.maxReconnectAttempts;
				console.warn("目标 Peer 不可用，可能离线或不存在");
				break;

			// 配置相关错误
			case PeerErrorType.InvalidID:
				// ID格式错误，这是致命错误，需要检查ID格式
				console.error("Peer ID 格式无效");
				throw error;
			case PeerErrorType.InvalidKey:
				// API密钥错误，这是致命错误，需要检查配置
				console.error("API Key 无效");
				throw error;
			case PeerErrorType.UnavailableID:
				// ID已被占用，这是致命错误，需要更换ID
				console.error("Peer ID 已被占用");
				throw error;

			// 网络连接相关错误
			case PeerErrorType.Disconnected:
				// 与信令服务器断开连接，可以尝试重连
				console.warn("与信令服务器断开连接");
				this.handleErrorReconnect();
				break;
			case PeerErrorType.SocketError:
			case PeerErrorType.SocketClosed:
				// Socket错误，可以尝试重连
				console.warn("Socket连接错误");
				this.handleErrorReconnect();
				break;

			// 环境相关错误
			case PeerErrorType.SslUnavailable:
				// SSL不可用，这是致命错误，需要检查服务器配置
				console.error("SSL 不可用，请检查服务器配置");
				throw error;
			case PeerErrorType.BrowserIncompatible:
				// 浏览器不兼容，这是致命错误
				console.error("浏览器不支持 WebRTC");
				throw error;

			// 其他错误
			case PeerErrorType.Network:
				// 网络错误，可以尝试重连
				console.warn("网络错误");
				this.handleErrorReconnect();
				break;
			case PeerErrorType.ServerError:
				// 服务器错误，可以尝试重连
				console.warn("服务器错误");
				this.handleErrorReconnect();
				break;
			case PeerErrorType.WebRTC:
				// WebRTC错误，可能需要重新建立连接
				console.warn("WebRTC 错误");
				this.handleErrorReconnect();
				break;
			default:
				console.error("未知错误:", error);
				throw error;
		}

		this.onerror?.(error);
	}

	private handleDisconnected() {
		console.debug('peer disconnected');
		this.ondisconnected?.();
	
		// 添加重连状态追踪
		if (this.peer?.destroyed) {
			console.warn('Peer已销毁，不进行重连');
			return;
		}
	
		// 使用递增重连间隔
		const currentInterval = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
		this.reconnectAttempts++;
	
		const timer = setTimeout(() => {
			clearTimeout(timer);
			if (this.peer?.disconnected) {
				this.peer.reconnect();
			}
		}, currentInterval);
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