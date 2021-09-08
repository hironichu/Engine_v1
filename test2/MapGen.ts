const process: Worker = self as unknown as Worker;






process.onmessage = (e: MessageEvent) => {
	//Check the Type of the Message
	if (e.data.type === "init") {

}
process.postMessage({
	type: 'init',
	data: {
		width: 100,
		height: 100,
		seed: Math.random()
	}
});
