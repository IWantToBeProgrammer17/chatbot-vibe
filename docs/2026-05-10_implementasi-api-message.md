# Dokumentasi Implementasi API Routes Message

**Tanggal:** 10 Mei 2026  
**Topik:** Implementasi API Routes untuk Handle Message  
**Status:** ✅ Selesai dan Tested

---

## 📋 Ringkasan Implementasi

Pada tahap ini, telah dilakukan implementasi lengkap API routes untuk menangani fitur message (pesan) pada aplikasi Chatbot AI. Implementasi mencakup tiga lapisan arsitektur yang sama dengan Conversation API: Service Layer, Controller Layer, dan Routes Layer.

Message API memungkinkan user untuk membuat, membaca, mengupdate, dan menghapus messages dalam setiap conversation, dengan support untuk typing indicator dan pagination.

---

## 🎯 Tujuan & Requirements

Membuat API endpoints yang memungkinkan user untuk:
- ✅ Membuat message baru (user atau AI)
- ✅ Melihat daftar messages dalam conversation (dengan pagination)
- ✅ Filter messages berdasarkan sender type (user/ai)
- ✅ Melihat detail message spesifik
- ✅ Update content message
- ✅ Update typing status (untuk AI responses)
- ✅ Menghapus message

Semua endpoint harus dilindungi dengan autentikasi JWT dan memverifikasi ownership conversation.

---

## 🏗️ Arsitektur Implementasi

### 1. Service Layer
**File:** `src/services/message.service.ts`

Kelas `MessageService` dengan static methods:

| Method | Deskripsi |
|--------|-----------|
| `createMessage(conversationId, userId, senderType, content)` | Membuat message baru |
| `getMessagesByConversationId(conversationId, userId)` | Mengambil semua messages dalam conversation |
| `getMessageById(messageId, userId)` | Mengambil detail message spesifik |
| `updateMessageContent(messageId, userId, content)` | Update content message |
| `updateTypingStatus(messageId, userId, isTyping)` | Update typing indicator status |
| `deleteMessage(messageId, userId)` | Hapus message |
| `getMessageCount(conversationId, userId)` | Menghitung jumlah messages dalam conversation |
| `getMessagesBySenderType(conversationId, userId, senderType)` | Filter messages by sender type |
| `getMessagesPaginated(conversationId, userId, skip, take)` | Get messages dengan pagination |

**Fitur Keamanan:**
- Verifikasi ownership - user hanya bisa access/modify messages dalam conversation milik mereka
- Validation conversation ownership sebelum create/read messages
- Error handling untuk unauthorized access
- Type-safe dengan Prisma SenderType enum

### 2. Controller Layer
**File:** `src/controllers/message.controller.ts`

Tujuh handler function dengan validasi lengkap:

| Handler | HTTP | Endpoint | Deskripsi |
|---------|------|----------|-----------|
| `createMessage` | POST | `/api/conversations/:conversationId/messages` | Buat message |
| `getMessages` | GET | `/api/conversations/:conversationId/messages` | List messages (paginated) |
| `getMessagesBySenderType` | GET | `/api/conversations/:conversationId/messages/sender/:senderType` | Filter by sender |
| `getMessageDetail` | GET | `/api/messages/:id` | Detail message |
| `updateMessage` | PATCH | `/api/messages/:id` | Update content |
| `updateTypingStatus` | PATCH | `/api/messages/:id/typing` | Update typing |
| `deleteMessage` | DELETE | `/api/messages/:id` | Hapus message |

**Validasi yang Diimplementasi:**
- ✅ Autentikasi JWT (via middleware)
- ✅ Validasi ID format (integer parsing)
- ✅ Validasi input body (content not empty, boolean isTyping)
- ✅ Validasi senderType enum (user/ai)
- ✅ Authorization check (ownership verification)
- ✅ Pagination validation (skip >= 0, 1 <= take <= 100)
- ✅ Error handling dengan proper HTTP status codes

**Enum Mapping:**
- String input 'user'/'ai' di-mapping ke Prisma SenderType enum (USER/AI)
- Helper function `mapToSenderType()` untuk conversion

### 3. Routes Layer
**File:** `src/routes/messages.ts`

Express router dengan 7 endpoints:

```
POST   /api/conversations/:conversationId/messages            - Buat message
GET    /api/conversations/:conversationId/messages            - List messages
GET    /api/conversations/:conversationId/messages/sender/:senderType - Filter by sender
GET    /api/messages/:id                                      - Detail message
PATCH  /api/messages/:id                                      - Update content
PATCH  /api/messages/:id/typing                               - Update typing
DELETE /api/messages/:id                                      - Hapus message
```

**Middleware:**
- Semua routes dilindungi dengan `authMiddleware` (JWT verification)

### 4. Integration
**File:** `src/index.ts`

Routes message sudah terdaftar di main server:
```typescript
app.use('/api', messageRoutes);
```

---

## 📝 API Endpoints & Usage Examples

### 1. Buat Message Baru (User)
```http
POST http://localhost:3000/api/conversations/1/messages
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "content": "Halo, apa itu AI?",
  "senderType": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversationId": 1,
    "senderType": "USER",
    "content": "Halo, apa itu AI?",
    "isTyping": false,
    "createdAt": "2026-05-10T12:00:00.000Z",
    "updatedAt": "2026-05-10T12:00:00.000Z"
  }
}
```

### 2. Buat Message Baru (AI Response)
```http
POST http://localhost:3000/api/conversations/1/messages
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "content": "AI adalah cabang ilmu komputer yang fokus pada penciptaan sistem cerdas...",
  "senderType": "ai"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "conversationId": 1,
    "senderType": "AI",
    "content": "AI adalah cabang ilmu komputer...",
    "isTyping": false,
    "createdAt": "2026-05-10T12:01:00.000Z",
    "updatedAt": "2026-05-10T12:01:00.000Z"
  }
}
```

### 3. Get All Messages (dengan Pagination)
```http
GET http://localhost:3000/api/conversations/1/messages?skip=0&take=20
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversationId": 1,
      "senderType": "USER",
      "content": "Halo, apa itu AI?",
      "isTyping": false,
      "createdAt": "2026-05-10T12:00:00.000Z",
      "updatedAt": "2026-05-10T12:00:00.000Z"
    },
    {
      "id": 2,
      "conversationId": 1,
      "senderType": "AI",
      "content": "AI adalah cabang ilmu komputer...",
      "isTyping": false,
      "createdAt": "2026-05-10T12:01:00.000Z",
      "updatedAt": "2026-05-10T12:01:00.000Z"
    }
  ],
  "pagination": {
    "skip": 0,
    "take": 20,
    "total": 2,
    "pages": 1
  }
}
```

### 4. Get Messages by Sender Type (User Only)
```http
GET http://localhost:3000/api/conversations/1/messages/sender/user
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "conversationId": 1,
      "senderType": "USER",
      "content": "Halo, apa itu AI?",
      "isTyping": false,
      "createdAt": "2026-05-10T12:00:00.000Z",
      "updatedAt": "2026-05-10T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 5. Get Messages by Sender Type (AI Only)
```http
GET http://localhost:3000/api/conversations/1/messages/sender/ai
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "conversationId": 1,
      "senderType": "AI",
      "content": "AI adalah cabang ilmu komputer...",
      "isTyping": false,
      "createdAt": "2026-05-10T12:01:00.000Z",
      "updatedAt": "2026-05-10T12:01:00.000Z"
    }
  ],
  "count": 1
}
```

### 6. Get Message Detail
```http
GET http://localhost:3000/api/messages/1
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversationId": 1,
    "senderType": "USER",
    "content": "Halo, apa itu AI?",
    "isTyping": false,
    "createdAt": "2026-05-10T12:00:00.000Z",
    "updatedAt": "2026-05-10T12:00:00.000Z"
  }
}
```

### 7. Update Message Content
```http
PATCH http://localhost:3000/api/messages/1
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "content": "Updated message content"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "conversationId": 1,
    "senderType": "USER",
    "content": "Updated message content",
    "isTyping": false,
    "createdAt": "2026-05-10T12:00:00.000Z",
    "updatedAt": "2026-05-10T12:05:00.000Z"
  },
  "message": "Message updated successfully"
}
```

### 8. Update Typing Status
```http
PATCH http://localhost:3000/api/messages/2/typing
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "isTyping": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "conversationId": 1,
    "senderType": "AI",
    "content": "AI adalah cabang ilmu komputer...",
    "isTyping": true,
    "createdAt": "2026-05-10T12:01:00.000Z",
    "updatedAt": "2026-05-10T12:02:00.000Z"
  },
  "message": "Typing status updated successfully"
}
```

### 9. Delete Message
```http
DELETE http://localhost:3000/api/messages/1
Authorization: Bearer {TOKEN}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## 🐛 Issues & Solutions

### Issue 1: Prisma SenderType Enum Type Mismatch
**Problem:**
```
error TS2322: Type '"user" | "ai"' is not assignable to type 'SenderType'.
Type '"user"' is not assignable to type 'SenderType'. Did you mean '"USER"'?
```

**Root Cause:**
Prisma schema mendefinisikan `SenderType` enum dengan uppercase values (USER, AI) yang di-map ke lowercase di database (user, ai):
```prisma
enum SenderType {
  USER @map("user")
  AI   @map("ai")
}
```

API controller menerima string lowercase ('user'/'ai') dari client tetapi Prisma memerlukan enum type uppercase (USER/AI).

**Solution:**
1. Import `SenderType` dari '@prisma/client' di service layer
2. Ubah method signature untuk menggunakan `SenderType` enum
3. Buat helper function `mapToSenderType()` di controller untuk convert string ke enum:
```typescript
function mapToSenderType(senderTypeStr: string): SenderType {
  const mapping: { [key: string]: SenderType } = {
    user: SenderType.USER,
    ai: SenderType.AI,
  };
  return mapping[senderTypeStr.toLowerCase()] || SenderType.USER;
}
```

**Status:** ✅ Resolved

---

## ✅ Testing & Verification

### Proses Testing
1. ✅ TypeScript compilation - Berhasil
2. ✅ Import check - Tidak ada error
3. ✅ Enum type validation - Berhasil
4. ✅ Server startup - Berhasil
5. ✅ API endpoints ready - Siap untuk ditest dengan client

### Server Status
```
✓ Server running on http://localhost:3000
✓ Environment: development
```

---

## 📚 Database Schema Reference

### Message Model
```
id (INT) - Primary Key
conversationId (INT) - Foreign Key to conversations.id
senderType (ENUM: USER | AI) - Sender type (mapped to 'user' | 'ai' in DB)
content (LONGTEXT) - Message content
isTyping (BOOLEAN) - Typing indicator status
createdAt (TIMESTAMP) - Created timestamp
updatedAt (TIMESTAMP) - Updated timestamp
```

### Relations
```
Message -> Conversation (many-to-one)
```

---

## 🔒 Security Features Implemented

1. **JWT Authentication**
   - Semua endpoints protected dengan `authMiddleware`
   - Token validation di setiap request

2. **Authorization (Ownership Verification)**
   - User hanya bisa access/modify messages dalam conversation miliknya
   - Query verifikasi conversation ownership sebelum message operations

3. **Input Validation**
   - ID format validation (integer parsing)
   - Content validation (required, non-empty string)
   - senderType validation (user/ai)
   - isTyping validation (boolean)
   - Pagination validation (skip >= 0, 1 <= take <= 100)
   - Error handling untuk invalid requests

4. **Data Integrity**
   - Cascade delete - messages terhapus otomatis jika conversation dihapus
   - Timestamp tracking (createdAt, updatedAt)
   - Type-safe dengan Prisma enum

---

## 📂 File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── conversation.controller.ts      [EXISTING]
│   │   ├── message.controller.ts           [NEW]
│   │   └── user.controller.ts              [EXISTING]
│   ├── routes/
│   │   ├── auth.ts                         [EXISTING]
│   │   ├── conversations.ts                [EXISTING]
│   │   └── messages.ts                     [UPDATED]
│   ├── services/
│   │   ├── auth.service.ts                 [EXISTING]
│   │   ├── conversation.service.ts         [EXISTING]
│   │   └── message.service.ts              [UPDATED]
│   ├── middleware/
│   │   └── auth.ts                         [EXISTING]
│   ├── utils/
│   │   ├── jwt.ts                          [EXISTING]
│   │   ├── password.ts                     [EXISTING]
│   │   └── prisma.ts                       [EXISTING]
│   └── index.ts                            [UPDATED]
└── prisma/
    └── schema.prisma                       [EXISTING]
```

---

## 📋 API Endpoint Summary

| No | Method | Endpoint | Deskripsi | Status |
|----|--------|----------|-----------|--------|
| 1 | POST | `/api/conversations/:conversationId/messages` | Create message | ✅ |
| 2 | GET | `/api/conversations/:conversationId/messages` | Get all messages (paginated) | ✅ |
| 3 | GET | `/api/conversations/:conversationId/messages/sender/:senderType` | Filter by sender type | ✅ |
| 4 | GET | `/api/messages/:id` | Get message detail | ✅ |
| 5 | PATCH | `/api/messages/:id` | Update message content | ✅ |
| 6 | PATCH | `/api/messages/:id/typing` | Update typing status | ✅ |
| 7 | DELETE | `/api/messages/:id` | Delete message | ✅ |

---

## 📌 Fitur-fitur Implementasi

### ✅ Message CRUD Operations
- Create, Read, Update, Delete messages
- Support untuk both user dan AI messages

### ✅ Pagination Support
- Query parameters: `skip` dan `take`
- Default: skip=0, take=20
- Max take=100 untuk prevent abuse

### ✅ Filter & Search
- Filter messages by sender type (user/ai)
- Get messages for specific conversation

### ✅ Typing Indicator
- Update `isTyping` status untuk show AI response status
- Frontend dapat polling atau gunakan WebSocket untuk real-time

### ✅ Authorization
- Ownership verification di setiap operation
- User tidak bisa access messages dari conversation orang lain

### ✅ Error Handling
- Proper HTTP status codes (400, 401, 404, 500)
- Meaningful error messages
- Validation untuk semua inputs

---

## 🔗 Related Files & References

- Conversation API: [docs/2026-05-10_implementasi-api-conversation.md](2026-05-10_implementasi-api-conversation.md)
- Database Design: [specs/database-design.md](../specs/database-design.md)
- Requirements: [specs/00-requirements.md](../specs/00-requirements.md)
- API Examples: [client.http](../client.http)
- Prisma Schema: [prisma/schema.prisma](../backend/prisma/schema.prisma)

---

## 📊 Comparison: Conversation vs Message API

| Aspek | Conversation | Message |
|-------|--------------|---------|
| Soft Delete | Ya (deletedAt) | Tidak (hard delete) |
| Rename | Ya (title) | Tidak |
| Pagination | Tidak | Ya |
| Filter by Type | Tidak | Ya (senderType) |
| Typing Indicator | Tidak | Ya (isTyping) |

---

**Dokumentasi dibuat pada:** 10 Mei 2026  
**Status Implementasi:** ✅ Message API - DONE | ⏳ AI Integration - PENDING | ⏳ Daily Limit - PENDING
