
import React, { useState, useEffect } from 'react';
import { Store } from '../store';
import { User } from '../types';
import { Logo, APP_COLORS } from '../constants';
import { Eye, EyeOff, Upload, Camera } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (val: string) => {
    const regex = /^[A-Za-z0-9_]*$/;
    if (!regex.test(val)) return false;
    if (val.length > 50) return false;
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (validateUsername(val)) {
      setUsername(val);
      setError('');
    } else {
      setError('Username ไม่ถูกต้อง (ใช้เฉพาะ A-Z, a-z, 0-9 และ _ เท่านั้น สูงสุด 50 ตัวอักษร)');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUniqueUid = () => {
    const randomPart = Math.random().toString(36).substr(2, 5);
    const timePart = Date.now().toString(36).substr(-4);
    return `${randomPart}-${timePart}`.toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = Store.getUsers();

    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        Store.setCurrentUser(user);
        window.location.hash = '/';
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } else {
      if (username.length < 3) return setError('Username ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      if (displayName.trim().length < 2) return setError('ชื่อที่แสดงต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
      if (password.length < 4) return setError('Password ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      if (users.find(u => u.username === username)) return setError('ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว');

      const isFirstUser = users.length === 0;
      const newUser: User = {
        id: generateUniqueUid(),
        username,
        displayName: displayName || username,
        password,
        bio,
        profilePic,
        role: isFirstUser ? 'ADMIN' : 'USER',
        createdAt: Date.now()
      };

      Store.setUsers([...users, newUser]);
      Store.setCurrentUser(newUser);
      window.location.hash = '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-white">
      <div className="mb-8 transform scale-150">
        <Logo size="text-3xl" />
      </div>

      <div className="w-full space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-400" size={32} />
                )}
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Upload className="text-white" size={20} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">อัปโหลดรูปโปรไฟล์</p>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">ชื่อที่แสดง (Display Name)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ชื่อของคุณที่อยากให้ทุกคนเห็น"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Username สำหรับเข้าสู่ระบบ"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
            <p className="text-[10px] text-gray-500 ml-1 italic">ใช้ _ แทนช่องว่าง</p>
          </div>

          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-gray-700">รหัสผ่าน (Password)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">คำอธิบาย (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="แนะนำตัวเองหน่อย..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-24 resize-none"
              />
              <p className="text-right text-[10px] text-gray-400">{bio.length}/500</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95"
            style={{ backgroundColor: isLogin ? APP_COLORS.pink : APP_COLORS.blue }}
          >
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกเดี๋ยวนี้'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
