import express from 'express';
import { SenderType } from '@prisma/client';
import { MessageService } from '../services/message.service';

// Helper function to convert string to SenderType enum
function mapToSenderType(senderTypeStr: string): SenderType {
  const mapping: { [key: string]: SenderType } = {
    user: SenderType.USER,
    ai: SenderType.AI,
  };
  return mapping[senderTypeStr.toLowerCase()] || SenderType.USER;
}

/**
 * Create a new message in a conversation
 * POST /api/conversations/:conversationId/messages
 */
export async function createMessage(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const { content, senderType = 'user' } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }

    // Validate senderType
    if (!['user', 'ai'].includes(senderType.toLowerCase())) {
      return res.status(400).json({ error: 'senderType must be either "user" or "ai"' });
    }

    const message = await MessageService.createMessage(
      conversationId,
      req.user.id,
      mapToSenderType(senderType),
      content.trim()
    );

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    if (error.message === 'Conversation not found or unauthorized') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message || 'Failed to create message' });
  }
}

/**
 * Get all messages for a conversation
 * GET /api/conversations/:conversationId/messages
 */
export async function getMessages(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.conversationId);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    // Check for pagination params
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 20;

    if (skip < 0 || take < 1 || take > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const result = await MessageService.getMessagesPaginated(conversationId, req.user.id, skip, take);

    res.json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error.message === 'Conversation not found or unauthorized') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
}

/**
 * Get a specific message by ID
 * GET /api/messages/:id
 */
export async function getMessageDetail(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const message = await MessageService.getMessageById(messageId, req.user.id);

    res.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    if (error.message === 'Message not found or unauthorized') {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.error('Error fetching message detail:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch message' });
  }
}

/**
 * Update message content
 * PATCH /api/messages/:id
 */
export async function updateMessage(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const { content } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required and must be a non-empty string' });
    }

    const message = await MessageService.updateMessageContent(messageId, req.user.id, content.trim());

    res.json({
      success: true,
      data: message,
      message: 'Message updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Message not found or unauthorized') {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.error('Error updating message:', error);
    res.status(500).json({ error: error.message || 'Failed to update message' });
  }
}

/**
 * Update message typing status
 * PATCH /api/messages/:id/typing
 */
export async function updateTypingStatus(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    const { isTyping } = req.body;

    // Validate isTyping
    if (typeof isTyping !== 'boolean') {
      return res.status(400).json({ error: 'isTyping must be a boolean' });
    }

    const message = await MessageService.updateTypingStatus(messageId, req.user.id, isTyping);

    res.json({
      success: true,
      data: message,
      message: 'Typing status updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Message not found or unauthorized') {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.error('Error updating typing status:', error);
    res.status(500).json({ error: error.message || 'Failed to update typing status' });
  }
}

/**
 * Delete a message
 * DELETE /api/messages/:id
 */
export async function deleteMessage(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    await MessageService.deleteMessage(messageId, req.user.id);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Message not found or unauthorized') {
      return res.status(404).json({ error: 'Message not found' });
    }
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message || 'Failed to delete message' });
  }
}

/**
 * Get messages filtered by sender type
 * GET /api/conversations/:conversationId/messages/sender/:senderType
 */
export async function getMessagesBySenderType(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.conversationId);
    const senderTypeStr = req.params.senderType as string;

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    if (!['user', 'ai'].includes(senderTypeStr.toLowerCase())) {
      return res.status(400).json({ error: 'senderType must be either "user" or "ai"' });
    }

    const messages = await MessageService.getMessagesBySenderType(
      conversationId,
      req.user.id,
      mapToSenderType(senderTypeStr)
    );

    res.json({
      success: true,
      data: messages,
      count: messages.length,
    });
  } catch (error: any) {
    if (error.message === 'Conversation not found or unauthorized') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    console.error('Error fetching messages by sender type:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
}
