
import React, { useState, useEffect } from 'react';
import { UserProfile, AppView } from '../types';
import { isValidFriendCode, formatFriendCode } from '../utils/helpers';
import { MASTER_ADMIN_CODE } from '../constants';
import { Sword, Users, Info, ShieldCheck, Lock, Globe, Sparkles, User, Hash } from 'lucide-react';

interface HomeProps {
  user: UserProfile | null;
  onSaveUser: (profile: UserProfile) => void;
  onNavigate: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ user, onSaveUser, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(!user);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [friendCode, setFriendCode] = useState(user?.friendCode || '');
  const [isAdmin, setIsAdmin] = useState(user?.isAdmin || false);

  const cleanFriendCode = friendCode.replace(/\s/g, '');
  const isMasterCode = cleanFriendCode === MASTER_ADMIN_CODE;

  useEffect(() => {
    if (!isMasterCode && isAdmin) {
      setIsAdmin(false);
    }
  }, [cleanFriendCode, isMasterCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname && isValidFriendCode(friendCode)) {
      onSaveUser({ 
        nickname, 
        friendCode: cleanFriendCode,
        isAdmin: isMasterCode ? isAdmin : false 
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center border-4 border-[#8BC34A] relative">
          <img src="https://picsum.photos/seed/pikmin/100/100" className="rounded-full w-full h-full object-cover" alt="Pikmin" />
          <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1.5 rounded-full border-2 border-white shadow-sm">
            <Sparkles size={14} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">準備好打蘑菇了嗎？</h2>
        <p className="text-gray-500 text-sm">集結全球陸軍，挑戰巨大蘑菇！</p>
      </div>

      {/* Community Stats Mini Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[24px] p-4 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <Globe size={20} className="text-[#8BC34A]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">今日社群遠征</p>
            <p className="text-lg font-black">2,415 <span className="text-xs font-normal text-gray-500 ml-1">次作戰</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#8BC34A] font-bold">● ONLINE</p>
          <p className="text-xs font-medium text-gray-300">資料已同步</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-gray-800 flex items-center gap-2 text-lg">
            <div className="p-1.5 bg-[#8BC34A] rounded-lg text-white">
              <Info size={16} />
            </div>
            我的訓練家資訊
          </h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500 font-black px-3 py-1 bg-blue-50 rounded-full">編輯</button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 ml-1 flex items-center gap-1 uppercase tracking-widest">
                  <User size={12} /> 遊戲暱稱
                </label>
                <input 
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black text-gray-900 placeholder:text-gray-300 placeholder:font-normal focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10 outline-none transition-all"
                  placeholder="例如: 蘑菇大師"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 ml-1 flex items-center gap-1 uppercase tracking-widest">
                  <Hash size={12} /> 好友代碼 (12位數字)
                </label>
                <input 
                  className={`w-full px-5 py-4 border-2 rounded-2xl text-xl font-black tracking-widest text-gray-900 placeholder:text-gray-300 placeholder:font-normal outline-none transition-all ${isMasterCode ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100 focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10'}`}
                  placeholder="0000 0000 0000"
                  maxLength={isMasterCode ? 20 : 14}
                  value={formatFriendCode(friendCode)}
                  onChange={(e) => setFriendCode(e.target.value)}
                  required
                />
              </div>
            </div>

            {isMasterCode ? (
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-500" />
                  <span className="text-sm font-black text-indigo-700">管理員權限</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAdmin ? 'bg-indigo-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAdmin ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-100 opacity-30 grayscale">
                <Lock size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">管理員模式已鎖定</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={!nickname || !isValidFriendCode(friendCode)}
              className="w-full py-5 bg-[#8BC34A] text-white rounded-2xl font-black text-lg disabled:opacity-50 shadow-lg shadow-green-100 active:scale-95 transition-all"
            >
              儲存資訊並進入社群
            </button>
          </form>
        ) : (
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <p className="text-xl font-black text-gray-800 flex items-center gap-2">
                {user?.nickname}
                {user?.isAdmin && <ShieldCheck size={18} className="text-indigo-500" />}
              </p>
              <p className="text-sm text-gray-400 font-mono font-black tracking-widest">
                {isMasterCode ? 'ADMIN ACCESS' : formatFriendCode(user?.friendCode || '')}
              </p>
            </div>
            {user?.isAdmin && (
              <span className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded-full font-black shadow-sm">
                ADMIN
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => onNavigate('create')}
          className="group relative h-32 bg-[#8BC34A] rounded-3xl overflow-hidden shadow-lg transition-transform active:scale-95"
        >
          <div className="absolute right-[-10px] bottom-[-10px] text-white/20 rotate-12">
            <Sword size={120} />
          </div>
          <div className="relative z-10 p-6 flex flex-col justify-center h-full text-white text-left">
            <span className="text-2xl font-black tracking-tight">我要發起打菇</span>
            <span className="text-sm text-white/80 font-medium">將邀請廣播給全球訓練家</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('board')}
          className="group relative h-32 bg-[#03A9F4] rounded-3xl overflow-hidden shadow-lg transition-transform active:scale-95"
        >
          <div className="absolute right-[-10px] bottom-[-10px] text-white/20 -rotate-12">
            <Users size={120} />
          </div>
          <div className="relative z-10 p-6 flex flex-col justify-center h-full text-white text-left">
            <span className="text-2xl font-black tracking-tight">我要加入打菇</span>
            <span className="text-sm text-white/80 font-medium">查看全球所有正在徵人的邀請</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
