import express from 'express';
import {
  createConversation,
  getConversations,
  getConversationDetail,
  updateConversation,
  deleteConversation,
} from '../controllers/conversation.controller';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All conversation routes require authentication
router.use(authMiddleware);

/**
 * POST /api/conversations
 * Create a new conversation
 */
router.post('/', createConversation);

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user
 */
router.get('/', getConversations);

/**
 * GET /api/conversations/:id
 * Get a specific conversation by ID
 */
router.get('/:id', getConversationDetail);

/**
 * PATCH /api/conversations/:id
 * Update conversation title (rename)
 */
router.patch('/:id', updateConversation);

/**
 * DELETE /api/conversations/:id
 * Delete a conversation (soft delete)
 */
router.delete('/:id', deleteConversation);

export default router;
