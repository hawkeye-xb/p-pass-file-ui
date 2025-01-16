import type { CustomConn } from "@/services/peer/CustomConn";
import type { CustomPeer } from "@/services/peer/CustomPeer";
import type { CustomWebSocket } from "@/services/storage/CustomWebSocket";
import { defineStore } from "pinia";
import { ref } from "vue";

type LinkStatusType = 'normal' | 'processing' | 'success' | 'warning' | 'danger' | undefined;
type LinkType = 'ws' | 'signaling' | 'webRTC';
export const useLinkStore = defineStore('link', () => {
	const wsInstance = ref<CustomWebSocket>();
	const setWs = (ws: CustomWebSocket) => {
		wsInstance.value = ws;
	}
	const wsLink = ref<LinkStatusType>(undefined);

	const customPeer = ref<CustomPeer>();
	const setCustomPeer = (p: CustomPeer) => {
		customPeer.value = p;
	}
	const signalingLink = ref<LinkStatusType>(undefined);

	const customConn = ref<CustomConn>();
	const setCustomConn = (c: CustomConn) => {
		customConn.value = c;
	}
	const webRTCLink = ref<LinkStatusType>(undefined);

	const updateLink = (type: LinkType, status: LinkStatusType) => {
		switch (type) {
			case 'ws':
				wsLink.value = status;
				break;
			case 'signaling':
				signalingLink.value = status;
				break;
			case 'webRTC':
				webRTCLink.value = status;
				break;
		}
	}

	return {
		wsInstance,
		setWs,
		wsLink,

		customPeer,
		setCustomPeer,
		signalingLink,

		customConn,
		setCustomConn,
		webRTCLink,

		updateLink,
	}
})