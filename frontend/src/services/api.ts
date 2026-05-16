import { User, Conversation, Message, ApiResponse } from '@/types';
import { MOCK_USERS, MOCK_CONVERSATIONS, STORAGE_KEYS, DEFAULT_DAILY_LIMIT } from '@/utils/constants';
import { saveToStorage, loadFromStorage } from '@/utils/storage';

/**
 * Base Mock API Client with in-memory storage and localStorage persistence
 */
class MockApiClient {
  private users: Map<number, User>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private currentUserId: number | null = null;
  private nextUserId: number = 4;
  private nextConversationId: number = 4;
  private nextMessageId: number = 9;

  constructor() {
    // Initialize from storage or use mock data
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();

    this.initializeData();
  }

  /**
   * Initialize data from localStorage or use mock data
   */
  private initializeData(): void {
    // Try to load users from storage
    const savedUsers = loadFromStorage<User[]>(STORAGE_KEYS.USERS);
    if (savedUsers && Array.isArray(savedUsers)) {
      savedUsers.forEach((user) => this.users.set(user.id, user));
      this.nextUserId = Math.max(...Array.from(this.users.keys())) + 1;
    } else {
      // Use mock users
      MOCK_USERS.forEach((user) => this.users.set(user.id, user));
      this.nextUserId = MOCK_USERS.length + 1;
    }

    // Try to load conversations from storage
    const savedConversations = loadFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS);
    if (savedConversations && Array.isArray(savedConversations)) {
      savedConversations.forEach((conv) => {
        this.conversations.set(conv.id, conv);
      });
      this.nextConversationId = Math.max(...Array.from(this.conversations.keys())) + 1;
    } else {
      // Use mock conversations
      MOCK_CONVERSATIONS.forEach((conv) => {
        this.conversations.set(conv.id, conv);
      });
      this.nextConversationId = MOCK_CONVERSATIONS.length + 1;
    }

    // Try to load messages from storage
    const savedMessages = loadFromStorage<Message[]>(STORAGE_KEYS.MESSAGES);
    if (savedMessages && Array.isArray(savedMessages)) {
      savedMessages.forEach((msg) => this.messages.set(msg.id, msg));
      this.nextMessageId = Math.max(...Array.from(this.messages.keys())) + 1;
    } else {
      // Use mock messages from conversations
      MOCK_CONVERSATIONS.forEach((conv) => {
        if (conv.messages) {
          conv.messages.forEach((msg) => {
            this.messages.set(msg.id, msg);
          });
        }
      });
      this.nextMessageId = Math.max(...Array.from(this.messages.keys())) + 1;
    }
  }

  /**
   * Simulate API latency
   */
  protected async delay(ms: number = 100): Promise<void> {
    // Random delay between 50-500ms to simulate network latency
    const randomDelay = Math.random() * (500 - 50) + 50;
    return new Promise((resolve) => setTimeout(resolve, randomDelay));
  }

  /**
   * Get user by ID
   */
  getUser(id: number): User | null {
    return this.users.get(id) ?? null;
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | null {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  /**
   * Create or update user
   */
  setUser(user: User): void {
    this.users.set(user.id, user);
    this.persistData();
  }

  /**
   * Create new user
   */
  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.nextUserId++,
      ...user,
    };
    this.users.set(newUser.id, newUser);
    this.persistData();
    return newUser;
  }

  /**
   * Get conversation by ID (active only - not deleted)
   */
  getConversation(id: number): Conversation | null {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.deletedAt) return null;
    // Attach messages
    return this.attachMessagesToConversation(conversation);
  }

  /**
   * Get all active conversations for user
   */
  getUserConversations(userId: number): Conversation[] {
    const conversations: Conversation[] = [];
    for (const conv of this.conversations.values()) {
      if (conv.userId === userId && !conv.deletedAt) {
        conversations.push(this.attachMessagesToConversation(conv));
      }
    }
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Create conversation
   */
  createConversation(userId: number, title: string): Conversation {
    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: this.nextConversationId++,
      userId,
      title,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      messages: [],
    };
    this.conversations.set(newConversation.id, newConversation);
    this.persistData();
    return newConversation;
  }

  /**
   * Update conversation
   */
  updateConversation(id: number, title: string): Conversation | null {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.deletedAt) return null;

    const updated = {
      ...conversation,
      title,
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, updated);
    this.persistData();
    return this.attachMessagesToConversation(updated);
  }

  /**
   * Soft delete conversation
   */
  deleteConversation(id: number): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    conversation.deletedAt = new Date().toISOString();
    this.conversations.set(id, conversation);
    this.persistData();
    return true;
  }

  /**
   * Get message by ID
   */
  getMessage(id: number): Message | null {
    return this.messages.get(id) ?? null;
  }

  /**
   * Get messages for conversation
   */
  getConversationMessages(conversationId: number, skip = 0, take = 20): Message[] {
    const messages: Message[] = [];
    for (const msg of this.messages.values()) {
      if (msg.conversationId === conversationId && !msg.deletedAt) {
        messages.push(msg);
      }
    }
    return messages
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(skip, skip + take);
  }

  /**
   * Create message
   */
  createMessage(
    conversationId: number,
    content: string,
    senderType: 'user' | 'ai'
  ): Message {
    const now = new Date().toISOString();
    const newMessage: Message = {
      id: this.nextMessageId++,
      conversationId,
      senderType: senderType as any,
      content,
      isTyping: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.messages.set(newMessage.id, newMessage);
    this.persistData();
    return newMessage;
  }

  /**
   * Update message
   */
  updateMessage(id: number, content: string, isTyping?: boolean): Message | null {
    const message = this.messages.get(id);
    if (!message) return null;

    const updated = {
      ...message,
      content,
      isTyping: isTyping !== undefined ? isTyping : message.isTyping,
      updatedAt: new Date().toISOString(),
    };
    this.messages.set(id, updated);
    this.persistData();
    return updated;
  }

  /**
   * Update message typing status
   */
  updateTypingStatus(id: number, isTyping: boolean): Message | null {
    const message = this.messages.get(id);
    if (!message) return null;

    message.isTyping = isTyping;
    this.messages.set(id, message);
    this.persistData();
    return message;
  }

  /**
   * Soft delete message
   */
  deleteMessage(id: number): boolean {
    const message = this.messages.get(id);
    if (!message) return false;

    message.deletedAt = new Date().toISOString();
    this.messages.set(id, message);
    this.persistData();
    return true;
  }

  /**
   * Set current authenticated user
   */
  setCurrentUserId(userId: number | null): void {
    this.currentUserId = userId;
  }

  /**
   * Get current authenticated user ID
   */
  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  /**
   * Generate mock JWT token
   */
  generateToken(user: User): string {
    // Simple mock token: base64(id:username:role:timestamp)
    const tokenData = `${user.id}:${user.username}:${user.role}:${Date.now()}`;
    return Buffer.from(tokenData).toString('base64');
  }

  /**
   * Attach messages to conversation
   */
  private attachMessagesToConversation(conversation: Conversation): Conversation {
    const messages: Message[] = [];
    for (const msg of this.messages.values()) {
      if (msg.conversationId === conversation.id && !msg.deletedAt) {
        messages.push(msg);
      }
    }
    return {
      ...conversation,
      messages: messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    };
  }

  /**
   * Persist all data to localStorage
   */
  private persistData(): void {
    saveToStorage(STORAGE_KEYS.USERS, Array.from(this.users.values()));
    saveToStorage(STORAGE_KEYS.CONVERSATIONS, Array.from(this.conversations.values()));
    saveToStorage(STORAGE_KEYS.MESSAGES, Array.from(this.messages.values()));
  }
}

// Export singleton instance
export const mockApiClient = new MockApiClient();
