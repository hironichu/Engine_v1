export default function Vector(x,y) {
		this.x = x;
		this.y = y;
	this.add = (vector) =>  {
		this.x += vector.x;
		this.y += vector.y;
		return this
	}
	this.set = (vector) => {
		this.x = vector.x;
		this.y = vector.y;
		return this
	}
	this.subtract = (vector) => {
		this.x -= vector.x;
		this.y -= vector.y;
		return this
	}
	this.scaler = (scaler) => {
		this.x *= scaler;
		this.y *= scaler;
		return this
	}
	this.multiply = (vector) => {
		this.x *= vector.x;
		this.y *= vector.y;
		return this
	}
	this.dot = (vector) => {
		return this.x * vector.x + this.y * vector.y;
	}
	this.clone = () => {
		return new Vector(this.x, this.y);
	}

	this.toString = () => {
		return "(" + this.x + "," + this.y + ")";
	}
	this.divide=  (scaler)=>  {
		this.x /= scaler;
		this.y /= scaler;
		return this
	}
	this.invertY=  () => {
		this.y *= -1;
		return this
	}
	this.invertX=  ()=>  {
		this.x *= -1;
		return this
	}
	this.invert=  ()=>  {
		this.invertX();
		this.invertY();
		return this
	}
	this.length=  ()=>  {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	this.normalize =  ()=>  {
		var length = this.length();
		this.x /= length;
		this.y /= length;
		return this
	}
}