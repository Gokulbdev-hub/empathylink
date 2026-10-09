import { describe, it, expect } from 'vitest';
import { HeartLinkMatchingEngine } from '../../services/matching/src/index';

describe('HeartLink Matching Engine Unit Tests', () => {
  const engine = new HeartLinkMatchingEngine();

  const candidateA = {
    persona: {
      id: 'per_1',
      userId: 'usr_1',
      displayName: 'Aegis',
      publicCode: 'EL-MY-99001',
      universe: 'MYTHOLOGY' as const,
      lifestyle: 'Scholar',
      lifetimePath: 'Philosopher',
      dreamTheme: 'Olympus',
      aura: 'Solar Radiance',
      title: 'Pantheon Guide',
      symbols: ['laurel'],
      motto: 'Knowledge is starlight.',
      createdAt: new Date().toISOString(),
    },
    topics: ['philosophy', 'books', 'coding', 'ambient sound'],
    languages: ['en'],
    conversationStyle: 'REFLECTIVE' as const,
    availabilityWindow: 'Evening',
    timeZone: 'UTC',
  };

  const candidateB = {
    persona: {
      id: 'per_2',
      userId: 'usr_2',
      displayName: 'Vortex',
      publicCode: 'EL-GA-22104',
      universe: 'GAMING' as const,
      lifestyle: 'Speedrunner',
      lifetimePath: 'Esports',
      dreamTheme: 'Retro Arcade',
      aura: 'Neon Amethyst',
      title: 'Glitch Hunter',
      symbols: ['controller'],
      motto: 'No run is solo.',
      createdAt: new Date().toISOString(),
    },
    topics: ['gaming', 'speedrunning', 'racing'],
    languages: ['en'],
    conversationStyle: 'CASUAL' as const,
    availabilityWindow: 'Midnight',
    timeZone: 'UTC',
  };

  it('should score high compatibility when topics, universe, and styles align', () => {
    const request = {
      intentDescription: 'Seeking thoughtful discussion on philosophy and literature.',
      desiredUniverse: 'MYTHOLOGY' as const,
      topics: ['philosophy', 'books'],
      languages: ['en'],
      conversationStyle: 'REFLECTIVE' as const,
      availabilityWindow: 'Evening',
      timeZone: 'UTC',
    };

    const result = engine.calculateCompatibility(request, candidateA);
    expect(result.score).toBeGreaterThan(0.7);
    expect(result.matchingUniverse).toBe(true);
    expect(result.conversationStyleMatch).toBe(true);
    expect(result.sharedTopics).toContain('philosophy');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('should deterministically score lower when there is minimal overlap', () => {
    const request = {
      intentDescription: 'Seeking thoughtful discussion on philosophy and literature.',
      desiredUniverse: 'MYTHOLOGY' as const,
      topics: ['philosophy', 'books'],
      languages: ['en'],
      conversationStyle: 'REFLECTIVE' as const,
      availabilityWindow: 'Evening',
      timeZone: 'UTC',
    };

    const result = engine.calculateCompatibility(request, candidateB);
    expect(result.score).toBeLessThan(0.5);
    expect(result.matchingUniverse).toBe(false);
    expect(result.conversationStyleMatch).toBe(false);
  });

  it('should sort candidates in descending order of compatibility', () => {
    const request = {
      intentDescription: 'Quiet reflective talk.',
      topics: ['philosophy'],
      languages: ['en'],
      conversationStyle: 'REFLECTIVE' as const,
      availabilityWindow: 'Flexible',
      timeZone: 'UTC',
    };

    const matches = engine.findBestMatches('req_test', request, [candidateB, candidateA]);
    expect(matches[0].candidatePersona.displayName).toBe('Aegis');
    expect(matches[0].compatibilityScore).toBeGreaterThan(matches[1].compatibilityScore);
  });
});
