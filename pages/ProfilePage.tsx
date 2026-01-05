
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store } from '../store';
import { User, Review } from '../types';
import { Edit3, Key, Star, MessageCircle, MapPin, X, Upload, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [currentUser] = useState<User | null>(Store.getCurrentUser());
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfilePic, setEditProfilePic] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = () => {
      const allUsers = Store.getUsers();
      const targetUser = allUsers.find(u => u.id === id);
      setUser(targetUser || null);

      if (targetUser) {
        const allReviews = Store.getReviews().filter(r => r.sellerId === targetUser.id);
        setReviews(allReviews);
        
        // Initialize edit fields if it's the current user
        if (currentUser?.id === targetUser.id) {
          setEditDisplayName(targetUser.displayName || '');
          setEditBio(targetUser.bio || '');
          setEditProfilePic(targetUser.profilePic);
        }
      }
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, [id, currentUser?.id]);

  const handleUpdateProfile = () => {
    if (!currentUser) return;
    if (editDisplayName.trim().length < 2) return alert('ชื่อที่แสดงต้องมีความยาวอย่างน้อย 2 ตัวอักษร');

    const allUsers = Store.getUsers();
    const updatedUsers = allUsers.map(u => 
      u.id === currentUser.id 
        ? { ...u, displayName: editDisplayName, bio: editBio, profilePic: editProfilePic } 
        : u
    );
    
    Store.setUsers(updatedUsers);
    
    // Update session
    const updatedMe = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedMe) Store.setCurrentUser(updatedMe);

    setShowEditModal(false);
    alert('อัปเดตโปรไฟล์สำเร็จ!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    if (!currentUser || oldPass !== currentUser.password) return alert('รหัสผ่านเดิมไม่ถูกต้อง');
    if (newPass !== confirmPass) return alert('รหัสผ่านใหม่ไม่ตรงกัน');
    if (newPass.length < 4) return alert('รหัสผ่านใหม่สั้นเกินไป');

    const allUsers = Store.getUsers();
    const updatedUsers = allUsers.map(u => u.id === currentUser.id ? { ...u, password: newPass } : u);
    Store.setUsers(updatedUsers);
    
    // Update session
    const updatedMe = updatedUsers.find(u => u.id === currentUser.id);
    if (updatedMe) Store.setCurrentUser(updatedMe);

    setShowPasswordModal(false);
    setOldPass(''); setNewPass(''); setConfirmPass('');
    alert('เปลี่ยนรหัสผ่านสำเร็จ!');
  };

  const startChat = () => {
    if (!user || !currentUser) return;
    const allChats = Store.getChats();
    let chat = allChats.find(c => !c.isGroup && c.participants.includes(user.id) && c.participants.includes(currentUser.id));
    
    if (!chat) {
      chat = {
        id: Math.random().toString(36).substr(2, 9),
        participants: [currentUser.id, user.id],
        isGroup: false,
        lastTimestamp: Date.now()
      };
      Store.setChats([chat, ...allChats]);
    }
    navigate('/chats');
  };

  if (!user) return <div className="p-10 text-center text-gray-400">ไม่พบผู้ใช้งาน</div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 p-8 pb-20 text-center relative">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-xl mb-4 relative">
            {user.profilePic ? (
              <img src={user.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-bold">
                {user.displayName?.[0].toUpperCase() || user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <h2 className="text-white text-2xl font-bold">{user.displayName || user.username}</h2>
            {currentUser?.id === user.id && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>
          <p className="text-blue-100 text-xs mt-1">@{user.username}</p>
          <p className="text-blue-200 text-[10px] mt-1 uppercase font-bold tracking-widest">{user.role === 'ADMIN' ? '👑 ผู้ดูแลระบบ' : '🍴 สมาชิก'}</p>
        </div>
      </div>

      <div className="px-6 -mt-12">
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6 border">
          <div className="flex justify-around border-b pb-6">
            <div className="text-center">
              <p className="font-bold text-xl">{avgRating}</p>
              <p className="text-xs text-gray-500">คะแนนเฉลี่ย</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">{reviews.length}</p>
              <p className="text-xs text-gray-500">รีวิวทั้งหมด</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-gray-800">เกี่ยวกับฉัน</h4>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{user.bio || 'ไม่มีคำอธิบาย'}</p>
          </div>

          <div className="flex flex-col gap-2">
            {currentUser?.id !== user.id && (
              <button 
                onClick={startChat}
                className="w-full py-3 bg-pink-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} /> ส่งข้อความ
              </button>
            )}
            {currentUser?.id === user.id && (
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Key size={18} /> เปลี่ยนรหัสผ่าน
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="px-6 space-y-4 pb-10">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" size={20} /> รีวิวจากลูกค้า
        </h3>
        <div className="space-y-3">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-white p-4 rounded-2xl border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-sm">{rev.buyerName}</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-xs text-gray-600">{rev.comment}</p>
              {rev.reply && (
                <div className="mt-2 pl-3 border-l-2 border-blue-200 bg-blue-50 p-2 rounded-r-lg">
                  <p className="text-[10px] font-bold text-blue-500">ผู้ขายตอบกลับ:</p>
                  <p className="text-[10px] text-gray-500">{rev.reply}</p>
                </div>
              )}
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm italic">ยังไม่มีรีวิวสำหรับผู้ใช้รายนี้</div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold">แก้ไขโปรไฟล์</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center py-2">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group shadow-inner">
                  {editProfilePic ? (
                    <img src={editProfilePic} alt="Edit Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-gray-400" size={32} />
                  )}
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Upload className="text-white" size={20} />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">แตะเพื่อเปลี่ยนรูปโปรไฟล์</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">ชื่อที่แสดง (Display Name)</label>
                <input 
                  type="text" 
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-white text-black outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="ชื่อที่แสดงของคุณ"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">คำอธิบาย (Bio)</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                  className="w-full p-3 border rounded-xl bg-white text-black h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  placeholder="แนะนำตัวเองสั้นๆ..."
                />
                <p className="text-right text-[10px] text-gray-400">{editBio.length}/500</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition"
              >ยกเลิก</button>
              <button 
                onClick={handleUpdateProfile} 
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition"
              >บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold">เปลี่ยนรหัสผ่าน</h3>
            <div className="space-y-3">
              <input 
                type="password" placeholder="รหัสผ่านเดิม" 
                className="w-full p-3 border rounded-xl bg-white text-black shadow-sm"
                value={oldPass} onChange={e => setOldPass(e.target.value)}
              />
              <input 
                type="password" placeholder="รหัสผ่านใหม่" 
                className="w-full p-3 border rounded-xl bg-white text-black shadow-sm"
                value={newPass} onChange={e => setNewPass(e.target.value)}
              />
              <input 
                type="password" placeholder="ยืนยันรหัสผ่านใหม่" 
                className="w-full p-3 border rounded-xl bg-white text-black shadow-sm"
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">ยกเลิก</button>
              <button onClick={handleChangePassword} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
