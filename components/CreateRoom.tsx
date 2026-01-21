
import React, { useState } from 'react';
import { UserProfile, MushroomCategory, MushroomAttribute, MushroomRoom } from '../types';
import { Camera, Calendar, Users as UsersIcon, X, Sword } from 'lucide-react';

interface CreateRoomProps {
  user: UserProfile;
  onSubmit: (room: Omit<MushroomRoom, 'id' | 'participants' | 'status' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ user, onSubmit, onCancel }) => {
  const [category, setCategory] = useState<MushroomCategory>(MushroomCategory.NORMAL);
  const [attribute, setAttribute] = useState<MushroomAttribute | undefined>(undefined);
  const [slots, setSlots] = useState(4);
  const [minStrength, setMinStrength] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
  const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [startTime, setStartTime] = useState(getLocalISOString());

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      host: {
        id: 'host-' + Math.random().toString(36).substring(2, 9),
        nickname: user.nickname,
        friendCode: user.friendCode
      },
      category,
      attribute,
      slots,
      imageUrl,
      startTime: new Date(startTime).toISOString(),
      minStrength
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">發起打菇邀請</h2>
        <button type="button" onClick={onCancel} className="p-2 bg-gray-100 rounded-full text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="relative group">
        <div className="w-full h-48 rounded-3xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <>
              <Camera size={40} className="text-gray-300 mb-2" />
              <span className="text-sm text-gray-400 font-bold">點擊上傳明信片 (選填)</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        {imageUrl && (
          <button 
            type="button" 
            onClick={() => setImageUrl(undefined)}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">蘑菇分類</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(MushroomCategory).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-3 px-1 text-sm rounded-xl font-black transition-all border-2 ${
                  category === cat 
                    ? 'bg-[#8BC34A] border-[#8BC34A] text-white' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-[#8BC34A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">屬性 (選填)</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(MushroomAttribute).map(attr => (
              <button
                key={attr}
                type="button"
                onClick={() => setAttribute(attribute === attr ? undefined : attr)}
                className={`py-2.5 text-xs rounded-xl font-black transition-all border-2 ${
                  attribute === attr 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-md' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-blue-500'
                }`}
              >
                {attr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
              <Calendar size={12} /> 預計開打時間
            </label>
            <input 
              type="datetime-local" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-black text-gray-900 outline-none focus:border-[#8BC34A] focus:ring-4 focus:ring-[#8BC34A]/10 transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <UsersIcon size={12} /> 徵求人數
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={slots}
                  onChange={(e) => setSlots(Number(e.target.value))}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-black text-gray-900 outline-none focus:border-[#8BC34A] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Sword size={12} /> 希望戰力 <span className="text-[10px] lowercase font-normal opacity-60">(選填)</span>
              </label>
              <div className="relative">
                <input 
                  type="number"
                  placeholder="如: 3500"
                  value={minStrength || ''}
                  onChange={(e) => setMinStrength(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-black text-gray-900 outline-none focus:border-[#8BC34A] transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 sticky bottom-0 bg-[#FAFAF5]/80 backdrop-blur-md pb-4">
        <button 
          type="submit"
          className="w-full py-5 bg-[#8BC34A] text-white rounded-3xl font-black text-xl shadow-xl shadow-green-100 transition-transform active:scale-95"
        >
          立即發佈邀請
        </button>
      </div>
    </form>
  );
};

export default CreateRoom;
