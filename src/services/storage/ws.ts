import { useLinkStore } from '@/stores/link'

export const initWs = (onmessage: () => void) => {
	const WS_URL = "ws://localhost:3000/ws";
	const ws = new WebSocket(WS_URL);

	const linkStore = useLinkStore();

	linkStore.updateLink('ws', 'processing') // 重连呢？
	ws.onmessage = (event) => {
		debounceUpdateMetadatas(onmessage);
	};
	ws.onopen = () => {
		console.log('ws open');
		linkStore.updateLink('ws', 'success')
	}
	ws.onclose = () => {
		console.log('ws close');
		linkStore.updateLink('ws', 'warning')
	}
	ws.onerror = () => {
		console.log('ws error');
		linkStore.updateLink('ws', 'danger')
	}

	let timer: number | null | undefined = null;
	function debounceUpdateMetadatas(onmessage: () => void) {
		if (timer) {
			clearInterval(timer)
		}

		timer = setTimeout(() => {
			onmessage();
		}, 20)
	}
}