//Wait till the window is loaded and create a Websocket connection
window.onload = function () {

	var ws = new WebSocket("ws://localhost:8080");
	//Create a Canvas element and append it to the body
	var canvas = document.createElement("canvas");
	document.body.appendChild(canvas);
	//Get the context of the canvas
	var ctx = canvas.getContext("2d");
	//Set the canvas size to the window size
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ws.onopen = function (event) {
		console.log("Connected to server");
	};
	ws.onmessage = function (event) {
		//Convert the event.data Blob to an image and display it
		//clear the canvas
		ctx.save();
		// ctx.clearRect(0, 0, canvas.width, canvas.height);
		var img = document.createElement("img");
		img.src = window.URL.createObjectURL(event.data);
		// img.onload = function () {
			//add the image to the body
			// document.body.appendChild(img);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		// }
		ctx.restore();

		// console.log("Received: " + event.data);
	};
	ws.onclose = function (event) {
		console.log(event)
		console.log("Connection closed");
	};
	//On click send a message to the server
	document.body.onclick = function () {
		//send the position of the mouse in the canvas
		var x = event.clientX;
		var y = event.clientY;
		var rect = canvas.getBoundingClientRect();
		//x -= rect.left;
		//y -= rect.top;
		ws.send(JSON.stringify({x:x, y:y}));
	}
};