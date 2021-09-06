import Canvas from 'https://deno.land/x/canvas@v1.2.2/mod.ts'

export interface Chunkpool {
	id: string;
	chunk: Chunk;
	generated: number;
	lastUpdated: number;
	locked: boolean;
}
interface ChunkObject {
	name: string;
	manifest: Record<string, unknown>;
}
type TilesetObject = Record<string,unknown>

export class Chunk {

	constructor (chunk: ChunkObject, tileset: TilesetObject) {
		if (!chunk && !tileset!) {
			throw new Error('Chunk or tileset is missing')
		}
	}
	generate () {

	}
	loadsets (img: any) {

	}

	loadset (){
		// return new Promise((resolve, reject) => {
			// const img = new Image()
			// img.src = this.tileset
			// img.onload = () => resolve(this.#loadsets(img))
			// img.onerror = () => reject(`Error LOL`)
		// })
	}
}