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
	this.setViewport = function(xView, yView, wView, hView) {
		this.xView = xView;
		this.yView = yView;
		this.wView = wView;
		this.hView = hView;
	}
	this.update = function() {

		if (this.followed != null) {
			let x = this.followed.position.x + this.followed.width / 2 - this.wView / 2 + this.followed.velocity.x ;
			let y = this.followed.position.y + this.followed.height / 2 - this.hView / 2 + this.followed.velocity.y;
			//Make the camera follow with a smooth movement (lerp)
			this.xView += (x - this.xView) * 1;
			this.yView += (y - this.yView) * 1;

			if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH) {
				if (this.xView < this.worldRect.x) {
					this.xView = this.worldRect.x;
				}
				if (this.xView + this.wView > this.worldRect.x + this.worldRect.width) {
					this.xView = this.worldRect.x + this.worldRect.width - this.wView;
				}
			}
			if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {
				if (this.yView < this.worldRect.y) {
					this.yView = this.worldRect.y;
				}
				if (this.yView + this.hView > this.worldRect.y + this.worldRect.height) {
					this.yView = this.worldRect.y + this.worldRect.height - this.hView;
				}
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