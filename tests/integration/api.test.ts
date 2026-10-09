import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../services/api/src/app';

const app = createApp();

describe('EmpathyLink Core API Integration Tests', () => {
  let authToken = '';
  let journalId = '';

  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
  });

  it('GET /ready should return 200 and ready status', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY');
  });

  it('GET /api/v1/universes should return all 8 DreamVerse universes', async () => {
    const res = await request(app).get('/api/v1/universes');
    expect(res.status).toBe(200);
    expect(res.body.data.universes.length).toBe(8);
  });

  it('POST /api/v1/auth/register should create anonymous account with Argon2id hash & JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `traveler_${Date.now()}@empathy.test`,
        password: 'ValidPassword123!@#',
        initialUniverse: 'CYBERPUNK',
        displayName: 'AuraWalker',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.user.persona.displayName).toBe('AuraWalker');
    expect(res.body.data.user.persona.universe).toBe('CYBERPUNK');

    authToken = res.body.data.tokens.accessToken;
  });

  it('GET /api/v1/persona should return user persona when authenticated', async () => {
    const res = await request(app)
      .get('/api/v1/persona')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.persona.displayName).toBe('AuraWalker');
  });

  it('POST /api/v1/heartlink/requests should submit peer match intent and calculate matches', async () => {
    const res = await request(app)
      .post('/api/v1/heartlink/requests')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        intentDescription: 'Seeking late night discussion on coding and synthwave.',
        topics: ['coding', 'music'],
        languages: ['en'],
        conversationStyle: 'REFLECTIVE',
        availabilityWindow: 'Midnight',
        timeZone: 'UTC',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.request).toBeDefined();
    expect(res.body.data.matches).toBeDefined();
  });

  it('POST /api/v1/journal should create a private journal entry', async () => {
    const res = await request(app)
      .post('/api/v1/journal')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Integration Test Solitude',
        content: 'Reflecting on personal progress and quiet perseverance.',
        moodTag: 'REFLECTIVE',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.entry.title).toBe('Integration Test Solitude');
    journalId = res.body.data.entry.id;
  });

  it('POST /api/v1/journal/:id/reflect should trigger Sol reflection with explicit disclosure', async () => {
    const res = await request(app)
      .post(`/api/v1/journal/${journalId}/reflect`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        reflectionType: 'GENTLE_REFLECTION',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reflection.output).toBeDefined();
    expect(res.body.data.disclosure).toContain('Explicit disclosure');
  });

  it('POST /api/v1/sol/chat should provide empathetic non-clinical response', async () => {
    const res = await request(app)
      .post('/api/v1/sol/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: 'Hello Sol, I am feeling a little tired today.',
        tonePreference: 'WARM',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reply).toBeDefined();
    expect(res.body.data.crisisDetected).toBe(false);
  });
});
