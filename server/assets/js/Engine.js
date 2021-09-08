const fps = 75;
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
	keybinds: {
		"a": "left",
		"w": "up",
		"d": "right",
		"s": "down",
		" ": "dash",
	},
	CTX: [],
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
		DOMCanvasElem.insertAdjacentElement('afterbegin', gameBackdropCanvas);
		DOMCanvasElem.insertAdjacentElement('afterbegin', gameGroundCanvas);
		DOMCanvasElem.insertAdjacentElement('afterbegin', gameInteractiveCanvas);

		gameBackdropCanvas.width = window.innerWidth;
		gameBackdropCanvas.height = window.innerHeight
		gameGroundCanvas.width = window.innerWidth;
		gameGroundCanvas.height = window.innerHeight
		gameInteractiveCanvas.width = window.innerWidth;
		gameInteractiveCanvas.height = window.innerHeight
		window.addEventListener('resize', (event) => {
			gameBackdropCanvas.width = window.innerWidth;
			gameBackdropCanvas.height = window.innerHeight
			gameGroundCanvas.width = window.innerWidth;
			gameGroundCanvas.height = window.innerHeight
			gameInteractiveCanvas.width = window.innerWidth;
			gameInteractiveCanvas.height = window.innerHeight
		})
		Engine.CTX[0] = gameBackdropCanvas.getContext('2d');
		Engine.CTX[1] = gameGroundCanvas.getContext('2d');
		Engine.CTX[2] = gameInteractiveCanvas.getContext('2d');

		Engine.Cursor = new Engine.Vector( window.innerWidth / 2, window.innerHeight / 2);
		Engine.CursorinMap = new Engine.Vector(0,0);
		Engine.gravity = 0.98;
		gameInteractiveCanvas.onmousemove = function(e) {
			Engine.Cursor.x = e.pageX - this.offsetLeft;
			Engine.Cursor.y = e.pageY - this.offsetTop;
			if (Engine.Cursor.x < 0) Engine.Cursor.x = 0
			if (Engine.Cursor.y < 0) Engine.Cursor.y = 0
		}
		console.log(`Engine v${Engine.version} initialized [${Math.round(performance.now() - time)}ms]`);
	},
	start: async () => {
		const time = performance.now();
		const player_default = await (await import('./entities/Player.entity.js')).Player
		const player_girl =  await (await import('./entities/Player2.entity.js')).Player
		const props  = await (await import('./entities/Default.entity.js')).Props
		Engine.assets.set('props', await props)
		Engine.assets.set('player_default', await player_default)
		Engine.assets.set('player_girl', await player_girl)
		Engine.assets.set('walls', await (await import('./entities/Walls.entity.js')).Props)
		Engine.Game = await (await import('./Game.js')).Game;
		await console.info(`Asset loaded [${Math.round(performance.now() - time)}ms]`)
		if (!(window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
			Engine.serverName = prompt("Server URL : ");
			if (!Engine.serverName || Engine.serverName === "") {
				await Engine.Game.stop("No server name provided, stopping the game");
				return;
			}
		}
		Engine.playername = prompt("Choose a Username ");
		if (!Engine.playername) Engine.playername = "bob";
		Engine.ws = new WebSocket((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'  ? 'ws://localhost:8080': Engine.serverName), 'game');
		var id = new Uint32Array(32);
		window.crypto.getRandomValues(id);
		Engine.ws.id = crypto.randomUUID();
		Engine.ws.onerror = async (e) => {
			await Engine.Game.stop(e.reason || `The Server or the client found a nasty bug`);
		}
		Engine.ws.onopen = async () => {
			await Engine.ws.send(JSON.stringify({
				type: 'init',
				id: Engine.ws.id,
				data: {
					wsid: Engine.ws.id,
					name: Engine.playername,
					version: Engine.version,
					screenWidth: Engine.CTX[2].canvas.clientWidth,
					screenHeight: Engine.CTX[2].canvas.clientHeight,
					fps: fps
				}
			}));
		}
		Engine.ws.onclose = async (data) => {
			console.log(`Connection closed [${data.code}] ${data.reason}`, data);
			switch(data.type) {
				case 'close':
					await Engine.Game.stop(data.reason || `The Server closed the connection`);
					break;
				case 'error':
					await Engine.Game.stop(data.reason || `Error while joining the server`);
					break;
			}
			//Stop the game
			// await Engine.Game.stop(data.reason);
		}
		Engine.ws.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			switch (message.type) {
				case 'init':
					// console.log('INIT', message.data);
					console.info(`Game started [${Math.round(performance.now() - window.loadedtime)}ms]`);
					await Engine.Game.start(message.data.data, message.data.players, Engine);
					break;
				case'newplayer':
					console.info(`Player online [${Math.round(performance.now() - window.loadedtime)}ms] Name : ${message.data.player.name}`);
					Engine.Game.newOnlinePlayer(message.data.player);
					break;
				case 'update':
					//Check updatetype
					switch (message.data.updatetype) {
						case 'player.move':
							if (Engine.Game.Players.has(message.data.id)) {
								Engine.Game.Players.get(message.data.id).update(message.data.data);
							}
						break;
						default: 
							//
						break;
					}
					break;
				case 'player.disconnect':
					console.info(`Player offline [${Math.round(performance.now() - window.loadedtime)}ms]`);
					Engine.Game.Players.delete(message.data.clientid);
					break;
				case 'error':
					console.error(data.data);
					break;
				default:
					console.error('Unknown message type: ' + data.type);
				break;
			}
		}
	},
	Vector: await (await import('./Engine/Vector.js')).default,
	Map: await (await import('./Engine/Map.js')).default,
	Player: await (await import('./Game/Player.js')).default,
	Entity: await (await import('./Game/Entity.js')).default,
	Prop: await (await import('./Game/Prop.js')).default,
	Wall: await (await import('./Game/Wall.js')).default,
	Rectangle: await (await import('./Engine/Rectangle.js')).default,
	Camera: await (await import('./Engine/Camera.js')).default,
}


export default Engine;