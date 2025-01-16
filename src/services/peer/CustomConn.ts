import type { DataConnection, PeerError } from "peerjs";
import type { ActionType, WebRTCContextType } from "./type";
import { deleteRequest, generateWebRTCContext, getRequest, setRequest } from "./requestManager";

import { CustomPeer } from "./CustomPeer";

// todo：dev 多次被实例化的问题?
export class CustomConn {
	private deviceId: string = '';
	public customPeer: CustomPeer | undefined = undefined;
	public conn: DataConnection | undefined = undefined;
	private connDeviceId: string = '';
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectInterval: number = 1000; // 重连间隔时间（毫秒）
	private reconnectTimeout: number | null = null;

	public onopen: (() => void) | null = null;
	public onclose: (() => void) | null = null;
	public onerror: ((error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed">) => void) | null = null;
	public oninit: (() => void) | null = null;
	public ondata: ((data: any) => void) | null = null;

	public destory() {
		this.reconnectAttempts = this.maxReconnectAttempts + 1;
		this.conn?.close();
		this.conn = undefined;

		this.customPeer?.destroy();
		this.customPeer = undefined;
		this.onclose?.();
	}

	public restart() {
		this.reconnectAttempts = 0;

		this.handleReconnect();
	}

	constructor(deviceId: string, connDeviceId: string, options?: {
		reconnectAttempts?: number;
		maxReconnectAttempts?: number;
		reconnectInterval?: number;
	}) {
		this.deviceId = deviceId;
		this.connDeviceId = connDeviceId;
		this.reconnectAttempts = options?.reconnectAttempts || 0;
		this.maxReconnectAttempts = options?.maxReconnectAttempts || 5;
		this.reconnectInterval = options?.reconnectInterval || 1000;

		if (this.conn) return;
		this.connect();
	}

	private connect() {
		this.oninit?.();
		if (!this.customPeer || this.customPeer.peer?.disconnected) {
			this.customPeer = new CustomPeer(this.deviceId);
			this.customPeer.onopen = () => { // 主意不要被覆盖了，如果要监听open，在peer实例上监听
				console.debug('custom peer onopen or reconnect')
				this.connectDevice();
			}
			return;
		}
		this.connectDevice();
	}

	private connectDevice() {
		// if (this.conn.) 多次同样的链接会怎么样

		this.conn = this.customPeer?.peer?.connect(this.connDeviceId);
		this.bindEvent();
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

	private handleClose() { // close 和Error不管如何都先发起重连
		this.onclose?.();

		this.handleReconnect();
	}

	private handleError(error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed">) {
		this.onerror?.(error);

		this.handleReconnect();
	}

	private handleReconnect() {
		if (this.reconnectTimeout) {
			return;
		}
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			return;
		}
		if (this.customPeer?.peer?.disconnected) {
			// 已经断开连接
			this.customPeer.peer.reconnect(); // 会重复调用open 创建新内容；如果信令重连还是失败呢？怎么处理？todo：怎么重建所有
			return;
		}

		this.reconnectAttempts++;
		this.reconnectTimeout = setTimeout(() => {
			clearTimeout(this.reconnectTimeout!);
			this.connect();
		}, this.reconnectInterval);
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