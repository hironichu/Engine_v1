export default function Player(playerdata) {
	//Function that manage [PLAYER] Objects within the Game
	this.name = playerdata.name;
	this.id = playerdata.id;
	this.uuid = playerdata.uuid;
	this.wsid = playerdata.wsid;
	this.layer = playerdata.layer;
	this.sprite = Engine.assets.get(playerdata.sprite);
	this.width = this.sprite.size[0];
	this.self = playerdata.self || false;
	this.height = this.sprite.size[1];
	this.position = new Engine.Vector(playerdata.position.x, playerdata.position.y);
	this.velocity = new Engine.Vector(playerdata.velocity.x, playerdata.velocity.y);
	this.speed = playerdata.speed || 100;
	this.mass = playerdata.mass || 1;
	this.direction = playerdata.direction;
	this.health = playerdata.health;
	this.maxHealth = playerdata.maxhealth;
	this.posinmap = new Engine.Vector((this.position.x - this.width / 2) - Engine.Game.camera.xView, (this.position.y - this.height / 2) - Engine.Game.camera.yView);
	this.spriteFrame = new Engine.Vector(0, 0);
	this.StaggerFrames = 10;
	this.type = playerdata.type
	this.hitbox = this.sprite.hitbox
	this.drawn = true
	this.canMove = false
	this.walking = false
	this.hitbox = this.sprite.hitbox
	this.movements = {
		angle: 0,
		direction: 0,
		distance: 0,
		weight: 0,
		inputs: new Set(),
		sight: new Map()
	}

	this.update = function(netdata) {
		if (this.health === 0) return;
			this.direction = netdata.direction
			this.velocity.set(netdata.velocity)
		}
	this.move = function() {
		this.velocity.scaler(0.92)
		this.checkMapCollision()
		this.position.add(this.velocity);
		this.posinmap.add(this.velocity);

	}
	this.checkMapCollision = function() {
		if (this.position.x - this.width / 2 < 0) {
			this.position.x = this.width / 2;
			this.velocity.x = 0;
		}
		if (this.position.y - this.height / 2 < 0) {
			this.position.y = this.height / 2;
			this.velocity.y = 0;
		}
		if (this.position.x + this.width / 2 > Engine.Game.currentmap.width) {
			this.position.x = Engine.Game.currentmap.width - this.width / 2;
			this.velocity.x = 0;
		}
		if (this.position.y + this.height / 2 > Engine.Game.currentmap.height) {
			this.position.y =  Engine.Game.currentmap.height - this.height / 2;
			this.velocity.y = 0;
		}
	}
	this.behind = function() {

	}
	this.changeLayer = function(layer) {
		this.layer = layer;
	}
	this.colided = function(ColisionOrigin,x,y, step) {
	}
	this.colide = function(x, y, step) {

	}
	this.cursor = function() {

	}
	this.info = function() {

	}
	this.draw = () => {
		//Check if the vector position is outside the camera view
		const posX = (this.position.x - this.width / 2) - Engine.Game.camera.xView
		const posY = (this.position.y - this.height / 2) - Engine.Game.camera.yView
		
		// console.log('DRAW CALLED', this)
		// if (posX + this.width < 0 || posX >Engine.CTX[2].canvas.width || posY + this.height < 0 || posY > Engine.CTX[2].canvas.height) {
			// this.drawn = false;
			// Engine.Game.DrawnObjects.delete(this)
		// } else {
			// this.drawn = true;
			Engine.Game.DrawnObjects.add(this)
			const SpritePosition = Math.floor(Engine.Game.gameFrames / this.StaggerFrames) % this.sprite.animations[this.direction].loc.length;
			if (this.walking) {
				this.spriteFrame.x = this.sprite.animation_step * SpritePosition;
				this.spriteFrame.y = this.sprite.animations[this.direction].loc[SpritePosition].y

			} else {
				this.spriteFrame.x = this.sprite.animations[this.direction].loc[0].x
				this.spriteFrame.y = this.sprite.animations[this.direction].loc[0].y
			}
			Engine.CTX[2].drawImage(this.sprite.canvas, this.spriteFrame.x, this.spriteFrame.y, this.width, this.height,posX, posY, this.width, this.height);
			//Draw the health bar
			let color = '#00ff00'
			
			if (this.health < 20) {
				color = "red"
			} else if (this.health < 50) {
				color = "yellow"
			} else {
				color = "green"
			}
			Engine.CTX[2].textAlign  = "center"
			Engine.CTX[2].fillStyle = '#000';
			Engine.CTX[2].fillRect(posX + 10, posY - 10, this.width, 5);
			Engine.CTX[2].fillStyle = color;
			Engine.CTX[2].fillRect(posX + 10, posY - 10, this.width * this.health / this.maxHealth, 5);
			Engine.CTX[2].fillStyle = '#fff';
			Engine.CTX[2].fillText(this.health + '/' + this.maxHealth, posX + 32, posY - 15);
			Engine.CTX[2].fillStyle = '#fff';
			Engine.CTX[2].fillText(this.name, posX + 32, posY - 25);
			const hbplayer = {
				x: this.x ,
				y: this.y,
				radius: this.hitbox.width,
				height: this.hitbox.height,
			}
			//Draw the hitbox
			if (this.hitbox.type == 'circle') {
				Engine.CTX[2].beginPath();
				Engine.CTX[2].arc(posX + this.hitbox.x, posY + this.hitbox.y, this.hitbox.width, 0, 2 * Math.PI);
				Engine.CTX[2].strokeStyle = '#fff';
				Engine.CTX[2].stroke();
			} else if (this.hitbox.type == 'square') {
				Engine.CTX[2].beginPath();
				Engine.CTX[2].strokeStyle = '#ff0000';
				Engine.CTX[2].rect(posX + this.hitbox.x, posY + this.hitbox.y, hbplayer.radius, hbplayer.height);
				// Engine.CTX[2].rect(hbobject.x, hbobject.y, hbobject.radius, hbobject.height);
				Engine.CTX[2].stroke();

			}
		// }
		// }
	}
}