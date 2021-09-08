const time = performance.now();
window.onload  = async () => {
	window.loadedtime = performance.now() - time;
	console.info(`Window loaded [${Math.round(window.loadedtime)}ms]`)
	document.addEventListener('zoom' , (evt) => {
		evt.preventDefault();
		evt.stopPropagation();
	}, {passive: false, capture: true});
	document.addEventListener('wheel' , (evt) => {
		if(evt.ctrlKey) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, {passive: false, capture: true});
	document.addEventListener('keydown' , (evt) => {
		if(evt.ctrlKey) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	}, {passive: false, capture: true});

	const Engine = await (await import('./Engine.js')).default;
	window.Engine = Engine;
	console.log(`App loaded [${Math.round(performance.now() - time)}ms]`);
	await window.Engine.init();
	await window.Engine.start();
}
