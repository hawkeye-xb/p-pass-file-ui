import type { DataConnection } from "peerjs";
import type { ActionType, WebRTCContextType } from "./type";

export type ConnectionFunctionType = (ctx: WebRTCContextType, conn: DataConnection) => Promise<void> | void;

const actionMap = new Map<ActionType, ConnectionFunctionType>();
export function on(action: ActionType, fn: ConnectionFunctionType) {
	actionMap.set(action, fn);
}

export function emit(ctx: WebRTCContextType, conn: DataConnection) {
	const action = ctx.action;
	const fn = actionMap.get(action);
	if (fn) {
		fn(ctx, conn);
	}
}

export function off(action: ActionType) {
	actionMap.delete(action);
}