# Plan: Frontend Implementation with Mock API

## TL;DR
Build a complete React frontend (TypeScript + Vite + Tailwind) from scratch with mock API services that match the backend endpoints from client.http. This includes auth system (login/register), conversation management, messaging interface, and typing indicators. Mock data will be stored in-memory with localStorage persistence, enabling full feature testing before backend integration.

---

## Discovery Findings
- **Frontend status**: `frontend/src` is completely empty, need to create full structure
- **API endpoints** identified from client.http:
  - **Auth**: POST /api/auth/login (register not yet in client.http but required by requirements)
  - **Conversations**: POST (create), GET (list), GET/:id (detail), PATCH/:id (update), DELETE/:id (delete)
  - **Messages**: POST (create), GET (list by conversation), PATCH/:id (update), DELETE/:id (delete), PATCH/:id/typing (typing status)
- **Tech stack confirmed**: React 18+, TypeScript, Vite, Tailwind CSS
- **Required features**: Auth, conversations, messaging, typing indicators, daily limit tracking

---

## Steps

### Phase 1: Project Setup & Core Infrastructure
1. Initialize Vite React project with TypeScript template in `frontend/` directory
2. Install dependencies: `react-router-dom`, `react-icons`, Tailwind CSS
3. Create project structure:
   - `src/types/` - TypeScript interfaces and types
   - `src/services/` - Mock API service layer
   - `src/context/` - Auth and App state contexts
   - `src/components/` - Reusable UI components
   - `src/pages/` - Page components (Login, Chat, etc.)
   - `src/hooks/` - Custom React hooks
   - `src/utils/` - Helper functions
4. Setup Tailwind CSS with custom colors from requirements (primary: #219ebc, secondary: #ccd5ae, accent1: #d4a373, accent2: #023047)
5. Configure TypeScript paths alias for cleaner imports (`@/*` pointing to `src/*`)

### Phase 2: Data Models & Types
1. Create TypeScript interfaces in `src/types/index.ts`:
   - `User` - id, username, role (admin|user), dailyLimit, createdAt
   - `Conversation` - id, userId, title, createdAt, updatedAt, deletedAt, messages
   - `Message` - id, conversationId, senderType (user|ai), content, isTyping, createdAt, updatedAt
   - `AuthResponse` - success, token, user (optional)
   - `ApiResponse<T>` - Generic wrapper for all API responses (success, data, message, error)
2. Create enum for sender types: `enum SenderType { USER = 'user', AI = 'ai' }`
3. Create enum for user roles: `enum UserRole { ADMIN = 'admin', USER = 'user' }`

### Phase 3: Mock API Service Layer
1. Create `src/services/api.ts` - Base mock API client with:
   - Mock database initialized from hard-coded data in constants
   - In-memory store (Map) for runtime state management
   - Simulated delay (100-500ms) to mimic real API latency
   - localStorage sync for persistence across page reloads
2. Create `src/services/auth.service.ts` with mock implementations:
   - `login(username, password)` - validates against hard-coded users
   - `register(username, password)` - creates new user in-memory
   - Pre-seeded users: admin (admin/admin123), test users
3. Create `src/services/conversation.service.ts`:
   - `createConversation(title)` - creates conversation from hard-coded template
   - `getConversations()` - returns active conversations for current user
   - `getConversationById(id)` - returns conversation with messages
   - `updateConversation(id, title)` - updates conversation title
   - `deleteConversation(id)` - soft delete conversation
4. Create `src/services/message.service.ts`:
   - `createMessage(conversationId, content, senderType)` - creates message
   - `getMessages(conversationId, skip?, take?)` - list messages with pagination
   - `updateMessage(id, content)` - updates message content
   - `deleteMessage(id)` - soft delete message
   - `updateTypingStatus(id, isTyping)` - updates typing status
   - Hard-coded mock AI responses for auto-reply
5. Mock storage: In-memory Map with localStorage sync on every change

### Phase 4: Global State Management (Context API + useReducer)
1. Create `src/context/AuthContext.tsx`:
   - State: user (User | null), token (string | null), isAuthenticated, isLoading
   - Use `useReducer` hook with AuthReducer for state transitions
   - Actions: `LOGIN`, `LOGOUT`, `REGISTER`, `SET_LOADING`
   - AuthProvider component wraps app with Context.Provider
   - Persist token and user data in localStorage on state changes
2. Create `src/context/AppContext.tsx`:
   - State: currentConversation (Conversation | null), conversations (Conversation[])
   - Use `useReducer` hook with AppReducer for state transitions
   - Actions: `SET_CONVERSATIONS`, `SET_CURRENT_CONVERSATION`, `ADD_CONVERSATION`, `UPDATE_CONVERSATION`, `DELETE_CONVERSATION`, `ADD_MESSAGE`, `UPDATE_MESSAGE`, `DELETE_MESSAGE`
   - AppProvider component wraps app with Context.Provider
3. Create custom hooks in `src/hooks/`:
   - `useAuth()` - access AuthContext with auth dispatch
   - `useApp()` - access AppContext with app dispatch
   - `useLocalStorage()` - generic localStorage hook for persistence

### Phase 5: Layout & Navigation Components
1. Create `src/components/Layout.tsx` - Main layout wrapper with:
   - Header with logo and user info
   - Sidebar for conversations list
   - Main content area
   - Footer (optional)
2. Create `src/components/Header.tsx` - Navigation header with:
   - Logout button
   - User role display
   - Daily usage/limit display
3. Create `src/components/Sidebar.tsx` - Conversations sidebar:
   - List of conversations (with soft-deleted indication or filtered out)
   - "New Conversation" button
   - Conversation item click to load conversation
   - Delete conversation button (with soft delete)
   - Rename conversation button

### Phase 6: Authentication Pages
1. Create `src/pages/Login.tsx`:
   - Username and password input fields
   - Login button (calls auth.service.login())
   - Register link navigation
   - Form validation
   - Error message display
   - Loading state
2. Create `src/pages/Register.tsx`:
   - Username and password input fields
   - Password confirmation field
   - Register button
   - Login link navigation
   - Form validation
   - Error handling

### Phase 7: Chat Interface
1. Create `src/pages/Chat.tsx` - Main chat page:
   - Renders Layout wrapper
   - Calls loadConversations() on mount
   - Displays current conversation
   - Renders MessageList and MessageInput components
2. Create `src/components/MessageList.tsx`:
   - Maps through messages array
   - Renders Message component for each message
   - Handles pagination or infinite scroll (optional for mock)
   - Auto-scroll to latest message
3. Create `src/components/Message.tsx`:
   - Displays message content with sender label (You | AI)
   - Shows timestamp
   - Different styling for user vs AI messages
   - AI messages: show typing indicator if isTyping: true
   - Show delete button on hover (for user messages only)
4. Create `src/components/MessageInput.tsx`:
   - Textarea for message content
   - Send button
   - Disable send if empty or conversation not selected
   - Simulates AI response delay (1-3 seconds) with typing indicator
   - Auto-generates mock AI response on user message send

### Phase 8: Conversation Management Components
1. Create `src/components/ConversationItem.tsx`:
   - Conversation title display
   - Last message preview (optional)
   - Selected state styling
   - Context menu for rename/delete (or separate buttons)
2. Create `src/components/RenameConversationDialog.tsx`:
   - Modal dialog with new title input
   - Save/Cancel buttons
   - Calls message.service.updateConversation()
3. Create `src/components/ConfirmDeleteDialog.tsx`:
   - Generic confirmation modal
   - Reusable for delete operations

### Phase 9: Routing & App Structure
1. Create `src/App.tsx`:
   - Setup BrowserRouter with routes:
     - `/` - redirect to /chat or /login based on auth state
     - `/login` - Login page
     - `/register` - Register page
     - `/chat` - Chat page (protected)
     - `/chat/:conversationId` - Specific conversation (protected)
   - ProtectedRoute component to check authentication
2. Create `src/main.tsx` - React entry point with providers:
   - AuthContext provider wraps app
   - AppContext provider wraps app
   - BrowserRouter
3. Create `src/index.css` - Global styles with Tailwind

### Phase 10: Utilities & Helpers
1. Create `src/utils/constants.ts`:
   - API endpoints (for later backend integration)
   - Color theme constants
   - Default daily limit value
   - Hard-coded mock users, conversations, and messages data
2. Create `src/utils/format.ts`:
   - `formatDate()` - Format timestamps
   - `formatTime()` - Format time for messages
3. Create `src/utils/storage.ts`:
   - `getStorageKey()` - Generate storage key with namespace
   - `loadFromStorage()` - Load data from localStorage
   - `saveToStorage()` - Save data to localStorage

### Phase 11: Daily Limit Feature (UI Only)
1. Add `dailyUsageCount` and `dailyLimit` to User type
2. Track message send count in daily limit
3. Display remaining quota in Header component
4. Disable send button if user reached daily limit for today
5. Mock reset logic: Reset count at midnight (or provide manual reset for testing)

### Phase 12: Testing & Verification
1. Ensure all pages load without errors
2. Test login/register flow with mock credentials
3. Test conversation CRUD operations (create, list, detail, update, delete)
4. Test message creation with mock AI response
5. Verify typing indicator appears during AI response simulation
6. Test localStorage persistence across page reloads
7. Verify daily limit tracking works
8. Check styling with Tailwind colors matches requirements

---

## Relevant Files
- Backend API endpoints reference: [client.http](client.http)
- API documentation: [docs/2026-05-10_implementasi-api-conversation.md](docs/2026-05-10_implementasi-api-conversation.md)
- Requirements with colors: [specs/00-requirements.md](specs/00-requirements.md)
- Database schema reference: [specs/database-schema.sql](specs/database-schema.sql)

---

## Verification
1. **Frontend loads**: `npm run dev` in frontend/ runs without errors
2. **Login flow**: Can login with `admin/admin123` and get redirected to chat
3. **Conversation management**: Can create, list, and delete conversations
4. **Messaging**: Can send message and mock AI response appears after 1-3s with typing indicator
5. **Persistence**: Refresh page, data still exists from localStorage
6. **Daily limit**: Tracks message count, disables send at limit
7. **Responsive design**: Layout works on desktop and tablet sizes

---

## Decisions & Scope
- **State management**: Context API + useReducer for predictable state updates and easier testing
- **Mock data approach**: Hard-coded initial data in `src/utils/constants.ts` - no complex seed functions
- **Runtime storage**: In-memory Map with localStorage persistence (data survives page reloads)
- **AI response simulation**: Pre-written mock responses from hard-coded list (not real Gemini API yet)
- **Typing indicator**: Always shows 1-3 second delay before AI response appears
- **Daily limit logic**: Resets at midnight (or can be manually reset in mock for testing)
- **Authentication**: Mock JWT tokens (simple string storage, not real validation)
- **Soft deletes**: Filtered out from UI but technically stored with deletedAt timestamp
- **Scope exclusion**: WebSocket (will be added later), real Gemini API (Phase 2), admin dashboard for daily limit settings (future)

---

## Further Considerations
1. **Component library**: Should we create a separate `components/common/` for UI atoms (Button, Input, Modal) or inline Tailwind? *Recommendation: Create reusable components in `components/common/` to follow best practices and make styling consistent*

2. **Error handling strategy**: How should errors be displayed - toast notifications, inline messages, or modal? *Recommendation: Use toast-like notifications in the bottom-right corner for better UX*

3. **Mock AI responses**: Should responses be simple text or more realistic (with multiple paragraphs, formatting)? *Recommendation: Create a mock response list with realistic AI answers to demonstrate typing indicator and message variety*
