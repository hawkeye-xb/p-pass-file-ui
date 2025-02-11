import type { DataConnection, PeerError } from "peerjs";
import { PeerErrorType } from "peerjs";
import { ActionType, type WebRTCContextType } from "./type";
import { deleteRequest, generateWebRTCContext, getRequest, setRequest } from "./requestManager";

import { CustomPeer } from "./CustomPeer";

// todo：dev 多次被实例化的问题?
export class CustomConn {
	private deviceId: string = '';
	public customPeer: CustomPeer | undefined = undefined;
	public conn: DataConnection | undefined = undefined;
	private connDeviceId: string = '';
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 100;
	private baseReconnectInterval: number = 1000; // 基础重连间隔时间（毫秒）
	private reconnectTimeout: number | null = null;
	
	private heartbeatInterval: number = 5000; // 心跳间隔，默认10秒
    private heartbeatTimeout: number = 10000;   // 心跳超时时间，默认5秒
    private heartbeatTimer: number | null = null;
    private lastHeartbeatResponse: number = 0;

	public onopen: (() => void) | null = null;
	public onclose: (() => void) | null = null;
	public onerror: (
		(error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed"> | PeerError<`${PeerErrorType}`>) => void) | null = null;
	public oninit: (() => void) | null = null;
	public ondata: ((data: any) => void) | null = null;

	public destory() {
		console.debug('custom conn destory')
		this.stopHeartbeat();
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
		baseReconnectInterval?: number;
	}) {
		this.deviceId = deviceId;
		this.connDeviceId = connDeviceId;
		this.reconnectAttempts = options?.reconnectAttempts || 0;
		this.maxReconnectAttempts = options?.maxReconnectAttempts || 5;
		this.baseReconnectInterval = options?.baseReconnectInterval || 1000;
	}

	public connect() {
		this.oninit?.();
		if (!this.customPeer || this.customPeer.peer?.disconnected) {
			this.customPeer = new CustomPeer(this.deviceId);
			this.customPeer.onopen = () => { // 主意不要被覆盖了，如果要监听open，在peer实例上监听
				console.debug('custom peer onopen or reconnect')
				this.connectDevice();
			}
			this.customPeer.onerror = (err) => {
				this.onerror?.(err);
				this.handleReconnect(); // 不管啥错，先重连。。
			}

			this.customPeer.init();
			return;
		}
		this.connectDevice();
	}

	// private handlePeerError(error: PeerError<`${PeerErrorType}`>) {
	// 	switch (error.type) {
	// 		case PeerErrorType.PeerUnavailable:
	// 			this.handleReconnect(); // 重连
	// 			break;
	// 		// case PeerErrorType.InvalidID: // 应该重置id？
	// 		default:
	// 			console.error("未知错误:", error);
	// 	}
	// }

	private connectDevice() {
		try {
			// @ts-ignore
			const connMap = this.customPeer?.peer?._connections;
			if (connMap && connMap.has(this.connDeviceId)) {
				const conns = connMap.get(this.connDeviceId);
				for (const conn of conns) {
					if (conn.open && conn.type === 'data') {
						console.debug('conn already exist, use it', conn)
						this.conn = conn;
						this.onopen?.();

						this.bindEvent();
						return;
					}
				}
			}
		} catch (error) {
			console.debug('connect get ready err:', error);
		}

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
		console.debug('custom conn data:', data);

		this.lastHeartbeatResponse = Date.now();
		if (data === ActionType.HeartbeatPong || data === ActionType.HeartbeatPing) {
			return;
		}

		this.ondata?.(data);

		this.handleConnResponse(data);
	}

	private handleOpen() {
		// 先停止之前的心跳，确保清理干净
		this.stopHeartbeat();
		this.reconnectAttempts = 0;
		
		// 确保连接正常后再启动心跳
		if (this.conn?.open) {
			this.startHeartbeat();
		}
	
		this.onopen?.();
	}

	private handleClose() { // close 和Error不管如何都先发起重连
		this.stopHeartbeat(); // 连接关闭时停止心跳
		this.onclose?.();

		this.handleReconnect();
	}

	private handleError(error: PeerError<"not-open-yet" | "message-too-big" | "negotiation-failed" | "connection-closed">) {
		console.error('custom conn error:', error)
		this.onerror?.(error);

		this.handleReconnect();
	}

	private handleReconnect() {
		console.trace('connect failed, reconnect...', this.reconnectAttempts);
		if (this.reconnectTimeout) {
			return;
		}
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.warn('max reconnect attempts reached');
			return;
		}
		if (this.customPeer?.peer?.disconnected) {
			this.customPeer.peer.reconnect();
			return;
		}

		// 计算当前重连间隔时间：基础间隔 * (2^重连次数)，最大16秒
		const currentInterval = Math.min(
			this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts),
			16000
		);
		
		this.reconnectAttempts++;
		this.reconnectTimeout = setTimeout(() => {
			this.conn = undefined;
			clearTimeout(this.reconnectTimeout!);
			this.reconnectTimeout = null;
			this.connect();
		}, currentInterval);
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

	// 添加心跳相关方法
    private startHeartbeat() {
        this.stopHeartbeat();
		// 添加双重检查
		if (this.heartbeatTimer || !this.conn?.open) {
			return;
		}

        this.lastHeartbeatResponse = Date.now();
        
        this.heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
            
            // 检查上次心跳响应时间
            if (Date.now() - this.lastHeartbeatResponse > this.heartbeatTimeout) {
                console.warn('心跳超时，判定连接已断开');
                this.handleConnectionLost();
            }
        }, this.heartbeatInterval);
    }
	private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
	private async sendHeartbeat() {
        try {
            this.conn?.send(ActionType.HeartbeatPing);
        } catch (error) {
            console.warn('心跳发送失败:', error);
        }
    }
	private handleConnectionLost() {
        this.stopHeartbeat();
        this.conn?.close();
        this.conn = undefined;
        this.handleReconnect();
    }
}