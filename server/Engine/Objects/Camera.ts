import Rectangle from '../Maths/Rectangles.ts';
import {Player} from './Player.ts';

const AXIS = {
	NONE: 1,
	HORIZONTAL: 2,
	VERTICAL: 3,
	BOTH: 4
};
export default class Camera {
	//Function that manage [CAMERA] Objects within the Game
	public xView: number;
	public yView: number;
	public xDeadZone: number;
	public yDeadZone: number;
	public wView: number;
	public hView: number;
	public worldWidth: number;
	public worldHeight: number;
	public axis: number;
	public followed: Player | null;
	public viewportRect: Rectangle;
	public worldRect: Rectangle;
	public map: string;
	constructor (xView: number, yView:number , viewportWidth:number, viewportHeight:number, worldWidth:number, worldHeight:number, map: string) {
		this.xView = xView || 0;
		this.yView = yView || 0;
		this.xDeadZone = 0;
		this.yDeadZone = 0;
		this.wView = viewportWidth;
		this.hView = viewportHeight;
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		this.axis = AXIS.BOTH;
		this.followed = null;
		this.map = map;
		this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);
		this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);
	}

	public follow (PlayerObject: Player, xDeadZone: number, yDeadZone: number) {
		this.followed = PlayerObject;
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	}
	public update () {

		if (this.followed != null) {
			let x = this.followed.position.x + 64 / 2 - this.wView / 2 + this.followed.velocity.x;
			let y = this.followed.position.y + 64 / 2 - this.hView / 2 + this.followed.velocity.y;
			//Make the camera follow with a smooth movement (lerp)
			this.xView += (x - this.xView);
			this.yView += (y - this.yView);

			if (this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH) {
				if (this.xView < this.worldRect.width) {
					this.xView = this.worldRect.width;
				}
				if (this.xView + this.wView > this.worldRect.width + this.worldRect.width) {
					this.xView = this.worldRect.width + this.worldRect.width - this.wView;
				}
			}
			if (this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH) {
				if (this.yView < this.worldRect.height) {
					this.yView = this.worldRect.height;
				}
				if (this.yView + this.hView > this.worldRect.height + this.worldRect.height) {
					this.yView = this.worldRect.height + this.worldRect.height - this.hView;
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
	//Create a method that check if a Camera is within this Camera
	public within (Camera: Camera) {
		return (this.viewportRect.within(Camera.viewportRect));
	}
}