// 被peer模块依赖
import { v4 as uuidv4 } from "uuid";
import { type ActionType, type WebRTCContextType, type RequestManagerType } from './type'

const requestMap = new Map();

export const setRequest = <T>(id: string, ctx: RequestManagerType<T>) => {
  requestMap.set(id, ctx);
}

export const getRequest = (id: string) => {
  return requestMap.get(id);
}

export const deleteRequest = (id: string) => {
  requestMap.delete(id);
}

export function generateWebRTCContext(action: ActionType, body: unknown): WebRTCContextType {
  return {
    action,
    request: {
      id: uuidv4(),
      body,
    },
    response: {
      body: {
        code: 200,
        data: undefined,
        message: ''
      },
    }
  }
}

