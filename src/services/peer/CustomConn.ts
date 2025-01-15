import type { DataConnection, Peer } from "peerjs";
import type { ActionType, WebRTCContextType } from "./type";
import { deleteRequest, generateWebRTCContext, getRequest, setRequest } from "./requestManager";

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
	public ondata: ((data: any) => void) | null = null;

	public reconnect() {
		// 主动的？
		this.connect();
	}

	constructor(peerInstance: Peer, connDeviceId: string, options?: {
		reconnectAttempts?: number;
		maxReconnectAttempts?: number;
		reconnectInterval?: number;
	}) {
		this.peer = peerInstance;
		this.connDeviceId = connDeviceId;
		this.reconnectAttempts = options?.reconnectAttempts || 0;
		this.maxReconnectAttempts = options?.maxReconnectAttempts || 5;
		this.reconnectInterval = options?.reconnectInterval || 1000;

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
		this.conn?.on('data', this.handleData.bind(this));
	}

	private handleData(data: any) {
		this.ondata?.(data);

		this.handleConnResponse(data);
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
		this.onerror?.('');

		this.handleReconnect();
	}

	private handleReconnect() {
		if (this.reconnectTimeout) {
			return;
		}
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			return;
		}

		this.reconnectAttempts++;
		this.reconnectTimeout = setTimeout(() => {
			clearTimeout(this.reconnectTimeout!);
			this.connect();
		}, this.reconnectInterval);
	}

	public getUniConn() {
		return this.conn;
	}

	public request<T>(action: ActionType, body: unknown, config: {
		target?: DataConnection;
		request?: {}
	}): Promise<T> {
		return new Promise((resolve, reject) => {
			const context = generateWebRTCContext(action, body);

			context.request = {
				...context.request,
				...config.request,
			};

			setRequest(context.request.id, {
				resolve,
				reject,
				context,
			})

			const conn = config.target || this.conn;
			if (conn) {
				conn.send(context);
			} else {
				reject('conn not init');
			}
		})
	}

	private handleConnResponse(d: unknown) {
		try {
			const ctx = d as WebRTCContextType;
			const target = getRequest(ctx.request.id);
			if (target) {
				target.resolve(ctx);
				deleteRequest(ctx.request.id);
			}
		} catch (error) {
			console.warn(error);
		}
	}
}