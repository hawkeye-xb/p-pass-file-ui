export interface MetadataType {
	name: string,
	ino: number,
	path: string,
	size: number,
	ctime: Date,
	mtime: Date,
	type: string,
	children?: MetadataType[],
	parent: string | null,
}

export const MetadataTypeDefaultValue: MetadataType = {
	name: "",
	ino: 0,
	path: "",
	size: 0,
	ctime: new Date(),
	mtime: new Date(),
	type: "",
	children: [],
	parent: null,
}