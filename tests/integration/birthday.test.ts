import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../services/api/src/app';

const app = createApp();

describe('Birthday Sanctuary Integration Tests', () => {
  let authToken = '';
  let celebrantId = '';

  it('GET /api/v1/birthday should return today celebrants and global stats', async () => {
    const res = await request(app).get('/api/v1/birthday');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.celebrants.length).toBeGreaterThan(0);
    expect(res.body.data.stats.todayCelebrantsCount).toBeGreaterThan(0);
    expect(res.body.data.stats.totalWishesSentToday).toBeGreaterThan(0);
  });

  it('POST /api/v1/birthday/celebrate should register user birthday in sanctuary', async () => {
    // Register user first
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `birthday_star_${Date.now()}@empathy.test`,
        password: 'ValidPassword123!@#',
        initialUniverse: 'ANIME',
        displayName: 'StarChild',
      });

    authToken = regRes.body.data.tokens.accessToken;

    const res = await request(app)
      .post('/api/v1/birthday/celebrate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        locationLabel: 'Kyoto, Japan',
        mood: 'Celebrating quietly under cherry blossoms',
        wishNote: 'Grateful for another journey around the sun!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.celebrant.persona.displayName).toBe('StarChild');
    expect(res.body.data.celebrant.locationLabel).toBe('Kyoto, Japan');

    celebrantId = res.body.data.celebrant.id;
  });

  it('POST /api/v1/birthday/wish should send a warm symbolic gift and message', async () => {
    const res = await request(app)
      .post('/api/v1/birthday/wish')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        celebrantId,
        gift: 'STARLIGHT_CANDLE',
        vibe: 'WARM_HUG',
        message: 'Happy Birthday StarChild! You are bringing light to the world.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wish.gift).toBe('STARLIGHT_CANDLE');
    expect(res.body.data.wish.vibe).toBe('WARM_HUG');
  });

  it('POST /api/v1/birthday/blow-candle/:id should increment candle count', async () => {
    const res = await request(app).post(`/api/v1/birthday/blow-candle/${celebrantId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.celebrant.candlesBlown).toBeGreaterThan(0);
  });

  it('POST /api/v1/birthday/sol-blessing should generate a gentle birthday reflection', async () => {
    const res = await request(app)
      .post('/api/v1/birthday/sol-blessing')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        celebrantName: 'StarChild',
        universe: 'ANIME',
        mood: 'Reflective',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.blessing).toBeDefined();
    expect(typeof res.body.data.blessing).toBe('string');
  });
});
