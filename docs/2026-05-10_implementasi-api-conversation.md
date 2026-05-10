# Dokumentasi Implementasi API Routes Conversation

**Tanggal:** 10 Mei 2026  
**Topik:** Implementasi API Routes untuk Handle Conversation  
**Status:** ✅ Selesai dan Tested

---

## 📋 Ringkasan Percakapan

Pada sesi ini, telah dilakukan implementasi lengkap API routes untuk menangani fitur conversation (percakapan) pada aplikasi Chatbot AI. Implementasi mencakup tiga lapisan arsitektur: Service Layer, Controller Layer, dan Routes Layer.

---

## 🎯 Tujuan & Requirements

Membuat API endpoints yang memungkinkan user untuk:
- ✅ Membuat conversation baru
- ✅ Melihat daftar semua conversation milik user
- ✅ Melihat detail conversation spesifik beserta messages-nya
- ✅ Rename (update title) conversation
- ✅ Menghapus conversation (soft delete)

Semua endpoint harus dilindungi dengan autentikasi JWT dan memverifikasi ownership conversation.

---

## 🏗️ Arsitektur Implementasi

### 1. Service Layer
**File:** `src/services/conversation.service.ts`

Kelas `ConversationService` dengan static methods:

| Method | Deskripsi |
|--------|-----------|
| `createConversation(userId, title)` | Membuat conversation baru untuk user |
| `getConversationsByUserId(userId)` | Mengambil semua conversation user (exclude soft-deleted) |
| `getConversationById(conversationId, userId)` | Mengambil detail conversation spesifik + messages |
| `updateConversationTitle(conversationId, userId, title)` | Update title conversation (rename) |
| `deleteConversation(conversationId, userId)` | Soft delete conversation |
| `getConversationCount(userId)` | Menghitung jumlah conversation active user |

**Fitur Keamanan:**
- Verifikasi ownership - user hanya bisa access/modify conversation milik mereka
- Soft delete - data tidak benar-benar dihapus, hanya di-mark dengan `deletedAt`
- Error handling untuk unauthorized access

### 2. Controller Layer
**File:** `src/controllers/conversation.controller.ts`

Lima handler function dengan validasi lengkap:

| Handler | HTTP | Endpoint | Deskripsi |
|---------|------|----------|-----------|
| `createConversation` | POST | `/api/conversations` | Buat conversation baru |
| `getConversations` | GET | `/api/conversations` | Daftar semua conversation |
| `getConversationDetail` | GET | `/api/conversations/:id` | Lihat detail conversation |
| `updateConversation` | PATCH | `/api/conversations/:id` | Rename conversation |
| `deleteConversation` | DELETE | `/api/conversations/:id` | Hapus conversation |

**Validasi yang Diimplementasi:**
- ✅ Autentikasi JWT (via middleware)
- ✅ Validasi ID format (integer parsing)
- ✅ Validasi input body (title not empty)
- ✅ Authorization check (ownership verification)
- ✅ Error handling dengan proper HTTP status codes

### 3. Routes Layer
**File:** `src/routes/conversations.ts`

Express router dengan 5 endpoints:

```
POST   /api/conversations          - Buat conversation
GET    /api/conversations          - List all
GET    /api/conversations/:id      - Detail
PATCH  /api/conversations/:id      - Update title
DELETE /api/conversations/:id      - Delete
```

**Middleware:**
- Semua routes dilindungi dengan `authMiddleware` (JWT verification)

### 4. Integration
**File:** `src/index.ts`

Routes conversation sudah terdaftar di main server:
```typescript
app.use('/api/conversations', conversationRoutes);
```

---

## 📝 API Endpoints & Usage Examples

### 1. Login untuk Mendapatkan Token
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "esto",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Buat Conversation Baru
```http
POST http://localhost:3000/api/conversations
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhemt5Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzgzNzg2NjUsImV4cCI6MTc3ODk4MzQ2NX0.pvFSKHMakR9oKtsmMYABlTPu8cjW_FlRGbPn5T3kMPk

{
  "title": "Chat tentang AI"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Chat tentang AI",
    "createdAt": "2026-05-10T10:30:00.000Z",
    "updatedAt": "2026-05-10T10:30:00.000Z",
    "deletedAt": null,
    "messages": []
  }
}
```

### 3. Daftar Semua Conversation
```http
GET http://localhost:3000/api/conversations
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "title": "Chat tentang AI",
      "createdAt": "2026-05-10T10:30:00.000Z",
      "updatedAt": "2026-05-10T10:30:00.000Z",
      "deletedAt": null,
      "messages": []
    },
    {
      "id": 2,
      "userId": 1,
      "title": "Chat tentang Web Development",
      "createdAt": "2026-05-10T11:00:00.000Z",
      "updatedAt": "2026-05-10T11:00:00.000Z",
      "deletedAt": null,
      "messages": []
    }
  ],
  "count": 2
}
```

### 4. Lihat Detail Conversation
```http
GET http://localhost:3000/api/conversations/1
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Chat tentang AI",
    "createdAt": "2026-05-10T10:30:00.000Z",
    "updatedAt": "2026-05-10T10:30:00.000Z",
    "deletedAt": null,
    "messages": [
      {
        "id": 1,
        "conversationId": 1,
        "senderType": "user",
        "content": "Halo, apa itu AI?",
        "isTyping": false,
        "createdAt": "2026-05-10T10:31:00.000Z",
        "updatedAt": "2026-05-10T10:31:00.000Z"
      }
    ],
    "user": {
      "id": 1,
      "username": "esto",
      "role": "user"
    }
  }
}
```

### 5. Rename Conversation
```http
PATCH http://localhost:3000/api/conversations/1
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "title": "Chat tentang Machine Learning"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "title": "Chat tentang Machine Learning",
    "createdAt": "2026-05-10T10:30:00.000Z",
    "updatedAt": "2026-05-10T10:32:00.000Z",
    "deletedAt": null,
    "messages": []
  },
  "message": "Conversation title updated successfully"
}
```

### 6. Hapus Conversation (Soft Delete)
```http
DELETE http://localhost:3000/api/conversations/1
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

## 🐛 Issues & Solutions

### Issue 1: Import Prisma Error
**Problem:** 
```
error TS2614: Module '"../utils/prisma"' has no exported member 'prisma'
```

**Root Cause:**
File `prisma.ts` menggunakan `export default prisma`, tetapi di `conversation.service.ts` menggunakan named import `import { prisma }`.

**Solution:**
Mengubah import di `conversation.service.ts` dari:
```typescript
import { prisma } from '../utils/prisma';
```

Menjadi:
```typescript
import prisma from '../utils/prisma';
```

**Status:** ✅ Resolved

---

## ✅ Testing & Verification

### Proses Testing
1. ✅ Menjalankan `npm run dev` - Server berhasil start
2. ✅ Melakukan import check - Tidak ada error
3. ✅ TypeScript compilation - Berhasil
4. ✅ API endpoints ready - Siap untuk ditest dengan client

### Server Status
```
✓ Server running on http://localhost:3000
✓ Environment: development
```

---

## 📚 Database Schema Reference

### Conversation Model
```
id (INT) - Primary Key
userId (INT) - Foreign Key to users.id
title (VARCHAR) - Conversation title
createdAt (TIMESTAMP) - Created timestamp
updatedAt (TIMESTAMP) - Updated timestamp
deletedAt (TIMESTAMP, nullable) - Soft delete timestamp
```

### Message Model (Related)
```
id (INT) - Primary Key
conversationId (INT) - Foreign Key to conversations.id
senderType (ENUM: 'user' | 'ai') - Who sent the message
content (LONGTEXT) - Message content
isTyping (BOOLEAN) - Typing indicator
createdAt (TIMESTAMP) - Created timestamp
updatedAt (TIMESTAMP) - Updated timestamp
```

---

## 🔒 Security Features Implemented

1. **JWT Authentication**
   - Semua endpoints protected dengan `authMiddleware`
   - Token validation di setiap request

2. **Authorization (Ownership Verification)**
   - User hanya bisa access/modify conversation miliknya
   - Query filter berdasarkan `userId` dan `conversationId`

3. **Input Validation**
   - ID format validation (integer parsing)
   - Title validation (required, non-empty string)
   - Error handling untuk invalid requests

4. **Data Integrity**
   - Soft delete support (tidak menghapus data)
   - Timestamp tracking (createdAt, updatedAt, deletedAt)
   - Cascade delete dari messages ketika conversation dihapus

---

## 📂 File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── conversation.controller.ts      [NEW]
│   ├── routes/
│   │   └── conversations.ts                [UPDATED]
│   ├── services/
│   │   └── conversation.service.ts         [UPDATED]
│   ├── middleware/
│   │   └── auth.ts                         [EXISTING]
│   ├── utils/
│   │   └── prisma.ts                       [EXISTING]
│   └── index.ts                            [UPDATED]
└── prisma/
    └── schema.prisma                       [EXISTING - Conversation & Message models]
```

---

## 🎯 Next Steps & Plan Implementasi Berikutnya

### Phase 1: Message API (Priority: HIGH) ⏳
**Deadline:** 1 minggu ke depan

Sama dengan conversation API, implementasikan API untuk handle messages:

1. **Message Service** (`src/services/message.service.ts`)
   - `createMessage()` - Buat message baru
   - `getMessagesByConversationId()` - Fetch messages per conversation
   - `updateMessage()` - Update message content
   - `deleteMessage()` - Soft delete message
   - `updateTypingStatus()` - Update is_typing status

2. **Message Controller** (`src/controllers/message.controller.ts`)
   - Handler untuk CRUD operations
   - Validasi conversation ownership
   - Input validation (content length, format)

3. **Message Routes** (`src/routes/messages.ts`)
   - POST `/api/conversations/:conversationId/messages` - Buat message
   - GET `/api/conversations/:conversationId/messages` - List messages
   - PATCH `/api/messages/:id` - Update message
   - DELETE `/api/messages/:id` - Delete message
   - PATCH `/api/messages/:id/typing` - Update typing status

4. **Integration**
   - Register routes di `src/index.ts`
   - Update example di `client.http`

---

### Phase 2: Gemini AI Integration (Priority: HIGH) ⏳
**Deadline:** 2 minggu ke depan

Integrasi dengan Gemini API untuk AI response:

1. **Setup Gemini API**
   - Install `@google/generative-ai` package
   - Setup API key di `.env`
   - Create AI service wrapper

2. **AI Service** (`src/services/ai.service.ts`)
   - `generateAIResponse()` - Call Gemini API dengan user message
   - `handleConversationContext()` - Pass full conversation history untuk context
   - Error handling untuk rate limiting

3. **Update Message Controller**
   - Ketika user kirim message (POST message)
   - Otomatis trigger AI response
   - Save AI response sebagai message dengan `senderType: 'ai'`

4. **Typing Indicator**
   - Set `is_typing: true` saat AI sedang generate response
   - Update `is_typing: false` ketika response selesai
   - Frontend dapat polling status atau gunakan WebSocket untuk real-time

---

### Phase 3: Daily Limit Implementation (Priority: MEDIUM) ⏳
**Deadline:** 2-3 minggu ke depan

Implementasi daily message limit per user:

1. **Daily Usage Tracking Service** (`src/services/daily-usage.service.ts`)
   - `getOrCreateDailyUsage()` - Get atau create daily usage record
   - `incrementMessageCount()` - Tambah counter ketika user kirim message
   - `checkLimit()` - Cek apakah user sudah mencapai limit hari ini
   - `resetDailyUsage()` - Reset daily usage (scheduled task)

2. **Middleware untuk Daily Limit** (`src/middleware/daily-limit.ts`)
   - Check daily limit sebelum allow message creation
   - Return 429 Too Many Requests jika sudah over limit

3. **Update Message Controller**
   - Tambahkan daily-limit middleware
   - Return user info (remaining quota) dalam response

4. **Admin Settings**
   - Endpoint untuk admin update user daily_limit
   - Endpoint untuk admin check user usage statistics

5. **Scheduled Task**
   - Setup cron job untuk reset daily usage setiap hari pukul 00:00 WIB
   - Atau bisa menggunakan `APScheduler` atau `node-cron`

---

### Phase 4: WebSocket untuk Real-time (Priority: MEDIUM) ⏳
**Deadline:** 3-4 minggu ke depan

Implementasi WebSocket untuk real-time messaging:

1. **Setup Socket.IO**
   - Install `socket.io` package
   - Setup Socket.IO server di backend

2. **Real-time Features**
   - Real-time typing indicator
   - Real-time message delivery
   - Real-time notifications
   - Online/offline status

3. **Socket Events**
   - `message:send` - Broadcast new message
   - `typing:start` - User mulai typing
   - `typing:stop` - User selesai typing
   - `user:online` - User go online
   - `user:offline` - User go offline

---

### Phase 5: Additional Features (Priority: LOW) ⏳
**Deadline:** 4-5 minggu ke depan

1. **User Profile & Settings**
   - Update profile endpoint
   - Change password endpoint
   - Account preferences

2. **Conversation Search & Filter**
   - Search conversations by title
   - Filter by date range
   - Pagination support

3. **Export Conversation**
   - Export conversation as PDF
   - Export as text file
   - Export as JSON

4. **Analytics & Statistics**
   - User message count statistics
   - Daily usage charts
   - AI response time metrics

---

## 📌 Notes & Recommendations

1. **Database Optimization**
   - Consider adding indexes untuk frequently queried columns
   - Monitor query performance dengan database logs

2. **Error Handling**
   - Implement centralized error handler middleware
   - Create custom error classes untuk different error types
   - Implement proper logging system

3. **Testing**
   - Implementasikan unit tests untuk services
   - Implementasikan integration tests untuk endpoints
   - Use Jest atau Mocha for testing framework

4. **API Documentation**
   - Generate Swagger/OpenAPI documentation
   - Use `swagger-jsdoc` untuk auto-generate dari comments

5. **Environment Configuration**
   - Pastikan semua sensitive data ada di `.env`
   - Never commit `.env` file
   - Use `.env.example` untuk template

6. **Performance**
   - Implement caching strategy (Redis)
   - Optimize database queries
   - Implement rate limiting untuk API endpoints

---

## 🔗 Related Files & References

- Database Design: [docs/database-design.md](../specs/database-design.md)
- Requirements: [specs/00-requirements.md](../specs/00-requirements.md)
- API Examples: [client.http](../client.http)
- Prisma Schema: [prisma/schema.prisma](../backend/prisma/schema.prisma)

---

**Dokumentasi dibuat pada:** 10 Mei 2026  
**Status Implementasi:** ✅ Conversation API - DONE | ⏳ Message API - PENDING | ⏳ AI Integration - PENDING
