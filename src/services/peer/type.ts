import type { DataConnection } from "peerjs";

// 是否需要区分不同的使用方式
export enum ActionType {
  HeartbeatPing,
  HeartbeatPong,
  WatchedMetadata, // 监听元数据
  // Base
  MoveRes,
  DeleteRes,
  Metadata, // 获取元数据
  // dir
  CreateTemporaryDir,
  CreateDir,
  RenameDir,
  DownloadDirZip, //
  // file
  PreUploadValidate,
  UploadFile,
  AggregateFiles,
  RenameFile,
  DownloadFile,
  // Notify
  Notify,
}

export type WebRTCContextType = {
  action: ActionType; // 操作类型
  // 请求的头部信息，后续可以携带一些用户信息
  request: {
    id: string; // 请求的 id，必填
    body: unknown;
  }
  // 响应的头部信息
  response: {
    body: {
      code: number;
      data?: unknown;
      message: string;
    };
    headers?: {
      contentType: 'application/json' | 'application/octet-stream';
    }
  }
}

export type RequestManagerType<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  context: WebRTCContextType;
}

export type ConnectionFunctionType = (ctx: WebRTCContextType, conn: DataConnection) => void;
