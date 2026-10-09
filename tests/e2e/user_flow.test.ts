import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../services/api/src/app';

const app = createApp();

describe('Complete EmpathyLink E2E User Journey Flow', () => {
  const email = `e2e_traveler_${Date.now()}@empathy.test`;
  const password = 'StrongPassword123!@#';
  let accessToken = '';
  let conversationId = '';
  let messageId = '';
  let journalId = '';

  it('1. Register -> creates anonymous user & persona', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        initialUniverse: 'CYBERPUNK',
        displayName: 'E2ETraveler',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    accessToken = res.body.data.tokens.accessToken;
  });

  it('2. Login -> validates credentials & receives fresh token pair', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    accessToken = res.body.data.tokens.accessToken;
  });

  it('3. Select DreamVerse -> customizes persona archetype & theme', async () => {
    const res = await request(app)
      .put('/api/v1/persona/dreamverse')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        universe: 'DEEP_OCEAN',
        lifestyle: 'Subsea Drifter',
        lifetimePath: 'Bioluminescent Navigator',
        dreamTheme: 'Whale Song Twilight',
        motto: 'In the tranquil deep, every ripple is understood.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.persona.universe).toBe('DEEP_OCEAN');
    expect(res.body.data.persona.lifestyle).toBe('Subsea Drifter');
  });

  it('4. Send HeartLink request -> matches with compatible peer', async () => {
    const res = await request(app)
      .post('/api/v1/heartlink/requests')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        intentDescription: 'Seeking peaceful reflection about deep ocean mysteries.',
        desiredUniverse: 'DEEP_OCEAN',
        topics: ['ambient sound', 'philosophy', 'calm'],
        languages: ['en'],
        conversationStyle: 'REFLECTIVE',
        availabilityWindow: 'Midnight',
        timeZone: 'UTC',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.matches.length).toBeGreaterThan(0);
  });

  it('5. Accept match & start conversation', async () => {
    const res = await request(app)
      .post('/api/v1/heartlink/requests/usr_nova/accept')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.conversation.id).toBeDefined();
    conversationId = res.body.data.conversation.id;
  });

  it('6. Send message in conversation', async () => {
    const res = await request(app)
      .post(`/api/v1/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Greetings from the deep ocean! Wishing you calm thoughts tonight.',
        isEncrypted: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.message.content).toContain('Greetings from the deep ocean');
    messageId = res.body.data.message.id;
  });

  it('7. Create private dream journal entry', async () => {
    const res = await request(app)
      .post('/api/v1/journal')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Voyage Journal',
        content: 'Taking time to listen to my breath and celebrate quiet growth.',
        moodTag: 'CALM',
      });

    expect(res.status).toBe(201);
    journalId = res.body.data.entry.id;
  });

  it('8. Request Sol reflection on journal entry', async () => {
    const res = await request(app)
      .post(`/api/v1/journal/${journalId}/reflect`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        reflectionType: 'GENTLE_REFLECTION',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reflection.output).toBeDefined();
    expect(res.body.data.disclosure).toBeDefined();
  });

  it('9. Block user & report content for safety violation', async () => {
    // Report
    const repRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        targetType: 'MESSAGE',
        targetId: messageId,
        reason: 'HARASSMENT',
        description: 'Test safety flag.',
      });
    expect(repRes.status).toBe(201);

    // Block
    const blockRes = await request(app)
      .post('/api/v1/blocks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        blockedUserId: 'usr_nova',
        reason: 'Personal boundary.',
      });
    expect(blockRes.status).toBe(200);
  });

  it('10. Change privacy settings', async () => {
    const res = await request(app)
      .put('/api/v1/privacy')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        showOnlineStatus: false,
        allowHeartLinkMatching: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.privacySettings.showOnlineStatus).toBe(false);
  });

  it('11. Delete account -> executes permanent removal pipeline', async () => {
    const res = await request(app)
      .post('/api/v1/privacy/delete-account')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('removed');

    // Confirm session is revoked and cannot access authenticated endpoints
    const verifyRes = await request(app)
      .get('/api/v1/persona')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(verifyRes.status).toBe(404); // Persona revoked/deleted
  });
});
