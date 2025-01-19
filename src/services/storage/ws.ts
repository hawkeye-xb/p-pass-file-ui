import { CustomWebSocket } from './CustomWebSocket'

export const initWs = (options: {
	onmessage: () => void;
	onopen?: () => void;
	onerror?: () => void;
	onclose?: () => void;
}) => {
	const WS_URL = "ws://localhost:2501/ws";
	const ws = new CustomWebSocket(WS_URL);
	ws.onmessage = (event) => {
		debounceUpdateMetadatas(options.onmessage);
	};
	ws.onopen = options.onopen || (() => { })
	ws.onclose = options.onclose || (() => { })
	ws.onerror = options.onerror || (() => { })

	let timer: number | null | undefined = null;
	function debounceUpdateMetadatas(onmessage: () => void) {
		if (timer) {
			clearInterval(timer)
		}

		timer = setTimeout(() => {
			onmessage();
		}, 20)
	}

	return ws;
}