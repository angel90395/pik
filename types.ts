
export enum MushroomCategory {
  HUGE = '巨大',
  EVENT = '一般活動',
  NORMAL = '一般',
  SMALL = '小',
  NORMAL_ATTR = '一般屬性',
  LARGE_ATTR = '大屬性'
}

export enum MushroomAttribute {
  ELECTRIC = '電',
  WATER = '水',
  CRYSTAL = '水晶',
  FIRE = '火',
  POISON = '毒',
  BLUE = '藍',
  PINK = '粉',
  YELLOW = '黃',
  RED = '紅',
  ICE = '冰',
  WHITE = '白'
}

export interface Participant {
  id: string;
  nickname: string;
  friendCode: string;
}

export interface MushroomRoom {
  id: string;
  host: Participant;
  category: MushroomCategory;
  attribute?: MushroomAttribute;
  slots: number;
  participants: Participant[];
  imageUrl?: string;
  startTime: string; // ISO string
  createdAt: string;
  status: 'active' | 'full' | 'closed';
  minStrength?: number;
}

export interface UserProfile {
  nickname: string;
  friendCode: string;
  isAdmin?: boolean;
}

export type AppView = 'home' | 'create' | 'board' | 'roomDetail' | 'myPosts';
