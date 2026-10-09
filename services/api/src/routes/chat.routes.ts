import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { SendMessageSchema } from '@empathylink/validation';
import { ModerationService } from '@empathylink/service-moderation';

export const chatRouter = Router();
const moderation = new ModerationService();

// List active conversations
chatRouter.get('/', authenticateToken, (req, res) => {
  const conversations = db.getUserConversations(req.user!.userId);
  res.json({ success: true, data: { conversations } });
});

// Create new conversation
chatRouter.post('/', authenticateToken, (req, res) => {
  const { recipientUserId, title, universeKey } = req.body;
  const conversation = db.createConversation({
    type: 'HEARTLINK_DIRECT',
    memberUserIds: [req.user!.userId, recipientUserId],
    title,
    universeKey,
  });
  res.status(201).json({ success: true, data: { conversation } });
});

// Get conversation messages
chatRouter.get('/:id/messages', authenticateToken, (req, res) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({
      error: {
        code: 'CONVERSATION_NOT_FOUND',
        message: 'Conversation not found.',
        requestId: (req.headers['x-request-id'] as string) || 'req_msg',
      },
    });
  }

  const isMember = conv.members.some((m) => m.userId === req.user!.userId);
  if (!isMember) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'You are not a member of this conversation.',
        requestId: (req.headers['x-request-id'] as string) || 'req_msg',
      },
    });
  }

  const messages = db.getMessages(req.params.id);
  res.json({
    success: true,
    data: {
      messages,
      e2eeNotice: conv.e2eePendingNotice
        ? 'Notice: Standard encrypted transport is active. Full independent third-party audited client-side E2EE integration is pending.'
        : undefined,
    },
  });
});

// Send message
chatRouter.post('/:id/messages', authenticateToken, validateBody(SendMessageSchema), (req, res) => {
  const conv = db.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({
      error: {
        code: 'CONVERSATION_NOT_FOUND',
        message: 'Conversation not found.',
        requestId: (req.headers['x-request-id'] as string) || 'req_send',
      },
    });
  }

  const otherMember = conv.members.find((m) => m.userId !== req.user!.userId);
  if (otherMember && db.isBlocked(req.user!.userId, otherMember.userId)) {
    return res.status(403).json({
      error: {
        code: 'USER_BLOCKED',
        message: 'Cannot send messages to a blocked user.',
        requestId: (req.headers['x-request-id'] as string) || 'req_send',
      },
    });
  }

  const { content, isEncrypted, mediaUrl, mediaType, ephemeralTtlSecs } = req.body;

  // Run moderation filter
  const safety = moderation.inspectContent(content);
  if (safety.action === 'BLOCK') {
    return res.status(400).json({
      error: {
        code: 'MESSAGE_REJECTED_SAFETY',
        message: 'Message violates community safety boundaries.',
        requestId: (req.headers['x-request-id'] as string) || 'req_send',
      },
    });
  }

  const senderPersona = db.getPersonaByUserId(req.user!.userId)!;
  const message = db.addMessage(req.params.id, {
    senderId: req.user!.userId,
    senderPersona,
    content: moderation.sanitize(content),
    isEncrypted,
    mediaUrl,
    mediaType,
    ephemeralExpiresAt: ephemeralTtlSecs
      ? new Date(Date.now() + ephemeralTtlSecs * 1000).toISOString()
      : undefined,
  });

  // Notify other participants
  conv.members.forEach((member) => {
    if (member.userId !== req.user!.userId) {
      db.addNotification(member.userId, {
        title: `Message from ${senderPersona.displayName}`,
        body: 'You received a new message.',
        type: 'MESSAGE_RECEIVED',
        actionUrl: `/chat/${conv.id}`,
      });
    }
  });

  res.status(201).json({
    success: true,
    data: {
      message,
      crisisDetected: safety.crisisDetected,
    },
  });
});

// Mark conversation read
chatRouter.post('/:id/read', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Marked read.' });
});

// Report conversation
chatRouter.post('/:id/report', authenticateToken, (req, res) => {
  const report = db.addReport(req.user!.userId, {
    targetType: 'MESSAGE',
    targetId: req.params.id,
    reason: req.body.reason || 'HARASSMENT',
    description: req.body.description,
  });
  res.json({ success: true, data: { report } });
});

// Block conversation user
chatRouter.post('/:id/block', authenticateToken, (req, res) => {
  const conv = db.getConversationById(req.params.id);
  if (conv) {
    const other = conv.members.find((m) => m.userId !== req.user!.userId);
    if (other) {
      db.blockUser(req.user!.userId, other.userId);
    }
  }
  res.json({ success: true, message: 'User blocked.' });
});
