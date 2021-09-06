import Engine from './server/Server.ts';

if (import.meta.main) {
	const port = Deno.args[0] || "8080";
	console.info(`[DEBUG] Server running`);
	await Engine.start(port);
}