import { defineStore } from "pinia";
import { ref } from "vue";

type LinkStatusType = 'normal' | 'processing' | 'success' | 'warning' | 'danger';
type LinkType = 'ws' | 'signaling' | 'webRTC';
export const useLinkStore = defineStore('link', () => {
	const wsLink = ref<LinkStatusType>('warning');
	const signalingLink = ref<LinkStatusType>('warning');
	const webRTCLink = ref<LinkStatusType>('warning');

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
		wsLink,
		signalingLink,
		webRTCLink,
		updateLink,
	}
})