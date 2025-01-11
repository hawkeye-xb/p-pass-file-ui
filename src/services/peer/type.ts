export enum ActionType {
	WatchedMetadata, // 监听元数据
	// Base
	MoveRes,
	DeleteRes,
	Metadata, // 获取元数据
	// dir
	CreateTemporaryDir,
	CreateDir,
	RenameDir,
	DownloadDirZip, //
	// file
	PreUploadValidate,
	UploadFile,
	RenameFile,
	DownloadFile,
	// Notify
	Notify,
}

type ContentType = 'application/json' | 'application/octet-stream';
export interface WebRTCContextType {
	action: ActionType,
	request: {
		headers: {
			'Content-Type': ContentType,
		},
		id: string,
		body: any,
	},
	response: {
		body: any,
		headers: {
			'Content-Type': ContentType,
		},
	}
}