import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { CreateCircleSchema, CircleMessageSchema } from '@empathylink/validation';
import { ModerationService } from '@empathylink/service-moderation';

export const circlesRouter = Router();
const moderation = new ModerationService();

// List circles
circlesRouter.get('/', (req, res) => {
  const circles = db.getCircles();
  res.json({ success: true, data: { circles } });
});

// Create circle
circlesRouter.post('/', authenticateToken, validateBody(CreateCircleSchema), (req, res) => {
  const circle = db.createCircle(req.user!.userId, req.body);
  res.status(201).json({ success: true, data: { circle } });
});

// Get circle by ID
circlesRouter.get('/:id', (req, res) => {
  const circle = db.getCircleById(req.params.id);
  if (!circle) {
    return res.status(404).json({
      error: {
        code: 'CIRCLE_NOT_FOUND',
        message: 'Community circle not found.',
        requestId: (req.headers['x-request-id'] as string) || 'req_circle',
      },
    });
  }
  res.json({ success: true, data: { circle } });
});

// Join circle
circlesRouter.post('/:id/join', authenticateToken, (req, res) => {
  db.joinCircle(req.params.id, req.user!.userId);
  res.json({ success: true, message: 'Joined circle successfully.' });
});

// Leave circle
circlesRouter.post('/:id/leave', authenticateToken, (req, res) => {
  db.leaveCircle(req.params.id, req.user!.userId);
  res.json({ success: true, message: 'Left circle.' });
});

// Get circle messages
circlesRouter.get('/:id/messages', (req, res) => {
  const messages = db.getCircleMessages(req.params.id);
  res.json({ success: true, data: { messages } });
});

// Post message to circle
circlesRouter.post('/:id/messages', authenticateToken, validateBody(CircleMessageSchema), (req, res) => {
  const safety = moderation.inspectContent(req.body.content);
  if (safety.action === 'BLOCK') {
    return res.status(400).json({
      error: {
        code: 'MESSAGE_REJECTED_SAFETY',
        message: 'Message violates community circle guidelines.',
        requestId: (req.headers['x-request-id'] as string) || 'req_cmsg',
      },
    });
  }

  const message = db.addCircleMessage(
    req.params.id,
    req.user!.userId,
    moderation.sanitize(req.body.content)
  );
  res.status(201).json({ success: true, data: { message } });
});

// List Echo Rooms
circlesRouter.get('/explore/echorooms', (req, res) => {
  const echoRooms = db.getEchoRooms();
  res.json({ success: true, data: { echoRooms } });
});
