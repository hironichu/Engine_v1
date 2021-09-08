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
	delta (vector: Vector) {
		this.x = vector.x - this.x;
		this.y = vector.y - this.y;
		return this
	}
	moveTowards (vector: Vector, distance: number) {
		let delta = vector.subtract(this)
		let length = delta.length()
		if (length < distance) {
			this.set(vector)
			return this
		}
		delta.normalize()
		delta.scaler(distance)
		this.add(delta)
		return this
	}
	direction (vector: Vector) {
		let delta = vector.subtract(this)
		delta.normalize()
		return delta
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
	clamp (min: number, max: number) {
		this.x = Math.min(Math.max(this.x, min), max);
		this.y = Math.min(Math.max(this.y, min), max);
		return this
	}
	lerp (vector: Vector, t: number) {
		this.x += (vector.x - this.x) * t;
		this.y += (vector.y - this.y) * t;
		return this
	}
	lerpunclamped (vector: Vector, t: number) {
		this.x += (vector.x - this.x) * t;
		this.y += (vector.y - this.y) * t;
		this.x = Math.min(Math.max(this.x, -1), 1);
		this.y = Math.min(Math.max(this.y, -1), 1);
		return this
	}
	rotate (angle: number) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var x = this.x;
		var y = this.y;
		this.x = x * cos - y * sin;
		this.y = x * sin + y * cos;
		return this
	}
	angle (vector: Vector) {
		return Math.atan2(vector.y - this.y, vector.x - this.x);
	}
	distance (vector: Vector) {
		var dx = vector.x - this.x;
		var dy = vector.y - this.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}