
import { createClient } from '@supabase/supabase-js';
import { MushroomRoom, Participant } from '../types';

const SUPABASE_URL = 'https://wofbnytcwqwdwobgfero.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_k5gIYJGuLFmzedAEV6INRA_lhKScMtq'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const syncRoomToGlobal = async (room: MushroomRoom): Promise<boolean> => {
  try {
    const payload = {
      id: room.id,
      host_nickname: room.host.nickname,
      host_friend_code: room.host.friendCode,
      category: room.category,
      attribute: room.attribute,
      slots: room.slots,
      image_url: room.imageUrl,
      participants: room.participants,
      start_time: room.startTime,
      created_at: room.createdAt,
      status: room.status,
      min_strength: room.minStrength
    };

    const { error } = await supabase
      .from('mushroom_rooms')
      .upsert(payload);
    
    return !error;
  } catch (e) {
    return false;
  }
};

/**
 * 🚀 使用 RPC 函式解決「多人搶位」的 race condition
 */
export const joinRoomGlobal = async (roomId: string, participant: Participant): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('join_mushroom_room', {
      target_room_id: roomId,
      new_participant: participant
    });
    
    if (error) {
      console.error("❌ [加入失敗]：", error.message);
      return false;
    }
    return data as boolean;
  } catch (e) {
    return false;
  }
};

export const leaveRoomGlobal = async (roomId: string, friendCode: string): Promise<boolean> => {
  try {
    const { data: currentData } = await supabase
      .from('mushroom_rooms')
      .select('participants')
      .eq('id', roomId)
      .single();
      
    if (!currentData) return false;
    
    const updatedParticipants = (currentData.participants || []).filter((p: Participant) => p.friendCode !== friendCode);
    
    const { error } = await supabase
      .from('mushroom_rooms')
      .update({ participants: updatedParticipants })
      .eq('id', roomId);
      
    return !error;
  } catch (e) {
    return false;
  }
};

export const deleteRoomGlobal = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('mushroom_rooms')
      .delete()
      .eq('id', roomId);
    return !error;
  } catch (e) {
    return false;
  }
};

export const fetchGlobalRooms = async (): Promise<MushroomRoom[]> => {
  try {
    const { data, error } = await supabase
      .from('mushroom_rooms')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(item => ({
      id: item.id,
      host: { id: 'remote', nickname: item.host_nickname, friendCode: item.host_friend_code },
      category: item.category,
      attribute: item.attribute,
      slots: item.slots,
      imageUrl: item.image_url,
      participants: item.participants || [],
      startTime: item.start_time,
      createdAt: item.created_at,
      status: item.status,
      minStrength: item.min_strength
    }));
  } catch (e) {
    return [];
  }
};
