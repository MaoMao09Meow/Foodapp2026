
import React, { useState, useEffect } from 'react';
import { Store } from '../store';
import { Notification, User } from '../types';
import { Bell, X, ShoppingBag, MessageCircle, Info } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [currentUser] = useState<User | null>(Store.getCurrentUser());

  useEffect(() => {
    const load = () => {
      if (!currentUser) return;
      const all = Store.getNotifs().filter(n => n.userId === currentUser.id);
      setNotifs(all);
      
      // Mark as read
      const updatedAll = Store.getNotifs().map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n);
      Store.setNotifs(updatedAll);
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, [currentUser]);

  const deleteNotif = (id: string) => {
    const all = Store.getNotifs();
    Store.setNotifs(all.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ORDER': return <ShoppingBag className="text-pink-500" />;
      case 'CHAT': return <MessageCircle className="text-blue-500" />;
      default: return <Info className="text-gray-500" />;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">การแจ้งเตือน</h2>
        <span className="text-xs text-gray-400">เก็บไว้สูงสุด 5 วัน</span>
      </div>

      <div className="space-y-3">
        {notifs.map(n => (
          <div key={n.id} className={`p-4 rounded-2xl border flex gap-4 bg-white relative shadow-sm ${!n.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
            <div className="p-3 bg-gray-50 rounded-xl">
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800">{n.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{n.message}</p>
              <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => deleteNotif(n.id)} className="p-1 text-gray-300 hover:text-red-500">
              <X size={16} />
            </button>
          </div>
        ))}
        {notifs.length === 0 && (
          <div className="text-center py-20">
            <Bell size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
