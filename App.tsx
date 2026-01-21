
import React, { useState, useEffect, useCallback } from 'react';
import { 
  MushroomRoom, 
  UserProfile, 
  AppView, 
  Participant
} from './types';
import { STORAGE_KEY_USER } from './constants';
import Home from './components/Home';
import BulletinBoard from './components/BulletinBoard';
import CreateRoom from './components/CreateRoom';
import RoomDetail from './components/RoomDetail';
import MyPosts from './components/MyPosts';
import { decodeRoomFromUrl } from './utils/helpers';
import { fetchGlobalRooms, syncRoomToGlobal, joinRoomGlobal, leaveRoomGlobal, deleteRoomGlobal, supabase } from './services/databaseService';
import { ChevronLeft, Home as HomeIcon, LayoutDashboard, UserCheck, X, Send, CheckCircle, RefreshCw } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info';
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<MushroomRoom[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const addNotification = (message: string, type: 'success' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const loadGlobalData = useCallback(async () => {
    setIsSyncing(true);
    const realRooms = await fetchGlobalRooms();
    setRooms(realRooms);
    setIsSyncing(false);
  }, []);

  // 💡 關鍵更新：使用 Realtime 訂閱代替輪詢
  useEffect(() => {
    loadGlobalData();

    // 訂閱資料表變動
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mushroom_rooms' },
        (payload) => {
          console.log('✨ [雲端同步] 資料發生變動:', payload.eventType);
          loadGlobalData(); // 任何變動即刻重新拉取最新狀態
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadGlobalData]);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) setUser(JSON.parse(savedUser));

    const urlParams = new URLSearchParams(window.location.search);
    const sharedRoomData = urlParams.get('room');
    if (sharedRoomData) {
      const decoded = decodeRoomFromUrl(sharedRoomData);
      if (decoded) {
        window.history.replaceState({}, document.title, window.location.pathname);
        const room = decoded as MushroomRoom;
        setRooms(prev => [room, ...prev.filter(r => r.id !== room.id)]);
        setCurrentRoomId(room.id);
        setView('roomDetail');
      }
    }
  }, []);

  const handleSaveUser = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
  };

  const handleCreateRoom = async (roomData: Omit<MushroomRoom, 'id' | 'participants' | 'status' | 'createdAt'>) => {
    const newRoom: MushroomRoom = {
      ...roomData,
      id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      participants: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    const success = await syncRoomToGlobal(newRoom);
    if (success) {
      addNotification('🚀 已同步至雲端！全球可見', 'success');
      setCurrentRoomId(newRoom.id);
      setView('roomDetail');
    } else {
      addNotification('⚠️ 發布失敗，請檢查連線或資料表結構', 'info');
    }
  };

  const handleJoinAction = async (roomId: string) => {
    if (!user) return;
    const participant: Participant = { id: `p-${Date.now()}`, nickname: user.nickname, friendCode: user.friendCode };
    const success = await joinRoomGlobal(roomId, participant);
    if (success) {
      addNotification('✅ 成功加入遠征隊！', 'success');
    } else {
      addNotification('❌ 加入失敗：隊伍已滿或您已在名單中', 'info');
    }
    // 加入後由 Realtime 自動更新畫面，不需手動 reload
  };

  const handleLeaveAction = async (roomId: string) => {
    if (!user) return;
    const success = await leaveRoomGlobal(roomId, user.friendCode);
    if (success) {
      addNotification('👋 已退出遠征隊', 'info');
    }
  };

  const handleKickAction = async (roomId: string, targetFriendCode: string) => {
    const success = await leaveRoomGlobal(roomId, targetFriendCode);
    if (success) {
      addNotification('🚫 已將隊員移出名單', 'info');
    }
  };

  const handleDeleteAction = async (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    const isHost = room.host.friendCode === user?.friendCode;
    const isAdmin = user?.isAdmin === true;

    if (!isHost && !isAdmin) return;

    const success = await deleteRoomGlobal(roomId);
    if (success) {
      addNotification('🗑️ 已從雲端移除邀請', 'info');
      setView('board');
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto shadow-2xl bg-[#FAFAF5] relative overflow-hidden">
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[340px] pointer-events-none space-y-2 px-4">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-3">
              {n.type === 'success' ? <CheckCircle className="text-[#8BC34A]" size={18} /> : <Send className="text-blue-400" size={18} />}
              <p className="text-xs font-bold leading-tight">{n.message}</p>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-white/40">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#8BC34A] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="p-1 hover:bg-black/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-black tracking-tight">Pikmin Army</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/10 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase">Live</span>
          </div>
          <button onClick={loadGlobalData} className={`p-1.5 rounded-lg ${isSyncing ? 'animate-spin' : ''}`}>
             <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {view === 'home' && <Home user={user} onSaveUser={handleSaveUser} onNavigate={(v) => setView(v)} />}
        {view === 'create' && user && <CreateRoom user={user} onSubmit={handleCreateRoom} onCancel={() => setView('home')} />}
        {view === 'board' && (
          <BulletinBoard rooms={rooms} user={user} onJoin={() => {}} isSyncing={isSyncing} onViewDetail={(id) => { setCurrentRoomId(id); setView('roomDetail'); }} />
        )}
        {view === 'roomDetail' && rooms.find(r=>r.id===currentRoomId) && (
          <RoomDetail 
            room={rooms.find(r=>r.id===currentRoomId)!} 
            user={user} 
            onJoinRequest={() => handleJoinAction(currentRoomId!)}
            onLeaveRequest={() => handleLeaveAction(currentRoomId!)}
            onKickRequest={(friendCode) => handleKickAction(currentRoomId!, friendCode)}
            onDelete={() => handleDeleteAction(currentRoomId!)} 
            onBack={() => setView('board')} 
          />
        )}
        {view === 'myPosts' && user && <MyPosts rooms={rooms} user={user} onViewDetail={(id) => { setCurrentRoomId(id); setView('roomDetail'); }} />}
      </main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' ? 'text-[#8BC34A]' : 'text-gray-300'}`}>
          <HomeIcon size={20} /><span className="text-[10px] font-bold">首頁</span>
        </button>
        <button onClick={() => setView('board')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'board' ? 'text-[#8BC34A]' : 'text-gray-300'}`}>
          <LayoutDashboard size={20} /><span className="text-[10px] font-bold">佈告欄</span>
        </button>
        <button onClick={() => setView('myPosts')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'myPosts' ? 'text-[#8BC34A]' : 'text-gray-300'}`}>
          <UserCheck size={20} /><span className="text-[10px] font-bold">我的戰鬥</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
