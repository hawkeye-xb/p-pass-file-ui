export enum ClientType {
	Storage = 'storage',
	Usage = 'usage'
}

interface ConfigType {
	trash: boolean,
	deviceId: string,
	downloadPath: string,
	clientType: ClientType | undefined,
	connDeviceId: string | undefined
}

const configDefaultValue: ConfigType = {
	trash: true,
	deviceId: '',
	downloadPath: '/Users/lixixi/Downloads', // todo, remove
	clientType: undefined,
	connDeviceId: undefined
}

const STORAGE_ITEM = 'systemConfig'

export function getConfig(): ConfigType;
export function getConfig<K extends keyof ConfigType>(key: K): ConfigType[K] | undefined;

export function getConfig<K extends keyof ConfigType>(key?: K): ConfigType | ConfigType[K] | undefined {
	let cfg = configDefaultValue;
	try {
		const config = localStorage.getItem(STORAGE_ITEM);
		if (config) {
			cfg = JSON.parse(config);
		}
	} catch (error) {
		console.warn(error);
	}

	if (key) {
		return cfg[key] || configDefaultValue[key] || undefined;
	}

	return cfg;
}

const setAllConfig = (value: ConfigType) => {
	localStorage.setItem(STORAGE_ITEM, JSON.stringify(value));
}

export function setConfig<K extends keyof ConfigType>(key: K, value: ConfigType[K]): void;
export function setConfig(value: ConfigType): void;

export function setConfig<K extends keyof ConfigType>(
	keyOrValue: K | ConfigType,
	value?: ConfigType[K]
): void {
	if (typeof keyOrValue === 'string' && value !== undefined) {
		// 处理 setConfig(key, value) 的情况
		const cfg = getConfig();
		cfg[keyOrValue] = value;
		setAllConfig(cfg);
	} else {
		// 处理 setConfig(value) 的情况
		setAllConfig(keyOrValue as ConfigType);
	}
}