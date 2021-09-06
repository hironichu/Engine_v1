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
		Engine.CTX[0] = gameBackdropCanvas.getContext('2d');
		Engine.CTX[1] = gameGroundCanvas.getContext('2d');
		Engine.CTX[2] = gameInteractiveCanvas.getContext('2d');
		Engine.Cursor = new Engine.Vector(DOMCanvasElem.clientWidth / 2, DOMCanvasElem.clientHeight / 2);
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
		Engine.serverName = prompt("Server URL : ");
		if (!Engine.serverName || Engine.serverName === "") {
			//Prompt an error and stop the game
			// alert("No server name provided, stopping the game");
			await Engine.Game.stop("No server name provided, stopping the game");
			return;
		}
		Engine.playername = prompt("Select a character : bob | alice");
		if (!Engine.playername) Engine.playername = "bob";
		// alert("Welcome to the game, " + Engine.playername + "!");
		Engine.ws = new WebSocket((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'  ? 'ws://localhost:8080': Engine.serverName), 'game');
		var id = new Uint32Array(32);
		window.crypto.getRandomValues(id);
		Engine.ws.id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>(c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
		Engine.ws.onerror = async (e) => {
			// await Engine.Game.stop(`Connection error, please try again later.`);
			// console.error(e);
			// alert("Connection error, please try again later.");
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
					width: Engine.CTX[0].canvas.clientWidth,
					height: Engine.CTX[0].canvas.clientHeight,
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
					console.log('INIT', message.data);
					await Engine.Game.start(message.data.data, message.data.players, Engine);
					console.log(`Game started [${Math.round(performance.now() - window.loadedtime)}ms]`);
					break;
				case'newplayer':
					console.log(`NEW PLAYER `, message)
					await Engine.Game.newOnlinePlayer(message.data.player);
					console.log(`Player online [${Math.round(performance.now() - window.loadedtime)}ms] Name : ${message.data.player.name}`);
					break;
				case 'update':
					//Check updatetype
					switch (message.data.updatetype) {
						case 'player.move':
							const update = message.data.data
							console.info(update)
							const player = Engine.Game.Players.get(update.id).update(update);
							// console.log(update.id)
							// player.update(update);
						break;
					}
					// const objects = [...Game.Players, ...Game.Props, ...Game.Walls, ...Game.Houses, ...Game.Entities];
					//Check what to update within the
					// const player = Engine.Game.Players.get(data.data.uuid);
					// if (player) {
					// 	player.update(data.data);
					// }
					break;
				case 'player.disconnect':
					// console.log(message)
					console.log(`Player offline [${Math.round(performance.now() - window.loadedtime)}ms]`);
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