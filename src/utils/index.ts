import dayjs from "dayjs";

export function convertBytes(bytes: number): string {
	const kb = bytes / 1024;
	const mb = kb / 1024;
	const gb = mb / 1024;
	const tb = gb / 1024;

	if (tb >= 1) {
		return `${tb.toFixed(2)} TB`;
	} else if (gb >= 1) {
		return `${gb.toFixed(2)} GB`;
	} else if (mb >= 1) {
		return `${mb.toFixed(2)} MB`;
	} else if (kb >= 1) {
		return `${kb.toFixed(2)} KB`;
	} else {
		return `${bytes} B`;
	}
}

export const dateFormat = (now: string | number | Date | dayjs.Dayjs | null | undefined, fm = "YYYY-MM-DD HH:mm:ss") => {
	return dayjs(now).format(fm);
};

export const deviceEnv = () => {
	if (window.electron) {
		return window.electron.systemInfo.platform;
	} else {
		// 通过UA判断
		const ua = navigator.userAgent;
		if (ua.indexOf("Windows") !== -1) {
			return "win32";
		}
		if (ua.indexOf("Mac") !== -1) {
			return "darwin";
		}
		if (ua.indexOf("Linux") !== -1) {
			return "linux";
		}
		return "unknown";
	}
}