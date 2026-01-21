
import React from 'react';
import { MushroomRoom, UserProfile } from '../types';
import { ATTRIBUTE_COLORS } from '../constants';
import { formatFriendCode } from '../utils/helpers';
import { Users, Info, ChevronRight, Sword, ShieldCheck } from 'lucide-react';

interface MyPostsProps {
  rooms: MushroomRoom[];
  user: UserProfile;
  onViewDetail: (roomId: string) => void;
}

const MyPosts: React.FC<MyPostsProps> = ({ rooms, user, onViewDetail }) => {
  const hostedRooms = rooms.filter(r => r.host.friendCode === user.friendCode);
  const joinedRooms = rooms.filter(r => 
    r.host.friendCode !== user.friendCode && 
    r.participants.some(p => p.friendCode === user.friendCode)
  );

  const renderRoomList = (roomList: MushroomRoom[], title: string, icon: React.ReactNode) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="p-1.5 bg-[#8BC34A]/10 text-[#8BC34A] rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-black text-gray-800">{title} ({roomList.length})</h3>
      </div>
      
      {roomList.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">目前沒有任何紀錄</p>
        </div>
      ) : (
        roomList.map(room => (
          <button 
            key={room.id} 
            onClick={() => onViewDetail(room.id)}
            className="w-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all active:scale-[0.98] text-left group"
          >
            <div className="p-4 flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                <img 
                  src={room.imageUrl || `https://picsum.photos/seed/${room.id}/200/200`} 
                  className="w-full h-full object-cover" 
                  alt="Mushroom" 
                />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {room.attribute && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${ATTRIBUTE_COLORS[room.attribute]}`}>
                      {room.attribute}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-gray-400">{room.category}</span>
                </div>
                <h4 className="font-bold text-gray-800 leading-tight">
                  {room.host.nickname === user.nickname ? '正在召集隊友...' : `${room.host.nickname} 的邀請`}
                </h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-[#8BC34A]" />
                    {room.participants.length}/{room.slots}
                  </span>
                  <span className="font-mono">{formatFriendCode(room.host.friendCode)}</span>
                </div>
              </div>

              <div className="text-gray-300 group-hover:text-[#8BC34A] transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-gray-800">我的戰鬥紀錄</h2>
        <p className="text-xs text-gray-500">管理你發起或參與的蘑菇遠征</p>
      </div>

      <div className="space-y-8">
        {renderRoomList(hostedRooms, '我發起的', <Sword size={18} />)}
        {renderRoomList(joinedRooms, '我加入的', <ShieldCheck size={18} />)}
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0" />
        <p className="text-[11px] text-blue-700 leading-relaxed">
          提示：貼文將在發佈 24 小時後自動從列表中移除。如戰鬥已結束，身為發起人的你可以手動刪除貼文以保持列表整潔。
        </p>
      </div>
    </div>
  );
};

export default MyPosts;
