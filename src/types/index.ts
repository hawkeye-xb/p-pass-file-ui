export interface MetadataType {
	name: string,
	ino: number,
	path: string,
	size: number,
	ctime: string,
	mtime: string,
	type: string,
	children?: MetadataType[],
	parent: string | null, // 父路径path，用不上，尴尬
}

export const MetadataTypeDefaultValue: MetadataType = {
	name: "",
	ino: 0,
	path: "",
	size: 0,
	ctime: '',
	mtime: '',
	type: "",
	children: [],
	parent: null,
}