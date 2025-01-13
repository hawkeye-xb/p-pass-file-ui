export * from './watchs'; // 提供settings 使用

import { initWatchTargets } from './watchs';
import { useMetadatasStore } from '@/stores/metadatas';
import { initWs } from './ws';
import { getWatchTargetsMetadata } from '@/ctrls/index';

export const storageServiceInit = () => {
	initWatchTargets(); // 初始化监听

	// todo: 初始化peer，ws推送的时候，也需要重新推送所有内容

	const metadataStore = useMetadatasStore(); // 被监听的元数据信息
	initWs(async () => { // 接受推送，重新获取元数据
		const res = await getWatchTargetsMetadata();
		const result = await res.json();
		if (result.code !== 200) {
			return;
		}
		metadataStore.updateMetadatas(result.data)
	})
}
