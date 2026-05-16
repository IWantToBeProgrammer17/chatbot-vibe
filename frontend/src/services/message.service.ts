import { Message, SenderType, ApiResponse, PaginatedResponse } from '@/types';
import { mockApiClient } from './api';
import { MOCK_AI_RESPONSES } from '@/utils/constants';

/**
 * Mock Message Service
 */
class MessageService {
  /**
   * Create a new message
   */
  async createMessage(
    conversationId: number,
    content: string,
    senderType: SenderType
  ): Promise<ApiResponse<Message>> {
    await mockApiClient.delay();

    if (!content || content.trim() === '') {
      return {
        success: false,
        error: 'Pesan tidak boleh kosong',
      };
    }

    try {
      const message = mockApiClient.createMessage(conversationId, content, senderType);
      return {
        success: true,
        data: message,
        message: 'Pesan berhasil dikirim',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Gagal mengirim pesan',
      };
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: number,
    skip: number = 0,
    take: number = 20
  ): Promise<PaginatedResponse<Message>> {
    await mockApiClient.delay();

    try {
      const messages = mockApiClient.getConversationMessages(conversationId, skip, take);
      const total = mockApiClient.getConversationMessages(conversationId, 0, 10000).length;

      return {
        success: true,
        data: {
          items: messages,
          total,
          skip,
          take,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Gagal mengambil pesan',
      };
    }
  }

  /**
   * Get specific message by ID
   */
  async getMessageById(messageId: number): Promise<ApiResponse<Message>> {
    await mockApiClient.delay();

    const message = mockApiClient.getMessage(messageId);
    if (!message) {
      return {
        success: false,
        error: 'Pesan tidak ditemukan',
      };
    }

    return {
      success: true,
      data: message,
    };
  }

  /**
   * Update message content
   */
  async updateMessage(messageId: number, content: string): Promise<ApiResponse<Message>> {
    await mockApiClient.delay();

    if (!content || content.trim() === '') {
      return {
        success: false,
        error: 'Pesan tidak boleh kosong',
      };
    }

    const updated = mockApiClient.updateMessage(messageId, content);
    if (!updated) {
      return {
        success: false,
        error: 'Pesan tidak ditemukan',
      };
    }

    return {
      success: true,
      data: updated,
      message: 'Pesan berhasil diperbarui',
    };
  }

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: number): Promise<ApiResponse<void>> {
    await mockApiClient.delay();

    const success = mockApiClient.deleteMessage(messageId);
    if (!success) {
      return {
        success: false,
        error: 'Pesan tidak ditemukan',
      };
    }

    return {
      success: true,
      message: 'Pesan berhasil dihapus',
    };
  }

  /**
   * Update message typing status
   */
  async updateTypingStatus(messageId: number, isTyping: boolean): Promise<ApiResponse<Message>> {
    await mockApiClient.delay(50);

    const updated = mockApiClient.updateTypingStatus(messageId, isTyping);
    if (!updated) {
      return {
        success: false,
        error: 'Pesan tidak ditemukan',
      };
    }

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Generate mock AI response
   */
  generateMockAiResponse(): string {
    return MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)];
  }

  /**
   * Simulate AI response with typing indicator
   * This helper function creates a typing message, waits 1-3 seconds, then replaces it with actual AI response
   */
  async createAiResponseWithTyping(
    conversationId: number,
    onTypingMessageCreated?: (message: Message) => void,
    onResponseReady?: (message: Message) => void
  ): Promise<Message> {
    // Create typing message
    const typingMessage = mockApiClient.createMessage(conversationId, '', SenderType.AI);
    mockApiClient.updateTypingStatus(typingMessage.id, true);

    if (onTypingMessageCreated) {
      onTypingMessageCreated(typingMessage);
    }

    // Simulate AI thinking (1-3 seconds)
    const thinkingTime = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, thinkingTime));

    // Generate response
    const response = this.generateMockAiResponse();

    // Update message with actual content and remove typing status
    const finalMessage = mockApiClient.updateMessage(typingMessage.id, response, false);

    if (finalMessage && onResponseReady) {
      onResponseReady(finalMessage);
    }

    return finalMessage || typingMessage;
  }
}

export const messageService = new MessageService();
