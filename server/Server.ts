import { serve, ConnInfo} from "https://deno.land/std@0.144.0/http/server.ts";
// import { serveFile } from 'https://deno.land/std@0.116.0/http/file_server.ts'
// import  "https://deno.land/x/cliffy@v0.20.1/mod.ts"
import { serveFile } from "https://deno.land/std@0.144.0/http/file_server.ts";

import Vector from './Engine/Maths/Vector.ts'
import { Player } from './Engine/Objects/Player.ts'
import { Prop } from './Engine/Objects/Prop.ts'
import Camera from './Engine/Objects/Camera.ts'
const gravity = 0.98;
const Engine = {} as any;
Engine.lastTime = 0;
Engine.requestAnimationFrame = (callback: Function, element: any) =>  {
	Engine.now = Date.now();
	Engine.nextTime = Math.max(Engine.lastTime, Engine.now);
	return setTimeout(function() { callback(Engine.lastTime = Engine.nextTime); }, Engine.nextTime - Engine.now);
};
Engine.cancelAnimationFrame = clearTimeout;

//Create a Map to store the websocket connection
const wsConnections = new Map<string, WebSocket>();
const players = new Map<string, any>();
const events = new Map<string, any>();
const Cameras = new Map<string, Camera>();
Engine.players = players;
Engine.socks = wsConnections;
Engine.events = events;
Engine.Cameras = Cameras as Map<string, Camera>;
Engine.Maps = {
	"default": {
		width: 4608,
		height: 3072
	}
};

//Generate a random X value for the player to spawn at on the map
Engine.randomX = function (map: string) {
	return Math.floor(Math.random() * Engine.Maps[map].width);
};
//Random Y
Engine.randomY = function (map: string) {
	return Math.floor(Math.random() * Engine.Maps[map].height);
};




let testx = Engine.randomX('default')
let testy = Engine.randomY('default')
const initplayer = (socketid: string, clientid: string, message: any) => {
	console.log(`New Player => ID : ${clientid}| Name : ${message.data.name}`)
	const socket = Engine.socks.get(socketid)
	const pos = new Vector(0,0)
	let sprite = "";
	if (message.data.name === "bob") {
		pos.x = Engine.randomX('default')
		pos.y = Engine.randomY('default');
		sprite = "player_default";
	} else if (message.data.name === "alice") {
		pos.x = Engine.randomX('default')
		pos.y = Engine.randomY('default');
		sprite = "player_girl"
	} else {
		pos.x = testx;
		pos.y = testy;
		testx += 64;
		// testy += 32;
		sprite = "player_default";
	}
	if (sprite !== "") {
		const player = new Player(socketid,clientid, {
			position: pos,
			name: message.data.name,
			sprite: sprite,
			version: message.data.version,
			screenWidth: message.data.screenWidth,
			screenHeight: message.data.screenHeight,
		}, Engine)
		Engine.Cameras.set(socketid, new Camera(player.position.x, player.position.y, Math.min(Engine.Maps[player.map].width, player.screenWidth), Math.min(Engine.Maps[player.map].height, player.screenHeight), Engine.Maps[player.map].width, Engine.Maps[player.map].height, player.map));
		Engine.Cameras.get(socketid).follow(player, Math.min(Engine.Maps[player.map].width, player.screenWidth) / 2, Math.min(Engine.Maps[player.map].height, player.screenHeight) / 2);
		const playerCam = Engine.Cameras.get(socketid);
		
		const visiblePlayers = [...Engine.Cameras].filter(([sid, cam]) => cam.map === player.map && sid !== socketid && cam.xView > playerCam.xView - ((player.screenWidth / 2) + 256) && cam.xView < playerCam.xView + ((player.screenWidth / 2) + 256) && cam.yView > playerCam.yView - ((player.screenHeight / 2) + 256) && cam.yView < playerCam.yView + ((player.screenHeight / 2) + 256)).map(([sid, cam]) => cam.followed);
		player.visiblePlayers = visiblePlayers;
		
		socket.send(JSON.stringify({
			type: "player.init",
			data: {
				id: clientid,
				data: player,
				visiblePlayers: visiblePlayers,

			}
		}))
		Engine.players.set(socketid, player);

		Engine.events.set(`${Math.round(Date.now())}::player.online`, function (this: any) : void {
			this.type = 'player.online';
			Engine.sendToAll(socket, {
				type: 'player.new',
				config: this,
				data: {
					player:player
				}
			})
		})
	}
	return false
}

Engine.broadcast = function (data: any) {
	for (const [index, sock] of Engine.socks) {
		sock.send(JSON.stringify(data));
	}
}

//Create a function that sends a Websocket message to all except the sender
Engine.sendToAll = function (sender: WebSocket, data: any) {
	for (const [index, sock] of Engine.socks) {
		if (sock !== sender) {
			sock.send(JSON.stringify(data));
		}
	}
}


function handleWs(sock: WebSocket, Engine: any) {
	const sockid = crypto.randomUUID()
	console.log(`New Socket ID: ${sockid}`)
	sock.onopen = () => console.log("socket opened");
	sock.onmessage = async (event: MessageEvent<any>) => {
		if (typeof event.data === "string") {
			try {
				const message = JSON.parse(event.data);
				if (message.id && message.type && message.data) {
					if (message.type === 'init' && !Engine.socks.has(sockid)) {
						Engine.socks.set(sockid, sock);
						await initplayer(sockid, message.data.wsid, message);
					} else {
						switch (message.type) {
							case 'player.move':
								if (Engine.players.has(sockid)) {
									const player = Engine.players.get(sockid)
									player.update(Engine, message);
								}
							break;
							case 'player.attack':
								// const player = players.get(sockid)!.player;
							break;
							case 'player.test':
								// const player = players.get(sockid)!.player;
							break;
						}
					}
				}
			} catch (e) {
				console.error('invalid message type')
				sock.close(1002, 'invalid message type')
			}
		// await dispatch(ws, decode(sid, event.data)).catch(console.error)
		} else {
			console.log('\nInvalid message')
			sock.close(1002, 'invalid message type')
		}
	}
	sock.onclose = (event: CloseEvent) => {
		const { code, reason } = event;
		if (Engine.players.has(sockid)){
			const clientid = Engine.players.get(sockid)!.id;
			Engine.players.delete(sockid);
			Engine.socks.delete(sockid);
			Engine.Cameras.delete(sockid);
			Engine.broadcast({
				type: 'player.disconnect',
				data: {
					id: sockid,
					clientid: clientid,
					players: Array.from(Engine.players.values()),
				}
			})
		}
		if (!sock.CLOSED) {
			 sock.close(1000)
		}
	}

	sock.onerror = (ev: Event ) => {
		console.error(`\nFailed to receive frame: `);
		//Find the player with this socket and remove it
		if (Engine.players.has(sockid)) {
			const clientid = Engine.players.get(sockid)!.id;
			Engine.players.delete(sockid);
			Engine.socks.delete(sockid);
			Engine.Cameras.delete(sockid);
			Engine.broadcast({
				type: 'player.disconnect',
				data: {
					id: sockid,
					clientid: clientid,
					players: Array.from(Engine.players.values()),
				}
			})
		}
		if (!sock.CLOSED) {
		 	sock.close(1000)
		}
	}
}
const FPS = 90;
const Game = {
	now: 0,
	then: 0,
	delta: 0,
	fps: FPS,
	interval: 1000 / FPS,
	deltatime: 0
} as any;

Game.update = async function () {
	Promise.all([...Engine.players].map(([sid, player]) => {
		player.move(Engine);
	}))

	if (Engine.events.size > 0) {
		for await (const [index, event] of Engine.events) {
			console.info(`\nTriggered Event ${index}`)
			event.call(this);
		}
		Engine.events.clear();
	}
}
Engine.loop = () => {
	Engine.requestAnimationFrame(Engine.loop);
	Game.now = Date.now();
	Game.delta = Game.now - Game.then;
	Game.deltaTime = Game.delta / 1000;
	if(Game.delta > Game.interval) {
		
		// const text = `TickRate: ${Math.round(1 / Game.deltaTime)} || Players: ${Engine.players.size}  `;
		// Deno.stdout.writeSync(new TextEncoder().encode(`\r${text}`));
		//Listen for Stdin
		Game.update();
		Game.then = Game.now - (Game.delta % Game.interval);
	}
}

Engine.start = async (port: number) => {
	Engine.Game = Game;
	Game.now = Date.now();
	Game.then = Game.now;
	Engine.loop()
	await serve(async function (req: Request) {
		const upgrade = req.headers.get("upgrade") || "";
		const accessURL = new URL(req.url)
		if (upgrade !== "" && upgrade.toLowerCase() === "websocket") {
			console.log('\nUpgrade WS')
			const { socket, response } = Deno.upgradeWebSocket(req);
			handleWs(socket, Engine)
			return response
		} 
		// console.log(accessURL.pathname)
			if (accessURL.pathname === '/') {
					const file = `<!DOCTYPE html>
					<html lang="en">
						<head>
							<meta charset="UTF-8">
							<meta http-equiv="X-UA-Compatible" content="IE=edge">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>ChunkNorris Engine 1.0</title>
							<link rel="stylesheet" href="assets/css/style.min.css">
						</head>
						<body>
							<div class="gui">
								<div class="status"></div>
								<div class="inv"></div>
								<div class="combat"></div>
							</div>
							<div class="frame resimg" id='gameCanvas'></div>
							<script type="module" src="assets/js/App.js"></script>
						</body>
					</html>`
					const headers = new Headers();
					headers!.set('Content-Type', 'text/html; charset=UTF-8')
					return new Response(file, { headers , status: 200})
					// file.headers!.set('Cache-Control', 'private, max-age=31536000')
					// return file
			}
				const filepath =  accessURL.pathname
				const requestpath = `./server/${filepath}`
				try {
					return await serveFile(req, requestpath)
					// const file = await Deno.readFile(requestpath)
					// //Depending on the file extension, set the correct content type
					// const ext = filepath.split('.').pop()
					// const headers = new Headers();
					// if (ext){
					// 	const contentType = new Map()
					// 	contentType.set('html', 'text/html')
					// 	contentType.set('css', 'text/css')
					// 	contentType.set('js', 'application/javascript')
					// 	contentType.set('png', 'image/png')
					// 	contentType.set('jpg', 'image/jpeg')
					// 	contentType.set('jpeg', 'image/jpeg')
					// 	contentType.set('gif', 'image/gif')
					// 	contentType.set('svg', 'image/svg+xml')
					// 	contentType.set('json', 'application/json')
					// 	contentType.set('woff', 'application/font-woff')
					// 	contentType.set('woff2', 'application/font-woff2')
					// 	contentType.set('ttf', 'application/font-ttf')
					// 	contentType.set('eot', 'application/vnd.ms-fontobject')
					// 	contentType.set('otf', 'application/font-otf')
					// 	contentType.set('mp3', 'audio/mpeg')
					// 	contentType.set('ogg', 'audio/ogg')
					// 	contentType.set('wav', 'audio/wav')
					// 	contentType.set('mp4', 'video/mp4')
					// 	contentType.set('webm', 'video/webm')
					// 	contentType.set('ogv', 'video/ogg')
					// 	//add more image type to the contentType map

					// 	headers!.set('Content-Type', contentType.get(ext) || 'text/plain')
					// }
					// // const headers = new Headers();
					// // headers!.set('Content-Type', 'text/html; charset=UTF-8')
					// return new Response(file, { headers, status: 200})
				} catch (e) {
					return new Response("Error 404", { status: 404 })
				}
				// if (existsSync(requestpath)) {
				// 	const content = await serveFile(req, requestpath)
				// 	content.headers!.set('Content-Type', content.headers!.get('Content-Type') +'; charset=UTF-8')
				// 	// content.headers!.set('Cache-Control', 'private, max-age=31536000')
				// 	return content
				// } else {
				// 	return new Response("Error 404", { status: 404 })
				// }
		}, {port:8080}).catch(console.error)
}
export default Engine;