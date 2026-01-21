
import { MushroomAttribute } from 'types';

export const ATTRIBUTE_COLORS: Record<MushroomAttribute, string> = {
  [MushroomAttribute.ELECTRIC]: 'bg-yellow-400 text-yellow-900',
  [MushroomAttribute.WATER]: 'bg-blue-500 text-white',
  [MushroomAttribute.CRYSTAL]: 'bg-slate-300 text-slate-800',
  [MushroomAttribute.FIRE]: 'bg-red-600 text-white',
  [MushroomAttribute.POISON]: 'bg-purple-600 text-white',
  [MushroomAttribute.BLUE]: 'bg-blue-600 text-white',
  [MushroomAttribute.PINK]: 'bg-pink-400 text-white',
  [MushroomAttribute.YELLOW]: 'bg-yellow-300 text-yellow-800',
  [MushroomAttribute.RED]: 'bg-red-500 text-white',
  [MushroomAttribute.ICE]: 'bg-cyan-200 text-cyan-900',
  [MushroomAttribute.WHITE]: 'bg-white border border-gray-200 text-gray-800'
};

export const STORAGE_KEY_USER = 'pikmin_army_user';
export const STORAGE_KEY_ROOMS = 'pikmin_army_rooms';

// 管理員專用代碼
export const MASTER_ADMIN_CODE = 'lloginatw';
