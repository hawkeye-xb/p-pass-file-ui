import type { DataConnection } from 'peerjs';
import {
  type ActionType,
  type WebRTCContextType,
  type ConnectionFunctionType,
} from './type';

const functionMap = new Map<ActionType, ConnectionFunctionType>();

export function on(action: ActionType, fn: ConnectionFunctionType) {
  // 使用set可以重复注册
  functionMap.set(action, fn);
}

export async function emit(action: ActionType, ctx: WebRTCContextType, conn: DataConnection) {
  const fn = functionMap.get(action);
  if (fn) {
    await fn(ctx, conn);
  }
}

export function off(action: ActionType) {
  functionMap.delete(action);
}
