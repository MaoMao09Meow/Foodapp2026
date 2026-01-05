
import React, { useState, useEffect } from 'react';
import { Store } from '../store';
import { FoodItem, User } from '../types';
import { Plus, Trash2, Eye, EyeOff, Edit, Camera, X } from 'lucide-react';
import { APP_COLORS } from '../constants';

const FoodMenuPage: React.FC = () => {
  const [myItems, setMyItems] = useState<FoodItem[]>([]);
  const [currentUser] = useState<User | null>(Store.getCurrentUser());
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item Form
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [image, setImage] = useState('');

  useEffect(() => {
    const load = () => {
      const items = Store.getFood().filter(i => i.sellerId === currentUser?.id);
      setMyItems(items);
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, [currentUser]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!name || !price || !image || !currentUser) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    
    const newItem: FoodItem = {
      id: Math.random().toString(36).substr(2, 9),
      sellerId: currentUser.id,
      sellerName: currentUser.username,
      name,
      description: desc,
      price,
      stock,
      image,
      isHidden: false,
      averageRating: 0,
      totalReviews: 0
    };

    Store.setFood([...Store.getFood(), newItem]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setDesc(''); setPrice(0); setStock(1); setImage('');
  };

  const toggleHide = (id: string) => {
    const all = Store.getFood();
    Store.setFood(all.map(i => i.id === id ? { ...i, isHidden: !i.isHidden } : i));
  };

  const deleteItem = (id: string) => {
    if (window.confirm('ยืนยันการลบเมนูอาหารนี้?')) {
      const all = Store.getFood();
      Store.setFood(all.filter(i => i.id !== id));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">เมนูของฉัน</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-pink-100"
        >
          <Plus size={20} /> เพิ่มเมนู
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myItems.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl p-3 shadow-sm border flex gap-4 ${item.isHidden ? 'opacity-50' : ''}`}>
            <img src={item.image} className="w-24 h-24 rounded-xl object-cover" />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                <p className="text-pink-500 font-bold">฿{item.price}</p>
                <p className="text-[10px] text-gray-400">คงเหลือ: {item.stock}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => toggleHide(item.id)} className="p-2 text-gray-400 hover:text-blue-500">
                  {item.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {myItems.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">คุณยังไม่ได้เพิ่มเมนูอาหาร</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">เพิ่มเมนูใหม่</h3>
              <button onClick={() => setShowAddModal(false)}><X /></button>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col items-center">
                <div className="w-full aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-gray-400" />
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImage} />
                </div>
                <p className="text-xs text-gray-500 mt-1">อัปโหลดรูปอาหาร</p>
              </div>

              <input 
                placeholder="ชื่ออาหาร" 
                className="w-full p-3 border-b outline-none focus:border-pink-500" 
                value={name} onChange={e => setName(e.target.value)} 
              />
              <textarea 
                placeholder="คำอธิบาย" 
                className="w-full p-3 border rounded-xl h-24 resize-none outline-none focus:border-pink-500" 
                value={desc} onChange={e => setDesc(e.target.value)} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">ราคา (บาท)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border-b outline-none" 
                    value={price} onChange={e => setPrice(parseInt(e.target.value))} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">สต็อก (ชิ้น)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border-b outline-none" 
                    value={stock} onChange={e => setStock(parseInt(e.target.value))} 
                  />
                </div>
              </div>

              <button 
                onClick={handleAddItem}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 mt-4"
              >บันทึกเมนู</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMenuPage;
