import { z } from 'zod';

// ==========================================
// 1. Auth Schemas
// ==========================================

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters long')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  deviceName: z.string().max(100).optional().default('Web Browser'),
  initialUniverse: z
    .enum(['GAMING', 'MYTHOLOGY', 'CYBERPUNK', 'FANTASY', 'DEEP_OCEAN', 'TIME_TRAVEL', 'NATURE', 'ANIME'])
    .optional(),
  displayName: z.string().min(2).max(40).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceName: z.string().max(100).optional().default('Web Browser'),
  twoFactorCode: z.string().length(6).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(20),
});

export const TwoFactorVerifySchema = z.object({
  token: z.string().length(6, '2FA Code must be 6 digits'),
});

// ==========================================
// 2. Persona & DreamVerse Schemas
// ==========================================

export const UniverseEnum = z.enum([
  'GAMING',
  'MYTHOLOGY',
  'CYBERPUNK',
  'FANTASY',
  'DEEP_OCEAN',
  'TIME_TRAVEL',
  'NATURE',
  'ANIME',
]);

export const PersonaUpdateSchema = z.object({
  displayName: z.string().min(2).max(40).optional(),
  lifestyle: z.string().min(2).max(60).optional(),
  lifetimePath: z.string().min(2).max(60).optional(),
  dreamTheme: z.string().min(2).max(60).optional(),
  aura: z.string().min(2).max(60).optional(),
  title: z.string().min(2).max(60).optional(),
  motto: z.string().max(200).optional(),
  bio: z.string().max(500).optional(),
  symbols: z.array(z.string()).max(6).optional(),
  avatarMediaId: z.string().uuid().optional(),
});

export type PersonaUpdateInput = z.infer<typeof PersonaUpdateSchema>;

export const DreamVerseSelectSchema = z.object({
  universe: UniverseEnum,
  lifestyle: z.string().min(2).max(60),
  lifetimePath: z.string().min(2).max(60),
  dreamTheme: z.string().min(2).max(60),
  aura: z.string().min(2).max(60).optional(),
  title: z.string().min(2).max(60).optional(),
  motto: z.string().max(200).optional(),
});

export type DreamVerseSelectInput = z.infer<typeof DreamVerseSelectSchema>;

// ==========================================
// 3. HeartLink Schemas
// ==========================================

export const ConversationStyleEnum = z.enum([
  'CASUAL',
  'DEEP_DIVE',
  'SILENT_LISTENER',
  'STORYTELLER',
  'REFLECTIVE',
]);

export const HeartLinkRequestSchema = z.object({
  intentDescription: z
    .string()
    .min(5, 'Describe what conversation or connection you are seeking')
    .max(500, 'Keep your intent description concise (max 500 characters)'),
  desiredUniverse: UniverseEnum.optional(),
  topics: z.array(z.string().min(1).max(30)).min(1, 'Select at least 1 topic').max(8),
  languages: z.array(z.string().min(2).max(10)).default(['en']),
  conversationStyle: ConversationStyleEnum.default('REFLECTIVE'),
  availabilityWindow: z.string().min(2).max(50).default('Flexible'),
  timeZone: z.string().min(1).max(50).default('UTC'),
});

export type HeartLinkRequestDto = z.infer<typeof HeartLinkRequestSchema>;

// ==========================================
// 4. Chat Schemas
// ==========================================

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(4000),
  isEncrypted: z.boolean().default(false),
  mediaUrl: z.string().url().optional(),
  mediaType: z.string().optional(),
  ephemeralTtlSecs: z.number().int().nonnegative().optional(),
});

export const ReactionSchema = z.object({
  emoji: z.string().min(1).max(8),
});

// ==========================================
// 5. Circles & Echo Rooms Schemas
// ==========================================

export const CircleAccessModeEnum = z.enum(['OPEN', 'APPROVAL_REQUIRED', 'PRIVATE']);

export const CreateCircleSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().min(10).max(500),
  universe: UniverseEnum,
  accessMode: CircleAccessModeEnum.default('OPEN'),
  tags: z.array(z.string().min(1).max(25)).max(5).default([]),
});

export const CircleMessageSchema = z.object({
  content: z.string().min(1).max(3000),
  mediaUrl: z.string().url().optional(),
});

// ==========================================
// 6. Dream Journal Schemas
// ==========================================

export const JournalMoodEnum = z.enum([
  'CALM',
  'REFLECTIVE',
  'ENERGIZED',
  'ANXIOUS',
  'TIRED',
  'GRATEFUL',
  'SEEKING',
]);

export const SolReflectionTypeEnum = z.enum([
  'SUMMARIZE',
  'ORGANIZE_THOUGHTS',
  'KEY_IDEAS',
  'ACTION_STEPS',
  'GENTLE_REFLECTION',
  'TRANSLATE',
  'THOUGHT_MAP',
]);

export const CreateJournalEntrySchema = z.object({
  title: z.string().max(150).default('Untitled Reflection'),
  content: z.string().min(1, 'Journal entry content cannot be empty'),
  moodTag: JournalMoodEnum.default('REFLECTIVE'),
  universeTag: UniverseEnum.optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  isLocked: z.boolean().default(false),
  passcode: z.string().min(4).max(32).optional(),
});

export const UpdateJournalEntrySchema = z.object({
  title: z.string().max(150).optional(),
  content: z.string().min(1).optional(),
  moodTag: JournalMoodEnum.optional(),
  universeTag: UniverseEnum.optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  isLocked: z.boolean().optional(),
  passcode: z.string().min(4).max(32).optional(),
});

export const SolReflectionRequestSchema = z.object({
  reflectionType: SolReflectionTypeEnum,
  targetLanguage: z.string().optional(), // For TRANSLATE
});

// ==========================================
// 7. Sol AI Chat Schemas
// ==========================================

export const SolChatInputSchema = z.object({
  message: z.string().min(1).max(3000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
  tonePreference: z.enum(['WARM', 'MINIMAL', 'ANALYTIC', 'CREATIVE']).default('WARM'),
});

// ==========================================
// 8. Wellness & Mood Schemas
// ==========================================

export const WellnessTypeEnum = z.enum([
  'BREATHING',
  'GRATITUDE',
  'HYDRATION',
  'SLEEP_CHECK',
  'GOAL_PLEDGE',
]);

export const CreateWellnessSessionSchema = z.object({
  type: WellnessTypeEnum,
  durationSeconds: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

export const CreateMoodEntrySchema = z.object({
  mood: JournalMoodEnum,
  intensity: z.number().int().min(1).max(5),
  note: z.string().max(300).optional(),
});

// ==========================================
// 9. Privacy & Moderation Schemas
// ==========================================

export const UpdatePrivacySettingsSchema = z.object({
  allowSolJournalReflection: z.boolean().optional(),
  allowHeartLinkMatching: z.boolean().optional(),
  profileVisibility: z.enum(['UNIVERSE_ONLY', 'ANONYMOUS_CIRCLES', 'PRIVATE']).optional(),
  showOnlineStatus: z.boolean().optional(),
  allowDirectMessagesFrom: z.enum(['MATCHES_ONLY', 'CIRCLES_AND_MATCHES', 'NOBODY']).optional(),
  ephemeralMessagesDefaultTtlSecs: z.number().int().nonnegative().optional(),
  requirePasscodeForJournal: z.boolean().optional(),
});

export const SubmitReportSchema = z.object({
  targetType: z.enum(['MESSAGE', 'USER', 'CIRCLE', 'ROOM']),
  targetId: z.string().min(1),
  reason: z.enum([
    'HARASSMENT',
    'HATE_SPEECH',
    'NON_CONSENSUAL_CONTENT',
    'SCAM_OR_PHISHING',
    'IMPERSONATION',
    'MALICIOUS_SPAM',
    'ILLEGAL_ABUSE',
    'CRISIS_IMMEDIATE_DANGER',
  ]),
  description: z.string().max(1000).optional(),
});

export const ModerationActionSchema = z.object({
  action: z.enum(['WARN', 'MUTE', 'SUSPEND', 'BAN', 'DELETE_CONTENT', 'DISMISS']),
  note: z.string().min(3).max(1000),
  durationHours: z.number().int().positive().optional(),
});

export const BlockUserSchema = z.object({
  blockedUserId: z.string().min(1),
  reason: z.string().max(255).optional(),
});
