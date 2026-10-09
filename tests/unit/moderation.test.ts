import { describe, it, expect } from 'vitest';
import { ModerationService } from '../../services/moderation/src/index';

describe('Moderation Service Unit Tests', () => {
  const moderation = new ModerationService();

  it('should flag and prioritize immediate crisis signals without diagnosing', () => {
    const crisisText = 'I feel completely hopeless and want to end my life';
    const result = moderation.inspectContent(crisisText);

    expect(result.crisisDetected).toBe(true);
    expect(result.flaggedReason).toBe('CRISIS_IMMEDIATE_DANGER');
    expect(result.score).toBe(1.0);
  });

  it('should block abusive and harassment content', () => {
    const abusiveText = 'You should die alone, you are worthless';
    const result = moderation.inspectContent(abusiveText);

    expect(result.action).toBe('BLOCK');
    expect(result.flaggedReason).toBe('HARASSMENT');
  });

  it('should block malicious spam patterns', () => {
    const spamText = 'Join t.me/freecrypto to earn $500 daily!';
    const result = moderation.inspectContent(spamText);

    expect(result.action).toBe('BLOCK');
    expect(result.flaggedReason).toBe('MALICIOUS_SPAM');
  });

  it('should allow benign, kind messages', () => {
    const friendlyText = 'Hope you have a peaceful evening and restful sleep.';
    const result = moderation.inspectContent(friendlyText);

    expect(result.action).toBe('ALLOW');
    expect(result.crisisDetected).toBe(false);
  });

  it('should sanitize HTML inputs against XSS', () => {
    const maliciousInput = '<script>alert("hack")</script><b>Hello</b>';
    const clean = moderation.sanitize(maliciousInput);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
  });
});
