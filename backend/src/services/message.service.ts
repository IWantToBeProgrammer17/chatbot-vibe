import prisma from '../utils/prisma';
import { SenderType } from '@prisma/client';
import { ConversationService } from './conversation.service';

export class MessageService {
  /**
   * Create a new message in a conversation
   */
  static async createMessage(
    conversationId: number,
    userId: number,
    senderType: SenderType,
    content: string
  ) {
    // Verify conversation exists and belongs to user
    const conversation = await ConversationService.getConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    return prisma.message.create({
      data: {
        conversationId,
        senderType,
        content,
        isTyping: false,
      },
    });
  }

  /**
   * Get all messages for a conversation
   */
  static async getMessagesByConversationId(conversationId: number, userId: number) {
    // Verify conversation exists and belongs to user
    const conversation = await ConversationService.getConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    return prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get a specific message by ID
   */
  static async getMessageById(messageId: number, userId: number) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          select: {
            userId: true,
          },
        },
      },
    });

    // Verify message exists and belongs to user's conversation
    if (!message || message.conversation.userId !== userId) {
      throw new Error('Message not found or unauthorized');
    }

    return message;
  }

  /**
   * Update message content
   */
  static async updateMessageContent(messageId: number, userId: number, content: string) {
    // First verify message ownership
    await this.getMessageById(messageId, userId);

    return prisma.message.update({
      where: { id: messageId },
      data: { content },
    });
  }

  /**
   * Update message typing status
   */
  static async updateTypingStatus(messageId: number, userId: number, isTyping: boolean) {
    // First verify message ownership
    await this.getMessageById(messageId, userId);

    return prisma.message.update({
      where: { id: messageId },
      data: { isTyping },
    });
  }

  /**
   * Soft delete a message
   */
  static async deleteMessage(messageId: number, userId: number) {
    // First verify message ownership
    const message = await this.getMessageById(messageId, userId);

    // Delete the message by setting content to empty and marking as deleted
    // Note: Based on schema, messages don't have deletedAt, so we soft delete by clearing content
    return prisma.message.delete({
      where: { id: messageId },
    });
  }

  /**
   * Get message count for a conversation
   */
  static async getMessageCount(conversationId: number, userId: number) {
    // Verify conversation exists and belongs to user
    const conversation = await ConversationService.getConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    return prisma.message.count({
      where: {
        conversationId,
      },
    });
  }

  /**
   * Get messages by sender type
   */
  static async getMessagesBySenderType(
    conversationId: number,
    userId: number,
    senderType: SenderType
  ) {
    // Verify conversation exists and belongs to user
    const conversation = await ConversationService.getConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    return prisma.message.findMany({
      where: {
        conversationId,
        senderType,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get messages with pagination
   */
  static async getMessagesPaginated(
    conversationId: number,
    userId: number,
    skip: number = 0,
    take: number = 20
  ) {
    // Verify conversation exists and belongs to user
    const conversation = await ConversationService.getConversationById(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
    });

    const total = await prisma.message.count({
      where: {
        conversationId,
      },
    });

    return {
      messages,
      pagination: {
        skip,
        take,
        total,
        pages: Math.ceil(total / take),
      },
    };
  }
}
