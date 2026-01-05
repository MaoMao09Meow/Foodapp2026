
import React, { useState, useEffect } from 'react';
import { Store } from '../store';
import { User } from '../types';
import { Shield, Users, Search, Trash2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = () => {
      setUsers(Store.getUsers());
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, []);

  const deleteUser = (id: string) => {
    if (window.confirm('ยืนยันการลบบัญชีผู้ใช้รายนี้? ข้อมูลทั้งหมดจะหายไป')) {
      const all = Store.getUsers();
      Store.setUsers(all.filter(u => u.id !== id));
    }
  };

  const filtered = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 space-y-6">
      <div className="bg-blue-600 p-6 rounded-3xl text-white flex items-center gap-4 shadow-xl">
        <Shield size={40} />
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-blue-100 text-sm">การจัดการระบบส่วนกลาง</p>
        </div>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="ค้นหาชื่อผู้ใช้หรือชื่อที่แสดง..." 
          className="w-full py-3 pl-12 pr-4 bg-gray-100 rounded-2xl outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-gray-600">
          <Users size={18} /> รายชื่อผู้ใช้ ({filtered.length})
        </div>
        
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                    {u.displayName?.[0].toUpperCase() || u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold">{u.displayName || u.username}</h4>
                    <p className="text-[10px] text-gray-400">@{u.username} | UID: {u.id}</p>
                  </div>
                </div>
                <button onClick={() => deleteUser(u.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-xs space-y-1">
                <p className="font-bold text-gray-700">รหัสผ่าน: <span className="text-pink-500 font-mono text-sm">{u.password}</span></p>
                <p className="text-gray-500">สมัครเมื่อ: {new Date(u.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-500">Role: <span className={u.role === 'ADMIN' ? 'text-blue-600 font-bold' : ''}>{u.role}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
