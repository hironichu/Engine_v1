export default function Entity (entitydata) {
	//Function that manage [ENTITY] Objects within the Game
	console.log(entitydata)
	this.update = function() {

	}
	this.draw = function() {
	
	}
	this.colided = function(ColisionOrigin,x,y, step) {
		
	}
	this.changeLayer = function(layer) {
		//Change the layer of the object
		this.layer = layer;
	}
}