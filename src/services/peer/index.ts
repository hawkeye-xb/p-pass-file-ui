import Peer, { type DataConnection } from "peerjs";

import {
  ActionType,
  type WebRTCContextType,
  type ConnectionFunctionType,
} from './type';

import {
  getRequest,
  setRequest,
  deleteRequest,
  generateWebRTCContext,
} from './requestManager';

import {
  on,
  emit,
  off,
} from './listeners';

const peerConfig = {
  // debug: 3,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  }
}

type InitPeerConfigType = {
  deviceId: string;
  onPeerOpen?: (p: Peer) => void;
  onPeerClosed?: (p: Peer) => void;
  onPeerError?: (p: Peer, err: Error) => void;
  onPeerReceivedConn?: (conn: DataConnection) => void;
  onPeerDisconnected?: (p: Peer) => void;
}
type InitUniConnConfigType = {
  connDeviceId: string;
  onConnOpen?: (conn: DataConnection) => void;
  onConnClose?: (conn: DataConnection) => void;
  onConnError?: (conn: DataConnection, err: Error) => void;
  onConnData?: (conn: DataConnection, d: unknown) => void;
}
export class PeerInstance {
  // 静态属性，用于存储单例实例
  private static instance: PeerInstance;
  private peer: Peer | undefined;

  private uniConn: DataConnection | undefined; // 为使用侧保留，连接到存储侧的conn
  private uniConnInitBackup?: () => void;

  private connectionsMap = new Map<string, DataConnection>();

  private chunkMap = new Map<string, Uint8Array[]>();

  constructor() {
    console.warn('Dont new instance, use PeerInstance.getInstance()')
  }

  public static getInstance(): PeerInstance {
    if (!PeerInstance.instance) {
      PeerInstance.instance = new PeerInstance();
    }
    return PeerInstance.instance;
  }

  public init(config: InitPeerConfigType) {
    if (this.peer) {
      console.warn('peer already init');
      return;
    }

    this.peer = new Peer(config.deviceId, peerConfig);

    // @ts-ignore
    window.peer = this.peer;

    this.handlePeerListeners(config);
  }

  public destroy() {
    if (this.peer) {
      this.peer.disconnect();
      this.peer.once('disconnected', () => {
        console.log('peer disconnected');
        this.peer?.destroy();
        this.peer = undefined;
      })
    }
  }

  private handlePeerListeners(config: InitPeerConfigType) {
    const p = this.peer;
    if (p !== undefined) {
      p.on('open', () => { // ws 信令服务的链接状态
        config.onPeerOpen && config.onPeerOpen(p);

        if (this.uniConnInitBackup) {
          this.uniConnInitBackup();
        }
      })
      p.on('close', () => {
        config.onPeerClosed && config.onPeerClosed(p);
      })
      p.on('error', (err) => {
        config.onPeerError && config.onPeerError(p, err);
      })

      // 存储侧接受到的连接邀请
      p.on('connection', (conn) => {
        console.log('存储端收到连接邀请:', conn);
        conn.on('open', () => {
          this.connectionsMap.set(conn.peer, conn);

          config.onPeerReceivedConn && config.onPeerReceivedConn(conn);
        })

        conn.on('data', (d: unknown) => {
          console.log('存储端 route 接收到的数据:', d)
          // 这里不用处理响应数据吧，只需要当成router来处理就好了
          // this.handleConnResponse(d)
          this.handleReceived(conn, d)
        })
      })

      p.on('disconnected', () => { // 断开连接
        config.onPeerDisconnected && config.onPeerDisconnected(p);
      })

    }
  }

  // ---- 存储侧注册的类似router事件，有handleReceived处理 ----
  public register(action: ActionType, fn: ConnectionFunctionType) {
    on(action, fn);
  }
  public unregister(action: ActionType) {
    off(action);
  }

  private async handleReceived(conn: DataConnection, d: unknown) {
    try {
      const data = d as WebRTCContextType;
      await emit(data.action, data, conn);

      if (data.action === ActionType.Notify) { return }
      conn.send(data);
    } catch (error) {
      console.warn(error);
    }
  }

  // ----
  // 本侧发送数据 - 与接收返回数据的处理
  public connect(config: InitUniConnConfigType) {
    if (this.peer) {
      if (this.uniConn) {
        console.warn('uniConn already init');
        return;
      }

      if (this.peer.open) {
        this.handleUniConnListeners(config);
        return;
      }
      this.uniConnInitBackup = () => {
        this.handleUniConnListeners(config);
      }
    }
  }
  public handleUniConnListeners(config: InitUniConnConfigType) {
    const p = this.peer;
    if (!p) return;
    if (this.uniConn) return;

    const uc = p.connect(config.connDeviceId)
    this.uniConn = uc;
    this.uniConnInitBackup = undefined;

    uc.on('open', () => {
      config.onConnOpen && config.onConnOpen(uc);
    })
    uc.on('close', () => {
      config.onConnClose && config.onConnClose(uc);
    })
    uc.on('error', (err) => {
      config.onConnError && config.onConnError(uc, err);
    })
    uc.on('data', (d) => {
      // 处理返回数据
      console.log('使用侧 接收到 存储侧 的数据:', d)

      this.handleConnResponse(d);
      config.onConnData && config.onConnData(uc, d);
    })

    // @ts-ignore
    window.uniConn = uc;
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

      const conn = config.target || this.getUniConn();
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
      // todo: reject handle?
      if (ctx.response.headers?.contentType === 'application/octet-stream') {
        const body = ctx.response.body.data as {
          type: 'start' | 'chunk' | 'end';
          chunk: Uint8Array;
        };
        if (body.type === 'start') {
          this.chunkMap.set(ctx.request.id, [body.chunk]);
          return;
        }
        if (body.type === 'chunk') {
          const chunks = this.chunkMap.get(ctx.request.id);
          chunks?.push(body.chunk);
          return;
        }
        if (body.type === 'end') {
          const chunks = this.chunkMap.get(ctx.request.id);

          // chunks 转成reader
          const reader = new ReadableStream({
            start(controller) {
              chunks?.forEach((chunk) => {
                controller.enqueue(chunk);
              })
              controller.close();
            },
          }).getReader();

          ctx.response.body = {
            ...ctx.response.body,
            data: reader
          };
          this.chunkMap.delete(ctx.request.id);
        }
      }

      const target = getRequest(ctx.request.id);

      if (target) {
        target.resolve(ctx);
        deleteRequest(ctx.request.id);
      }
    } catch (error) {
      console.warn(error);
    }
  }

  // ---- peer ----
  public getPeer() {
    return this.peer;
  }

  // ---- connections ----
  public getConnectionsMap() {
    return this.connectionsMap;
  }
  public getUniConn() {
    return this.uniConn;
  }
}


