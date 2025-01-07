import { watchTarget, unwatchTarget } from '@/ctrls/index'

const STORAGE_ITEM = 'watchTargets';

const setWatchTargets = (targets: string[]) => {
	localStorage.setItem(STORAGE_ITEM, JSON.stringify(targets));
}

export const getWatchTargets = () => {
	const targets = localStorage.getItem(STORAGE_ITEM);
	if (targets) {
		return JSON.parse(targets);
	}
	return [];
}

export const addWatchTarget = (target: string) => {
	const targets = getWatchTargets();
	// 需要去重
	if (targets.indexOf(target) > -1) {
		return;
	}
	targets.push(target);

	setWatchTargets(targets);

	// 订阅
	watchTarget({ target });
}

export const removeWatchTarget = (target: string) => {
	const targets = getWatchTargets();
	const index = targets.indexOf(target);
	if (index > -1) {
		targets.splice(index, 1);
		setWatchTargets(targets);

		// 取消订阅
		unwatchTarget({ target });
	}
}

export const clearAllWatchTargets = () => {
	setWatchTargets([]);
}

export const initWatchTargets = () => {
	const targets = getWatchTargets();
	targets.forEach((target: string) => {
		watchTarget({ target });
	});
}