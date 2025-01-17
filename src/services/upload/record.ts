const STORAGE_KEY = 'upload_records'

export interface UploadRecord {
	filename: string
	type: string
	size: number
	uploaded: number
	uploading: boolean
}