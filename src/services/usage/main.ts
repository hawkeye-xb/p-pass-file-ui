import { getConfig } from "../config";
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { useConnectionsStore } from '@/stores/connections';
import { CustomConn } from "../peer/CustomConn";
import { ActionType } from "../peer/type";
import { setUsageCtrlRequest } from "@/ctrls";

export const usageService = () => {
	const deviceId = getConfig('deviceId');
	const connDeviceId = getConfig('connDeviceId');
	if (!deviceId || !connDeviceId) { return; }

	const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	const linkStore = useLinkStore();

	const conn = new CustomConn(deviceId, connDeviceId);
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
	conn.onopen = () => { linkStore.updateLink('webRTC', 'success') }
	conn.ondata = (ctx: any) => {
		if (ctx.action === ActionType.Notify) {
			console.info('收到通知:', ctx);
			metadataStore.updateMetadatas(ctx.request.body);
		}
	}

	setUsageCtrlRequest(conn.request.bind(conn));
}
