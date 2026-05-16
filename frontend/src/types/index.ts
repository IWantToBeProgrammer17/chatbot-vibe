// Enums
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum SenderType {
  USER = 'user',
  AI = 'ai',
}

// Models
export interface User {
  id: number;
  username: string;
  role: UserRole;
  dailyLimit: number;
  dailyUsageCount: number;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderType: SenderType;
  content: string;
  isTyping: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  messages: Message[];
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  token: string;
  user?: User;
  message?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

// Context State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

// Action Types
export type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: { user: User; token: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: User };

export type AppAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: Conversation | null }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: Conversation }
  | { type: 'DELETE_CONVERSATION'; payload: number }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: number; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'DELETE_MESSAGE'; payload: { conversationId: number; messageId: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
