import express from 'express';
import { ConversationService } from '../services/conversation.service';

/**
 * Create a new conversation
 * POST /api/conversations
 */
export async function createConversation(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title } = req.body;
    const conversation = await ConversationService.createConversation(req.user.id, title);

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message || 'Failed to create conversation' });
  }
}

/**
 * Get all conversations for the authenticated user
 * GET /api/conversations
 */
export async function getConversations(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await ConversationService.getConversationsByUserId(req.user.id);

    res.json({
      success: true,
      data: conversations,
      count: conversations.length,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch conversations' });
  }
}

/**
 * Get a specific conversation by ID
 * GET /api/conversations/:id
 */
export async function getConversationDetail(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const conversation = await ConversationService.getConversationById(conversationId, req.user.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    console.error('Error fetching conversation detail:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch conversation' });
  }
}

/**
 * Rename conversation (update title)
 * PATCH /api/conversations/:id
 */
export async function updateConversation(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }

    const conversation = await ConversationService.updateConversationTitle(
      conversationId,
      req.user.id,
      title.trim()
    );

    res.json({
      success: true,
      data: conversation,
      message: 'Conversation title updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Conversation not found or unauthorized') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: error.message || 'Failed to update conversation' });
  }
}

/**
 * Delete conversation (soft delete)
 * DELETE /api/conversations/:id
 */
export async function deleteConversation(req: express.Request, res: express.Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }

    await ConversationService.deleteConversation(conversationId, req.user.id);

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Conversation not found or unauthorized') {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: error.message || 'Failed to delete conversation' });
  }
}
