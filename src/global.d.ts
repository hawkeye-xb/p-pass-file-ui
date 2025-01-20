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

interface Window {
	electron?: {
		openFileSelector: (options: any) => Promise<OpenDialogReturnValue>
	},
	conn: any,
}