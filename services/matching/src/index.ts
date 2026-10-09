import {
  HeartLinkRequestInput,
  PersonaSummary,
  HeartLinkMatchCandidate,
  ConversationStyle,
} from '@empathylink/types';

export interface CandidateProfile {
  persona: PersonaSummary;
  topics: string[];
  languages: string[];
  conversationStyle: ConversationStyle;
  availabilityWindow: string;
  timeZone: string;
}

export interface CompatibilityScoreResult {
  score: number; // 0.0 to 1.0
  reasons: string[];
  sharedTopics: string[];
  sharedLanguages: string[];
  matchingUniverse: boolean;
  conversationStyleMatch: boolean;
}

export class HeartLinkMatchingEngine {
  /**
   * Weights for multi-factor deterministic scoring:
   * Total = 1.0
   */
  private static readonly WEIGHTS = {
    TOPICS: 0.35,
    CONVERSATION_STYLE: 0.20,
    UNIVERSE_AFFINITY: 0.15,
    LANGUAGES: 0.15,
    AVAILABILITY: 0.10,
    TIMEZONE: 0.05,
  };

  /**
   * Deterministically calculates compatibility between a request and candidate.
   * Completely explainable, non-diagnostic, privacy-respecting.
   */
  public calculateCompatibility(
    request: HeartLinkRequestInput,
    candidate: CandidateProfile
  ): CompatibilityScoreResult {
    const reasons: string[] = [];

    // 1. Topic Overlap (35%)
    const normalizedReqTopics = request.topics.map((t) => t.toLowerCase().trim());
    const normalizedCandTopics = candidate.topics.map((t) => t.toLowerCase().trim());
    const sharedTopics = normalizedReqTopics.filter((t) => normalizedCandTopics.includes(t));

    const topicRatio =
      request.topics.length > 0 ? sharedTopics.length / Math.max(1, request.topics.length) : 0;
    const topicScore = Math.min(1.0, topicRatio) * HeartLinkMatchingEngine.WEIGHTS.TOPICS;

    if (sharedTopics.length > 0) {
      reasons.push(`Shared interests in: ${sharedTopics.slice(0, 3).join(', ')}`);
    }

    // 2. Conversation Style Compatibility (20%)
    let styleScore = 0;
    const styleMatch = request.conversationStyle === candidate.conversationStyle;
    if (styleMatch) {
      styleScore = HeartLinkMatchingEngine.WEIGHTS.CONVERSATION_STYLE;
      reasons.push(`Both prefer ${request.conversationStyle.replace('_', ' ').toLowerCase()} conversations`);
    } else {
      // Complementary styles (e.g. STORYTELLER + SILENT_LISTENER)
      if (
        (request.conversationStyle === 'STORYTELLER' && candidate.conversationStyle === 'SILENT_LISTENER') ||
        (request.conversationStyle === 'SILENT_LISTENER' && candidate.conversationStyle === 'STORYTELLER')
      ) {
        styleScore = HeartLinkMatchingEngine.WEIGHTS.CONVERSATION_STYLE * 0.9;
        reasons.push('Complementary storyteller and listener dynamic');
      } else {
        styleScore = HeartLinkMatchingEngine.WEIGHTS.CONVERSATION_STYLE * 0.4;
      }
    }

    // 3. Universe Affinity (15%)
    let universeScore = 0;
    const matchingUniverse = !request.desiredUniverse || request.desiredUniverse === candidate.persona.universe;
    if (matchingUniverse) {
      universeScore = HeartLinkMatchingEngine.WEIGHTS.UNIVERSE_AFFINITY;
      if (request.desiredUniverse) {
        reasons.push(`Aligned with your requested ${candidate.persona.universe} universe`);
      } else {
        reasons.push(`Part of the ${candidate.persona.universe} universe`);
      }
    }

    // 4. Language Compatibility (15%)
    const reqLangs = request.languages.map((l) => l.toLowerCase());
    const candLangs = candidate.languages.map((l) => l.toLowerCase());
    const sharedLanguages = reqLangs.filter((l) => candLangs.includes(l));
    const langScore =
      sharedLanguages.length > 0 ? HeartLinkMatchingEngine.WEIGHTS.LANGUAGES : 0.0;
    if (sharedLanguages.length > 0) {
      reasons.push(`Speaks common language: ${sharedLanguages.join(', ').toUpperCase()}`);
    }

    // 5. Availability Window Overlap (10%)
    let availScore = 0;
    if (
      request.availabilityWindow.toLowerCase() === 'flexible' ||
      candidate.availabilityWindow.toLowerCase() === 'flexible' ||
      request.availabilityWindow.toLowerCase() === candidate.availabilityWindow.toLowerCase()
    ) {
      availScore = HeartLinkMatchingEngine.WEIGHTS.AVAILABILITY;
      reasons.push(`Complementary availability (${request.availabilityWindow})`);
    } else {
      availScore = HeartLinkMatchingEngine.WEIGHTS.AVAILABILITY * 0.3;
    }

    // 6. Timezone Offset Proximity (5%)
    let tzScore = HeartLinkMatchingEngine.WEIGHTS.TIMEZONE * 0.5;
    if (request.timeZone === candidate.timeZone) {
      tzScore = HeartLinkMatchingEngine.WEIGHTS.TIMEZONE;
      reasons.push('Same timezone for immediate synchronization');
    }

    const totalRawScore = topicScore + styleScore + universeScore + langScore + availScore + tzScore;
    const score = Math.round(Math.min(1.0, Math.max(0.1, totalRawScore)) * 100) / 100;

    return {
      score,
      reasons,
      sharedTopics,
      sharedLanguages,
      matchingUniverse,
      conversationStyleMatch: styleMatch,
    };
  }

  /**
   * Ranks an array of candidates against a request.
   */
  public findBestMatches(
    requestId: string,
    request: HeartLinkRequestInput,
    candidates: CandidateProfile[],
    limit = 5
  ): HeartLinkMatchCandidate[] {
    const scored = candidates.map((cand) => {
      const result = this.calculateCompatibility(request, cand);
      return {
        requestId,
        candidatePersona: cand.persona,
        compatibilityScore: result.score,
        reasons: result.reasons,
        sharedTopics: result.sharedTopics,
        sharedLanguages: result.sharedLanguages,
        matchingUniverse: result.matchingUniverse,
        conversationStyleMatch: result.conversationStyleMatch,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };
    });

    // Sort descending by compatibility score
    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return scored.slice(0, limit);
  }
}
