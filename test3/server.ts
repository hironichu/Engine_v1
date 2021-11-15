import { listenAndServe } from "https://deno.land/std@0.113.0/http/server.ts";
import {
	Status,
	STATUS_TEXT,
  } from "https://deno.land/std@0.113.0/http/http_status.ts";
  
//Create a reponse handler that return a new Reponse with simple parameters such as body statuscode and headers
const respond = async (reqEv: Deno.RequestEvent, body: string, statusCode?: number, headers?: Headers) => {
	console.log(req)
	await reqEv.respondWith(new Response(
			  body || null,
			  {
				"status" : statusCode || 200,
				"headers": headers || new Headers()}
	  ))
}


async function handle(conn: Deno.Conn) {
	const httpConn = Deno.serveHttp(conn);
	for await (const request of httpConn) {
	  await respond(request, "Hello World!");
	}
}

console.log("http://localhost:8080/");
const server = Deno.listen({ port: 8080 });
  
for await (const conn of server) {
  handle(conn);
}
