// import { createDir, renameDir, renameFile, downloadFile, uploadFile, deleteFile, deleteDir } from '@/apis';
import { createDir, deleteRes, renameDir, renameFile } from '@/ctrls';
import { PeerInstance } from '@/services/peer/index';
import { ActionType, type WebRTCContextType } from '@/services/peer/type';
import type { DataConnection } from 'peerjs';

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
export function initRegister() {
  const peerInstance = PeerInstance.getInstance();

  peerInstance.register(ActionType.RenameDir, handleRouteResponseMiddle(renameDir))
  peerInstance.register(ActionType.RenameFile, handleRouteResponseMiddle(renameFile))
  peerInstance.register(ActionType.CreateDir, handleRouteResponseMiddle(createDir))
  peerInstance.register(ActionType.DeleteRes, handleRouteResponseMiddle(deleteRes))

  // peerInstance.register(ActionType.UploadFile, async (ctx: WebRTCContextType, conn: DataConnection) => {
  //   try {
  //     const body = (ctx.request.body as any)
  //     const formData = new FormData();
  //     formData.append('path', body.target)

  //     const fileBlob = body.fileBlob;
  //     const f = new File([fileBlob], body.fileName, {
  //       type: body.fileType
  //     })
  //     formData.append('file', f);

  //     const res = await uploadFile(formData);
  //     ctx.response.body = res;
  //   } catch (error) {
  //     ctx.response.body = { code: 500, message: 'UploadFile error' + error };
  //   }
  // })

  // peerInstance.register(ActionType.DownloadFile, async (ctx: WebRTCContextType, conn: DataConnection) => {
  //   try {
  //     const uniConn = conn;

  //     const reader = await downloadFile(ctx.request.body as any);

  //     if (!reader) {
  //       console.error('Error downloading file:', 'reader is null');
  //       return;
  //     }

  //     let count = 0;
  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) {
  //         ctx.response = {
  //           ...ctx.response,
  //           headers: {
  //             contentType: 'application/octet-stream',
  //           },
  //           body: {
  //             code: 200,
  //             data: {
  //               type: 'end',
  //               chunk: null,
  //             },
  //             message: 'end',
  //           },
  //         }
  //         break;
  //       }
  //       let data = {};
  //       if (count === 0) {
  //         data = {
  //           type: 'start',
  //           chunk: value,
  //         }
  //       } else {
  //         data = {
  //           type: 'chunk',
  //           chunk: value,
  //         }
  //       }

  //       count++;

  //       ctx.response = {
  //         ...ctx.response,
  //         headers: {
  //           contentType: 'application/octet-stream',
  //         },
  //         body: {
  //           code: 200,
  //           data,
  //           message: 'chunk',
  //         },
  //       }

  //       uniConn.send(ctx); // 自行发送，最后一帧结束发送
  //     }


  //   } catch (error) {
  //     ctx.response.body = { code: 500, message: 'DownloadFile error' + error };
  //   }
  // })
}
