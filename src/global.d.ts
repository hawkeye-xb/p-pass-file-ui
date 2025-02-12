interface OpenDialogReturnValue {
	/**
	 * whether or not the dialog was canceled.
	 */
	canceled: boolean;
	/**
	 * An array of file paths chosen by the user. If the dialog is cancelled this will
	 * be an empty array.
	 */
	filePaths: string[];
	/**
	 * An array matching the `filePaths` array of base64 encoded strings which contains
	 * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
	 * this to be populated. (For return values, see table here.)
	 *
	 * @platform darwin,mas
	 */
	bookmarks?: string[];
}
interface OpenDialogOptions {
	title?: string;
	defaultPath?: string;
	/**
	 * Custom label for the confirmation button, when left empty the default label will
	 * be used.
	 */
	buttonLabel?: string;
	filters?: FileFilter[];
	/**
	 * Contains which features the dialog should use. The following values are
	 * supported:
	 */
	properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
	/**
	 * Message to display above input boxes.
	 *
	 * @platform darwin
	 */
	message?: string;
	/**
	 * Create security scoped bookmarks when packaged for the Mac App Store.
	 *
	 * @platform darwin,mas
	 */
	securityScopedBookmarks?: boolean;
}
type Platform =
	| "aix"
	| "android"
	| "darwin"
	| "freebsd"
	| "haiku"
	| "linux"
	| "openbsd"
	| "sunos"
	| "win32"
	| "cygwin"
	| "netbsd";
interface Window {
	electron?: {
		openFileSelector: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
		showItemInFolder: (fullPath: string) => void;
		systemInfo: {
			platform: Platform;
			arch: string;
			electron: string;
			node: string;
			appVersion: string;
		},
		theme: {
      getCurrentTheme: () => Promise<'light' | 'dark'>;
      setTheme: (theme: 'system' | 'light' | 'dark') => void;
      onThemeChange: (callback: (theme: 'light' | 'dark') => void) => void;
      removeThemeChangeListener: () => void;
    };
		relaunchApp: () => void,
	},
	conn: any,
}