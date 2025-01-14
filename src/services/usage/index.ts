import { getConfig } from "../config";
import { useMetadatasStore } from '@/stores/metadatas';
import { useLinkStore } from '@/stores/link';
import { useConnectionsStore } from '@/stores/connections';
import { PeerInstance } from '../peer';

export const usageServiceInit = () => {
	// const deviceId = getConfig('deviceId');
	// const connDeviceId = getConfig('connDeviceId');
	// if (!deviceId || !connDeviceId) { return; }

	// const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	// const linkStore = useLinkStore();
	// const connectionsStore = useConnectionsStore();

	// const peerInstance = PeerInstance.getInstance();
}