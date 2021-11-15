import { listenAndServe, serve, ServerRequest } from "https://deno.land/std@0.106.0/http/server.ts";
import { serveFile } from 'https://deno.land/std@0.106.0/http/file_server.ts'
import { existsSync } from "https://deno.land/std@0.108.0/fs/mod.ts"
import  "https://deno.land/x/cliffy@v0.19.6/mod.ts"

// export { listenAndServe, serve, ServerRequest } from "https://deno.land/std/http/server.ts"
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.106.0/ws/mod.ts";

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


async function handleWs(sock: WebSocket, Engine: any) {
	const sockid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	console.log(`New Socket ID: ${sockid}`)
	try {
		for await (const ev of sock) {
			if (typeof ev === "string") {
				const message = JSON.parse(ev);
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
				} else {
					console.log(`Invalid Message: `, message)
					console.error('Invalid message')
				}
			} else if (isWebSocketCloseEvent(ev)) {
				const { code, reason } = ev;
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
				if (!sock.isClosed) {
					await sock.close(1000).catch(console.error);
				}
			}
		}
	} catch (err) {
		console.error(`\nFailed to receive frame: ${err}`);
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
		if (!sock.isClosed) {
			await sock.close(1000).catch(console.error);
		}
	}
}
const FPS = 75;
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
		
		const text = `TickRate: ${Math.round(1 / Game.deltaTime)} || Players: ${Engine.players.size}  `;
		Deno.stdout.writeSync(new TextEncoder().encode(`\r${text}`));
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
	
	await listenAndServe(`:8080`, async (req: ServerRequest) => {
		const { conn, r: bufReader, w: bufWriter, headers } = req;
		if (headers.get("upgrade") === "websocket") {
			acceptWebSocket({conn, bufReader, bufWriter, headers, }).then((sock) => {
				handleWs(sock, Engine);
			})
			.catch(async (err) => {
				console.error(`Failed to accept websocket: ${err}`);
				await req.respond({ status: 400 });
			});
		} else {
			if (req.url === '/' || req.url === '/index.html') {
				const file = await serveFile(req, './index.html');
				await req.respond(file)
			} else {
				const url = new URL(`http://localhost${req.url}`)
				const filepath =  url.pathname
				const requestpath = `./server/${filepath}`
				if (existsSync(requestpath)) {
					const content = await serveFile(req, requestpath)
					content.headers!.set('Content-Type', content.headers!.get('Content-Type') +'; charset=UTF-8')
					content.headers!.set('Cache-Control', 'private, max-age=31536000')
					return await req.respond(content)
				} else {
					await req.respond({ status: 404 })
				}
			}
		}
	})
}

export default Engine;
