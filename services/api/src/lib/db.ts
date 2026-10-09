import crypto from 'node:crypto';
import {
  UserProfile,
  PersonaSummary,
  PrivacySettingsDto,
  UniverseKey,
  HeartLinkRequestInput,
  HeartLinkMatchCandidate,
  ConversationDto,
  MessageDto,
  CircleDto,
  EchoRoomDto,
  JournalEntryDto,
  JournalAIReflectionDto,
  WellnessSessionDto,
  MoodEntryDto,
  ReportSubmission,
  ReportStatus,
  ReportReason,
  ID,
} from '@empathylink/types';
import { DREAMVERSE_UNIVERSES, INITIAL_ECHO_ROOMS } from '@empathylink/config';
import { generatePublicCode } from './crypto';

// In-Memory & Prisma Hybrid Persistence Store
export class DatabaseStore {
  public users = new Map<string, any>();
  public sessions = new Map<string, any>();
  public devices = new Map<string, any>();
  public personas = new Map<string, any>();
  public privacySettings = new Map<string, PrivacySettingsDto>();
  public heartLinkRequests = new Map<string, any>();
  public heartLinkMatches = new Map<string, any>();
  public conversations = new Map<string, any>();
  public messages = new Map<string, any[]>(); // conversationId -> messages[]
  public circles = new Map<string, any>();
  public circleMembers = new Map<string, Set<string>>(); // circleId -> Set<userId>
  public circleMessages = new Map<string, any[]>(); // circleId -> messages[]
  public echoRooms = new Map<string, any>();
  public echoRoomMembers = new Map<string, Set<string>>();
  public journalEntries = new Map<string, any>();
  public journalReflections = new Map<string, any[]>(); // journalEntryId -> reflections[]
  public moodEntries = new Map<string, any[]>(); // userId -> entries[]
  public wellnessSessions = new Map<string, any[]>(); // userId -> sessions[]
  public reports = new Map<string, any>();
  public blocks = new Map<string, Set<string>>(); // initiatorId -> Set<blockedUserId>
  public moderationEvents = new Map<string, any>();
  public notifications = new Map<string, any[]>(); // userId -> notifications[]
  public securityEvents = new Map<string, any[]>();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Seed Demo Users for HeartLink matching and circle creators
    const demoUsers = [
      { id: 'usr_nova', email: 'nova@empathylink.demo', displayName: 'Nova', initialUniverse: 'CYBERPUNK' as UniverseKey },
      { id: 'usr_lyra', email: 'lyra@empathylink.demo', displayName: 'Lyra', initialUniverse: 'DEEP_OCEAN' as UniverseKey },
      { id: 'usr_kaito', email: 'kaito@empathylink.demo', displayName: 'Kaito', initialUniverse: 'ANIME' as UniverseKey },
      { id: 'usr_admin', email: 'admin@empathylink.demo', displayName: 'Aegis', initialUniverse: 'MYTHOLOGY' as UniverseKey },
    ];
    demoUsers.forEach((u) => {
      this.createUser({
        id: u.id,
        email: u.email,
        passwordHash: 'demo_hash_not_for_login',
        displayName: u.displayName,
        initialUniverse: u.initialUniverse,
        role: u.id === 'usr_admin' ? 'ADMIN' : 'USER',
      });
    });

    // Seed Echo Rooms
    INITIAL_ECHO_ROOMS.forEach((room, idx) => {
      const id = `echo_room_${idx + 1}`;
      this.echoRooms.set(id, {
        id,
        title: room.title,
        category: room.category,
        isSilentPresenceAllowed: room.isSilentPresenceAllowed,
        activePresenceCount: room.activePresenceCount,
        createdAt: new Date().toISOString(),
      });
      this.echoRoomMembers.set(id, new Set());
    });

    // Seed Demo Public Circles
    const demoCircles = [
      {
        id: 'circle_neon_coders',
        name: 'Neon Coders',
        description: 'Night owls writing synth algorithms and cyberpunk lore.',
        universe: 'CYBERPUNK' as UniverseKey,
        accessMode: 'OPEN' as const,
        tags: ['coding', 'cyberpunk', 'synthwave'],
        creatorId: 'usr_nova',
      },
      {
        id: 'circle_abyssal_chill',
        name: 'Abyssal Sanctuary',
        description: 'Quiet contemplation, ambient ocean sounds, and calm breathing.',
        universe: 'DEEP_OCEAN' as UniverseKey,
        accessMode: 'OPEN' as const,
        tags: ['calm', 'ambient', 'ocean'],
        creatorId: 'usr_lyra',
      },
      {
        id: 'circle_mythos_lore',
        name: 'Pantheon Whispers',
        description: 'Exploring archetypal stories and philosophical reflections.',
        universe: 'MYTHOLOGY' as UniverseKey,
        accessMode: 'OPEN' as const,
        tags: ['philosophy', 'mythology', 'reflection'],
        creatorId: 'usr_admin',
      },
    ];

    demoCircles.forEach((c) => {
      this.circles.set(c.id, {
        id: c.id,
        name: c.name,
        description: c.description,
        universe: c.universe,
        accessMode: c.accessMode,
        tags: c.tags,
        creatorPersona: {
          id: `per_${c.creatorId}`,
          userId: c.creatorId,
          displayName: c.creatorId === 'usr_admin' ? 'Aegis' : c.creatorId === 'usr_nova' ? 'Nova' : 'Lyra',
          publicCode: `EL-UN-${Math.floor(10000 + Math.random() * 90000)}`,
          universe: c.universe,
          lifestyle: 'Pioneer',
          lifetimePath: 'Curator',
          dreamTheme: 'Sanctuary',
          aura: 'Calm Indigo',
          title: 'Founder',
          symbols: ['sigil-core'],
          motto: 'We are there for you. Always for you.',
          createdAt: new Date().toISOString(),
        },
        memberCount: 3,
        createdAt: new Date().toISOString(),
      });
      this.circleMembers.set(c.id, new Set([c.creatorId]));
      this.circleMessages.set(c.id, []);
    });
  }

  // ==================== User & Auth ====================
  public findUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized && !user.deletedAt) {
        return user;
      }
    }
    return null;
  }

  public findUserById(id: string) {
    const user = this.users.get(id);
    if (!user || user.deletedAt) return null;
    return user;
  }

  public createUser(userData: any) {
    const id = userData.id || `usr_${crypto.randomUUID()}`;
    const user = {
      id,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'USER',
      isVerified: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, user);

    // Create default privacy settings
    this.privacySettings.set(id, {
      allowSolJournalReflection: true,
      allowHeartLinkMatching: true,
      profileVisibility: 'UNIVERSE_ONLY',
      showOnlineStatus: true,
      allowDirectMessagesFrom: 'MATCHES_ONLY',
      ephemeralMessagesDefaultTtlSecs: 0,
      requirePasscodeForJournal: false,
    });

    // Create default Persona
    const universe: UniverseKey = userData.initialUniverse || 'CYBERPUNK';
    const universeConfig = DREAMVERSE_UNIVERSES[universe] || DREAMVERSE_UNIVERSES.CYBERPUNK;
    const persona: PersonaSummary = {
      id: `per_${id}`,
      userId: id,
      displayName: userData.displayName || 'Traveler',
      publicCode: generatePublicCode(universe),
      universe,
      lifestyle: universeConfig.defaultLifestyles[0] || 'Wanderer',
      lifetimePath: universeConfig.defaultLifetimePaths[0] || 'Pathfinder',
      dreamTheme: universeConfig.defaultDreamThemes[0] || 'Dawn',
      aura: universeConfig.aura,
      title: 'Kindred Soul',
      symbols: [universeConfig.symbols[0]],
      motto: universeConfig.motto,
      createdAt: new Date().toISOString(),
    };
    this.personas.set(id, persona);

    return user;
  }

  public createSession(sessionData: any) {
    const id = `ses_${crypto.randomUUID()}`;
    const session = {
      id,
      userId: sessionData.userId,
      deviceId: sessionData.deviceId || `dev_${crypto.randomUUID()}`,
      deviceName: sessionData.deviceName || 'Web Browser',
      refreshTokenHash: sessionData.refreshTokenHash,
      ipAddress: sessionData.ipAddress || '127.0.0.1',
      userAgent: sessionData.userAgent || 'EmpathyLink-Client',
      expiresAt: sessionData.expiresAt,
      isRevoked: false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.sessions.set(id, session);
    return session;
  }

  public findSessionByRefreshTokenHash(hash: string) {
    for (const session of this.sessions.values()) {
      if (session.refreshTokenHash === hash && !session.isRevoked) {
        return session;
      }
    }
    return null;
  }

  public revokeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isRevoked = true;
      this.sessions.set(sessionId, session);
    }
  }

  public getUserSessions(userId: string) {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId && !s.isRevoked);
  }

  // ==================== Persona & DreamVerse ====================
  public getPersonaByUserId(userId: string): PersonaSummary | null {
    const user = this.users.get(userId);
    if (user && user.deletedAt) return null;
    return this.personas.get(userId) || null;
  }

  public updatePersona(userId: string, data: Partial<PersonaSummary>): PersonaSummary {
    const existing = this.personas.get(userId);
    if (!existing) {
      throw new Error('Persona not found');
    }
    const updated = {
      ...existing,
      ...data,
      symbols: data.symbols || existing.symbols,
    };
    this.personas.set(userId, updated);
    return updated;
  }

  // ==================== HeartLink ====================
  public createHeartLinkRequest(userId: string, input: HeartLinkRequestInput) {
    const id = `hlreq_${crypto.randomUUID()}`;
    const req = {
      id,
      userId,
      ...input,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.heartLinkRequests.set(id, req);
    return req;
  }

  public getHeartLinkRequests(userId: string) {
    return Array.from(this.heartLinkRequests.values()).filter((r) => r.userId === userId);
  }

  public getCandidatesForMatching(excludeUserId: string) {
    const candidates: any[] = [];
    for (const [userId, persona] of this.personas.entries()) {
      if (userId === excludeUserId) continue;
      const privacy = this.privacySettings.get(userId);
      if (privacy && !privacy.allowHeartLinkMatching) continue;

      candidates.push({
        persona,
        topics: ['mindfulness', 'music', 'coding', 'gaming', 'art', 'philosophy'],
        languages: ['en'],
        conversationStyle: 'REFLECTIVE',
        availabilityWindow: 'Flexible',
        timeZone: 'UTC',
      });
    }
    return candidates;
  }

  // ==================== Conversations & Messages ====================
  public createConversation(data: { type: any; title?: string; memberUserIds: string[]; universeKey?: string }) {
    const id = `conv_${crypto.randomUUID()}`;
    const members = data.memberUserIds.map((uid) => ({
      userId: uid,
      persona: this.getPersonaByUserId(uid)!,
      joinedAt: new Date().toISOString(),
    }));

    const conversation: ConversationDto = {
      id,
      type: data.type || 'HEARTLINK_DIRECT',
      title: data.title,
      universe: data.universeKey as UniverseKey,
      members,
      e2eePendingNotice: true,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  public getUserConversations(userId: string) {
    return Array.from(this.conversations.values()).filter((conv) =>
      conv.members.some((m: any) => m.userId === userId)
    );
  }

  public getConversationById(id: string): ConversationDto | null {
    return this.conversations.get(id) || null;
  }

  public addMessage(conversationId: string, messageData: any): MessageDto {
    const message: MessageDto = {
      id: `msg_${crypto.randomUUID()}`,
      conversationId,
      senderId: messageData.senderId,
      senderPersona: messageData.senderPersona,
      content: messageData.content,
      isEncrypted: messageData.isEncrypted || false,
      mediaUrl: messageData.mediaUrl,
      mediaType: messageData.mediaType,
      reactions: [],
      createdAt: new Date().toISOString(),
    };

    const list = this.messages.get(conversationId) || [];
    list.push(message);
    this.messages.set(conversationId, list);

    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.lastMessage = message;
      conv.updatedAt = message.createdAt;
      this.conversations.set(conversationId, conv);
    }

    return message;
  }

  public getMessages(conversationId: string) {
    return this.messages.get(conversationId) || [];
  }

  // ==================== Circles ====================
  public getCircles() {
    return Array.from(this.circles.values());
  }

  public getCircleById(id: string): CircleDto | null {
    return this.circles.get(id) || null;
  }

  public createCircle(creatorUserId: string, data: any): CircleDto {
    const id = `circle_${crypto.randomUUID()}`;
    const creatorPersona = this.getPersonaByUserId(creatorUserId)!;

    const circle: CircleDto = {
      id,
      name: data.name,
      description: data.description,
      universe: data.universe,
      accessMode: data.accessMode,
      tags: data.tags || [],
      memberCount: 1,
      creatorPersona,
      isMember: true,
      createdAt: new Date().toISOString(),
    };

    this.circles.set(id, circle);
    this.circleMembers.set(id, new Set([creatorUserId]));
    this.circleMessages.set(id, []);
    return circle;
  }

  public joinCircle(circleId: string, userId: string) {
    const members = this.circleMembers.get(circleId) || new Set();
    members.add(userId);
    this.circleMembers.set(circleId, members);

    const circle = this.circles.get(circleId);
    if (circle) {
      circle.memberCount = members.size;
      this.circles.set(circleId, circle);
    }
  }

  public leaveCircle(circleId: string, userId: string) {
    const members = this.circleMembers.get(circleId);
    if (members) {
      members.delete(userId);
      const circle = this.circles.get(circleId);
      if (circle) {
        circle.memberCount = members.size;
        this.circles.set(circleId, circle);
      }
    }
  }

  public addCircleMessage(circleId: string, senderUserId: string, content: string) {
    const persona = this.getPersonaByUserId(senderUserId)!;
    const msg = {
      id: `cmsg_${crypto.randomUUID()}`,
      circleId,
      senderPersona: persona,
      content,
      createdAt: new Date().toISOString(),
    };
    const list = this.circleMessages.get(circleId) || [];
    list.push(msg);
    this.circleMessages.set(circleId, list);
    return msg;
  }

  public getCircleMessages(circleId: string) {
    return this.circleMessages.get(circleId) || [];
  }

  // ==================== Echo Rooms ====================
  public getEchoRooms(): EchoRoomDto[] {
    return Array.from(this.echoRooms.values());
  }

  // ==================== Dream Journal ====================
  public createJournalEntry(userId: string, data: any): JournalEntryDto {
    const id = `jrn_${crypto.randomUUID()}`;
    const wordCount = (data.content || '').trim().split(/\s+/).filter(Boolean).length;
    const entry: JournalEntryDto = {
      id,
      userId,
      title: data.title || 'Untitled Reflection',
      content: data.content,
      moodTag: data.moodTag || 'REFLECTIVE',
      universeTag: data.universeTag,
      tags: data.tags || [],
      isLocked: data.isLocked || false,
      wordCount,
      reflections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.journalEntries.set(id, entry);
    this.journalReflections.set(id, []);
    return entry;
  }

  public getUserJournalEntries(userId: string): JournalEntryDto[] {
    return Array.from(this.journalEntries.values())
      .filter((e) => e.userId === userId && !e.deletedAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getJournalEntryById(id: string): JournalEntryDto | null {
    const entry = this.journalEntries.get(id);
    if (!entry || entry.deletedAt) return null;
    entry.reflections = this.journalReflections.get(id) || [];
    return entry;
  }

  public updateJournalEntry(id: string, userId: string, data: any): JournalEntryDto {
    const entry = this.getJournalEntryById(id);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or access denied');
    }
    const updated: JournalEntryDto = {
      ...entry,
      ...data,
      wordCount: data.content
        ? data.content.trim().split(/\s+/).filter(Boolean).length
        : entry.wordCount,
      updatedAt: new Date().toISOString(),
    };
    this.journalEntries.set(id, updated);
    return updated;
  }

  public deleteJournalEntry(id: string, userId: string): boolean {
    const entry = this.getJournalEntryById(id);
    if (!entry || entry.userId !== userId) return false;
    entry.deletedAt = new Date().toISOString();
    this.journalEntries.set(id, entry);
    return true;
  }

  public addJournalReflection(journalEntryId: string, reflectionData: any) {
    const id = `jref_${crypto.randomUUID()}`;
    const reflection: JournalAIReflectionDto = {
      id,
      journalEntryId,
      ...reflectionData,
      createdAt: new Date().toISOString(),
    };
    const list = this.journalReflections.get(journalEntryId) || [];
    list.push(reflection);
    this.journalReflections.set(journalEntryId, list);
    return reflection;
  }

  // ==================== Wellness & Mood ====================
  public addMoodEntry(userId: string, data: any): MoodEntryDto {
    const entry: MoodEntryDto = {
      id: `mood_${crypto.randomUUID()}`,
      userId,
      mood: data.mood,
      intensity: data.intensity,
      note: data.note,
      timestamp: new Date().toISOString(),
    };
    const list = this.moodEntries.get(userId) || [];
    list.push(entry);
    this.moodEntries.set(userId, list);
    return entry;
  }

  public getUserMoodEntries(userId: string): MoodEntryDto[] {
    return (this.moodEntries.get(userId) || []).slice(-30);
  }

  public addWellnessSession(userId: string, data: any): WellnessSessionDto {
    const session: WellnessSessionDto = {
      id: `wel_${crypto.randomUUID()}`,
      userId,
      type: data.type,
      durationSeconds: data.durationSeconds,
      notes: data.notes,
      completedAt: new Date().toISOString(),
    };
    const list = this.wellnessSessions.get(userId) || [];
    list.push(session);
    this.wellnessSessions.set(userId, list);
    return session;
  }

  // ==================== Privacy & Moderation ====================
  public getPrivacySettings(userId: string): PrivacySettingsDto {
    return (
      this.privacySettings.get(userId) || {
        allowSolJournalReflection: true,
        allowHeartLinkMatching: true,
        profileVisibility: 'UNIVERSE_ONLY',
        showOnlineStatus: true,
        allowDirectMessagesFrom: 'MATCHES_ONLY',
        ephemeralMessagesDefaultTtlSecs: 0,
        requirePasscodeForJournal: false,
      }
    );
  }

  public updatePrivacySettings(userId: string, data: Partial<PrivacySettingsDto>): PrivacySettingsDto {
    const existing = this.getPrivacySettings(userId);
    const updated = { ...existing, ...data };
    this.privacySettings.set(userId, updated);
    return updated;
  }

  public addReport(reporterId: string, submission: ReportSubmission) {
    const id = `rep_${crypto.randomUUID()}`;
    const report = {
      id,
      reporterId,
      ...submission,
      status: 'PENDING' as ReportStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.reports.set(id, report);
    return report;
  }

  public getReports(status?: ReportStatus) {
    const all = Array.from(this.reports.values());
    if (status) return all.filter((r) => r.status === status);
    return all;
  }

  public actionReport(reportId: string, moderatorId: string, action: string, note: string) {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');
    report.status = 'ACTION_TAKEN';
    report.updatedAt = new Date().toISOString();
    this.reports.set(reportId, report);

    const eventId = `modevt_${crypto.randomUUID()}`;
    const event = {
      id: eventId,
      reportId,
      moderatorId,
      action,
      note,
      createdAt: new Date().toISOString(),
    };
    this.moderationEvents.set(eventId, event);
    return event;
  }

  public blockUser(initiatorId: string, blockedUserId: string) {
    if (!this.blocks.has(initiatorId)) {
      this.blocks.set(initiatorId, new Set());
    }
    this.blocks.get(initiatorId)?.add(blockedUserId);
  }

  public unblockUser(initiatorId: string, blockedUserId: string) {
    this.blocks.get(initiatorId)?.delete(blockedUserId);
  }

  public isBlocked(userA: string, userB: string): boolean {
    return !!(this.blocks.get(userA)?.has(userB) || this.blocks.get(userB)?.has(userA));
  }

  // ==================== Notifications ====================
  public addNotification(userId: string, notif: any) {
    const item = {
      id: `notif_${crypto.randomUUID()}`,
      userId,
      ...notif,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const list = this.notifications.get(userId) || [];
    list.unshift(item);
    this.notifications.set(userId, list.slice(0, 50));
    return item;
  }

  public getUserNotifications(userId: string) {
    return this.notifications.get(userId) || [];
  }

  public markNotificationAsRead(userId: string, notifId: string) {
    const list = this.notifications.get(userId) || [];
    const item = list.find((n) => n.id === notifId);
    if (item) item.isRead = true;
    return item;
  }
}

export const db = new DatabaseStore();
