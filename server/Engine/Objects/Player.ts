import Vector from "./Vector.ts";
export class Player {
	id: string;
	playerdata: any
	velocity: Vector
	position: Vector
	direction: string
	movements: any
	speed: number
	name: string
	sid: string;
	sprite: string;
	health: number;
	maxhealth: number;
	energy: number;
	maxenergy: number;
	level: number;
	mass: number;
	map: string;
	posinmap: Vector;
	constructor(sid: string, clientid: string, playerdata: any) {
		this.id = clientid;
		this.sid = sid;
		this.name = playerdata.name;
		this.position = new Vector(playerdata.position.x, playerdata.position.y);
		this.speed = 120;
		this.velocity = new Vector(0, 0);
		this.sprite = playerdata.sprite;
		this.health = 100;
		this.maxhealth = 100;
		this.energy = 100;
		this.maxenergy = 100;
		this.level = 5;
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
		const update = data.data
		if (update.updatetype == 'position') {
			let inputs = new Set(update.inputs);
			this.movements.inputs = inputs;
			this.movements.weight = (this.mass * 0.98)
			// console.log(this.velocity)
			if (this.movements.inputs.has("left")) {
				this.direction = 'left'
				this.velocity.x -= (this.speed  * Engine.Game.deltaTime) / this.movements.weight
			}
			if (this.movements.inputs.has("right")) {
				this.direction = 'right'
				this.velocity.x += (this.speed * Engine.Game.deltaTime) / this.movements.weight
			}
			if (this.movements.inputs.has("up")) {
				this.direction = 'up'
				this.velocity.y -= (this.speed * Engine.Game.deltaTime) / this.movements.weight
			}
			if (this.movements.inputs.has("down")) {
				this.direction = 'down'
				this.velocity.y += (this.speed * Engine.Game.deltaTime) / this.movements.weight
			}
			const resdata = this;
			Engine.broadcast({
				type: 'update',
				config: this,
				data: {
					id: resdata.id,
					updatetype: 'player.move',
					data: resdata
			}})
		}
	}
	move () {
		this.velocity.scaler(0.92);
		this.position.add(this.velocity);
		this.posinmap.add(this.velocity);
	}
}