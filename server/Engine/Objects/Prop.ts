import Vector from "../Maths/Vector.ts";
export class Prop {
	id: string;
	velocity: Vector
	position: Vector
	direction: string
	movements: any
	speed: number
	name: string
	sprite: string;
	health: number;
	maxhealth: number;
	mass: number;
	map: string;
	posinmap: Vector;
	constructor(sid: string, clientid: string, propdata: any) {
		this.id = clientid;
		this.name = propdata.name;
		this.position = new Vector(propdata.position.x, propdata.position.y);
		this.speed = 120;
		this.velocity = new Vector(0, 0);
		this.sprite = propdata.sprite;
		this.health = 100;
		this.maxhealth = 100;
		this.mass = 5;
		this.map =	'default';
		this.posinmap = new Vector(0, 0);
		this.movements = {
			angle: 0,
			direction: 0,
			distance: 0,
			weight: 0,
			inputs: new Set(),
		}
		this.direction = 'idle'
	}
	update(Engine: any, data: any) {
		//Check the kind of update and update the player accordingly
		// const update = data.data
		// if (update.updatetype == 'position') {
		// 	let inputs = new Set(update.inputs);
		// 	this.movements.inputs = inputs;
		// 	this.movements.weight = (this.mass * 0.98)
		// 	// console.log(this.velocity)
		// 	// if (this.movements.inputs.has("left")) {
		// 	// 	this.direction = 'left'
		// 	// 	this.velocity.x -= (this.speed  * Engine.Game.deltaTime) / this.movements.weight
		// 	// }
		// 	// if (this.movements.inputs.has("right")) {
		// 	// 	this.direction = 'right'
		// 	// 	this.velocity.x += (this.speed * Engine.Game.deltaTime) / this.movements.weight
		// 	// }
		// 	// if (this.movements.inputs.has("up")) {
		// 	// 	this.direction = 'up'
		// 	// 	this.velocity.y -= (this.speed * Engine.Game.deltaTime) / this.movements.weight
		// 	// }
		// 	// if (this.movements.inputs.has("down")) {
		// 	// 	this.direction = 'down'
		// 	// 	this.velocity.y += (this.speed * Engine.Game.deltaTime) / this.movements.weight
		// 	// }
		// 	const resdata = this;
		// 	Engine.broadcast({
		// 		type: 'update',
		// 		config: this,
		// 		data: {
		// 			id: resdata.id,
		// 			updatetype: 'prop.move',
		// 			data: resdata
		// 	}})
		// }
	}
	move () {
		this.velocity.scaler(0.92);
		this.position.add(this.velocity);
		this.posinmap.add(this.velocity);
	}
}
