import { serve } from "https://deno.land/std@0.106.0/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.106.0/ws/mod.ts";

import Vector from './Engine/Maths/Vector.ts'
import { Player } from './Engine/Objects/Player.ts'
const gravity = 0.98;
const Engine = {} as any;
Engine.lastTime = 0;
Engine.requestAnimationFrame = function(callback: Function, element: any)
{
	Engine.now = window.performance.now();
	Engine.nextTime = Math.max(Engine.lastTime + 16, Engine.now);
	return setTimeout(function() { callback(Engine.lastTime = Engine.nextTime); }, Engine.nextTime - Engine.now);
};
Engine.cancelAnimationFrame = clearTimeout;

//Create a Map to store the websocket connection
const wsConnections = new Map<string, WebSocket>();
const players = new Map<string, any>();
const events = new Map<string, any>();

Engine.players = players;
Engine.socks = wsConnections;
Engine.events = events;

const initplayer = async (socketid: string, clientid: string, message: any) => {
	console.log(`New Player => ID : ${clientid}| Name : ${message.data.name}`)
	const socket = Engine.socks.get(socketid)
	const pos = new Vector(0,0)
	let sprite = "";
	if (message.data.name === "bob") {
		pos.x = 256;
		pos.y = 256;
		sprite = "player_default";
	} else if (message.data.name === "alice") {
		pos.x = 150;
		pos.y = 132;
		sprite = "player_girl"
	} else {
		if (!socket.isClosed) {
			return await socket.close(1000, `Invalid character selected`).catch(console.error);
		}
		//close the socket 
		// socket.close(`No player selected`)

	}
	if (sprite !== "") {
		const player = new Player(socketid,clientid, {
			position: pos,
			name: message.data.name,
			sprite: sprite
		})
		socket.send(JSON.stringify({
			type: "init",
			data: {
				id: clientid,
				data: player,
				players: Array.from(Engine.players.values()),
			}
		}))
		Engine.players.set(socketid, player)
		//Queue the new player spawn event
	
		Engine.events.set(`${Math.round(performance.now())}::spawn`, function (this: any) : void {
			this.type = 'spawn';
			Engine.sendToAll(socket, {
				type: 'newplayer',
				config: this,
				data: {player:player}
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
				const clientid = Engine.players.get(sockid)!.id;
				Engine.players.delete(sockid);
				Engine.socks.delete(sockid);
				//Broadcast the player's disconnection
				//Get the clientid of the player
				Engine.broadcast({
					type: 'player.disconnect',
					data: {
						id: sockid,
						clientid: clientid,
						players: Array.from(Engine.players.values()),
					}
				})
				if (!sock.isClosed) {
					await sock.close(1000).catch(console.error);
				}
			}
		}
	} catch (err) {
		console.error(`\nFailed to receive frame: ${err}`);
		//Find the player with this socket and remove it
		const clientid = Engine.players.get(sockid)!.id;
		Engine.players.delete(sockid);
		Engine.socks.delete(sockid);
		Engine.broadcast({
			type: 'player.disconnect',
			data: {
				id: sockid,
				clientid: clientid,
				players: Array.from(Engine.players.values()),
			}
		})
		if (!sock.isClosed) {
			await sock.close(1000).catch(console.error);
		}
	}
}
const FPS = 100;
const Game = {
	now: 0,
	then: 0,
	delta: 0,
	fps: FPS,
	interval: 1000 / FPS,
	deltatime: 0
} as any;

Game.update = async function () {
	Engine.players.forEach(function (player: any) {
		player.move();
	})
	if (Engine.events.size > 0) {
		for await (const [index, event] of Engine.events) {
			console.info(`\nTriggered Event ${index}`)
			event.call(this);
			// event.execute(Engine, event.data)
		}
		Engine.events.clear();
	}
	//Run the move function on all Players
}
Engine.loop = async () => {
	Engine.requestAnimationFrame(Engine.loop);
	Game.now = performance.now();
	Game.delta = Game.now - Game.then;
	Game.deltaTime = Game.delta / 1000;
	if(Game.delta > Game.interval) {
		Game.update();
		const text = `FPS: ${Math.round(1 / Game.deltaTime)} || Players: ${Engine.players.size}`;
		await Deno.stdout.write(new TextEncoder().encode(`\r${text}`));
		Game.then = Game.now - (Game.delta % Game.interval);
	}
}

Engine.start = async (port: number) => {
	Engine.Game = Game;
	Game.now = performance.now();
	Game.then = Game.now;
	await Engine.loop();
	await Deno.stdout.write(new TextEncoder().encode(`\n`));
	for await (const req of serve(`:${port}`)) {
		const { conn, r: bufReader, w: bufWriter, headers } = req;
		acceptWebSocket({conn, bufReader, bufWriter, headers, }).then((sock) => {
			handleWs(sock, Engine);
		})
		.catch(async (err) => {
			console.error(`Failed to accept websocket: ${err}`);
			await req.respond({ status: 400 });
		});
	}
}

export default Engine;
