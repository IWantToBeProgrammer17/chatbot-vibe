import { User, AuthResponse, UserRole } from '@/types';
import { mockApiClient } from './api';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_DAILY_LIMIT } from '@/utils/constants';

/**
 * Mock Authentication Service
 */
class AuthService {
  /**
   * Login user
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    await mockApiClient.delay(100);

    // Validate input
    if (!username || !password) {
      return {
        success: false,
        error: 'Username dan password harus diisi',
      };
    }

    // Check if user exists
    const user = mockApiClient.getUserByUsername(username);

    // Mock password validation (in mock, password is hardcoded)
    const mockPasswords: { [key: string]: string } = {
      admin: 'admin123',
      esto: 'password123',
      azky: 'aski',
    };

    if (!user || mockPasswords[username] !== password) {
      return {
        success: false,
        error: 'Username atau password salah',
      };
    }

    // Generate token
    const token = mockApiClient.generateToken(user);

    // Set current user
    mockApiClient.setCurrentUserId(user.id);

    // Save to storage
    saveToStorage(STORAGE_KEYS.USER, user);
    saveToStorage(STORAGE_KEYS.TOKEN, token);

    return {
      success: true,
      data: {
        token,
        user,
      },
    };
  }

  /**
   * Register new user
   */
  async register(username: string, password: string): Promise<AuthResponse> {
    await mockApiClient.delay(150);

    // Validate input
    if (!username || !password) {
      return {
        success: false,
        error: 'Username dan password harus diisi',
      };
    }

    if (username.length < 3) {
      return {
        success: false,
        error: 'Username minimal 3 karakter',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password minimal 6 karakter',
      };
    }

    // Check if user already exists
    if (mockApiClient.getUserByUsername(username)) {
      return {
        success: false,
        error: 'Username sudah digunakan',
      };
    }

    // Create new user
    const newUser = mockApiClient.createUser({
      username,
      role: UserRole.USER,
      dailyLimit: DEFAULT_DAILY_LIMIT,
      dailyUsageCount: 0,
      createdAt: new Date().toISOString(),
    });

    // Generate token
    const token = mockApiClient.generateToken(newUser);

    // Set current user
    mockApiClient.setCurrentUserId(newUser.id);

    // Save to storage
    saveToStorage(STORAGE_KEYS.USER, newUser);
    saveToStorage(STORAGE_KEYS.TOKEN, token);

    return {
      success: true,
      data: {
        token,
        user: newUser,
      },
      message: 'Pendaftaran berhasil',
    };
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await mockApiClient.delay(50);
    mockApiClient.setCurrentUserId(null);
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    return loadFromStorage<User>(STORAGE_KEYS.USER);
  }

  /**
   * Get current token from storage
   */
  getCurrentToken(): string | null {
    return loadFromStorage<string>(STORAGE_KEYS.TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentToken() && !!this.getCurrentUser();
  }

  /**
   * Update user daily usage count
   */
  async updateDailyUsageCount(userId: number, count: number): Promise<void> {
    const user = mockApiClient.getUser(userId);
    if (user) {
      user.dailyUsageCount = count;
      mockApiClient.setUser(user);
    }
  }

  /**
   * Reset daily usage count (called at midnight or manually)
   */
  async resetDailyUsageCount(userId: number): Promise<void> {
    const user = mockApiClient.getUser(userId);
    if (user) {
      user.dailyUsageCount = 0;
      mockApiClient.setUser(user);
    }
  }

  /**
   * Check if user has reached daily limit
   */
  hasReachedDailyLimit(user: User): boolean {
    return user.dailyUsageCount >= user.dailyLimit;
  }
}

export const authService = new AuthService();
