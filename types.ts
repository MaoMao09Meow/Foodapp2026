
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  displayName: string;
  password?: string; // Visible to admin
  bio: string;
  profilePic?: string;
  role: UserRole;
  createdAt: number;
}

export interface FoodItem {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  isHidden: boolean;
  averageRating: number;
  totalReviews: number;
}

export type OrderStatus = 'PENDING' | 'DELIVERED';

export interface Order {
  id: string;
  foodId: string;
  foodName: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  totalPrice: number;
  notes: string;
  pickupTime: string;
  pickupLocation: string;
  status: OrderStatus;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  image?: string;
  timestamp: number;
  chatId: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: number;
  isGroup: boolean;
  groupName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'CHAT' | 'STATUS';
  isRead: boolean;
  createdAt: number;
}

export interface Review {
  id: string;
  foodId: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: number;
}
