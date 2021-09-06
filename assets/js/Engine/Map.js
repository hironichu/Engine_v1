export default function Map(mapdata){
	//Function that manage [MAP] Objects within the Game
	this.width = mapdata.width;
	this.height = mapdata.height;
	this.data = mapdata
	this.draw = () => {
		var sx, sy, dx, dy;
		var sWidth, sHeight, dWidth, dHeight;
		sx = Engine.Game.camera.xView;
		sy = Engine.Game.camera.yView;
		sWidth = Engine.CTX[1].canvas.width;
		sHeight = Engine.CTX[1].canvas.height;

		if (this.data.width - sx < sWidth) {
			sWidth = this.image.width - sx;
		}
		if (this.data.height - sy < sHeight) {
			sHeight = this.data.height - sy;
		}
		dx = 0;
		dy = 0;
		dWidth = sWidth;
		dHeight = sHeight;
		Engine.CTX[1].drawImage(this.data.map,  sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	}
}