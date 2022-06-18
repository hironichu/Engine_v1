import Vector from "../Maths/Vector.ts";
// import Rectangle from "../Maths/Rectangle.ts";
import Camera from "./Camera.ts";
export class Player {
	id: string;
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
	screenWidth: number;
	screenHeight: number;
	visiblePlayers: Array<Player> = []
	constructor(sid: string, clientid: string, playerdata: any, Engine: any) {
		this.id = clientid;
		this.sid = sid;
		this.name = playerdata.name;
		this.position = new Vector(playerdata.position.x, playerdata.position.y);
		this.speed = 140;
		this.velocity = new Vector(0, 0);
		this.sprite = playerdata.sprite;
		this.health = 100;
		this.maxhealth = 100;
		this.energy = 100;
		this.maxenergy = 100;
		this.level = 5;
		this.mass = 4;
		this.map =	'default';
		this.posinmap = new Vector(0, 0);
		this.screenWidth = playerdata.screenWidth;
		this.screenHeight = playerdata.screenHeight;
		this.visiblePlayers = [];
		this.movements = {
			angle: 0,
			direction: 0,
			distance: 0,
			weight: 0,
			delta: 0,
			inputs: new Set(),
		}
		this.direction = 'idle'
	}
	update(Engine: any, data: any) {
		//Check the kind of update and update the player accordingly
		const update = data.data
		if (update.updatetype == 'position') {
			//Convert the update.inputs object to a Map
			// console.log((update.inputs))
			const inputs = new Map((update.inputs));
			// const inputs = new Map(update.inputs);
			this.movements.moving = true;
			this.movements.inputs = inputs;
			this.movements.weight = (this.mass * 0.98)
			this.movements.delta = Engine.Game.deltaTime
			// console.log(this.velocity)
			if (this.movements.inputs.has("left")) {
				this.direction = 'left'
				this.velocity.x -= (this.speed * Engine.Game.deltaTime) / this.movements.weight
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
			// this.checkPlayerCollision(Engine)
			// const playerCam = Engine.Cameras.get(this.sid);
			// const newVisible = [...Engine.Cameras].filter(([sid, cam]) => cam.map === this.map && cam.xView > playerCam.xView - ((this.screenWidth / 2) + 256) && cam.xView < playerCam.xView + ((this.screenWidth / 2) + 256) && cam.yView > playerCam.yView - ((this.screenHeight / 2) + 256) && cam.yView < playerCam.yView + ((this.screenHeight / 2) + 256)).map(([sid, cam]) => cam.followed.sid)
			//Compare the new visible players with the old visible players and send the new ones to the client
			// const newVisiblePlayers = newVisible.filter((player) => !this.visiblePlayers.includes(player.sid))
			// const oldVisiblePlayers = this.visiblePlayers.filter((player) => !newVisible.includes(player.sid))
			// this.visiblePlayers = newVisiblePlayers
			// newVisiblePlayers.push(this.sid)
			Engine.players.forEach((_: any, socketid: WebSocket) => {
				// console.log(socketid)
				// console.log(playersid)
				const sock = Engine.socks.get(socketid)
				sock.send(JSON.stringify({
					type: 'player.update',
					data: {
						id: this.id,
						updatetype: 'player.move',
						data: this
					}
				}));
			})
			this.movements.moving = false;
			// })
		}
	}
	move (Engine: any) {
		// this.CheckColideMaps(Engine)
		this.movements.moving = true;
		this.velocity.scaler(0.86);
		this.position.add(this.velocity);
		this.posinmap.add(this.velocity);
		Engine.Cameras.get(this.sid).update()
		this.movements.moving = false;
	}
	private checkPlayerCollision (Engine: any) {
		[...Engine.players].forEach(([sid, player]) => {
			if (player != this) {
				if (this.collision(player)) {
					this.position.add(this.velocity.scaler(-1));
					this.velocity.scaler(0);
					
				}
			}
		})
	}
	private collision (player: Player) {
		//Check if the next player position is in the player position
		if (this.position.x + this.velocity.x > player.position.x && this.position.x + this.velocity.x < player.position.x + player.velocity.x) {
			if (this.position.y + this.velocity.y > player.position.y && this.position.y + this.velocity.y < player.position.y + player.velocity.y) {
				return true
			}
		}
		return false
	}
	private CheckColideMaps(Engine: any) {
		// if (this.position.x - 32 < 0) {
		// 	this.position.x = 32;
		// 	this.velocity.x = 0;
		// }
		// if (this.position.y - 32  < 0) {
		// 	this.position.y = 32;
		// 	this.velocity.y = 0;
		// }
		// if (this.position.x + 32 > Engine.Maps[this.map].width) {
		// 	this.position.x = Engine.Maps[this.map].width - 32;
		// 	this.velocity.x = 0;
		// }
		// if (this.position.y + 32 > Engine.Maps[this.map].height) {
		// 	this.position.y =  Engine.Maps[this.map].height - 32;
		// 	this.velocity.y = 0;
		// }
	}
}