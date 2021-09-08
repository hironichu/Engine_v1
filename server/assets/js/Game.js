import Engine from './Engine.js';

export const Game = {
	Players: new Map(),
	Maps: new Map(),
	Props: new Map(),
	Walls: new Map(), // Walls 
	Houses: new Map(), // Houses are not in the game, but are used to store the data
	Entities: new Map(), //NPCs, Items, etc.
	DrawnObjects: new Set(),
	currentmap: null,
	player: null,
	oldmap: null,
	nextmap: null,
	now: null,
	then: null,
	delta: null,
	deltaTime: null,
}

Game.update = function(objects) {
	if (Game.self.movements.inputs.size > 0) {
		Game.self.walking = true;
		Engine.ws.send(JSON.stringify({
			type: 'player.move',
			id: Game.self.uuid,
			data: {
					updatetype: 'position',
					inputs: Array.from(Game.self.movements.inputs.values()),
					speed: Game.self.speed,
					map: Game.self.map,
					mapwidth: Game.currentmap.width,
					mapheight: Game.currentmap.height,
					position: Game.self.position,
					posinmap: Game.self.posinmap,
					screenwidth: Engine.CTX[2].canvas.width,
					screenheight: Engine.CTX[2].canvas.height,
				}
			})
		);
	} else {
		Game.self.walking = false;
	}
}

Game._frame = function(objects) {

	Engine.CTX[0].save()
	Engine.CTX[1].save()
	Engine.CTX[2].save()
	Engine.CTX[0].clearRect(0, 0, Engine.CTX[0].canvas.width, Engine.CTX[0].canvas.height);
	Engine.CTX[1].clearRect(0, 0, Engine.CTX[1].canvas.width, Engine.CTX[1].canvas.height);
	Engine.CTX[2].clearRect(0, 0, Engine.CTX[2].canvas.width, Engine.CTX[2].canvas.height);

	Game.currentmap.draw();
	Engine.CTX[1].fillStyle = '#fff';
	Engine.CTX[1].font = '15px Arial';
	Engine.CTX[1].fillText(`FPS: ${Math.round(1 / Game.deltaTime)}`, 20, Engine.CTX[0].canvas.height - 20);

	if (Engine.Game.DrawnObjects.size > objects.length) {
		Engine.Game.DrawnObjects.clear();
	}
	for (let layer = 1; layer < 4;layer++) {
		Promise.all([...objects].filter(([index, object]) => object.layer === layer).map(([index, object]) => {
			const posX = (object.position.x - object.width / 2) - Game.camera.xView
			const posY = (object.position.y - object.height / 2) - Game.camera.yView
			if (posX + object.width < 0 || posX >Engine.CTX[2].canvas.width || posY + object.height < 0 || posY > Engine.CTX[2].canvas.height) {
				object.drawn = false;
				Engine.Game.DrawnObjects.delete(object)
			} else {
				object.move()
				object.draw()
			}
		}))
	}
	//Draw the Engine.ws.id to the screen in the top middle
	Engine.CTX[1].fillStyle = '#fff';
	Engine.CTX[1].font = '15px Arial';
	const text = `ID: ${Engine.ws.id}`;
	Engine.CTX[1].fillText(text, Engine.CTX[0].canvas.width / 2 - Engine.CTX[0].measureText(text).width , 20);
	//Draw the numbers of players to the screen in the top right
	Engine.CTX[1].fillStyle = '#fff';
	//Align the text to the right
	Engine.CTX[1].textAlign = 'end';
	const text2 = `Players: ${Game.Players.size}`;
	Engine.CTX[1].fillText(text2, Engine.CTX[0].canvas.width + Engine.CTX[0].measureText(text2).width - 60 , 20);
	//Draw the number of drawn object in the top right corner
	Engine.CTX[1].fillStyle = '#fff';
	Engine.CTX[1].textAlign = 'end';
	const text4 = `Drawn Objects: ${Engine.Game.DrawnObjects.size}`;
	Engine.CTX[1].fillText(text4, Engine.CTX[0].canvas.width + (Engine.CTX[0].measureText(text4).width - 90), 40);

	Engine.CTX[0].restore()
	Engine.CTX[1].restore()
	Engine.CTX[2].restore()
}

Game.stop = function(reason) {
	Engine.CTX[0].clearRect(0, 0, Engine.CTX[0].canvas.width, Engine.CTX[0].canvas.height);
	Engine.CTX[1].clearRect(0, 0, Engine.CTX[1].canvas.width, Engine.CTX[1].canvas.height);
	Engine.CTX[2].clearRect(0, 0, Engine.CTX[2].canvas.width, Engine.CTX[2].canvas.height);
	if (reason) {
		Engine.CTX[0].fillStyle = '#FFF';
		Engine.CTX[0].font = '20px Arial';
		Engine.CTX[0].fillText(`Error : ${reason}`, Engine.CTX[0].canvas.width / 2 - Engine.CTX[0].measureText(`Error : ${reason}`).width / 2, Engine.CTX[0].canvas.height / 2);
		window.cancelAnimationFrame(Game.animationframe);
		//refresh the page after 3 seconds
		setTimeout(() => {
			window.location.reload();
		}, 3000);
	}
}

Game.loop = function() {
	Game.animationframe = window.requestAnimationFrame(() => {
		Game.loop(Engine);
	})
	
	Game.now = performance.now();
	Game.delta = Game.now - Game.then;
	Game.deltaTime = Game.delta / 1000;
	if(Game.delta > Engine.settings.INTERVAL) {
		const Objects = [...Game.Players, ...Game.Props, ...Game.Walls, ...Game.Houses, ...Game.Entities];
		Game.update(Objects)
		Game._frame(Objects);
		Game.gameFrames++;
		Game.then = Game.now - (Game.delta % Engine.settings.INTERVAL);
	}
}

Game.newOnlinePlayer = function(player) {
	const now = performance.now();
	console.log(`New player ${player.id}|${player.name} connected [${Math.round(now)}ms]`);
	Game.Players.set(player.id, new Engine.Player({
		id: `${Date.now()}::${player.sid}::${player.name}`,
		uuid: player.id,
		self: (Engine.ws.id === player.id),
		wsid: player.sid,
		name: player.name,
		type: 'net_player',
		position: player.position,
		velocity: player.velocity,
		mass: player.mass,
		speed: player.speed,
		layer: 2,
		sprite: player.sprite,
		direction: 'idle',
		map: player.map,
		health: player.health,
		maxhealth: player.maxhealth,
	}))
}

Game.start = async function(LocalPlayer,PlayersObject, Engine) { 
	if (!LocalPlayer) throw new Error('No LocalPlayer provided');
	if (!Engine) throw new Error('No Engine provided');
	console.log(`Game loading [Engine V${Engine.version}] in map ${LocalPlayer.map}`)
	const MapGen = await (await import('./Generation/Map.js')).MapGen
	const defaultmap = await new MapGen()
	Engine.vWidth = Math.min(defaultmap.width, Engine.CTX[1].canvas.width );
	Engine.vHeight = Math.min(defaultmap.height, Engine.CTX[1].canvas.height );
	Game.camera = new Engine.Camera(LocalPlayer.position.x, LocalPlayer.position.y,  Engine.vWidth, Engine.vHeight, defaultmap.width, defaultmap.height);
	Game.gameFrames = 0;
	Game.Maps.set('default', new Engine.Map(defaultmap))
	Game.now = performance.now();
	Game.then = Game.now;
	Game.currentmap = Game.Maps.get('default')
	// console.log(PlayersObject)
	if (PlayersObject.length > 0) {
		PlayersObject.forEach(player => Game.newOnlinePlayer(player))
	}
	Game.Players.set(LocalPlayer.id, new Engine.Player({
		id: `${Date.now()}::${LocalPlayer.sid}::${LocalPlayer.name}`,
		uuid: LocalPlayer.id,
		wsid: LocalPlayer.sid,
		self: true,
		name: LocalPlayer.name,
		type: 'local_player',
		position: LocalPlayer.position,
		velocity: LocalPlayer.velocity,
		mass: LocalPlayer.mass,
		speed: LocalPlayer.speed,
		layer: 2,
		sprite: LocalPlayer.sprite,
		direction: 'idle',
		map: LocalPlayer.map,
		health: LocalPlayer.health,
		maxhealth: LocalPlayer.maxhealth,
	}))
	Game.self = Game.Players.get(LocalPlayer.id)
	Game.camera.follow(Game.self, (Engine.vWidth / 2), Engine.vHeight / 2);
	self.posinmap = new Engine.Vector((Game.self.position.x - Game.self.width / 2) - Game.camera.xView, (Game.self.position.y - Game.self.height / 2) - Game.camera.yView);
	document.addEventListener('keydown', (event) => {
		var KeyPressed = event.key
		event.preventDefault();
		//Make sure we don't repeat the same key
		if (typeof Engine.keybinds[KeyPressed] !== 'undefined') {
			const key = Engine.keybinds[KeyPressed]
			//Check if we just pressed the key
			if (!Game.self.movements.inputs.has(key)) {
				Game.self.movements.inputs.add(key)
			} else {
				//We already pressed the key
				return;
			}
		}
	}, {passive: false, capture: true})
	//Keyup event listener
	document.addEventListener('keyup', (event) => {
		event.preventDefault();
		var KeyPressed = event.key
		if (typeof Engine.keybinds[KeyPressed] !== 'undefined') {
			const key = Engine.keybinds[KeyPressed]
			if (Game.self.movements.inputs.has(key)) {
				Game.self.movements.inputs.delete(key)
			} else {
				return ;
			}
		} else {
		}
	}, {passive: false, capture: true})
	//Check if window is in focus
	window.addEventListener('focus', (event) => {
		// console.log(event)
		Game.self.movements.inputs.clear()
	})
	//Check if window is out of focus
	window.addEventListener('blur', (event) => {
		// console.log(event)
		Game.self.movements.inputs.clear()
	})
	window.addEventListener('resize', (event) => {
		if (Game.self && Game.camera) {
			Engine.vWidth = Math.min(Game.currentmap.width, window.innerWidth);
			Engine.vHeight = Math.min(Game.currentmap.height, window.innerHeight);
			Game.camera.setViewport(Game.self.position.x, Game.self.position.y, Engine.vWidth, Engine.vHeight);
			Game.camera.follow(Game.self, (Engine.vWidth / 2), Engine.vHeight / 2);
			//resize all the canvas
			Engine.CTX[0].canvas.width = window.innerWidth;
			Engine.CTX[0].canvas.height = window.innerHeight;
			Engine.CTX[1].canvas.width = window.innerWidth;
			Engine.CTX[1].canvas.height = window.innerHeight;
			Engine.CTX[2].canvas.width = window.innerWidth;
			Engine.CTX[2].canvas.height = window.innerHeight;
			//Regenerate the map
			// const defaultmap = await new MapGen()
			// Game.Maps.set('default', new Engine.Map(defaultmap))
			// Game.currentmap = Game.Maps.get('default')
		}
	})
	Game.loop()
}

