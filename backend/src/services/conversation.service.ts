import prisma from '../utils/prisma';

export class ConversationService {
  /**
   * Create a new conversation for a user
   */
  static async createConversation(userId: number, title: string = 'New Chat') {
    return prisma.conversation.create({
      data: {
        userId,
        title,
      },
      include: {
        messages: true,
      },
    });
  }

  /**
   * Get all conversations for a user (excluding soft-deleted ones)
   */
  static async getConversationsByUserId(userId: number) {
    return prisma.conversation.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Get a specific conversation by ID
   */
  static async getConversationById(conversationId: number, userId: number) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
        deletedAt: null,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Update conversation title (rename)
   */
  static async updateConversationTitle(conversationId: number, userId: number, title: string) {
    // First verify that the conversation belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
        deletedAt: null,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  /**
   * Soft delete a conversation
   */
  static async deleteConversation(conversationId: number, userId: number) {
    // First verify that the conversation belongs to the user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
        deletedAt: null,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get conversation count for a user
   */
  static async getConversationCount(userId: number) {
    return prisma.conversation.count({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }
}
