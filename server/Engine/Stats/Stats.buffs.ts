export interface Effect {
	name: string;
	description: string;
	duration: number;
	icon: string;
	stats: unknown;
}
export interface Buff {
	id: number;
	name: string;
	description: string;
	icon: string;
	duration: number;
	stacks: number;
	maxStacks: number;
	maxDuration: number;
	data: Effect
}

export interface Debuff {
	id: number;
	name: string;
	description: string;
	icon: string;
	duration: number;
	stacks: number;
	maxStacks: number;
	maxDuration: number;
	data: Effect
}