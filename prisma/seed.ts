import { PrismaClient } from '@prisma/client';
import { DREAMVERSE_UNIVERSES, INITIAL_ECHO_ROOMS } from '../packages/config/src/index';
import { hashPassword } from '../services/api/src/lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EmpathyLink Seed Sequence...');

  // 1. Seed All 8 Universes
  for (const univ of Object.values(DREAMVERSE_UNIVERSES)) {
    const universeRecord = await prisma.universe.upsert({
      where: { id: univ.id },
      update: {
        name: univ.name,
        tagline: univ.tagline,
        description: univ.description,
        primaryColor: univ.primaryColor,
        secondaryColor: univ.secondaryColor,
        aura: univ.aura,
        symbols: univ.symbols,
        motto: univ.motto,
      },
      create: {
        id: univ.id,
        name: univ.name,
        tagline: univ.tagline,
        description: univ.description,
        primaryColor: univ.primaryColor,
        secondaryColor: univ.secondaryColor,
        aura: univ.aura,
        symbols: univ.symbols,
        motto: univ.motto,
      },
    });

    console.log(`✨ Seeded Universe: ${universeRecord.name}`);
  }

  // 2. Seed Initial Echo Rooms
  for (const room of INITIAL_ECHO_ROOMS) {
    const existing = await prisma.echoRoom.findFirst({
      where: { title: room.title },
    });
    if (!existing) {
      await prisma.echoRoom.create({
        data: {
          title: room.title,
          category: room.category,
          isSilentPresenceAllowed: room.isSilentPresenceAllowed,
        },
      });
      console.log(`🌌 Seeded Echo Room: ${room.title}`);
    }
  }

  // 3. Seed Demo Users
  const defaultPassword = 'Password123!@#';
  const passwordHash = await hashPassword(defaultPassword);

  const demoUsers = [
    {
      email: 'admin@empathylink.internal',
      role: 'ADMIN' as const,
      displayName: 'Aegis',
      publicCode: 'EL-MY-99001',
      universeKey: 'MYTHOLOGY',
      lifestyle: 'Sanctuary Guardian',
      lifetimePath: 'Pantheon Seeker',
      dreamTheme: 'Ascent to Olympus',
      aura: 'Solar Radiance',
      title: 'Platform Custodian',
      motto: 'Guarding safe shores for every traveler.',
    },
    {
      email: 'nova@empathylink.internal',
      role: 'USER' as const,
      displayName: 'Nova',
      publicCode: 'EL-CY-58291',
      universeKey: 'CYBERPUNK',
      lifestyle: 'Deckrunner',
      lifetimePath: 'Augmented Lifespan',
      dreamTheme: 'System Disconnect',
      aura: 'Neon Violet Glitch',
      title: 'Neon Wanderer',
      motto: 'Your code writes tomorrow.',
    },
    {
      email: 'lyra@empathylink.internal',
      role: 'USER' as const,
      displayName: 'Lyra',
      publicCode: 'EL-OC-10492',
      universeKey: 'DEEP_OCEAN',
      lifestyle: 'Subsea Drifter',
      lifetimePath: 'Bioluminescent Navigator',
      dreamTheme: 'Whale Song Twilight',
      aura: 'Abyssal Cyan',
      title: 'Trench Whisperer',
      motto: 'In the tranquil deep, every ripple is understood.',
    },
    {
      email: 'kaito@empathylink.internal',
      role: 'USER' as const,
      displayName: 'Kaito',
      publicCode: 'EL-GA-77312',
      universeKey: 'GAMING',
      lifestyle: 'Casual Explorer',
      lifetimePath: 'Guild Cartographer',
      dreamTheme: 'Co-op Overworld',
      aura: 'Resonant Amethyst',
      title: 'Checkpoint Keeper',
      motto: 'No run is solo when our save states align.',
    },
  ];

  for (const user of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          passwordHash,
          role: user.role,
          privacySettings: {
            create: {
              allowSolJournalReflection: true,
              allowHeartLinkMatching: true,
              profileVisibility: 'UNIVERSE_ONLY',
              showOnlineStatus: true,
            },
          },
          persona: {
            create: {
              displayName: user.displayName,
              publicCode: user.publicCode,
              universeKey: user.universeKey,
              lifestyle: user.lifestyle,
              lifetimePath: user.lifetimePath,
              dreamTheme: user.dreamTheme,
              aura: user.aura,
              title: user.title,
              symbols: ['sigil-core'],
              motto: user.motto,
            },
          },
        },
      });
      console.log(`👤 Seeded User & Persona: ${user.email} (${user.displayName})`);
    }
  }

  console.log('✅ Seed Sequence Completed Successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
