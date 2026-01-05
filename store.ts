
import { User, FoodItem, Order, ChatRoom, ChatMessage, Notification, Review } from './types';

// Mock DB keys
const KEYS = {
  USERS: 'sue_users',
  FOOD: 'sue_food',
  ORDERS: 'sue_orders',
  CHATS: 'sue_chats',
  MESSAGES: 'sue_messages',
  NOTIFS: 'sue_notifications',
  REVIEWS: 'sue_reviews',
  CURRENT_USER: 'sue_current_user'
};

const get = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage_update'));
};

export const Store = {
  getUsers: () => get<User[]>(KEYS.USERS, []),
  setUsers: (users: User[]) => set(KEYS.USERS, users),
  
  getFood: () => get<FoodItem[]>(KEYS.FOOD, []),
  setFood: (food: FoodItem[]) => set(KEYS.FOOD, food),
  
  getOrders: () => get<Order[]>(KEYS.ORDERS, []),
  setOrders: (orders: Order[]) => set(KEYS.ORDERS, orders),
  
  getChats: () => get<ChatRoom[]>(KEYS.CHATS, []),
  setChats: (chats: ChatRoom[]) => set(KEYS.CHATS, chats),
  
  getMessages: () => get<ChatMessage[]>(KEYS.MESSAGES, []),
  setMessages: (msgs: ChatMessage[]) => set(KEYS.MESSAGES, msgs),
  
  getNotifs: () => {
    const notifs = get<Notification[]>(KEYS.NOTIFS, []);
    // Auto-delete older than 5 days
    const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
    const filtered = notifs.filter(n => n.createdAt > fiveDaysAgo);
    if (filtered.length !== notifs.length) {
      set(KEYS.NOTIFS, filtered);
    }
    return filtered;
  },
  setNotifs: (notifs: Notification[]) => set(KEYS.NOTIFS, notifs),
  
  getReviews: () => get<Review[]>(KEYS.REVIEWS, []),
  setReviews: (reviews: Review[]) => set(KEYS.REVIEWS, reviews),
  
  getCurrentUser: () => get<User | null>(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => set(KEYS.CURRENT_USER, user),

  notify: (userId: string, title: string, message: string, type: Notification['type']) => {
    const notifs = Store.getNotifs();
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: Date.now()
    };
    Store.setNotifs([newNotif, ...notifs]);
  }
};
