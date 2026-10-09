import { ReportReason, ReportStatus } from '@empathylink/types';

export interface ModerationCheckResult {
  action: 'ALLOW' | 'WARN' | 'BLOCK' | 'FLAG_FOR_REVIEW';
  flaggedReason?: ReportReason;
  crisisDetected: boolean;
  score: number; // 0 to 1 risk score
  reasons: string[];
}

export class ModerationService {
  private static readonly SPAM_PATTERNS = [
    /free\s*crypto/i,
    /t\.me\//i,
    /whatsapp:\+/i,
    /click\s*here\s*now/i,
    /earn\s*\$?\d{3,}\s*(daily|weekly)/i,
    /cashapp/i,
  ];

  private static readonly HARASSMENT_PATTERNS = [
    /\bkill\s+yourself\b/i,
    /\bworthless\s+human\b/i,
    /\byou\s+deserve\s+to\s+die\b/i,
    /\bdie\s+alone\b/i,
  ];

  private static readonly CRISIS_PATTERNS = [
    /\bkill\s+myself\b/i,
    /\bwant\s+to\s+die\b/i,
    /\bend\s+my\s+life\b/i,
    /\bsuicide\b/i,
    /\bhurt(ing)?\s+myself\b/i,
  ];

  /**
   * Evaluates text through multi-tier safety pipeline:
   * 1. Crisis immediate danger detection
   * 2. Direct harassment / abuse check
   * 3. Spam / scam detection
   */
  public inspectContent(text: string): ModerationCheckResult {
    const reasons: string[] = [];
    let crisisDetected = false;

    // 1. Crisis Check
    for (const pattern of ModerationService.CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        crisisDetected = true;
        reasons.push('Immediate crisis signal detected');
        return {
          action: 'FLAG_FOR_REVIEW',
          flaggedReason: 'CRISIS_IMMEDIATE_DANGER',
          crisisDetected: true,
          score: 1.0,
          reasons,
        };
      }
    }

    // 2. Severe Harassment / Hate Check
    for (const pattern of ModerationService.HARASSMENT_PATTERNS) {
      if (pattern.test(text)) {
        reasons.push('Violates harassment and safety guidelines');
        return {
          action: 'BLOCK',
          flaggedReason: 'HARASSMENT',
          crisisDetected: false,
          score: 0.95,
          reasons,
        };
      }
    }

    // 3. Spam Check
    for (const pattern of ModerationService.SPAM_PATTERNS) {
      if (pattern.test(text)) {
        reasons.push('Commercial spam or phishing pattern identified');
        return {
          action: 'BLOCK',
          flaggedReason: 'MALICIOUS_SPAM',
          crisisDetected: false,
          score: 0.85,
          reasons,
        };
      }
    }

    return {
      action: 'ALLOW',
      crisisDetected: false,
      score: 0.0,
      reasons: ['Content within safety boundaries'],
    };
  }

  /**
   * Sanitizes text to prevent XSS and malicious characters
   */
  public sanitize(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }
}
