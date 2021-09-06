export default class Vector {
	x: number
	y: number
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	add (vector : Vector)  {
		this.x += vector.x;
		this.y += vector.y;
		return this
	}
	set (vector: Vector) {
		this.x = vector.x;
		this.y = vector.y;
		return this
	}
	subtract (vector: Vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		return this
	}
	scaler (scaler: number)  {
		this.x *= scaler;
		this.y *= scaler;
		return this
	}
	multiply (vector: 	Vector)  {
		this.x *= vector.x;
		this.y *= vector.y;
		return this
	}
	dot(vector: Vector) {
		return this.x * vector.x + this.y * vector.y;
	}
	clone () {
		return new Vector(this.x, this.y);
	}
	toString () {
		return "(" + this.x + "," + this.y + ")";
	}
	divide (scaler: number) {
		this.x /= scaler;
		this.y /= scaler;
		return this
	}
	invertY  () {
		this.y *= -1;
		return this
	}
	invertX  (){
		this.x *= -1;
		return this
	}
	invert  () {
		this.invertX();
		this.invertY();
		return this
	}
	length  () {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	normalize ()  {
		var length = this.length();
		this.x /= length;
		this.y /= length;
		return this
	}
}