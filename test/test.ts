import { serve } from "https://deno.land/std@0.106.0/http/server.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  WebSocket,
} from "https://deno.land/std@0.106.0/ws/mod.ts";
import { createCanvas } from "https://deno.land/x/canvas/mod.ts";

// import Vector from './Engine/Maths/Vector.ts'
// import { Player } from './Engine/Objects/Player.ts'
// import { Prop } from './Engine/Objects/Prop.ts'
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
	// console.log(`New Player => ID : ${clientid}| Name : ${message.data.name}`)
	// const socket = Engine.socks.get(socketid)
	// const pos = new Vector(0,0)
	// let sprite = "";
	// if (message.data.name === "bob") {
	// 	pos.x = 256;
	// 	pos.y = 256;
	// 	sprite = "player_default";
	// } else if (message.data.name === "alice") {
	// 	pos.x = 150;
	// 	pos.y = 132;
	// 	sprite = "player_girl"
	// } else {
	// 	if (!socket.isClosed) {
	// 		return await socket.close(1000, `Invalid character selected`).catch(console.error);
	// 	}
	// 	//close the socket 
	// 	// socket.close(`No player selected`)

	// }
	// if (sprite !== "") {
	// 	const player = new Player(socketid,clientid, {
	// 		position: pos,
	// 		name: message.data.name,
	// 		sprite: sprite
	// 	})
	// 	socket.send(JSON.stringify({
	// 		type: "init",
	// 		data: {
	// 			id: clientid,
	// 			data: player,
	// 			players: Array.from(Engine.players.values()),
	// 		}
	// 	}))
	// 	Engine.players.set(socketid, player)
	// 	//Queue the new player spawn event
	
	// 	Engine.events.set(`${Math.round(performance.now())}::spawn`, function (this: any) : void {
	// 		this.type = 'spawn';
	// 		Engine.sendToAll(socket, {
	// 			type: 'newplayer',
	// 			config: this,
	// 			data: {player:player}
	// 		})
	// 	})
	// }
	// return false
}

Engine.broadcast = function (data: any) {
	for (const [index, sock] of Engine.socks) {
		sock.send(data);
	}
}

//Create a function that sends a Websocket message to all except the sender
// Engine.sendToAll = function (sender: WebSocket, data: any) {
// 	for (const [index, sock] of Engine.socks) {
// 		if (sock !== sender) {
// 			sock.send(JSON.stringify(data));
// 		}
// 	}
// }
Engine.circles = new Set < any > ();

async function handleWs(sock: WebSocket, Engine: any) {
	const sockid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	console.log(`New Socket ID: ${sockid}`)
	Engine.socks.set(sockid, sock);
	try {
		for await (const ev of sock) {
			if (typeof ev === "string") {
				const message = JSON.parse(ev);
				// console.log(message)
				// console.log(Engine.canvas.toBuffer())
				Engine.circles.add(message)
				Engine.broadcast(Engine.canvas.toBuffer())
			} else if (isWebSocketCloseEvent(ev)) {
				const { code, reason } = ev;
				if (!sock.isClosed) {
					await sock.close(1000).catch(console.error);
				}
			}
		}
	} catch (err) {
		console.error(`\nFailed to receive frame: ${err}`);
	}
}
const FPS = 60;
const Game = {
	now: 0,
	then: 0,
	delta: 0,
	fps: FPS,
	interval: 1000 / FPS,
	deltatime: 0
} as any;
Game.update =  function () {
	//Draw all of the circles
	for (const circle of Engine.circles) {
		Engine.CTX.beginPath();
		Engine.CTX.arc(circle.x, circle.y, 5, 0, Math.PI * 2);
		Engine.CTX.fill();
	}
	// Engine.broadcast(Engine.canvas.toBuffer())
}
Engine.loop = () => {
	Engine.requestAnimationFrame(Engine.loop);
	Game.now = performance.now();
	Game.delta = Game.now - Game.then;
	Game.deltaTime = Game.delta / 1000;
	if(Game.delta > Game.interval) {
		//Clear the canvas and redraw 
		Engine.CTX.save();
		Engine.CTX.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
		//Draw a circle in a random position in the canvas

		Game.update();
		
		Engine.CTX.restore();
		//Update the game
		const text = `FPS: ${Math.round(1 / Game.deltaTime)}`;
		Deno.stdout.writeSync(new TextEncoder().encode(`\r${text}`));
		Game.then = Game.now - (Game.delta % Game.interval);
	}
}

Engine.start = async (port: number) => {
	Engine.Game = Game;
	Game.now = performance.now();
	Game.then = Game.now;
	Engine.canvas = createCanvas(1920, 961);
	Engine.CTX = Engine.canvas.getContext("2d");


	
	// await Deno.writeFile("image.png", canvas.toBuffer());
	await Engine.loop();

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

await Engine.start(8080)
