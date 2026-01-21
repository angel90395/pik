
import { MASTER_ADMIN_CODE } from '../constants';
import { MushroomRoom } from '../types';

export const formatFriendCode = (code: string): string => {
  if (/[a-zA-Z]/.test(code)) {
    return code;
  }
  
  const cleaned = code.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return cleaned;
};

export const isValidFriendCode = (code: string): boolean => {
  const cleaned = code.replace(/\s/g, '');
  if (cleaned === MASTER_ADMIN_CODE) return true;
  return /^\d{12}$/.test(cleaned);
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Encode a room object (minus the image for URL length limits) to a Base64 string
export const encodeRoomForUrl = (room: MushroomRoom): string => {
  const data = {
    h: room.host.nickname,
    c: room.host.friendCode,
    cat: room.category,
    a: room.attribute,
    s: room.slots,
    t: room.startTime,
    id: room.id
  };
  return btoa(encodeURIComponent(JSON.stringify(data)));
};

// Decode a room string from URL back into a Room object
export const decodeRoomFromUrl = (encoded: string): Partial<MushroomRoom> | null => {
  try {
    const data = JSON.parse(decodeURIComponent(atob(encoded)));
    return {
      id: data.id || `shared-${Math.random().toString(36).substring(2, 9)}`,
      host: { id: 'remote', nickname: data.h, friendCode: data.c },
      category: data.cat,
      attribute: data.a,
      slots: data.s,
      startTime: data.t,
      participants: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };
  } catch (e) {
    console.error("Failed to decode room:", e);
    return null;
  }
};
