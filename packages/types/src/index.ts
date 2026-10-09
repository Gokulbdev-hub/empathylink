// EmpathyLink Core TypeScript Definitions

export type ID = string;

// ==========================================
// 1. Error & API Envelope Types
// ==========================================

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown> | Array<unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    requestId?: string;
  };
}

// ==========================================
// 2. Authentication, User & Security
// ==========================================

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface UserProfile {
  id: ID;
  email: string;
  role: UserRole;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  persona?: PersonaSummary;
  privacySettings?: PrivacySettingsDto;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionInfo {
  id: ID;
  userId: ID;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface PrivacySettingsDto {
  allowSolJournalReflection: boolean;
  allowHeartLinkMatching: boolean;
  profileVisibility: 'UNIVERSE_ONLY' | 'ANONYMOUS_CIRCLES' | 'PRIVATE';
  showOnlineStatus: boolean;
  allowDirectMessagesFrom: 'MATCHES_ONLY' | 'CIRCLES_AND_MATCHES' | 'NOBODY';
  ephemeralMessagesDefaultTtlSecs: number; // e.g. 0 for permanent, 86400 for 24h
  requirePasscodeForJournal: boolean;
}

// ==========================================
// 3. DreamVerse & Persona Types
// ==========================================

export type UniverseKey =
  | 'GAMING'
  | 'MYTHOLOGY'
  | 'CYBERPUNK'
  | 'FANTASY'
  | 'DEEP_OCEAN'
  | 'TIME_TRAVEL'
  | 'NATURE'
  | 'ANIME';

export interface UniverseDefinition {
  id: UniverseKey;
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  aura: string;
  symbols: string[];
  motto: string;
  defaultLifetimePaths: string[];
  defaultDreamThemes: string[];
  defaultLifestyles: string[];
}

export interface PersonaSummary {
  id: ID;
  userId: ID;
  displayName: string; // e.g., "Nova"
  publicCode: string;  // e.g., "EL-CY-58291"
  universe: UniverseKey;
  lifestyle: string;   // e.g. "Deckrunner"
  lifetimePath: string; // e.g. "Augmented Lifespan"
  dreamTheme: string;  // e.g. "System Disconnect"
  aura: string;        // e.g. "Neon Violet"
  title: string;       // e.g. "Neon Wanderer"
  symbols: string[];
  motto: string;       // e.g. "Your code writes tomorrow."
  avatarMediaId?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

// ==========================================
// 4. HeartLink Matching Types
// ==========================================

export type ConversationStyle = 'CASUAL' | 'DEEP_DIVE' | 'SILENT_LISTENER' | 'STORYTELLER' | 'REFLECTIVE';
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

export interface HeartLinkRequestInput {
  intentDescription: string; // "What kind of person or conversation am I looking for?"
  desiredUniverse?: UniverseKey;
  topics: string[];
  languages: string[];
  conversationStyle: ConversationStyle;
  availabilityWindow: string; // e.g., "Evening", "Midnight", "Flexible"
  timeZone: string;
}

export interface HeartLinkMatchCandidate {
  requestId: ID;
  candidatePersona: PersonaSummary;
  compatibilityScore: number; // 0.0 to 1.0
  reasons: string[];
  sharedTopics: string[];
  sharedLanguages: string[];
  matchingUniverse: boolean;
  conversationStyleMatch: boolean;
  status: MatchStatus;
  createdAt: string;
}

// ==========================================
// 5. Chat & Real-Time Messaging Types
// ==========================================

export type ConversationType = 'HEARTLINK_DIRECT' | 'CIRCLE_PUBLIC' | 'ECHO_ROOM';

export interface ConversationDto {
  id: ID;
  type: ConversationType;
  title?: string;
  universe?: UniverseKey;
  members: Array<{
    userId: ID;
    persona: PersonaSummary;
    joinedAt: string;
    lastReadAt?: string;
  }>;
  e2eePendingNotice: boolean; // Explicit audit disclaimer
  lastMessage?: MessageDto;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
  id: ID;
  conversationId: ID;
  senderId: ID;
  senderPersona: PersonaSummary;
  content: string; // Plaintext or encrypted payload envelope
  isEncrypted: boolean;
  mediaUrl?: string;
  mediaType?: string;
  ephemeralExpiresAt?: string;
  reactions: Array<{
    emoji: string;
    count: number;
    userIds: string[];
  }>;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
}

// ==========================================
// 6. Circles & Echo Rooms
// ==========================================

export type CircleAccessMode = 'OPEN' | 'APPROVAL_REQUIRED' | 'PRIVATE';

export interface CircleDto {
  id: ID;
  name: string;
  description: string;
  universe: UniverseKey;
  accessMode: CircleAccessMode;
  memberCount: number;
  tags: string[];
  creatorPersona: PersonaSummary;
  isMember?: boolean;
  createdAt: string;
}

export interface EchoRoomDto {
  id: ID;
  title: string;
  category: 'CANT_SLEEP' | 'CODING_TOGETHER' | 'EXAM_STRESS' | 'STARTUP_BRAINSTORM' | 'MUSIC_LOVERS' | 'MIDNIGHT_TALK';
  activePresenceCount: number;
  isSilentPresenceAllowed: boolean;
  expiresAt?: string;
  createdAt: string;
}

// ==========================================
// 7. Dream Journal & Sol Reflection
// ==========================================

export type JournalMood = 'CALM' | 'REFLECTIVE' | 'ENERGIZED' | 'ANXIOUS' | 'TIRED' | 'GRATEFUL' | 'SEEKING';

export type SolReflectionType =
  | 'SUMMARIZE'
  | 'ORGANIZE_THOUGHTS'
  | 'KEY_IDEAS'
  | 'ACTION_STEPS'
  | 'GENTLE_REFLECTION'
  | 'TRANSLATE'
  | 'THOUGHT_MAP';

export interface JournalEntryDto {
  id: ID;
  userId: ID;
  title: string;
  content: string;
  moodTag: JournalMood;
  universeTag?: UniverseKey;
  tags: string[];
  isLocked: boolean;
  wordCount: number;
  reflections: JournalAIReflectionDto[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalAIReflectionDto {
  id: ID;
  journalEntryId: ID;
  reflectionType: SolReflectionType;
  output: string;
  thoughtMapNodes?: Array<{ id: string; label: string; group: string }>;
  thoughtMapEdges?: Array<{ from: string; to: string; relationship: string }>;
  disclaimer: string;
  createdAt: string;
}

// ==========================================
// 8. Sol AI Assistant Contract
// ==========================================

export interface SolChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface SolChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  tonePreference?: 'WARM' | 'MINIMAL' | 'ANALYTIC' | 'CREATIVE';
}

export interface SolChatResponse {
  reply: string;
  disclaimer: string;
  crisisDetected: boolean;
  crisisResources?: CrisisResourceInfo[];
}

export interface CrisisResourceInfo {
  name: string;
  country: string;
  contact: string;
  description: string;
  freeAndConfidential: boolean;
  url: string;
}

// ==========================================
// 9. Wellness & Check-ins
// ==========================================

export type WellnessType = 'BREATHING' | 'GRATITUDE' | 'HYDRATION' | 'SLEEP_CHECK' | 'GOAL_PLEDGE';

export interface WellnessSessionDto {
  id: ID;
  userId: ID;
  type: WellnessType;
  durationSeconds: number;
  notes?: string;
  completedAt: string;
}

export interface MoodEntryDto {
  id: ID;
  userId: ID;
  mood: JournalMood;
  intensity: number; // 1 to 5
  note?: string;
  timestamp: string;
}

// ==========================================
// 10. Moderation, Reports & Safety
// ==========================================

export type ReportReason =
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'NON_CONSENSUAL_CONTENT'
  | 'SCAM_OR_PHISHING'
  | 'IMPERSONATION'
  | 'MALICIOUS_SPAM'
  | 'ILLEGAL_ABUSE'
  | 'CRISIS_IMMEDIATE_DANGER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED';

export interface ReportSubmission {
  targetType: 'MESSAGE' | 'USER' | 'CIRCLE' | 'ROOM';
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export interface ModerationActionDto {
  reportId: string;
  action: 'WARN' | 'MUTE' | 'SUSPEND' | 'BAN' | 'DELETE_CONTENT' | 'DISMISS';
  note: string;
}

// ==========================================
// 11. WebSocket Protocol Definitions
// ==========================================

export interface ClientToServerEvents {
  'join:conversation': (data: { conversationId: string }) => void;
  'leave:conversation': (data: { conversationId: string }) => void;
  'send:message': (data: {
    conversationId: string;
    content: string;
    isEncrypted?: boolean;
    mediaUrl?: string;
    ephemeralTtlSecs?: number;
  }) => void;
  'typing:start': (data: { conversationId: string }) => void;
  'typing:stop': (data: { conversationId: string }) => void;
  'presence:ping': (data: { status: 'ONLINE' | 'AWAY' | 'SILENT' }) => void;
  'join:room': (data: { roomId: string; isSilent?: boolean }) => void;
  'leave:room': (data: { roomId: string }) => void;
}

export interface ServerToClientEvents {
  'message:new': (message: MessageDto) => void;
  'message:reaction': (data: { messageId: string; emoji: string; count: number }) => void;
  'typing:update': (data: { conversationId: string; userPersona: PersonaSummary; isTyping: boolean }) => void;
  'presence:update': (data: { userId: string; status: 'ONLINE' | 'OFFLINE' | 'SILENT' }) => void;
  'notification:new': (data: { id: string; title: string; body: string; type: string; url?: string }) => void;
  'heartlink:update': (data: { matchId: string; status: MatchStatus; candidatePersona: PersonaSummary }) => void;
  'error:socket': (error: { code: string; message: string }) => void;
}

// ==========================================
// 12. Birthday Sanctuary & Worldwide Wishes
// ==========================================

export type BirthdayGiftType =
  | 'STARLIGHT_CANDLE'
  | 'COSMIC_CAKE'
  | 'AURORA_LANTERN'
  | 'GOLDEN_LOTUS'
  | 'WARM_COCOA'
  | 'DREAM_BALLOON'
  | 'CONSTELLATION_STAR';

export type BirthdayWishVibe =
  | 'PEACEFUL'
  | 'WARM_HUG'
  | 'COSMIC_COURAGE'
  | 'JOYFUL'
  | 'GENTLE_SOLACE';

export interface BirthdayCelebrant {
  id: string;
  userId: string;
  persona: PersonaSummary;
  timezone: string;
  locationLabel: string;
  mood: string;
  wishNote?: string;
  wishesCount: number;
  candlesBlown: number;
  isCurrentUser?: boolean;
  createdAt: string;
}

export interface BirthdayWish {
  id: string;
  celebrantId: string;
  senderPersona: PersonaSummary;
  gift: BirthdayGiftType;
  vibe: BirthdayWishVibe;
  message: string;
  createdAt: string;
}

export interface BirthdayStats {
  todayCelebrantsCount: number;
  totalWishesSentToday: number;
  participatingCountries: number;
}
