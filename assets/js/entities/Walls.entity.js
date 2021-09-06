const skin = '/assets/tileset/Tileset_Wall.png';


const props = [
	{
		name: 'longwall',
		x: 32,
		y: 192,
		width: 128,
		height: 64,
		type: 'wall',
		weight: 1,
		movable: false,
	},
	{
		name: 'wallwindow',
		x: 192,
		y: 192,
		width: 32,
		height: 64,
		type: 'wall',
		weight: 1,
		movable: false,
	}
];
const loadsprites = (image, props) => {
	const propslist = []
	props.forEach((prop, index) => {
		let canvastmp = document.createElement('canvas')
		canvastmp.width = prop.width
		canvastmp.height = prop.height
		let ctx = canvastmp.getContext('2d')
		ctx.drawImage(image, prop.x, prop.y, prop.width, prop.height, 0, 0, prop.width, prop.height)
		propslist[index] = {
			name: prop.name,
			x: prop.x,
			y: prop.y,
			type:  prop.type,
			width: prop.width,
			height: prop.height,
			weight: prop.weight,
			movable: prop.movable,
			sprite: canvastmp
		}
		ctx = null
		canvastmp = null
	})

	return propslist;
}

const loadProps =  (skin) => {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.src = skin
		img.onload = () => resolve(loadsprites(img, props))
		img.onerror = () => reject(`Error Skinload`)
	})
}

const Props = loadProps(skin)

export {Props}