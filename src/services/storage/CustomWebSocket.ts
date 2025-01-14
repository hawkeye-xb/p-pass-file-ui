export class CustomWebSocket {
	private websocket: WebSocket | null = null; // WebSocket 实例
	private url: string; // WebSocket 连接地址
	private reconnectAttempts: number = 0; // 当前重连次数
	private maxReconnectAttempts: number = 5; // 最大重连次数
	private reconnectInterval: number = 1000; // 重连间隔时间（毫秒）
	private reconnectTimeout: number | null = null; // 重连定时器

	// 事件回调函数
	public onopen: ((event: Event) => void) | null = null;
	public onmessage: ((event: MessageEvent) => void) | null = null;
	public onclose: ((event: CloseEvent) => void) | null = null;
	public onerror: ((event: Event) => void) | null = null;
	public onreconnecting: (() => void) | null = null;
	public onreconnected: ((err: string) => void) | null = null;
	public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) { // 目前应该用不上
		this.websocket?.send(data);
	}

	public close() {
		if (!this.websocket) return;

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
		this.reconnectAttempts = this.maxReconnectAttempts + 1; // 不再重连
		this.websocket?.close();
	}

	public reconnect() {
		if (this.websocket) {
			this.onreconnected?.('');
			return;
		}

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		console.log('reconnect');
		this.reconnectAttempts = 0; // 重置重连次数
		this.handleReconnect();
	}

	constructor(url: string | URL, protocols?: string | string[]) {
		this.url = typeof url === 'string' ? url : url.href;
		this.initWebSocket();
	}

	// 初始化 WebSocket 连接
	private initWebSocket() {
		this.websocket = new WebSocket(this.url);
		// 绑定事件监听器
		this.bindEvent();
	}

	private bindEvent() {
		this.websocket?.addEventListener('open', this.handleOpen.bind(this));
		this.websocket?.addEventListener('message', this.handleMessage.bind(this));
		this.websocket?.addEventListener('close', this.handleClose.bind(this));
		this.websocket?.addEventListener('error', this.handleError.bind(this));
	}

	// 处理连接成功
	private handleOpen(event: Event) {
		this.reconnectAttempts = 0; // 重置重连次数
		this.onopen?.(event);
	}
	// 处理收到消息
	private handleMessage(event: MessageEvent) {
		this.onmessage?.(event);
	}
	// 处理连接关闭
	private handleClose(event: CloseEvent) {
		console.log('WebSocket 断开连接，尝试重连...');
		this.websocket = null; // 清理 WebSocket 实例
		this.onclose?.(event);

		console.log('handleReconnect by close', event);
		this.handleReconnect();
	}
	// 处理错误
	private handleError(event: Event) {
		this.websocket = null; // 清理 WebSocket 实例
		this.onerror?.(event);

		console.log('handleReconnect by error', event);
		this.handleReconnect();
	}

	private handleReconnect() {
		if (this.reconnectTimeout) {
			console.info('重连中...');
			return;
		}
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.info(`尝试重连，次数: ${this.reconnectAttempts}`);
			this.onreconnecting?.();

			this.reconnectTimeout = setTimeout(() => {
				this.reconnectTimeout = null;
				const ws = new WebSocket(this.url);
				ws.onopen = () => {
					this.websocket = ws;
					this.bindEvent();
					this.reconnectAttempts = 0;
					this.onreconnected?.('');
				};
				ws.onclose = (ev) => { this.handleReconnect(); }
				ws.onerror = (ev) => { console.info('ws error', ev); }
			}, this.reconnectInterval);
		} else {
			this.onreconnected?.('达到最大重连次数，停止重连');
		}
	}
}
