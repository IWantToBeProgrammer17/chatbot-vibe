# 🎓 Mock API Usage Guide

## Quick Start

### 1. Authentication

**Login with existing user:**
```typescript
import { authService } from '@/services';

const response = await authService.login('admin', 'admin123');
if (response.success) {
  const { token, user } = response.data!;
  console.log(`Logged in as ${user.username}`);
}
```

**Pre-configured Test Credentials:**
- Username: `admin`, Password: `admin123` (Admin role, 100/day limit)
- Username: `esto`, Password: `password123` (User role, 20/day limit)
- Username: `azky`, Password: `aski` (User role, 20/day limit)

**Register new user:**
```typescript
const response = await authService.register('myuser', 'mypassword');
if (response.success) {
  const { token, user } = response.data!;
  console.log(`Account created for ${user.username}`);
}
```

**Check authentication status:**
```typescript
const isLoggedIn = authService.isAuthenticated();
const currentUser = authService.getCurrentUser();
const token = authService.getCurrentToken();
```

---

## 2. Conversations

### Create Conversation
```typescript
import { conversationService } from '@/services';

const response = await conversationService.createConversation(
  userId,
  'My New Chat'
);

if (response.success) {
  const conversation = response.data!;
  console.log(`Created conversation #${conversation.id}`);
}
```

### List User Conversations
```typescript
const response = await conversationService.getConversations(userId);

if (response.success) {
  const conversations = response.data!;
  conversations.forEach(conv => {
    console.log(`${conv.id}: ${conv.title}`);
  });
}
```

### Get Single Conversation (with messages)
```typescript
const response = await conversationService.getConversationById(conversationId);

if (response.success) {
  const conversation = response.data!;
  console.log(`${conversation.title} has ${conversation.messages?.length || 0} messages`);
}
```

### Rename Conversation
```typescript
const response = await conversationService.updateConversation(
  conversationId,
  'Updated Title'
);

if (response.success) {
  console.log(`Renamed to: ${response.data?.title}`);
}
```

### Delete Conversation
```typescript
const response = await conversationService.deleteConversation(conversationId);

if (response.success) {
  console.log('Conversation deleted (soft delete)');
}
```

---

## 3. Messages

### Send User Message
```typescript
import { messageService, SenderType } from '@/services';

const response = await messageService.createMessage(
  conversationId,
  'Hello, what is machine learning?',
  SenderType.USER
);

if (response.success) {
  const message = response.data!;
  console.log(`Message sent: ${message.content}`);
}
```

### Send AI Message
```typescript
const response = await messageService.createMessage(
  conversationId,
  'Machine learning is a subset of AI...',
  SenderType.AI
);

if (response.success) {
  const message = response.data!;
  console.log(`AI message created: ${message.content}`);
}
```

### Get Messages (with Pagination)
```typescript
const response = await messageService.getMessages(
  conversationId,
  skip = 0,    // pagination start
  take = 20    // number of messages to return
);

if (response.success) {
  const { items, total, skip, take } = response.data!;
  console.log(`Showing ${items.length} of ${total} messages`);
  items.forEach(msg => {
    console.log(`[${msg.senderType}]: ${msg.content}`);
  });
}
```

### Update Message
```typescript
const response = await messageService.updateMessage(
  messageId,
  'Updated message content'
);

if (response.success) {
  console.log('Message updated');
}
```

### Delete Message
```typescript
const response = await messageService.deleteMessage(messageId);

if (response.success) {
  console.log('Message deleted (soft delete)');
}
```

---

## 4. AI Response with Typing Indicator

**This is the key feature for realistic AI chatbot experience:**

```typescript
// Method 1: Using callbacks for real-time updates
await messageService.createAiResponseWithTyping(
  conversationId,
  
  // Called when typing message is created
  (typingMessage) => {
    console.log('AI is typing...');
    updateUI({ isTyping: true });
  },
  
  // Called when AI response is ready
  (finalMessage) => {
    console.log('AI response ready!');
    updateUI({ isTyping: false, message: finalMessage.content });
  }
);

// Method 2: Await for completion
const aiMessage = await messageService.createAiResponseWithTyping(
  conversationId
);
console.log('AI response:', aiMessage.content);
```

**How it works:**
1. Creates a message with `isTyping: true`
2. Shows typing indicator in UI
3. Waits randomly 1-3 seconds (simulates thinking time)
4. Generates random mock AI response
5. Updates message with actual content and `isTyping: false`

---

## 5. Utility Functions

### Date Formatting
```typescript
import { 
  formatDate, 
  formatTime, 
  formatDateTime,
  formatRelativeTime,
  isToday 
} from '@/utils/format';

const date = new Date();

formatDate(date);           // "10 Mei 2026"
formatTime(date);           // "14:30"
formatDateTime(date);       // "10 Mei 2026 14:30"
formatRelativeTime(date);   // "baru saja", "2m yang lalu", "1h yang lalu"
isToday(date);              // true/false
```

### Storage Management
```typescript
import { 
  saveToStorage, 
  loadFromStorage, 
  removeFromStorage,
  clearStorage 
} from '@/utils/storage';

// Save
saveToStorage('mydata', { id: 1, name: 'Test' });

// Load
const data = loadFromStorage<{ id: number; name: string }>('mydata');

// Load with default
const data = loadFromStorage<any>('mydata', { id: 0 });

// Remove
removeFromStorage('mydata');

// Clear all chatbot data
clearStorage();
```

---

## 6. Daily Limit Tracking

### Check Remaining Quota
```typescript
const user = authService.getCurrentUser();
const remaining = user.dailyLimit - user.dailyUsageCount;
console.log(`${remaining}/${user.dailyLimit} messages remaining`);
```

### Check if Limit Reached
```typescript
const hasReachedLimit = authService.hasReachedDailyLimit(user);
if (hasReachedLimit) {
  console.log('User has reached daily limit');
  // Disable send button in UI
}
```

### Increment Usage Count
```typescript
const user = authService.getCurrentUser()!;
user.dailyUsageCount += 1;
await authService.updateDailyUsageCount(user.id, user.dailyUsageCount);
```

### Reset Daily Limit
```typescript
// Called at midnight or manually for testing
await authService.resetDailyUsageCount(userId);
```

---

## 7. Error Handling

All services return consistent error format:

```typescript
const response = await conversationService.createConversation(userId, '');

if (!response.success) {
  console.error(response.error); // "Judul percakapan tidak boleh kosong"
}
```

**Common Error Messages:**
- "Username dan password harus diisi"
- "Username atau password salah"
- "Username sudah digunakan"
- "Username minimal 3 karakter"
- "Password minimal 6 karakter"
- "Judul percakapan tidak boleh kosong"
- "Pesan tidak boleh kosong"
- "Percakapan tidak ditemukan"
- "Pesan tidak ditemukan"

---

## 8. Complete Example Flow

```typescript
import { 
  authService, 
  conversationService, 
  messageService 
} from '@/services';
import { SenderType } from '@/types';

async function chatbotFlow() {
  // 1. Login
  const loginRes = await authService.login('esto', 'password123');
  if (!loginRes.success) throw new Error(loginRes.error);
  
  const user = loginRes.data!.user;
  console.log(`✅ Logged in as ${user.username}`);

  // 2. Create conversation
  const convRes = await conversationService.createConversation(
    user.id,
    'My AI Chat'
  );
  if (!convRes.success) throw new Error(convRes.error);
  
  const conversation = convRes.data!;
  console.log(`✅ Created conversation: ${conversation.title}`);

  // 3. Send user message
  const msgRes = await messageService.createMessage(
    conversation.id,
    'What is TypeScript?',
    SenderType.USER
  );
  if (!msgRes.success) throw new Error(msgRes.error);
  console.log(`✅ Message sent`);

  // 4. Simulate AI thinking and response
  const aiRes = await messageService.createAiResponseWithTyping(
    conversation.id,
    () => console.log('⏳ AI is thinking...'),
    (msg) => console.log(`✅ AI: ${msg.content}`)
  );

  // 5. Get all messages
  const allMsgsRes = await messageService.getMessages(conversation.id);
  if (allMsgsRes.success) {
    console.log(`✅ Total messages: ${allMsgsRes.data?.total}`);
    allMsgsRes.data?.items?.forEach(msg => {
      console.log(`  [${msg.senderType}]: ${msg.content.substring(0, 30)}...`);
    });
  }

  // 6. Logout
  await authService.logout();
  console.log(`✅ Logged out`);
}

// Run it
chatbotFlow().catch(console.error);
```

---

## 9. Testing in Browser Console

**1. Open browser DevTools (F12)**

**2. Go to Console tab**

**3. Import and run test:**
```javascript
import('./src/services/test.js').then(m => m.testMockApi());
```

**Expected output:**
```
🧪 Starting Mock API Tests...

📝 Test 1: Login
✅ Login successful: admin

📝 Test 2: Invalid Login
✅ Invalid login rejected: Username atau password salah

[... more tests ...]

✅ All tests passed! 🎉
```

---

## 10. Mock Data Overview

**Pre-seeded Users:**
| Username | Password | Role | Daily Limit |
|----------|----------|------|------------|
| admin | admin123 | Admin | 100 |
| esto | password123 | User | 20 |
| azky | aski | User | 20 |

**Pre-seeded Conversations (User esto):**
1. **Chat about AI** (4 messages)
   - User: "Halo, apa itu AI?"
   - AI: [explanation about AI]
   - User: "Apa perbedaan antara machine learning dan deep learning?"
   - AI: [explanation about ML vs DL]

2. **Python Programming Tips** (2 messages)
   - User: "Bagaimana cara membuat function yang efisien di Python?"
   - AI: [Python tips]

3. **Web Development Stack** (User azky, 2 messages)
   - User: "Apa saja tools yang penting untuk web development modern?"
   - AI: [tools explanation]

---

## 11. localStorage Persistence

Data is automatically persisted with these keys:

```javascript
// Check what's stored
localStorage.getItem('chatbot_user')
localStorage.getItem('chatbot_token')
localStorage.getItem('chatbot_conversations')
localStorage.getItem('chatbot_messages')
localStorage.getItem('chatbot_users')
```

**Example:**
```javascript
// After login, data persists
await authService.login('admin', 'admin123');
window.location.reload(); // Page refreshes

// User is still logged in!
console.log(authService.getCurrentUser()); // Works!
```

---

## 12. Next Steps

After familiarizing yourself with the Mock API:

1. **Build Context API layer** (Phase 4) to manage:
   - Auth state (user, token, isAuthenticated)
   - App state (conversations, current conversation, messages)

2. **Create React components** (Phase 5+) that:
   - Use the Context hooks
   - Call the services
   - Update UI with loading/error states
   - Display typing indicators while AI responds

3. **Later swap for real backend**:
   - Replace `mockApiClient` with real API calls
   - Keep all services interface the same
   - Context and components work unchanged!

---

## Questions?

Check the source files:
- **Types**: [src/types/index.ts](frontend/src/types/index.ts)
- **Services**: [src/services/](frontend/src/services/)
- **Utils**: [src/utils/](frontend/src/utils/)
- **Tests**: [src/services/test.ts](frontend/src/services/test.ts)
