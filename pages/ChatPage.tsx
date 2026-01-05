
import React, { useState, useEffect, useRef } from 'react';
import { Store } from '../store';
import { ChatRoom, ChatMessage, User } from '../types';
import { Send, Image as ImageIcon, Trash2, ChevronLeft, Search, Plus } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentUser] = useState<User | null>(Store.getCurrentUser());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      if (!currentUser) return;
      const allRooms = Store.getChats();
      const myRooms = allRooms.filter(r => r.participants.includes(currentUser.id));
      setRooms(myRooms);

      if (selectedRoom) {
        const allMsgs = Store.getMessages().filter(m => m.chatId === selectedRoom.id);
        setMessages(allMsgs);
      }
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, [currentUser, selectedRoom]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (image?: string) => {
    if ((!input.trim() && !image) || !selectedRoom || !currentUser) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.displayName || currentUser.username,
      content: input,
      image,
      timestamp: Date.now(),
      chatId: selectedRoom.id
    };

    const allMsgs = Store.getMessages();
    Store.setMessages([...allMsgs, newMessage]);

    // Update Room
    const allRooms = Store.getChats();
    const updatedRooms = allRooms.map(r => r.id === selectedRoom.id ? { 
      ...r, 
      lastMessage: image ? 'ส่งรูปภาพ' : input,
      lastTimestamp: Date.now() 
    } : r);
    Store.setChats(updatedRooms);

    // Notify others
    selectedRoom.participants.forEach(pId => {
      if (pId !== currentUser.id) {
        Store.notify(pId, 'ข้อความใหม่', `${currentUser.displayName || currentUser.username}: ${image ? 'ส่งรูปภาพ' : input}`, 'CHAT');
      }
    });

    setInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleSend(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const deleteMessage = (msgId: string) => {
    if (!window.confirm('ลบข้อความนี้?')) return;
    const allMsgs = Store.getMessages();
    Store.setMessages(allMsgs.filter(m => m.id !== msgId));
  };

  const getChatTitle = (room: ChatRoom) => {
    if (room.isGroup) return room.groupName || 'กลุ่ม';
    const otherId = room.participants.find(p => p !== currentUser?.id);
    const otherUser = Store.getUsers().find(u => u.id === otherId);
    return otherUser ? (otherUser.displayName || otherUser.username) : 'ผู้ใช้ที่ถูกลบ';
  };

  if (selectedRoom) {
    return (
      <div className="flex flex-col h-full bg-gray-50 fixed inset-0 max-w-md mx-auto z-[60]">
        {/* Chat Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => setSelectedRoom(null)}><ChevronLeft /></button>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 uppercase">
            {getChatTitle(selectedRoom)[0]}
          </div>
          <div className="flex-1">
            <h4 className="font-bold">{getChatTitle(selectedRoom)}</h4>
            <p className="text-[10px] text-green-500">ออนไลน์</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => {
            const isMe = m.senderId === currentUser?.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && selectedRoom.isGroup && <span className="text-[10px] text-gray-400 mb-1 ml-1">{m.senderName}</span>}
                <div className={`relative group max-w-[80%] p-3 rounded-2xl ${
                  isMe ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'
                }`}>
                  {m.image && <img src={m.image} className="rounded-lg mb-2 w-full" />}
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  <span className={`text-[8px] mt-1 block ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isMe && (
                    <button 
                      onClick={() => deleteMessage(m.id)}
                      className="absolute -left-8 top-1/2 -translate-y-1/2 text-red-300 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="bg-white p-4 border-t pb-8 flex items-center gap-2">
          <label className="p-2 text-gray-400 cursor-pointer">
            <ImageIcon size={24} />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <input 
            type="text" 
            placeholder="พิมพ์ข้อความ..." 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            className="p-3 bg-pink-500 text-white rounded-full shadow-lg shadow-pink-100"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">แชท</h2>
        <button className="p-2 bg-blue-100 text-blue-600 rounded-full">
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <input type="text" placeholder="ค้นหาบทสนทนา..." className="w-full bg-gray-100 py-3 pl-12 pr-4 rounded-2xl outline-none" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      <div className="space-y-2">
        {rooms.map(room => (
          <div 
            key={room.id} 
            onClick={() => setSelectedRoom(room)}
            className="bg-white p-4 rounded-2xl border flex items-center gap-4 active:bg-gray-50 transition cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white text-xl uppercase">
              {getChatTitle(room)[0]}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{getChatTitle(room)}</h4>
              <p className="text-xs text-gray-400 truncate">{room.lastMessage || 'เริ่มการแชท...'}</p>
            </div>
            {room.lastTimestamp && (
              <span className="text-[10px] text-gray-300">
                {new Date(room.lastTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="text-center py-20 text-gray-400">ยังไม่มีบทสนทนา</div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
