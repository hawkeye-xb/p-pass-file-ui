import type { DataConnection, Peer } from "peerjs";

export class CustomConn {
	private peer: Peer | null = null;
	private conn: DataConnection | null = null;
	private connDeviceId: string = '';
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectInterval: number = 1000; // 重连间隔时间（毫秒）
	private reconnectTimeout: number | null = null;

	public onopen: (() => void) | null = null;
	public onclose: (() => void) | null = null;
	public onerror: ((err: string) => void) | null = null;
	public oninit: (() => void) | null = null;

	constructor(peerInstance: Peer, options: {
		connDeviceId: string;
		reconnectAttempts?: number;
		maxReconnectAttempts?: number;
		reconnectInterval?: number;
	}) {
		this.peer = peerInstance;
		this.connDeviceId = options.connDeviceId;
		this.reconnectAttempts = options.reconnectAttempts || 0;
		this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
		this.reconnectInterval = options.reconnectInterval || 1000;

		this.connect();
	}

	private connect() {
		if (!this.peer) return;
		this.oninit?.();

		const run = () => {
			this.conn = null;
			this.conn = this.peer?.connect(this.connDeviceId) || null;
			this.bindEvent();
		}
		if (this.peer.disconnected) {
			this.peer.reconnect();
			this.peer.once('open', run)
			return;
		}

		run()
	}

	private bindEvent() {
		this.conn?.on('open', this.handleOpen.bind(this));
		this.conn?.on('close', this.handleClose.bind(this));
		this.conn?.on('error', this.handleError.bind(this));
	}

	private handleOpen() {
		this.reconnectAttempts = 0; // 重置重连次数

		this.onopen?.();
	}

	private handleClose() {
		this.onclose?.();

		this.handleReconnect();
	}

	private handleError(...args: any) {
		console.log(args);
		this.onerror?.('');

		this.handleReconnect();
	}

	private handleReconnect() {
		if (this.reconnectTimeout) {
			console.debug('peer conn reconnecting...');
			return;
		}
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.debug('peer conn reconnect failed');
			return;
		}

		this.reconnectTimeout = setTimeout(() => {
			this.connect();
		}, this.reconnectInterval);
	}
}