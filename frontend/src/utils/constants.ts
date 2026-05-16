import { User, Conversation, Message, UserRole, SenderType } from '@/types';

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3000/api',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  CONVERSATIONS: {
    BASE: '/conversations',
    LIST: '/conversations',
    CREATE: '/conversations',
    DETAIL: (id: number) => `/conversations/${id}`,
    UPDATE: (id: number) => `/conversations/${id}`,
    DELETE: (id: number) => `/conversations/${id}`,
  },
  MESSAGES: {
    CREATE: (conversationId: number) => `/conversations/${conversationId}/messages`,
    LIST: (conversationId: number) => `/conversations/${conversationId}/messages`,
    DETAIL: (id: number) => `/messages/${id}`,
    UPDATE: (id: number) => `/messages/${id}`,
    DELETE: (id: number) => `/messages/${id}`,
    TYPING: (id: number) => `/messages/${id}/typing`,
  },
};

// Tailwind Colors from Requirements
export const THEME_COLORS = {
  PRIMARY: '#219ebc',
  SECONDARY: '#ccd5ae',
  ACCENT1: '#d4a373',
  ACCENT2: '#023047',
};

// Default Daily Limit
export const DEFAULT_DAILY_LIMIT = 20;

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'chatbot_user',
  TOKEN: 'chatbot_token',
  CONVERSATIONS: 'chatbot_conversations',
  MESSAGES: 'chatbot_messages',
  USERS: 'chatbot_users',
};

// Mock AI Responses
export const MOCK_AI_RESPONSES = [
  'AI (Artificial Intelligence) adalah cabang ilmu komputer yang fokus pada penciptaan sistem yang dapat melakukan tugas-tugas yang biasanya memerlukan kecerdasan manusia.',
  'Teknologi machine learning memungkinkan komputer untuk belajar dari data tanpa diprogram secara eksplisit.',
  'Natural Language Processing adalah teknik AI yang memungkinkan mesin untuk memahami dan memproses bahasa manusia.',
  'Deep learning adalah subset dari machine learning yang menggunakan jaringan saraf buatan dengan banyak lapisan.',
  'Chatbot adalah aplikasi AI yang dirancang untuk mensimulasikan percakapan manusia.',
  'Computer vision memungkinkan komputer untuk menginterpretasi dan memahami konten visual dari dunia nyata.',
  'Algoritma pembelajaran yang berbeda memiliki kekuatan dan kelemahan yang berbeda tergantung pada masalah yang dipecahkan.',
  'Data science menggabungkan statistik, programming, dan domain expertise untuk mengekstrak insight dari data.',
  'Gemini API adalah layanan Google untuk mengakses model bahasa generatif yang canggih.',
  'Automation menggunakan AI dapat meningkatkan efisiensi dan mengurangi kesalahan manusia dalam berbagai proses.',
];

// Hard-coded Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    role: UserRole.ADMIN,
    dailyLimit: 100,
    dailyUsageCount: 0,
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 2,
    username: 'esto',
    role: UserRole.USER,
    dailyLimit: DEFAULT_DAILY_LIMIT,
    dailyUsageCount: 0,
    createdAt: '2026-05-05T10:00:00Z',
  },
  {
    id: 3,
    username: 'azky',
    role: UserRole.USER,
    dailyLimit: DEFAULT_DAILY_LIMIT,
    dailyUsageCount: 0,
    createdAt: '2026-05-10T10:00:00Z',
  },
];

// Hard-coded Mock Conversations and Messages
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    userId: 2,
    title: 'Chat about AI',
    createdAt: '2026-05-08T10:00:00Z',
    updatedAt: '2026-05-08T15:30:00Z',
    deletedAt: null,
    messages: [
      {
        id: 1,
        conversationId: 1,
        senderType: SenderType.USER,
        content: 'Halo, apa itu AI?',
        isTyping: false,
        createdAt: '2026-05-08T10:00:00Z',
        updatedAt: '2026-05-08T10:00:00Z',
        deletedAt: null,
      },
      {
        id: 2,
        conversationId: 1,
        senderType: SenderType.AI,
        content:
          'AI (Artificial Intelligence) adalah cabang ilmu komputer yang fokus pada penciptaan sistem yang dapat melakukan tugas-tugas yang biasanya memerlukan kecerdasan manusia.',
        isTyping: false,
        createdAt: '2026-05-08T10:05:00Z',
        updatedAt: '2026-05-08T10:05:00Z',
        deletedAt: null,
      },
      {
        id: 3,
        conversationId: 1,
        senderType: SenderType.USER,
        content: 'Apa perbedaan antara machine learning dan deep learning?',
        isTyping: false,
        createdAt: '2026-05-08T10:10:00Z',
        updatedAt: '2026-05-08T10:10:00Z',
        deletedAt: null,
      },
      {
        id: 4,
        conversationId: 1,
        senderType: SenderType.AI,
        content:
          'Machine learning adalah subset dari AI yang fokus pada kemampuan sistem untuk belajar dari data. Deep learning adalah subset khusus dari machine learning yang menggunakan jaringan saraf buatan dengan banyak lapisan untuk memproses data kompleks.',
        isTyping: false,
        createdAt: '2026-05-08T10:15:00Z',
        updatedAt: '2026-05-08T10:15:00Z',
        deletedAt: null,
      },
    ],
  },
  {
    id: 2,
    userId: 2,
    title: 'Python Programming Tips',
    createdAt: '2026-05-12T08:00:00Z',
    updatedAt: '2026-05-12T14:20:00Z',
    deletedAt: null,
    messages: [
      {
        id: 5,
        conversationId: 2,
        senderType: SenderType.USER,
        content: 'Bagaimana cara membuat function yang efisien di Python?',
        isTyping: false,
        createdAt: '2026-05-12T08:00:00Z',
        updatedAt: '2026-05-12T08:00:00Z',
        deletedAt: null,
      },
      {
        id: 6,
        conversationId: 2,
        senderType: SenderType.AI,
        content:
          'Ada beberapa cara untuk membuat function yang efisien di Python: 1) Gunakan type hints untuk clarity, 2) Hindari operasi berulang, 3) Gunakan list comprehension, 4) Profile code Anda untuk menemukan bottlenecks, 5) Pertimbangkan menggunakan generator untuk data besar.',
        isTyping: false,
        createdAt: '2026-05-12T08:05:00Z',
        updatedAt: '2026-05-12T08:05:00Z',
        deletedAt: null,
      },
    ],
  },
  {
    id: 3,
    userId: 3,
    title: 'Web Development Stack',
    createdAt: '2026-05-14T09:30:00Z',
    updatedAt: '2026-05-14T11:45:00Z',
    deletedAt: null,
    messages: [
      {
        id: 7,
        conversationId: 3,
        senderType: SenderType.USER,
        content: 'Apa saja tools yang penting untuk web development modern?',
        isTyping: false,
        createdAt: '2026-05-14T09:30:00Z',
        updatedAt: '2026-05-14T09:30:00Z',
        deletedAt: null,
      },
      {
        id: 8,
        conversationId: 3,
        senderType: SenderType.AI,
        content:
          'Tools penting untuk web development modern termasuk: Version Control (Git), Build tools (Webpack, Vite), Package managers (npm, yarn), Testing frameworks (Jest, Vitest), Linters (ESLint), dan IDEs seperti VSCode.',
        isTyping: false,
        createdAt: '2026-05-14T09:35:00Z',
        updatedAt: '2026-05-14T09:35:00Z',
        deletedAt: null,
      },
    ],
  },
];
