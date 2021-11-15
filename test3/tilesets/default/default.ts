const tilesize = 32
const size = [8,8]
const Tiles = () => {
	const tiles:Array<Record<string, number>> = [];
	for (let i = 0; i < (size[0] * size[1]); i++) {
			tiles[i] = {
					x: (i % size[0]) * tilesize,
					y: (Math.floor(i / size[0])) * tilesize,
					id: i,
					height: 32,
					width: 32
			}
	}
	return tiles
}
// console.log(tiles)
export 	const tileset = {
	url: "assets/tileset/Tileset_Grass.png",
	data: {
		tiles: Tiles(),
	}
}