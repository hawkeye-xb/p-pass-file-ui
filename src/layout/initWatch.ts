import { initWatchTargets, ws } from '@/services/index'
import { useLinkStore } from '@/stores/link'
import { useMetadatasStore } from '@/stores/metadatas'
import { getWatchTargetsMetadata } from '@/ctrls/index'

export const initWatch = () => {
	const linkStore = useLinkStore();
	const metadataStore = useMetadatasStore();
	// 初始化需要监听的 Dir
	initWatchTargets()

	linkStore.updateLink('ws', 'processing') // 重连呢？
	ws.onmessage = (event) => {
		debounceUpdateMetadatas();
	};
	ws.onopen = () => { linkStore.updateLink('ws', 'success') }
	ws.onclose = () => { linkStore.updateLink('ws', 'warning') }
	ws.onerror = () => { linkStore.updateLink('ws', 'danger') }

	let timer: number | null | undefined = null;
	function debounceUpdateMetadatas() {
		if (timer) {
			clearInterval(timer)
		}

		timer = setTimeout(() => {
			updateMetadatas();
		}, 20)
	}

	async function updateMetadatas() {
		const res = await getWatchTargetsMetadata();
		const result = await res.json();
		if (result.code !== 200) {
			return;
		}
		metadataStore.updateMetadatas(result.data)
	}
}