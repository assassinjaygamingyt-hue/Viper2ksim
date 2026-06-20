import React, { useState, useEffect, useRef } from 'react';
import { Team, ModUser, ChatRoom, ChatMessage } from '../types';
import { renderLogo } from '../utils';
import { MessageSquare, MessageCircle, Send, Plus, Users, ShieldAlert, Hash, Lock, Globe, Tv, Sparkles, X, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeagueChatProps {
  teams: Team[];
  currentUser: {
    id?: string;
    username: string;
    role: 'admin' | 'mod';
    teamId?: string;
    subRole?: string;
    permissions?: {
      editHistory: boolean;
      editDrafts: boolean;
      editRosters: boolean;
    };
  } | null;
  isAdminLoggedIn: boolean;
  onOpenLogin: () => void;
}

export default function LeagueChat({
  teams,
  currentUser,
  isAdminLoggedIn,
  onOpenLogin
}: LeagueChatProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-general');
  const [newMessageText, setNewMessageText] = useState<string>('');
  
  // Custom chat room creator modes
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // WebSocket and polling states
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Determine current active sender configuration
  const getSenderConfig = () => {
    if (!isAdminLoggedIn || !currentUser) {
      return { id: 'fan', name: 'Anonymous Fan', logo: '', color: 'text-gray-400' };
    }
    
    // Is Admin / Commissioner
    if (currentUser.role === 'admin') {
      return {
        id: 'admin',
        name: 'Commissioner Office',
        logo: '',
        color: 'text-red-500'
      };
    }

    // Checking specifically for ESPN subroles
    if (currentUser.role === 'mod' && currentUser.subRole === 'ESPN/News Outlet') {
      return {
        id: 'espn',
        name: 'ESPN League News Desk',
        logo: '',
        color: 'text-indigo-400'
      };
    }

    // Is Team Owner
    if (currentUser.teamId) {
      const assignedTeam = teams.find(t => t.id === currentUser.teamId);
      if (assignedTeam) {
        return {
          id: assignedTeam.id,
          name: assignedTeam.name,
          logo: assignedTeam.logo,
          color: 'text-amber-400'
        };
      }
    }

    // Fallback custom mod name
    return {
      id: currentUser.id || 'mod',
      name: currentUser.username,
      logo: '',
      color: 'text-amber-500'
    };
  };

  const senderInfo = getSenderConfig();

  // Load rooms and messages from backend
  const fetchRoomsAndMessages = async () => {
    try {
      const roomsResp = await fetch('/api/chats/rooms');
      if (roomsResp.ok) {
        const roomsData = await roomsResp.json();
        setRooms(roomsData);
      }
      
      const msgsResp = await fetch('/api/chats/messages');
      if (msgsResp.ok) {
        const msgsData = await msgsResp.json();
        setMessages(msgsData);
      }
    } catch (err) {
      console.error('Failed to query initial league messaging feeds:', err);
    }
  };

  useEffect(() => {
    fetchRoomsAndMessages();
    
    // Establishing real-time full-duplex WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWs = () => {
      try {
        const ws = new WebSocket(socketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          console.log('✅ Real-time league messaging relay synchronized.');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'message' && data.message) {
              setMessages(prev => {
                // Prevent duplicate messages
                if (prev.some(m => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
            } else if (data.type === 'room_created' && data.room) {
              setRooms(prev => {
                if (prev.some(r => r.id === data.room.id)) return prev;
                return [...prev, data.room];
              });
            }
          } catch (err) {
            console.error('Failed parsing chat live relay socket frame:', err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnecting after 5s
          setTimeout(connectWs, 5000);
        };

        ws.onerror = (err) => {
          console.error('Relay network connection warning:', err);
          ws.close();
        };
      } catch (e) {
        console.error('Error instantiating WebSockets:', e);
      }
    };

    connectWs();

    // Fallback/Safety Polling every 4 seconds to guarantee updates if WS experiences proxy drops
    const pollInterval = setInterval(fetchRoomsAndMessages, 4000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Sync scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoomId]);

  // Sending message action
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    if (!isAdminLoggedIn || !currentUser) return;

    const text = newMessageText;
    setNewMessageText('');

    try {
      const payload = {
        roomId: activeRoomId,
        senderId: senderInfo.id,
        senderName: senderInfo.name,
        senderLogo: senderInfo.logo || undefined,
        senderColor: senderInfo.id === 'admin' ? 'red' : senderInfo.id === 'espn' ? 'indigo' : 'amber',
        content: text
      };

      const resp = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error('Failed to post representative message');
      }

      // Add to local immediately for snappy feel
      const createdMessage = await resp.json();
      setMessages(prev => {
        if (prev.some(m => m.id === createdMessage.id)) return prev;
        return [...prev, createdMessage];
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Chat Room creation action
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      // Include selected members, creator is auto-included
      const memberIds = [...selectedMemberIds];
      if (!memberIds.includes(senderInfo.id)) {
        memberIds.push(senderInfo.id);
      }

      const payload = {
        name: newRoomName.trim(),
        type: 'group',
        memberIds,
        createdById: senderInfo.id
      };

      const resp = await fetch('/api/chats/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error('Could not synchronize new room ledger.');
      }

      const createdRoom = await resp.json();
      setRooms(prev => {
        if (prev.some(r => r.id === createdRoom.id)) return prev;
        return [...prev, createdRoom];
      });
      
      setActiveRoomId(createdRoom.id);
      setIsCreatingRoom(false);
      setNewRoomName('');
      setSelectedMemberIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle member selection
  const handleToggleMember = (id: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Filter messages for active room
  const filteredMessages = messages.filter(m => m.roomId === activeRoomId);
  const activeRoom = rooms.find(r => r.id === activeRoomId) || {
    id: 'room-general',
    name: 'General Federation Lobby',
    type: 'general',
    memberIds: ['admin', 'commissioner', 'espn']
  };

  // Determine if user has permission to write in active room
  // Fans can read general lobby, but cannot type anywhere.
  // Private rooms are limited to their designated members list.
  const isAuthorizedToWrite = () => {
    if (!isAdminLoggedIn) return false;
    if (activeRoom.type === 'general') return true;
    return activeRoom.memberIds.includes(senderInfo.id) || senderInfo.id === 'admin';
  };

  // Calculate readable participants
  const getParticipantsList = () => {
    if (activeRoom.type === 'general') return 'Open to all Virtual Hub representatives';

    const members = activeRoom.memberIds.map(memId => {
      if (memId === 'admin') return 'Commissioner';
      if (memId === 'espn') return 'ESPN News Desk';
      const franchise = teams.find(t => t.id === memId);
      return franchise ? franchise.abbrev : memId;
    });

    return `Participants: ${members.join(', ')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-gray-900 via-[#1e1b18] to-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f59e0b]/5 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">
                Direct Sync Active
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></span>
                <span className="text-gray-400">{wsConnected ? 'REAL-TIME NETWORK ONLINE' : 'POLLING BACKUP RELAY ACTIVE'}</span>
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-amber-500 animate-pulse" />
              Franchise Locker Room <span className="text-amber-500 font-serif">Chat</span>
            </h1>
            <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
              Official simulation channels where Franchise Owners, the Commissioner Office, and ESPN Journalists broadcast trade parameters, review active rumors, and negotiate league expansion schemes.
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center bg-gray-950/60 p-4 border border-gray-850 rounded-2xl gap-3">
            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-wider font-mono text-gray-500">Represented Persona:</span>
              <span className={`block font-bold text-xs ${senderInfo.color} font-mono`}>{senderInfo.name}</span>
            </div>
            {senderInfo.logo ? (
              <img src={senderInfo.logo} alt="" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center font-display text-xs text-white">
                {isAdminLoggedIn ? (senderInfo.id === 'admin' ? '🛡️' : '🎙️') : '👤'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[75vh]">
        {/* LEFT COLUMN: CHAT ROOMS DIRECTORY */}
        <div className="lg:col-span-4 bg-gray-950/70 border border-gray-850 rounded-3xl p-5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-850 pb-3 mb-4">
            <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-500" />
              Channels & Group Chats
            </h3>
            
            {isAdminLoggedIn && (
              <button
                onClick={() => setIsCreatingRoom(true)}
                className="p-1 px-2.5 rounded bg-amber-500 hover:bg-amber-600 text-gray-950 font-mono font-black text-[10px] uppercase transition cursor-pointer flex items-center gap-1 shadow"
              >
                <Plus className="w-3 h-3" />
                CREATE CHAT
              </button>
            )}
          </div>

          {/* ROOMS SCROLLER */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
            {rooms.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                Loading simulator room rosters...
              </div>
            ) : (
              rooms.map(room => {
                const isActive = room.id === activeRoomId;
                const isPrivate = room.type === 'group';
                
                // Determine if currentUser is member
                const isMember = room.type === 'general' || room.memberIds.includes(senderInfo.id) || senderInfo.id === 'admin';
                
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoomId(room.id);
                      setIsCreatingRoom(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition group cursor-pointer ${
                      isActive 
                        ? 'bg-amber-500 text-gray-950 font-bold shadow-lg shadow-amber-500/10' 
                        : isMember 
                          ? 'bg-gray-900/40 border border-gray-850/60 text-gray-200 hover:bg-gray-900 hover:text-white'
                          : 'bg-gray-900/10 border border-gray-850/20 text-gray-500 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-gray-950 text-amber-400' : 'bg-gray-950/60 text-gray-400 group-hover:text-amber-500'} transition`}>
                        {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate">
                        <span className="block text-xs font-semibold uppercase font-mono truncate">{room.name}</span>
                        <span className={`block text-[9px] ${isActive ? 'text-gray-900/80' : 'text-gray-500'} truncate`}>
                          {room.type === 'general' ? 'Public Lobby Channel' : `Private Group Chat • ${room.memberIds.length} members`}
                        </span>
                      </div>
                    </div>
                    
                    {!isMember && (
                      <span className="text-[8px] font-mono font-bold bg-gray-900/60 text-gray-400 border border-gray-850 px-1 py-0.5 rounded">
                        LOCKED
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* ADMIN ROOM QUICK BOOT INSTRUCTION */}
          {!isAdminLoggedIn && (
            <div className="mt-4 p-4 rounded-2xl bg-gray-900/60 border border-gray-850 space-y-3">
              <span className="block font-mono text-[10px] text-amber-400 font-bold">📢 SIMULATION FEED</span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Fans can view conversations live, but only authenticated Franchise Owners or League Commissioner Representatives are allowed to broadcast messages.
              </p>
              <button
                onClick={onOpenLogin}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-mono font-bold text-[10px] uppercase rounded-lg transition text-center cursor-pointer"
              >
                Sign In as Representative
              </button>
            </div>
          )}
        </div>

        {/* MAIN COLUMN: ACTIVE CHAT SCREEN */}
        <div className="lg:col-span-8 bg-gray-950/70 border border-gray-850 rounded-3xl flex flex-col h-full overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {isCreatingRoom ? (
              /* GROUP CHAT CREATOR VIEW */
              <motion.form
                key="creator-pane"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleCreateRoom}
                className="absolute inset-0 z-20 bg-gray-950 p-6 sm:p-8 flex flex-col overflow-y-auto space-y-6"
              >
                <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-display font-extrabold text-sm text-gray-200">PROVISION NEW LEAGUE DIRECTORY CHAT</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingRoom(false)}
                    className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-gray-400 font-black uppercase tracking-wider">GROUP CHAT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pacific Division Rumors"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-850 focus:border-amber-500 rounded-xl p-3 text-white text-xs outline-none font-sans"
                  />
                </div>

                <div className="space-y-2 flex-grow flex flex-col min-h-[25vh]">
                  <label className="block text-[10px] font-mono text-gray-400 font-black uppercase tracking-wider">
                    SELECT PARTICIPANT LEAGUE SEATS
                  </label>
                  
                  <div className="flex-1 min-h-[30vh] overflow-y-auto bg-gray-900/50 border border-gray-850 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Commissioner */}
                    <button
                      type="button"
                      onClick={() => handleToggleMember('admin')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition ${
                        selectedMemberIds.includes('admin')
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-gray-950/40 border-gray-850 text-gray-400 hover:bg-gray-900'
                      }`}
                    >
                      {selectedMemberIds.includes('admin') ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4" />}
                      <span className="text-xs uppercase font-mono">🛡️ Commissioner Room</span>
                    </button>

                    {/* ESPN */}
                    <button
                      type="button"
                      onClick={() => handleToggleMember('espn')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition ${
                        selectedMemberIds.includes('espn')
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                          : 'bg-gray-950/40 border-gray-850 text-gray-400 hover:bg-gray-900'
                      }`}
                    >
                      {selectedMemberIds.includes('espn') ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4" />}
                      <span className="text-xs uppercase font-mono">🎙️ ESPN News Desk</span>
                    </button>

                    {/* FRANCHISE TEAMS */}
                    {teams.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleMember(t.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition ${
                          selectedMemberIds.includes(t.id)
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                            : 'bg-gray-950/40 border-gray-850 text-gray-400 hover:bg-gray-900'
                        }`}
                      >
                        {selectedMemberIds.includes(t.id) ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4" />}
                        {renderLogo(t.logo, "w-4 h-4 object-contain")}
                        <span className="text-xs uppercase font-mono">{t.name} ({t.abbrev})</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-gray-950 font-mono font-black text-xs uppercase rounded-xl transition cursor-pointer text-center"
                  >
                    PROVISION NEW GROUP CHAT
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingRoom(false)}
                    className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            ) : null}
          </AnimatePresence>

          {/* ACTIVE CHAT HEADER */}
          <div className="bg-gray-900/40 border-b border-gray-850 p-4 sm:px-6 flex items-center justify-between select-none">
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-amber-400 font-bold tracking-wider uppercase block">
                {activeRoom.type === 'general' ? 'GLOBAL NETWORK' : 'SECURE CONVERSATION DIRECTORY'}
              </span>
              <h2 className="text-sm font-bold text-gray-200 uppercase font-mono tracking-tight truncate flex items-center gap-1.5 mt-0.5">
                {activeRoom.type === 'group' ? '🔒' : '🌐'} {activeRoom.name}
              </h2>
              <span className="block text-[9px] text-gray-500 font-mono truncate mt-0.5">
                {getParticipantsList()}
              </span>
            </div>

            {/* Total member count bubble */}
            {activeRoom.type === 'group' && (
              <div className="h-6 px-2.5 rounded-full bg-gray-900 border border-gray-850 text-[10px] font-mono font-bold text-gray-300 flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-500" />
                <span>{activeRoom.memberIds?.length || 0}</span>
              </div>
            )}
          </div>

          {/* ACTIVE CHAT MAIN MESSAGES RELAY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[50vh] min-h-[350px]">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500">
                <MessageCircle className="w-10 h-10 text-gray-700 mb-3 animate-pulse" />
                <p className="text-xs font-mono select-none">No messages broadcasted in this locker room yet.</p>
                {isAuthorizedToWrite() && (
                  <p className="text-[10px] text-gray-600 mt-1 max-w-xs">Be the first to representing your team by broadcasting a proposal in the prompt below!</p>
                )}
              </div>
            ) : (
              filteredMessages.map((msg, index) => {
                const isSentByMe = isAdminLoggedIn && (msg.senderId === senderInfo.id);
                
                // Parse date
                const timeStr = msg.timestamp 
                  ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                  : '';

                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-start gap-3 max-w-[85%] ${isSentByMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Speaker Avatar logo */}
                    {msg.senderLogo ? (
                      <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={msg.senderLogo} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gray-900 border border-gray-800 flex-shrink-0 flex items-center justify-center font-display text-xs text-white">
                        {msg.senderId === 'admin' ? '🛡️' : msg.senderId === 'espn' ? '🎙️' : '👤'}
                      </div>
                    )}

                    {/* Bubble Content Area */}
                    <div className="space-y-1">
                      <div className={`flex items-center gap-1.5 text-[10px] font-mono leading-none ${isSentByMe ? 'justify-end' : ''}`}>
                        <span className={`font-bold ${isSentByMe ? 'text-amber-400' : 'text-gray-300'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[8px] text-gray-600">
                          {timeStr}
                        </span>
                      </div>
                      
                      <div className={`px-4 py-2.5 rounded-3xl text-xs leading-relaxed break-words font-sans ${
                        isSentByMe 
                          ? 'bg-amber-400 text-gray-950 font-medium rounded-tr-none' 
                          : msg.senderId === 'admin'
                            ? 'bg-red-950/40 border border-red-500/20 text-red-100 rounded-tl-none'
                            : msg.senderId === 'espn'
                              ? 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-100 rounded-tl-none'
                              : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* SENDER DIAL INTERACTIVE BOX */}
          <div className="border-t border-gray-850 p-4 bg-gray-900/35">
            {isAuthorizedToWrite() ? (
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  required
                  placeholder={`Send secure statement as ${senderInfo.name}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-800 focus:border-amber-500 outline-none rounded-xl p-3 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 bg-amber-400 hover:bg-amber-500 text-gray-950 rounded-xl transition font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SEND</span>
                </button>
              </form>
            ) : (
              <div className="p-3 bg-gray-900/60 border border-red-900/20 text-red-400 rounded-2xl flex items-center justify-center text-center gap-2 font-mono text-[10px]">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-500" />
                <span>
                  {isAdminLoggedIn 
                    ? "LOCKED: You are not authorized as a participant of this private channel directory." 
                    : "READ-ONLY SIMULATION BOARD: Please log in as a Franchise Team Owner or Commissioner to broadcast messages."}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
