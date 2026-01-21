
import React from 'react';
import { MushroomRoom, UserProfile, Participant } from '../types';
import { ATTRIBUTE_COLORS } from '../constants';
import { copyToClipboard, formatFriendCode } from '../utils/helpers';
import { Copy, Users, CheckCircle, Clock, Zap, RefreshCcw, Ghost, Sword } from 'lucide-react';

interface BulletinBoardProps {
  rooms: MushroomRoom[];
  user: UserProfile | null;
  onJoin: (roomId: string, participant: Participant) => void;
  isSyncing: boolean;
  onViewDetail: (roomId: string) => void;
}

const BulletinBoard: React.FC<BulletinBoardProps> = ({ rooms, user, onViewDetail, isSyncing }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    copyToClipboard(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#1A1A1A] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden border border-white/5">
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#8BC34A]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${rooms.length > 0 ? 'bg-[#8BC34A] animate-pulse' : 'bg-gray-600'}`}></div>
              <h3 className="text-xl font-black italic">全球即時戰區</h3>
            </div>
            {isSyncing && <RefreshCcw size={16} className="animate-spin text-white/50" />}
          </div>
          <p className="text-xs text-white/60 font-medium leading-relaxed">
            正在同步全球陸軍邀請。如果您沒看到任何貼文，可能是表格尚未建立或暫時沒有人發起邀請。
          </p>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
            <Ghost size={48} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800">目前空蕩蕩的...</h4>
            <p className="text-xs text-gray-400 max-w-[200px]">
              趕快去「首頁」發起第一則邀請吧！或者是等待其他訓練家加入。
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              user={user} 
              onCopy={handleCopy} 
              copiedId={copiedId} 
              onViewDetail={onViewDetail} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RoomCard: React.FC<{ 
  room: MushroomRoom, 
  user: UserProfile | null, 
  onCopy: any, 
  copiedId: string | null, 
  onViewDetail: any 
}> = ({ room, user, onCopy, copiedId, onViewDetail }) => {
  const isMyRoom = user?.friendCode === room.host.friendCode;

  return (
    <div className={`bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm transition-all active:scale-[0.98]`}>
      <div className="p-4 flex gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 relative border border-gray-50">
          <img src={room.imageUrl || `https://picsum.photos/seed/${room.id}/200/200`} className="w-full h-full object-cover" alt="Mushroom" />
          <div className={`absolute top-1 left-1 p-1 rounded-lg shadow-sm bg-[#8BC34A] text-white`}>
            <Zap size={10} />
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {room.attribute && <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${ATTRIBUTE_COLORS[room.attribute]}`}>{room.attribute}</span>}
              <span className="text-[10px] font-black text-gray-400 uppercase">{room.category}蘑菇</span>
            </div>
            <div className="flex gap-1">
              {isMyRoom && <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-[#8BC34A] text-white uppercase">我的</span>}
              <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-green-50 text-green-600 flex items-center gap-0.5">
                <CheckCircle size={8} /> 真實
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="font-black text-gray-800 text-base">{room.host.nickname}</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase">
                <Clock size={10} /> 
                <span>{new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {room.minStrength && (
                <div className="flex items-center gap-1 text-[10px] text-red-500 font-black">
                  <Sword size={10} />
                  <span>戰力 {room.minStrength}+</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onCopy(room.host.friendCode, room.id); }}
                className={`flex items-center gap-1 text-[10px] font-mono font-black px-2 py-1 rounded-lg transition-all ${copiedId === room.id ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {copiedId === room.id ? <CheckCircle size={10} /> : <Copy size={10} />}
                {formatFriendCode(room.host.friendCode)}
              </button>
            </div>

            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <Users size={12} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-600">{room.participants.length}/{room.slots}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button 
          onClick={() => onViewDetail(room.id)}
          className={`w-full py-3 rounded-xl font-black text-xs shadow-sm transition-all active:scale-95 bg-gray-900 text-white hover:opacity-90`}
        >
          查看詳情並加入
        </button>
      </div>
    </div>
  );
};

export default BulletinBoard;
