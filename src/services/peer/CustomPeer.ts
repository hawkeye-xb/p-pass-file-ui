import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';

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
		// @ts-ignore
		if (window.DevEnvPeer) {
			// @ts-ignore
			this.peer = window.DevEnvPeer;
			console.log('DevEnvPeer already init', this.peer, this.peer?.disconnected);
			return;
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

		// @ts-ignore
		window.DevEnvPeer = this.peer;

		this.bindEvents();
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

	private handleClose() {
		console.warn('peer close');
		this.onclose?.();

		this.handleErrorReconnect();
	}

	private handleError(err: unknown) {
		console.warn('peer error:', err);
		this.onerror?.(err as string);

		this.handleErrorReconnect();
	}

	private handleDisconnected() { // 应该属于心跳包断连
		this.ondisconnected?.();

		const timer = setTimeout(() => {
			clearTimeout(timer);
			this.peer?.reconnect();
		}, this.reconnectInterval);
	}

	private handleErrorReconnect() {
		if (!this.peer?.destroyed) {
			this.peer?.destroy();
			return; // 会触发close事件
		}
		if (this.peer?.destroyed) { this.peer = undefined; }

		if (this.reconnectTimeout) {
			return;
		}

		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.warn('peer recreate attempts exceeded');
			return;
		}

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