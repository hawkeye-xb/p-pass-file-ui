import { getConfig } from "../config";
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { CustomConn } from "../peer/CustomConn";
import { ActionType } from "../peer/type";
import { setUsageCtrlRequest } from "@/ctrls";
import { useUploadRecordStore } from "@/stores/usage/uploadRecord";
import { useDownloadRecordStore } from "@/stores/usage/downloadRecord";

let conn: CustomConn;
export const getConn = () => {
	return conn;
}
export const usageService = () => {
	const deviceId = getConfig('deviceId');
	const connDeviceId = getConfig('connDeviceId');
	if (!deviceId || !connDeviceId) { return; }
	if (conn) { return; }

	const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	const linkStore = useLinkStore();

	conn = new CustomConn(deviceId, connDeviceId);
	linkStore.setCustomConn(conn);
	conn.oninit = () => { linkStore.updateLink('webRTC', 'processing') }
	conn.onclose = () => {
		linkStore.updateLink('webRTC', 'warning')
		metadataStore.updateMetadatas([]);
	}
	conn.onerror = () => {
		linkStore.updateLink('webRTC', 'danger')
		metadataStore.updateMetadatas([]);
	}
	conn.onopen = () => {
		linkStore.updateLink('webRTC', 'success');
		// todo: 成功的onpen 才设置请求的方式？
		setUsageCtrlRequest(conn.request.bind(conn));

		const uploadRecordStore = useUploadRecordStore();
		uploadRecordStore.run();

		const downloadRecordStore = useDownloadRecordStore();
		downloadRecordStore.run();
	}
	conn.ondata = (ctx: any) => {
		if (ctx.action === ActionType.Notify) {
			console.info('收到通知:', ctx);
			metadataStore.updateMetadatas(ctx.request.body);
		}
	}

	conn.connect();
}
