import { on, off } from './router';
import { ActionType, type WebRTCContextType } from './type';
import { deleteRes, getWatchTargetsMetadata, moveRes } from '@/ctrls';

function handleRouteResponseMiddle(fn: any) {
	return async (ctx: WebRTCContextType) => {
		try {
			const res = await fn(ctx.request.body);
			ctx.response.body = res;
		} catch (error) {
			ctx.response.body = { code: 500, message: 'handleRouteResponseMiddle error' + error };
		}
	}
}

export const initWebRTCCtrls = () => {
	on(ActionType.WatchedMetadata, handleRouteResponseMiddle(getWatchTargetsMetadata))
	on(ActionType.MoveRes, handleRouteResponseMiddle(moveRes))
	on(ActionType.DeleteRes, handleRouteResponseMiddle(deleteRes))
}

export const removeWebRTCCtrls = () => {
	off(ActionType.WatchedMetadata)
	off(ActionType.MoveRes)
	off(ActionType.DeleteRes)
}