
import React, { useState, useEffect } from 'react';
import { MushroomRoom, UserProfile } from '../types';
import { ATTRIBUTE_COLORS } from '../constants';
import { formatFriendCode, copyToClipboard } from '../utils/helpers';
import { getBattleTip } from '../services/geminiService';
import { Copy, Trash2, Sparkles, CheckCircle, UserMinus, Users, ChevronLeft, LogOut, Sword } from 'lucide-react';

interface RoomDetailProps {
  room: MushroomRoom;
  user: UserProfile | null;
  onJoinRequest: () => void;
  onLeaveRequest: () => void;
  onKickRequest: (friendCode: string) => void;
  onDelete: () => void;
  onBack: () => void;
}

const RoomDetail: React.FC<RoomDetailProps> = ({ room, user, onJoinRequest, onLeaveRequest, onKickRequest, onDelete, onBack }) => {
  const [tip, setTip] = useState<string>("正在獲取戰略建議...");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isHost = user?.friendCode === room.host.friendCode;
  const isAdmin = user?.isAdmin === true;
  const canDelete = isHost || isAdmin;
  
  const isJoined = room.participants.some(p => p.friendCode === user?.friendCode);
  const isFull = room.participants.length >= room.slots;

  useEffect(() => {
    const fetchTip = async () => {
      const battleTip = await getBattleTip(room.category, room.attribute);
      setTip(battleTip);
    };
    fetchTip();
  }, [room.category, room.attribute]);

  const handleCopy = (code: string, id: string) => {
    copyToClipboard(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-full pb-10">
      <div className="relative h-64 w-full bg-gray-200">
        <img 
          src={room.imageUrl || `https://picsum.photos/seed/${room.id}/600/400`} 
          className="w-full h-full object-cover" 
          alt="Mushroom" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white">
          <ChevronLeft size={24} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
          <div className="flex items-center gap-2">
            {room.attribute && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${ATTRIBUTE_COLORS[room.attribute]}`}>
                {room.attribute}屬性
              </span>
            )}
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-black uppercase backdrop-blur-sm">
              {room.category}蘑菇
            </span>
          </div>
          <h2 className="text-3xl font-black">{room.host.nickname} 的遠征隊</h2>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-white rounded-t-[40px] -mt-10 relative z-10 flex-1">
        {/* Requirement Box */}
        {room.minStrength && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Sword size={20} className="text-red-500" />
              </div>
              <p className="text-sm font-black text-red-600 tracking-wide uppercase">建議戰力門檻</p>
            </div>
            <span className="text-xl font-black text-red-600">{room.minStrength} <span className="text-xs font-bold opacity-60">UP</span></span>
          </div>
        )}

        {/* Gemini Tip Box */}
        <div className="bg-[#8BC34A]/5 p-5 rounded-3xl border border-[#8BC34A]/10 flex gap-4 items-start">
          <div className="p-2.5 bg-white rounded-2xl shadow-sm">
            <Sparkles size={24} className="text-[#8BC34A]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-[#689F38] uppercase tracking-widest">Gemini 戰略顧問</h4>
            <p className="text-sm text-gray-700 leading-relaxed font-bold italic">"{tip}"</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-gray-800 flex items-center gap-2 text-xl">
              遠征隊名單 
              <span className="text-sm font-bold text-gray-400">({room.participants.length}/{room.slots})</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-[#8BC34A]/10 border border-[#8BC34A]/20 rounded-3xl relative">
              <div className="w-12 h-12 rounded-2xl bg-[#8BC34A] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-100">
                {room.host.nickname.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-black text-gray-800">{room.host.nickname}</p>
                  <span className="text-[9px] bg-[#8BC34A] text-white px-2 py-0.5 rounded-full font-black uppercase">發起人</span>
                </div>
                <p className="text-xs text-gray-400 font-mono font-bold mt-0.5 tracking-wider">{formatFriendCode(room.host.friendCode)}</p>
              </div>
              <button 
                onClick={() => handleCopy(room.host.friendCode, 'host')}
                className={`p-3 rounded-2xl transition-all shadow-sm ${copiedId === 'host' ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
              >
                {copiedId === 'host' ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>

            {room.participants.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-3xl animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-400 font-black text-xl border border-gray-100">
                  {p.nickname.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-800">{p.nickname}</p>
                    {user?.friendCode === p.friendCode && <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-black">您</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-mono font-bold mt-0.5 tracking-wider">{formatFriendCode(p.friendCode)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isHost && (
                    <button 
                      onClick={() => onKickRequest(p.friendCode)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"
                      title="踢除隊員"
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleCopy(p.friendCode, p.id)}
                    className={`p-3 rounded-2xl transition-all shadow-sm ${copiedId === p.id ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
                  >
                    {copiedId === p.id ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, room.slots - room.participants.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-4 p-4 border border-dashed border-gray-200 rounded-3xl opacity-50">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                  <Users size={20} />
                </div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">等待隊友加入...</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col gap-3">
          {!isHost && !isJoined && !isFull && (
            <button 
              onClick={onJoinRequest}
              className="w-full py-5 bg-[#8BC34A] text-white rounded-3xl font-black text-xl shadow-xl shadow-green-100 active:scale-95 transition-all"
            >
              申請加入遠征隊
            </button>
          )}

          {isJoined && !isHost && (
            <button 
              onClick={onLeaveRequest}
              className="w-full py-5 bg-white text-gray-500 border-2 border-gray-100 rounded-3xl font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <LogOut size={20} /> 退出遠征隊
            </button>
          )}

          {isFull && !isJoined && !isHost && (
            <div className="w-full py-5 bg-gray-100 text-gray-400 rounded-3xl font-black text-center">
              此遠征隊已滿員
            </div>
          )}

          {canDelete && (
            <button 
              onClick={onDelete}
              className={`w-full py-4 border rounded-3xl font-black flex items-center justify-center gap-2 transition-colors ${isAdmin && !isHost ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
            >
              <Trash2 size={18} /> 
              {isAdmin && !isHost ? '刪除邀請 (管理員權限)' : '刪除邀請'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
