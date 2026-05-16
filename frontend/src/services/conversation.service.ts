import { Conversation, ApiResponse } from '@/types';
import { mockApiClient } from './api';

/**
 * Mock Conversation Service
 */
class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(userId: number, title: string): Promise<ApiResponse<Conversation>> {
    await mockApiClient.delay();

    if (!title || title.trim() === '') {
      return {
        success: false,
        error: 'Judul percakapan tidak boleh kosong',
      };
    }

    try {
      const conversation = mockApiClient.createConversation(userId, title);
      return {
        success: true,
        data: conversation,
        message: 'Percakapan berhasil dibuat',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Gagal membuat percakapan',
      };
    }
  }

  /**
   * Get all conversations for authenticated user
   */
  async getConversations(userId: number): Promise<ApiResponse<Conversation[]>> {
    await mockApiClient.delay();

    try {
      const conversations = mockApiClient.getUserConversations(userId);
      return {
        success: true,
        data: conversations,
        count: conversations.length,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Gagal mengambil daftar percakapan',
      };
    }
  }

  /**
   * Get specific conversation by ID
   */
  async getConversationById(conversationId: number): Promise<ApiResponse<Conversation>> {
    await mockApiClient.delay();

    const conversation = mockApiClient.getConversation(conversationId);
    if (!conversation) {
      return {
        success: false,
        error: 'Percakapan tidak ditemukan',
      };
    }

    return {
      success: true,
      data: conversation,
    };
  }

  /**
   * Update conversation title
   */
  async updateConversation(conversationId: number, title: string): Promise<ApiResponse<Conversation>> {
    await mockApiClient.delay();

    if (!title || title.trim() === '') {
      return {
        success: false,
        error: 'Judul percakapan tidak boleh kosong',
      };
    }

    const updated = mockApiClient.updateConversation(conversationId, title);
    if (!updated) {
      return {
        success: false,
        error: 'Percakapan tidak ditemukan',
      };
    }

    return {
      success: true,
      data: updated,
      message: 'Percakapan berhasil diperbarui',
    };
  }

  /**
   * Delete conversation (soft delete)
   */
  async deleteConversation(conversationId: number): Promise<ApiResponse<void>> {
    await mockApiClient.delay();

    const success = mockApiClient.deleteConversation(conversationId);
    if (!success) {
      return {
        success: false,
        error: 'Percakapan tidak ditemukan',
      };
    }

    return {
      success: true,
      message: 'Percakapan berhasil dihapus',
    };
  }
}

export const conversationService = new ConversationService();
