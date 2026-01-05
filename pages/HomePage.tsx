
import React, { useState, useEffect } from 'react';
import { Store } from '../store';
import { FoodItem, User, Order } from '../types';
import { APP_COLORS, THAI_MONTHS } from '../constants';
import { Search, ShoppingCart, Star, MessageCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentUser] = useState<User | null>(Store.getCurrentUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderModal, setShowOrderModal] = useState<FoodItem | null>(null);

  // Order Form State
  const [orderQty, setOrderQty] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [buyerName, setBuyerName] = useState(currentUser?.username || '');
  const [pickupDay, setPickupDay] = useState(new Date().getDate());
  const [pickupMonth, setPickupMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const load = () => {
      const items = Store.getFood().filter(i => !i.isHidden);
      setFoodItems(items);
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, []);

  const filteredItems = foodItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOrderSubmit = () => {
    if (!showOrderModal || !currentUser) return;
    if (orderQty > showOrderModal.stock) {
      alert('จำนวนสินค้าไม่เพียงพอ');
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      foodId: showOrderModal.id,
      foodName: showOrderModal.name,
      sellerId: showOrderModal.sellerId,
      buyerId: currentUser.id,
      buyerName: buyerName,
      quantity: orderQty,
      totalPrice: orderQty * showOrderModal.price,
      notes: orderNotes,
      pickupTime: `${pickupDay} ${THAI_MONTHS[pickupMonth]}`,
      pickupLocation: 'ผู้ขายจะระบุหลังจากยืนยันออเดอร์', // Placeholder per reqs
      status: 'PENDING',
      createdAt: Date.now()
    };

    // Update stock
    const allFood = Store.getFood();
    const updatedFood = allFood.map(f => f.id === showOrderModal.id ? { ...f, stock: f.stock - orderQty } : f);
    Store.setFood(updatedFood);

    // Save Order
    const allOrders = Store.getOrders();
    Store.setOrders([newOrder, ...allOrders]);

    // Notify Seller
    Store.notify(
      showOrderModal.sellerId,
      'ออเดอร์ใหม่!',
      `${buyerName} ได้สั่ง ${showOrderModal.name} จำนวน ${orderQty}`,
      'ORDER'
    );

    setShowOrderModal(null);
    setOrderQty(1);
    setOrderNotes('');
    alert('สั่งซื้อสำเร็จ! รอการตอบรับจากผู้ขาย');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="ค้นหาอาหารหรือผู้ขาย..."
          className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-pink-400 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400" size={20} />
          เมนูแนะนำสำหรับคุณ
        </h3>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">ยังไม่มีสินค้าให้เลือกซื้อ</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-md border flex flex-col sm:flex-row">
                <img src={item.image} alt={item.name} className="w-full sm:w-40 h-40 object-cover" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">฿{item.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-2 mt-1">{item.description}</p>
                    <Link to={`/profile/${item.sellerId}`} className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                      โดย: {item.sellerName}
                    </Link>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs ${item.stock > 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                      คงเหลือ: {item.stock} ชิ้น
                    </span>
                    <button
                      disabled={item.stock <= 0 || item.sellerId === currentUser?.id}
                      onClick={() => setShowOrderModal(item)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                        item.stock > 0 && item.sellerId !== currentUser?.id
                          ? 'bg-pink-500 text-white hover:bg-pink-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={16} />
                      สั่งเลย
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold border-b pb-2">รายละเอียดการสั่งซื้อ</h3>
            <div className="flex gap-4">
              <img src={showOrderModal.image} className="w-20 h-20 rounded-xl object-cover" />
              <div>
                <p className="font-bold">{showOrderModal.name}</p>
                <p className="text-pink-500 font-bold">฿{showOrderModal.price}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500">จำนวนที่สั่ง (คงเหลือ: {showOrderModal.stock})</label>
                <div className="flex items-center gap-4 mt-1">
                  <button 
                    onClick={() => setOrderQty(q => Math.max(1, q-1))}
                    className="w-10 h-10 rounded-full border flex items-center justify-center font-bold"
                  >-</button>
                  <span className="text-xl font-bold">{orderQty}</span>
                  <button 
                    onClick={() => setOrderQty(q => Math.min(showOrderModal.stock, q+1))}
                    className="w-10 h-10 rounded-full border flex items-center justify-center font-bold"
                  >+</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">ชื่อผู้รับ</label>
                <input 
                  type="text" 
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full border-b py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">เวลานัดรับ (วันที่/เดือน)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="1" max="31"
                    value={pickupDay}
                    onChange={e => setPickupDay(parseInt(e.target.value))}
                    className="w-16 border-b py-2 outline-none"
                  />
                  <select 
                    value={pickupMonth}
                    onChange={e => setPickupMonth(parseInt(e.target.value))}
                    className="flex-1 border-b py-2 outline-none"
                  >
                    {THAI_MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">เพิ่มเติมถึงผู้ขาย</label>
                <input 
                  type="text" 
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="เช่น ไม่เผ็ด, พิเศษ..."
                  className="w-full border-b py-2 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => setShowOrderModal(null)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600"
              >ยกเลิก</button>
              <button 
                onClick={handleOrderSubmit}
                className="flex-1 py-3 bg-blue-500 rounded-xl font-bold text-white shadow-lg shadow-blue-200"
              >ยืนยันสั่งซื้อ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
