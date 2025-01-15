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

	const signalingLink = ref<LinkStatusType>(undefined);
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
		signalingLink,
		webRTCLink,
		updateLink,
	}
})