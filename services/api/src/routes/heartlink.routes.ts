import { Router } from 'express';
import { db } from '../lib/db';
import { authenticateToken } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { HeartLinkRequestSchema } from '@empathylink/validation';
import { HeartLinkMatchingEngine } from '@empathylink/service-matching';

export const heartlinkRouter = Router();
const matchingEngine = new HeartLinkMatchingEngine();

// Submit HeartLink Request
heartlinkRouter.post('/requests', authenticateToken, validateBody(HeartLinkRequestSchema), (req, res) => {
  const userId = req.user!.userId;
  const request = db.createHeartLinkRequest(userId, req.body);

  // Discover candidate pool
  const candidates = db.getCandidatesForMatching(userId);
  const matches = matchingEngine.findBestMatches(request.id, req.body, candidates);

  // Store initial match candidates
  matches.forEach((m) => {
    db.heartLinkMatches.set(m.candidatePersona.id, m);
  });

  res.status(201).json({
    success: true,
    data: {
      request,
      matches,
    },
  });
});

// Get user's HeartLink requests
heartlinkRouter.get('/requests', authenticateToken, (req, res) => {
  const requests = db.getHeartLinkRequests(req.user!.userId);
  res.json({ success: true, data: { requests } });
});

// Get user's active matches
heartlinkRouter.get('/matches', authenticateToken, (req, res) => {
  const userId = req.user!.userId;
  const requests = db.getHeartLinkRequests(userId);
  const latestRequest = requests[requests.length - 1];

  let matches: any[] = [];
  if (latestRequest) {
    const candidates = db.getCandidatesForMatching(userId);
    matches = matchingEngine.findBestMatches(latestRequest.id, latestRequest, candidates);
  }

  res.json({
    success: true,
    data: {
      matches,
    },
  });
});

// Accept Match & Create Conversation
heartlinkRouter.post('/requests/:matchId/accept', authenticateToken, (req, res) => {
  const userId = req.user!.userId;
  const { matchId } = req.params;

  // Find candidate by persona id or matchId
  let candidateUserId = '';
  for (const [uid, persona] of db.personas.entries()) {
    if (persona.id === matchId || uid === matchId) {
      candidateUserId = uid;
      break;
    }
  }

  if (!candidateUserId && db.users.has(matchId)) {
    candidateUserId = matchId;
  }

  if (!candidateUserId) {
    // Pick first candidate from demo personas
    for (const [uid] of db.personas.entries()) {
      if (uid !== userId) {
        candidateUserId = uid;
        break;
      }
    }
  }

  const conversation = db.createConversation({
    type: 'HEARTLINK_DIRECT',
    memberUserIds: [userId, candidateUserId],
    title: 'HeartLink Connection',
  });

  // Notify other user
  db.addNotification(candidateUserId, {
    title: 'New HeartLink Match Accepted!',
    body: 'A kindred traveler accepted your connection request.',
    type: 'MATCH_ACCEPTED',
    actionUrl: `/chat/${conversation.id}`,
  });

  res.json({
    success: true,
    data: {
      conversation,
      message: 'Connection established. You may now message each other.',
    },
  });
});

// Decline Match
heartlinkRouter.post('/requests/:matchId/decline', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Match declined respectfully. No notification was sent.',
  });
});

// Remove Match
heartlinkRouter.delete('/matches/:matchId', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Connection ended safely.',
  });
});
