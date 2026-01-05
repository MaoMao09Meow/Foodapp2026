
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Store } from './store';
import { User } from './types';
import { Logo, APP_COLORS } from './constants';
import { Home, Menu, User as UserIcon, MessageCircle, Bell, ShoppingBag, LogOut, Settings, LayoutDashboard } from 'lucide-react';

// Pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import FoodMenuPage from './pages/FoodMenuPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(Store.getCurrentUser());
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      const user = Store.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const count = Store.getNotifs().filter(n => n.userId === user.id && !n.isRead).length;
        setNotifCount(count);
      }
    };
    window.addEventListener('storage_update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('storage_update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      Store.setCurrentUser(null);
      window.location.hash = '/login';
    }
  };

  const NavItem = ({ to, icon: Icon, label, badge }: { to: string, icon: any, label: string, badge?: number }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex flex-col items-center justify-center p-2 relative ${isActive ? 'text-pink-500' : 'text-gray-500 hover:text-blue-500'}`}
      >
        <div className="relative">
          <Icon size={24} />
          {badge && badge > 0 ? (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
              {badge}
            </span>
          ) : null}
        </div>
        <span className="text-[10px] mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
        {/* Header */}
        {currentUser && (
          <header className="sticky top-0 z-50 bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm">
            <Link to="/"><Logo size="text-xl" /></Link>
            <div className="flex items-center gap-2">
              {currentUser.role === 'ADMIN' && (
                <Link to="/admin" className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </div>
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <Routes>
            <Route path="/login" element={!currentUser ? <AuthPage /> : <Navigate to="/" />} />
            <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/menu" element={currentUser ? <FoodMenuPage /> : <Navigate to="/login" />} />
            <Route path="/profile/:id" element={currentUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/chats" element={currentUser ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={currentUser ? <NotificationsPage /> : <Navigate to="/login" />} />
            <Route path="/orders" element={currentUser ? <OrdersPage /> : <Navigate to="/login" />} />
            <Route path="/admin" element={currentUser?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Tab Bar */}
        {currentUser && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t flex justify-around items-center py-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <NavItem to="/" icon={Home} label="หน้าแรก" />
            <NavItem to="/menu" icon={ShoppingBag} label="เมนู" />
            <NavItem to="/chats" icon={MessageCircle} label="แชท" />
            <NavItem to="/notifications" icon={Bell} label="แจ้งเตือน" badge={notifCount} />
            <NavItem to="/orders" icon={ShoppingBag} label="ออเดอร์" />
            <NavItem to={`/profile/${currentUser.id}`} icon={UserIcon} label="โปรไฟล์" />
          </nav>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
