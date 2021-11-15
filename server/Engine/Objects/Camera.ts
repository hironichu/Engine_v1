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
	//Create a method that check if a Camera is within this Camera
	public within (Camera: Camera) {
		return (this.viewportRect.within(Camera.viewportRect));
	}
}