// import {tileset} from './Tileset.js'
import {tileset} from './Tileset.js'
import {default as Chunk} from './Chunk.js'
Math.floor(Math.random() * 100)
// console.log(tileset)
const chunktest = {
	name: "chunktest",
	id: 1,
	x: 0,
	y: 0,
	width: 32,
	height: 32,
	layers: [
		{
			name:'background',
			tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 11 : 2),
		},
		{
			name:'middle',
			tiles: [],
		},
		{
			name : 'foreground',
			tiles: [4,4,4,4,4,4,4,4],
		}
	]
}

const chunktest2 = {
	name: "chunktest2",
	id: 2,
	x: 1,
	y: 0,
	width: 32,
	height: 32,
	layers: [
		{
			name:'background',
			tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 5 : 4),
		},
		{
			name:'middle',
			tiles: [],
		},
		{
			name : 'foreground',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		}
	],
	objects: [
		{
			name: 'box',
			type: 'box',
			slug: 'box',
			x: 15,
			y: 5,
		}
	]
}

const chunktest3 = {
	name: "chunktest3",
	id: 3,
	x: 2,
	y: 0,
	width: 32,
	height: 32,
	layers: [
		{
			name:'background',
			tiles: Array.from(Array(1024).keys()).map((x) => {
				return x % 2 ? 3 : 5
			}),
		},
		{
			name:'middle',
			tiles: [],
		},
		{
			name : 'foreground',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		}
	],
	objects: [
		{
			name: 'box',
			type: 'box',
			slug: 'box',
			x: 6,
			y: 2,
		}
	]
}
const chunktest4 = {
	name: "chunktest4",
	id: 4,
	x: 0,
	y: 1,	
	width: 32,
	height: 32,
	layers: [
		{
			name:'background',
			tiles: Array.from(Array(1024).keys()).map((x) => x % 2 ? 2 : 8),
		},
		{
			name:'middle',
			tiles: [],
		},
		{
			name : 'foreground',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		}
	],
	objects: []
}

const chunktest5 = {
	name: "chunktest5",
	id: 5,
	x: 2,
	y: 1,	
	width: 32,
	height: 32,
	layers: [
		{
			name:'background',
			tiles: Array.from(Array(1024).keys()).map((x) => 1),
		},
		{
			name:'middle',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		},
		{
			name : 'foreground',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		}
	]
}
const chunktest6 = {
	name: "chunktest5",
	id: 5,
	x: 1,
	y: 1,	
	width: 32,
	height: 32,
	layers: [
		{
			name:'background',
			tiles: Array.from(Array(1024).keys()).map((x) => 1),
		},
		{
			name:'middle',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		},
		{
			name : 'foreground',
			tiles: Array.from(Array(1024).keys()).map((x) => -1),
		}
	]
}

export class MapGen {
	constructor () {
		const listChunk = [chunktest, chunktest2, chunktest3, chunktest4, chunktest5, chunktest6]

		const chunks = Object.values(listChunk).map(async (chunk) => {
			return {
				image: await this.#image(await new Chunk(chunk, tileset), chunk),
				data: chunk
			}
		})
		this.chunks = Promise.all(chunks)
		const mapdata = this.chunks.then((chunks) => {
			const width = (3 * 1024) * 1.5//chunks.reduce((acu, chunk) => acu + (chunk.data.x * 1024) , 0)
			const height = (2 * 1024)  * 1.5 //chunks.reduce((acu, chunk) => acu + (chunk.data.y * 1024) , 0)
			const map = document.createElement('canvas')
			map.width = width
			map.height = height
			const context = map.getContext('2d')
			context.scale(1.5, 1.5)
			for (const chunk of chunks) {
				context.drawImage(chunk.image, 0, 0, 1024, 1024, (chunk.data.x * 1024), chunk.data.y * 1024, 1024, 1024);
			}
			return {map:map, width: map.width, height: map.height}
		})
		return mapdata
	}
	async #image(blobdata, chunk) {
		const blob = await blobdata
		const newImg = document.createElement('img')
		const url = URL.createObjectURL(blob);
		newImg.classList.add(`chunk-${chunk.name}`)
		newImg.src = url;
		await newImg.decode();
		// URL.revokeObjectURL(url);
		// return newImg.onload = function() {
			// };
		return newImg
	}
}
