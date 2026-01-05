
import React, { useState, useEffect } from 'react';
import { Store } from '../store';
import { Order, User, Review } from '../types';
import { Clock, CheckCircle, XCircle, Star } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [currentUser] = useState<User | null>(Store.getCurrentUser());
  const [tab, setTab] = useState<'BUY' | 'SELL'>('BUY');

  const [reviewModal, setReviewModal] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const load = () => {
      if (!currentUser) return;
      const all = Store.getOrders();
      setBuyOrders(all.filter(o => o.buyerId === currentUser.id));
      setSellOrders(all.filter(o => o.sellerId === currentUser.id));
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, [currentUser]);

  const updateStatus = (id: string, status: Order['status'], buyerId: string, foodName: string) => {
    const all = Store.getOrders();
    Store.setOrders(all.map(o => o.id === id ? { ...o, status } : o));
    Store.notify(buyerId, 'อัปเดตสถานะออเดอร์', `ออเดอร์ ${foodName} ถูกเปลี่ยนสถานะเป็น ${status === 'DELIVERED' ? 'จัดส่งเรียบร้อย' : 'กำลังดำเนินการ'}`, 'STATUS');
  };

  const cancelOrder = (id: string) => {
    if (!window.confirm('ยืนยันการยกเลิกออเดอร์? ข้อมูลจะถูกลบถาวร')) return;
    const all = Store.getOrders();
    Store.setOrders(all.filter(o => o.id !== id));
  };

  const handleReview = () => {
    if (!reviewModal || !currentUser) return;
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      foodId: reviewModal.foodId,
      sellerId: reviewModal.sellerId,
      buyerId: currentUser.id,
      buyerName: currentUser.username,
      rating,
      comment,
      createdAt: Date.now()
    };
    Store.setReviews([newReview, ...Store.getReviews()]);
    
    // Update seller notification
    Store.notify(reviewModal.sellerId, 'รีวิวใหม่!', `${currentUser.username} ให้ ${rating} ดาวพร้อมรีวิว`, 'STATUS');
    
    setReviewModal(null);
    setRating(5);
    setComment('');
    alert('ขอบคุณสำหรับรีวิว!');
  };

  const currentOrders = tab === 'BUY' ? buyOrders : sellOrders;

  return (
    <div className="p-4 space-y-4">
      <div className="flex bg-gray-100 p-1 rounded-2xl">
        <button 
          onClick={() => setTab('BUY')}
          className={`flex-1 py-3 rounded-xl font-bold transition ${tab === 'BUY' ? 'bg-white shadow text-pink-500' : 'text-gray-500'}`}
        >ฉันซื้อ</button>
        <button 
          onClick={() => setTab('SELL')}
          className={`flex-1 py-3 rounded-xl font-bold transition ${tab === 'SELL' ? 'bg-white shadow text-blue-500' : 'text-gray-500'}`}
        >ฉันขาย</button>
      </div>

      <div className="space-y-4">
        {currentOrders.map(o => (
          <div key={o.id} className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">{o.foodName}</h4>
                <p className="text-xs text-gray-500">นัดรับ: {o.pickupTime}</p>
                <p className="text-xs text-blue-500 font-medium">สถานที่: {o.pickupLocation}</p>
              </div>
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                o.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {o.status === 'DELIVERED' ? 'ส่งเรียบร้อย' : 'กำลังดำเนินการ'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t pt-3">
              <span className="text-gray-600">จำนวน: {o.quantity} | รวม: <span className="text-pink-500 font-bold">฿{o.totalPrice}</span></span>
              <div className="flex gap-2">
                {tab === 'SELL' && o.status === 'PENDING' && (
                  <button 
                    onClick={() => updateStatus(o.id, 'DELIVERED', o.buyerId, o.foodName)}
                    className="p-2 bg-green-500 text-white rounded-lg"
                  ><CheckCircle size={18} /></button>
                )}
                {tab === 'BUY' && o.status === 'DELIVERED' && (
                  <button 
                    onClick={() => setReviewModal(o)}
                    className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold text-xs"
                  >รีวิว</button>
                )}
                <button 
                  onClick={() => cancelOrder(o.id)}
                  className="p-2 bg-red-100 text-red-500 rounded-lg"
                ><XCircle size={18} /></button>
              </div>
            </div>
            {o.notes && <p className="text-[10px] bg-gray-50 p-2 rounded italic text-gray-500">โน้ต: {o.notes}</p>}
          </div>
        ))}
        {currentOrders.length === 0 && (
          <div className="text-center py-20 text-gray-400">ยังไม่มีรายการสั่งซื้อ</div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold">รีวิวสินค้า</h3>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star size={32} className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea 
              placeholder="เขียนความประทับใจ..." 
              className="w-full p-3 border rounded-xl h-24 resize-none"
              value={comment} onChange={e => setComment(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-3 text-gray-500 font-bold">ปิด</button>
              <button onClick={handleReview} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold">ส่งรีวิว</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
