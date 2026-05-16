import express from 'express';
import {
  createMessage,
  getMessages,
  getMessageDetail,
  updateMessage,
  updateTypingStatus,
  deleteMessage,
  getMessagesBySenderType,
} from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All message routes require authentication
router.use(authMiddleware);

/**
 * POST /api/conversations/:conversationId/messages
 * Create a new message in a conversation
 */
router.post('/conversations/:conversationId/messages', createMessage);

/**
 * GET /api/conversations/:conversationId/messages
 * Get all messages for a conversation (with pagination support)
 * Query params: skip=0, take=20
 */
router.get('/conversations/:conversationId/messages', getMessages);

/**
 * GET /api/conversations/:conversationId/messages/sender/:senderType
 * Get messages filtered by sender type (user or ai)
 */
router.get('/conversations/:conversationId/messages/sender/:senderType', getMessagesBySenderType);

/**
 * GET /api/messages/:id
 * Get a specific message by ID
 */
router.get('/messages/:id', getMessageDetail);

/**
 * PATCH /api/messages/:id
 * Update message content
 */
router.patch('/messages/:id', updateMessage);

/**
 * PATCH /api/messages/:id/typing
 * Update message typing status
 */
router.patch('/messages/:id/typing', updateTypingStatus);

/**
 * DELETE /api/messages/:id
 * Delete a message
 */
router.delete('/messages/:id', deleteMessage);

export default router;
