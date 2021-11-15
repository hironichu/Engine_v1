import { listenAndServe} from "https://deno.land/std@0.111.0/http/server.ts";
import { exists, existsSync, } from "https://deno.land/std@0.111.0/fs/mod.ts";
import Canvas from 'https://deno.land/x/canvas/mod.ts'
// import Players from "./Players.ts";

async function handleConn(conn: Deno.Conn) {
	const httpConn = Deno.serveHttp(conn);
	for await (const e of httpConn) {
		e.respondWith(handleWs(e.request));
	}
}
function handleWs(req: Request) {
	if (req.headers.get("upgrade") != "websocket") {
		return new Response("not trying to upgrade as websocket.");
	}
	const { socket, response } = Deno.upgradeWebSocket(req);
	socket.onopen = () => console.log("socket opened");
	socket.onmessage = (e:any) => {
		console.log(e)
		console.log("socket message:", e.data);
		socket.send(new Date().toString());
	};
	socket.onerror = (e: any) => console.log("socket errored:", e);
	socket.onclose = () => console.log("socket closed");
	return response;
}
listenAndServe({port: 8000 }, async (req: Request ) => {

	if (req.url !== "/" && !req.url.startsWith("/static/") && !req.url.startsWith("/favicon.ico")) {
		const pathopt = req.url.substring(1).split('/')
		if (pathopt.length > 0) {
			const path = pathopt[0]
			const file = pathopt.slice(1).join('/')
			switch (path) {
				case "map":
					if (file.endsWith("/json")){
						const fileparsed = file.substring(0, file.length - 5)
						if (existsSync(`./map/${fileparsed}/manifest.json`) ){
							const mapManifest = Deno.readTextFileSync(`./map/${fileparsed}/manifest.json`)
							try {
								const mapManifestJson = JSON.parse(mapManifest)
								return  req.respond({headers: new Headers({'Content-Type': 'application/json' }),status:200, body: JSON.stringify(mapManifestJson, null, 2)});
							} catch (e) {
								return  req.respond({headers: new Headers({'Content-Type': 'text/plain' }),status:400, body: e.toString()});
							}
						} else {
							return await req.respond({headers: new Headers({'Content-Type': 'text/html' }),status: 404, body: `<h1>map not found</h1>`});
						}
					}else if (file.endsWith("/data")){
						const fileparsed = file.substring(0, file.length - 5)
						if (existsSync(`./map/${fileparsed}/manifest.json`) ){
							const mapManifest = Deno.readTextFileSync(`./map/${fileparsed}/manifest.json`)
							try {
								const mapManifestJson = JSON.parse(mapManifest)
								const datafile = mapManifestJson.file
								if (existsSync(`./map/${fileparsed}/${datafile}`) ){
									const data = Deno.readTextFileSync(`./map/${fileparsed}/${datafile}`)
									return  req.respond({headers: new Headers({'Content-Type': 'application/json' }),status:200, body: data});
								}
							} catch (e) {
								return  req.respond({headers: new Headers({'Content-Type': 'text/plain' }),status:400, body: e.toString()});
							}
						} else {
							return await req.respond({headers: new Headers({'Content-Type': 'text/html' }),status: 404, body: `<h1>map not found</h1>`});
						}
				    } else if (file.endsWith('/gen')) {
						console.log('ko')
						const fileparsed = file.substring(0, file.length - 5)
						if (existsSync(`./map/${fileparsed}/manifest.json`) ){
							const mapManifest = Deno.readTextFileSync(`./map/${fileparsed}/manifest.json`)
							try {
								const mapManifestJson = JSON.parse(mapManifest)
								const datafile = mapManifestJson.file
								if (existsSync(`./map/${fileparsed}/${datafile}`) ){
									const data = Deno.readTextFileSync(`./map/${fileparsed}/${datafile}`)
									return  req.respond({headers: new Headers({'Content-Type': 'application/json' }),status:200, body: data});
								}
							} catch (e) {
								return  req.respond({headers: new Headers({'Content-Type': 'text/plain' }),status:400, body: e.toString()});
							}
							// return await req.respond({headers: new Headers({'Content-Type': 'text/html' }),status: 200, body: `<h1>Generating Map Chunk</h1>`});
						}
					} else {
						if (existsSync(`./map/${file}/manifest.json`) ){
							const mapManifest = Deno.readTextFileSync(`./map/${file}/manifest.json`)
							const mapManifestJson = JSON.parse(mapManifest)
							await req.respond({headers: new Headers({'Content-Type': 'text/html' }), body: `<h1>Map Name : ${mapManifestJson.name}</h1>`});
						} else {
							return await req.respond({headers: new Headers({'Content-Type': 'text/html' }),status: 404, body: `<h1>map not found</h1>`});
						}
					}
				break;
				case "chunk":
					if (file !== ''){
						const chunkid = file.substring(1).split('/')
						console.log(chunkid);
						return await req.respond({headers: new Headers({'Content-Type': 'text/html' }), body: `<h1>Chunk id : ${chunkid[0]}</h1>`});
					}
				break;
				default:
					return req.respond({headers: new Headers({'Content-Type': 'text/html' }), body: `<h1>nothing here</h1>`});
			}
		} else {
			return await req.respond({headers: new Headers({'Content-Type': 'text/html' }),status: 404, body: `<h1>404</h1>`});
		}
	} else {
		req.respond({headers: new Headers({'Content-Type': 'text/html' }), body: `<h1>Hello World</h1>`});
	}
});
const websocket = Deno.listen({ port: 8001 });
console.log("HTTP : http://localhost:8000/");
console.log("WSS : ws://localhost:8001");
for await (const conn of websocket) {
	handleConn(conn);
}

