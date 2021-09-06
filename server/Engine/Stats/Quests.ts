export enum QuestType {
	None = 0,
	Normal = 1,
	Event = 2,
	Daily = 3,
	Weekly = 4,
	Monthly = 5,
	Seasonal = 6,
}

export interface Quest {
	id: string;
	name: string;
	description: string;
	reward: number;
	questType: QuestType;
}