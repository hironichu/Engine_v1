import { Game } from './Game.js';

const fps = 60;
const interval = 1000 / fps;
const Engine = {
	version: '1.0.0',
	assets: new Map(),
	settings: {
		FPS: fps,
		INTERVAL: 1000 / fps,
		STEP: interval / 1000,
	},
	controls: {
		left: false,
		up: false,
		right: false,
		down: false,
		dash: false,
	},
	Game: null,
	init: () => {
		const time = performance.now();
		const DOMCanvasElem = document.getElementById('gameCanvas');
		const gameBackdropCanvas = document.createElement('canvas');
		const gameGroundCanvas = document.createElement('canvas');
		const gameInteractiveCanvas = document.createElement('canvas');
		gameBackdropCanvas.classList.add('canvas', 'canvas-backdrop');
		gameGroundCanvas.classList.add('canvas','canvas-ground');
		gameInteractiveCanvas.classList.add('canvas','canvas-interactive');
		DOMCanvasElem.appendChild(gameBackdropCanvas);
		DOMCanvasElem.appendChild(gameGroundCanvas);
		DOMCanvasElem.appendChild(gameInteractiveCanvas);

		gameBackdropCanvas.width = DOMCanvasElem.clientWidth;
		gameBackdropCanvas.height = DOMCanvasElem.clientHeight;
		gameGroundCanvas.width = DOMCanvasElem.clientWidth;
		gameGroundCanvas.height = DOMCanvasElem.clientHeight;
		gameInteractiveCanvas.width = DOMCanvasElem.clientWidth;
		gameInteractiveCanvas.height = DOMCanvasElem.clientHeight;
		window.addEventListener('resize', (event) => {
			gameBackdropCanvas.width = DOMCanvasElem.clientWidth;
			gameBackdropCanvas.height = DOMCanvasElem.clientHeight;
			gameGroundCanvas.width = DOMCanvasElem.clientWidth;
			gameGroundCanvas.height = DOMCanvasElem.clientHeight;
			gameInteractiveCanvas.width = DOMCanvasElem.clientWidth;
			gameInteractiveCanvas.height = DOMCanvasElem.clientHeight;
		})
		Engine.CTX = [];
		Engine.CTX[0] = gameBackdropCanvas.getContext('2d');
		Engine.CTX[1] = gameGroundCanvas.getContext('2d');
		Engine.CTX[2] = gameInteractiveCanvas.getContext('2d');
		Engine.Cursorx = DOMCanvasElem.clientWidth / 2;
		Engine.Cursory = DOMCanvasElem.clientHeight / 2;
		window.addEventListener("keydown", function(e) {
			switch (e.key) {
			case "o":
				break;
			case "a":
				Engine.controls.left = true;
				break;
			case "w":
				Engine.controls.up = true;
				break;
			case "d":
				Engine.controls.right = true;
				break;
			case "s":
				Engine.controls.down = true;
				break;
			case "Shift":
				Engine.controls.dash = true;
				break;
			}
		}, false);
		
		window.addEventListener("keyup", function(e) {
			switch (e.key) {
				case "a":
					Engine.controls.left = false;
					break;
				case "w":
					Engine.controls.up = false;
					break;
				case "d":
					Engine.controls.right = false;
					break;
				case "s":
					Engine.controls.down = false;
					break;
				case "Shift":
					Engine.controls.dash = false;
					break;
			}
		}, false);
		var scaleF = 0.05;
		var scale = 1.0;
		window.PanY = 0;
		window.PanX = 0;
		Engine.cursx = 0;
		Engine.cursy = 0;
		window.ScaleZoom = scale;
		gameInteractiveCanvas.onmousemove = function(e){
			Engine.Cursorx = e.pageX - this.offsetLeft;
			Engine.Cursory = e.pageY - this.offsetTop;
			Engine.Cursorx = parseInt((Engine.Cursorx - PanX) / ScaleZoom);
			Engine.Cursory = parseInt((Engine.Cursory- PanY) / ScaleZoom);
			// console.log(Cursorx, Cursory, ScaleZoom)
			if (Engine.Cursorx < 0) Engine.Cursorx = 0
			if (Engine.Cursory < 0) Engine.Cursory = 0
		}
		console.log(`Engine v${Engine.version} initialized in ${performance.now() - time}ms`);
	},
	start: async () => {
		const player_default = await (await import('./entities/Player.entity.js')).Player
		const player_girl =  await (await import('./entities/Player2.entity.js')).Player
		const props  = await (await import('./entities/Default.entity.js')).Props
		Engine.assets.set('props', await props)
		Engine.assets.set('player_default', await player_default)
		Engine.assets.set('player_girl', await player_girl)
		Engine.assets.set('walls', await (await import('./entities/Walls.entity.js')).Props)
		Engine.Game = await (await import('./Game.js')).Game;
		console.log(`Engine started after ${performance.now() - window.loadedtime}ms`);
		// console.log(Engine.assets.get('player_default'))
		return await Engine.Game.start(Engine);
	},
	GetGameDatabyLayer: (layer) => {
		//
	},
	Map: function (mapdata){
		//Function that manage [MAP] Objects within the Game
		this.width = mapdata.width;
		this.height = mapdata.height;
		this.data = mapdata
		Engine.Map.prototype.draw = function (){
			var sx,sy, dx, dy;
			var sWidth, sHeight, dWidth, dHeight;
			sx = Engine.Game.camera.xView;
			sy = Engine.Game.camera.yView;
			sWidth = Engine.CTX[1].canvas.width;
			sHeight = Engine.CTX[1].canvas.height;

			if (this.data.width - sx < sWidth) {
				sWidth = this.image.width - sx;
			}
			if (this.data.height - sy < sHeight) {
				sHeight = this.data.height - sy;
			}
			dx = 0;
			dy = 0;
			dWidth = sWidth;
			dHeight = sHeight;
			Engine.CTX[1].drawImage(this.data.map,  sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
		}
	},
	Player: function(playerdata) {
		//Function that manage [PLAYER] Objects within the Game
		this.name = playerdata.name;
		this.id = playerdata.id;
		this.layer = playerdata.layer;
		this.x = playerdata.x;
		this.y = playerdata.y;
		this.sprite = Engine.assets.get(playerdata.sprite);
		this.width = this.sprite.size[0];
		this.height = this.sprite.size[1];
		this.speed = playerdata.speed;
		this.direction = playerdata.direction;
		this.speed = playerdata.speed;
		this.dashspeed = playerdata.dashspeed;
		this.health = playerdata.health;
		this.maxhealth = playerdata.maxhealth;
		this.mapx = (this.x - this.width / 2) - Engine.Game.camera.xView;
		this.mapy = (this.y - this.height / 2) - Engine.Game.camera.yView;
		this.frameX = 0;
		this.frameY = 0;
		this.StaggerFrames = 10;
		this.type = playerdata.type
		this.hitbox = this.sprite.hitbox
		this.drawn = true;
		this.colideedstate = false;
		this.walking = false
		this.view = {
			angle: 0,
			direction: 0,
			distance: 0,
			sight: new Map()
		}
		Engine.Player.prototype.update = function(step, worldWidth, worldHeight, _netdata = null) {
			if (this.health === 0) return;
			if (this.type === 'local_player') {
				if (Engine.controls.up || Engine.controls.down || Engine.controls.left || Engine.controls.right) {
					this.walking = true
					this.behind(step)
				} else {
					this.walking = false
				}
				if (Engine.controls.left) {
					this.direction = 'left'
					if (this.colide((this.x - (this.speed * step)), this.y, step)) return 
					this.x -= (this.speed * step) + (Engine.controls.dash ? this.dashspeed : 0);
				}
				if (Engine.controls.up) {
					this.direction = 'up'
					if (this.colide(this.x, (this.y - (this.speed * step)), step)) return
					this.y -= this.speed * step + (Engine.controls.dash ? this.dashspeed : 0);
				}
				if (Engine.controls.right) {
					this.direction = 'right'
					if (this.colide(this.x + (this.speed * step), this.y, step)) return
					this.x += this.speed * step + (Engine.controls.dash ? this.dashspeed : 0);
				}
				if (Engine.controls.down) {
					this.direction = 'down'
					if (this.colide(this.x, (this.y + (this.speed * step)), step)) return
					this.y += this.speed * step + (Engine.controls.dash ? this.dashspeed : 0);
				}
				
				if (this.x - this.width / 2 < 0) {
					this.x = this.width / 2;
				}
				if (this.y - this.height / 2 < 0) {
					this.y = this.height / 2;
				}
				if (this.x + this.width / 2 > worldWidth) {
					this.x = worldWidth - this.width / 2;
				}
				if (this.y + this.height / 2 > worldHeight) {
					this.y = worldHeight - this.height / 2;
				}
			}
			
			this.mapx = (this.x - this.width / 2) - Engine.Game.camera.xView;
			this.mapy = (this.y - this.height / 2) - Engine.Game.camera.yView;
		}
		Engine.Player.prototype.behind = function() {
			const objs = [...Engine.Game.Players, ...Engine.Game.Props, ...Engine.Game.Walls, ...Engine.Game.Houses, ...Engine.Game.Entities].filter(([obj, object]) => object.drawn === true && obj !== this)
			objs.map(([obj, object]) => {
				if (obj !== 'self') {
					if (this.mapy < object.mapy + (object.height / 2) && this.mapx < object.mapx + object.width / 2 && this.mapx + this.width / 2 > object.mapx) {
						if (object.layer < 3) {
							object.changeLayer(3);
						}
					} 
					if (this.mapy > object.mapy - (object.height / 2) && this.mapx < object.mapx + object.width / 2 && this.mapx + this.width / 2 > object.mapx) {
						if (object.layer > 1) {
							object.changeLayer(1);
						}
					}
				}
			})
		}
		Engine.Player.prototype.changeLayer = function(layer) {
			//Change the layer of the object
			this.layer = layer;
		}
		Engine.Player.prototype.colided = function(ColisionOrigin,x,y, step) {
			//
		}
		Engine.Player.prototype.colide = function(x, y, step) {
			let state = true
			// this.behind(x, y, step, object)
			return false
		}
		Engine.Player.prototype.MouseAction = function() {

			if (Engine.Game.DrawnObjects.size > 0) {
				Engine.Game.DrawnObjects.forEach((object, index) => {
					if (index === 'self') return 
					// console.log(object)
					Engine.CTX[2].fillText(`${Math.round(object.x)}, ${Math.round(object.y)}`, object.mapx + 10, object.mapy - 15)
					Engine.CTX[2].fillText(`${Engine.cursx}, ${Engine.cusry}`, Engine.Cursorx + 20, Engine.Cursory - 20)
					var rect = new Engine.Rectangle(object.x - object.width / 2 , object.y - object.height / 2, object.width * 1.5 , object.height * 1.5)
					var rect2 = new Engine.Rectangle(Engine.cursx, Engine.cusry, 20, 20)
					if (rect2.within(rect)) {
						let angle = Math.atan2(object.x - this.x, object.y - this.y)
						let distance = Math.sqrt(Math.pow(object.x - this.x, 2) + Math.pow(object.y - this.y, 2))
						this.view.sight.set(object.id, {
							angle: angle,
							distance: distance,
							object: object,
						})
					} else {
						if (this.view.sight.has(object.id)) {
							this.view.sight.delete(object.id)
						}

					}
				})
			}
		}
		Engine.Player.prototype.cursor = function() {
			let context = Engine.CTX[2];
			Engine.cursx = Engine.Cursorx + Engine.Game.camera.xView
			Engine.cusry = Engine.Cursory + Engine.Game.camera.yView
			//Calculate the angle between the player and the cursor
			this.view.angle = Math.atan2(Engine.cursx - this.x, Engine.cusry - this.y)
			//Calculate the distance between the player and the cursor
			this.view.distance = Math.sqrt(Math.pow(Engine.cursx - this.x, 2) + Math.pow(Engine.cusry - this.y, 2))
			//Bewteen the player and the cursor check if there is any object in the way with a hitbox
			

			//if the vector intersects with any of the objects, draw a line from the startx and starty to the distx and disty
			//Create a vector with startx and starty as the start and distx and disty as the end

			this.MouseAction()
			context.beginPath();
			context.strokeStyle = 'rgb(255, 255, 255)';
			context.setLineDash([6, 20]);
			context.lineDashOffset = 0;
			context.moveTo(this.mapx + (this.width / 2) + 8, this.mapy + (this.height / 2));
			context.lineTo(Engine.Cursorx, Engine.Cursory);
			context.stroke();
			context.closePath();
			context.setLineDash([]);
			context.beginPath();
			context.arc(Engine.Cursorx, Engine.Cursory, 10, 0, Math.PI * 2);
			context.fill();
			context.closePath();
		}
		Engine.Player.prototype.info = function() {
			Engine.CTX[2].fillStyle = 'rgb(255, 255, 255)';
			Engine.CTX[2].font = '13px Arial';
			Engine.CTX[2].fillText(`Player in Map : ${Math.round(this.mapx)} , ${Math.round(this.mapy)} | Anim : ${this.direction} | Dash : ${Engine.controls.dash}`, 10, 20);
			Engine.CTX[2].fillText(`Mouse in Screen : ${Math.round(Engine.Cursorx)} , ${Math.round(Engine.Cursory)}`, 10, 40);
			Engine.CTX[2].fillText(`Props Pool : ${Engine.Game.Props.size} | Drawn Objects ${[...Engine.Game.Props].filter(([obj, value]) => value.drawn === true).length}`, 10, 60);
			Engine.CTX[2].fillText(`Players Pool : ${Engine.Game.Players.size} | Drawn Players ${[...Engine.Game.Players].filter(([obj, value]) => value.drawn === true).length}`, 10, 80);
			Engine.CTX[2].fillText(`Element Drawn : ${Game.DrawnObjects.size}`, 10, 100);
			// context.fillText(`Camera data : ${Math.round(camera.xView)} , ${Math.round(camera.yView)} `, 10, 80);
			Engine.CTX[2].fillText(`Player in colision : ${this.colideedstate}`, 10, 120);
			Engine.CTX[2].fillText(`Objects in sights : ${this.view.sight.size} | ${[...this.view.sight].reduce((acc, curr, index) => acc += `${curr[0]} [${curr[1].angle}] [${curr[1].distance}]`, "") }`, 10, 140);
			Engine.CTX[2].fillText(`Cursor Angle and Distance : ${this.view.angle} | ${Math.round(this.view.distance)}`, 10, 160);
		}
		Engine.Player.prototype.draw = function() {
			if ((this.x + this.width) < Engine.Game.camera.xView || (this.x + this.width) > Engine.Game.camera.xView + Engine.CTX[2].canvas.width || (this.y + this.height) < Engine.Game.camera.yView || (this.y + this.height) > Engine.Game.camera.yView + Engine.CTX[2].canvas.height) {
				this.drawn = false;
				Game.DrawnObjects.delete(this)
			} else {
				this.drawn = true;
				Game.DrawnObjects.add(this)
				const position = Math.floor(Engine.Game.gameFrames / this.StaggerFrames) % this.sprite.animations[this.direction].loc.length;
				//check if player is this.walking = true or false
				if (this.walking) {
					this.frameX = this.sprite.animation_step * position;
					this.frameY = this.sprite.animations[this.direction].loc[position].y

				} else {
					this.frameX = this.sprite.animations[this.direction].loc[0].x
					this.frameY = this.sprite.animations[this.direction].loc[0].y
				}
				Engine.CTX[2].drawImage(this.sprite.canvas, this.frameX, this.frameY, this.width, this.height, this.mapx, this.mapy, this.width, this.height);
				const hbplayer = {
					x: this.x ,
					y: this.y,
					radius: this.hitbox.width,
					height: this.hitbox.height,
				}
				//Draw the hitbox
				Engine.CTX[2].beginPath();
				Engine.CTX[2].strokeStyle = '#ff0000';
				Engine.CTX[2].rect(this.mapx + this.hitbox.x, this.mapy + this.hitbox.y, hbplayer.radius, hbplayer.height);
				// Engine.CTX[2].rect(hbobject.x, hbobject.y, hbobject.radius, hbobject.height);
				Engine.CTX[2].stroke();
			}
		}
	},

	Entity: function(entitydata) {
		//Function that manage [ENTITY] Objects within the Game
		console.log(entitydata)
		Engine.Entity.prototype.update = function() {

		}
		Engine.Entity.prototype.draw = function() {
		
		}
		Engine.Entity.prototype.colided = function(ColisionOrigin,x,y, step) {
			
		}
		Engine.Entity.prototype.changeLayer = function(layer) {
			//Change the layer of the object
			this.layer = layer;
		}
	},
	Prop: function(propdata) {
		//Function that manage [PROPS] Objects within the Game
		const spritedata = Engine.assets.get('props').find(prop => prop.name === propdata.sprite);
		this.name = propdata.name;
		this.id = propdata.id;
		this.layer = propdata.layer;
		this.x = propdata.x;
		this.y = propdata.y;
		this.sprite = spritedata
		this.width = spritedata.width;
		this.height = spritedata.height;
		this.mapx = (this.x - this.width / 2) - Engine.Game.camera.xView;
		this.mapy = (this.y - this.height / 2) - Engine.Game.camera.yView;
		this.type = spritedata.type
		this.movable = spritedata.movable;
		this.hitbox = spritedata.hitbox;
		this.weight = spritedata.weight;
		this.drawn = true;
		Engine.Prop.prototype.update = function() {
			this.mapx = (this.x - this.width / 2) - Engine.Game.camera.xView;
			this.mapy = (this.y - this.height / 2) - Engine.Game.camera.yView;
		}
		Engine.Prop.prototype.draw = function() {
			if ((this.x + this.width) < Engine.Game.camera.xView || (this.x + this.width) > Engine.Game.camera.xView + Engine.CTX[2].canvas.width || (this.y + this.height) < Engine.Game.camera.yView || (this.y + this.height) > Engine.Game.camera.yView + Engine.CTX[2].canvas.height) {
				this.drawn = false;
				Game.DrawnObjects.delete(this)
			} else {
				Engine.CTX[2].drawImage(this.sprite.sprite, this.mapx, this.mapy, this.width, this.height);
				this.drawn = true;
				Game.DrawnObjects.add(this)
			}
			//Draw the hitbox
			Engine.CTX[2].beginPath();
			Engine.CTX[2].strokeStyle = '#ff0000';
			Engine.CTX[2].rect(this.mapx + this.hitbox.x, this.mapy + this.hitbox.y, this.hitbox.width, this.hitbox.height);
			Engine.CTX[2].stroke();
			
		}
		Engine.Prop.prototype.changeLayer = function(layer) {
			//Change the layer of the object
			this.layer = layer;
		}
		Engine.Prop.prototype.colided = function(ColisionOrigin,x, y, step) {
			if (this.movable) {
				if (ColisionOrigin.direction === 'left') {
					if (this.x < x) this.x -= this.weight * step;
				}
				if (ColisionOrigin.direction === 'up') {
					if (this.y < y) this.y -= this.weight * step;
				}
				if (ColisionOrigin.direction === 'right') {
					if (this.x > x) this.x += this.weight * step;
				}
				if (ColisionOrigin.direction === 'down') {
					if (this.y > y)  this.y += this.weight * step;
				}
			}
		}
	},
	Wall: function(walldata) {
		//Function that manage [WALLS] Objects within the Game
		console.log(walldata)
		Engine.Wall.prototype.update = function() {

		}
		Engine.Wall.prototype.draw = function() {
		
		}
		Engine.Wall.prototype.changeLayer = function(layer) {
			//Change the layer of the object
			this.layer = layer;
		}
	},
	Rectangle: function(left, top, width, height) {
			this.left = left || 0;
			this.top = top || 0;
			this.width = width || 0;
			this.height = height || 0;
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
		Engine.Rectangle.prototype.set = function(left, top, width, height) {
			this.left = left;
			this.top = top;
			this.width = width || this.width;
			this.height = height || this.height
			this.right = (this.left + this.width);
			this.bottom = (this.top + this.height);
		}
		Engine.Rectangle.prototype.within = function(r) {
			return (r.left <= this.left && r.right >= this.right && r.top <= this.top && r.bottom >= this.bottom);
		}
		Engine.Rectangle.prototype.overlaps = function(r) {
			return (this.left < r.right && r.left < this.right && this.top < r.bottom && r.top < this.bottom);
		}
	},
	Camera: function(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight) {
		//Function that manage [CAMERA] Objects within the Game
		const AXIS = {
			NONE: 1,
			HORIZONTAL: 2,
			VERTICAL: 3,
			BOTH: 4
		};
		this.xView = xView || 0;
		this.yView = yView || 0;
		this.xDeadZone = 0;
		this.yDeadZone = 0;
		this.wView = viewportWidth;
		this.hView = viewportHeight;
		this.axis = AXIS.BOTH;
		this.followed = null;
		this.viewportRect = new Engine.Rectangle(this.xView, this.yView, this.wView, this.hView);
		this.worldRect = new Engine.Rectangle(0, 0, worldWidth, worldHeight);

		Engine.Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone) {
			this.followed = gameObject;
			this.xDeadZone = xDeadZone;
			this.yDeadZone = yDeadZone;
		}
		Engine.Camera.prototype.update = function() {

			if (this.followed != null) {
				if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH) {
					if (this.followed.x - this.xView + this.xDeadZone > this.wView)
						this.xView = this.followed.x - (this.wView - this.xDeadZone);
					else if (this.followed.x - this.xDeadZone < this.xView)
						this.xView = this.followed.x - this.xDeadZone;
				}
				if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {
					if (this.followed.y - this.yView + this.yDeadZone > this.hView)
						this.yView = this.followed.y - (this.hView - this.yDeadZone);
					else if (this.followed.y - this.yDeadZone < this.yView)
						this.yView = this.followed.y - this.yDeadZone;
					}
			}
			this.viewportRect.set(this.xView, this.yView);

			if (!this.viewportRect.within(this.worldRect)) {
				if (this.viewportRect.left < this.worldRect.left)
					this.xView = this.worldRect.left;
				if (this.viewportRect.top < this.worldRect.top)
					this.yView = this.worldRect.top;
				if (this.viewportRect.right > this.worldRect.right)
					this.xView = this.worldRect.right - this.wView;
				if (this.viewportRect.bottom > this.worldRect.bottom)
					this.yView = this.worldRect.bottom - this.hView;
			}
		}
	}
}




export default Engine;