import Engine from './server/Server.ts';

if (import.meta.main) {
	const port = "8080";
	console.info(`[DEBUG] Server running`);
	await Engine.start(port);
}