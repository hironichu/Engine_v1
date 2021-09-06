export default function Camera(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight) {
	//Function that manage [CAMERA] Objects within the Game
	const AXIS = {
		NONE: 1,
		HORIZONTAL: 2,
		VERTICAL: 3,
		BOTH: 4
	};
	this.xView = xView || 0;
	this.yView = yView || 0;
	this.xDeadZone = 0;
	this.yDeadZone = 0;
	this.wView = viewportWidth;
	this.hView = viewportHeight;
	this.axis = AXIS.BOTH;
	this.followed = null;
	this.viewportRect = new Engine.Rectangle(this.xView, this.yView, this.wView, this.hView);
	this.worldRect = new Engine.Rectangle(0, 0, worldWidth, worldHeight);

	this.follow = function(gameObject, xDeadZone, yDeadZone) {
		this.followed = gameObject;
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	}
	this.update = function() {

		if (this.followed != null) {
			if (this.axis == AXIS.HORIZONTAL || this.axis === AXIS.BOTH) {
				if (this.followed.position.x - this.xView + this.xDeadZone > this.wView)
					this.xView = this.followed.position.x - (this.wView - this.xDeadZone);
				else if (this.followed.position.x - this.xDeadZone < this.xView)
					this.xView = this.followed.position.x - this.xDeadZone;
			}
			if (this.axis == AXIS.VERTICAL || this.axis === AXIS.BOTH) {
				if (this.followed.position.y - this.yView + this.yDeadZone > this.hView)
					this.yView = this.followed.position.y - (this.hView - this.yDeadZone);
				else if (this.followed.position.y - this.yDeadZone < this.yView)
					this.yView = this.followed.position.y - this.yDeadZone;
			}
		}
		this.viewportRect.set(this.xView, this.yView);

		if (!this.viewportRect.within(this.worldRect)) {
			if (this.viewportRect.left < this.worldRect.left)
				this.xView = this.worldRect.left;
			if (this.viewportRect.top < this.worldRect.top)
				this.yView = this.worldRect.top;
			if (this.viewportRect.right > this.worldRect.right)
				this.xView = this.worldRect.right - this.wView;
			if (this.viewportRect.bottom > this.worldRect.bottom)
				this.yView = this.worldRect.bottom - this.hView;
	
		}
	}
}