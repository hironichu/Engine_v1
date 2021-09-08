export const Physics = function (object) {
	this.type = 'solid' || object.type;
	this.mass = 1 || object.mass;
	this.box = new Engine.Rectangle(0, 0, 0, 0);
}