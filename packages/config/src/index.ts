import { UniverseDefinition, UniverseKey, CrisisResourceInfo, EchoRoomDto } from '@empathylink/types';

// ==========================================
// 1. DreamVerse Catalog (8 Universes)
// ==========================================

export const DREAMVERSE_UNIVERSES: Record<UniverseKey, UniverseDefinition> = {
  GAMING: {
    id: 'GAMING',
    name: 'Gaming',
    tagline: 'Pixels, reflexes, and shared quests in infinite realms.',
    description: 'A domain for digital wanderers, speedrunners, and cooperative souls who find solace in virtual camaraderie.',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    aura: 'Resonant Amethyst',
    symbols: ['controller', 'polygon-crystal', 'respawn-sigil', 'd20'],
    motto: 'No run is solo when our save states align.',
    defaultLifetimePaths: ['Esports Strategist', 'Indie Architect', 'Speedrun Archivist', 'Guild Cartographer'],
    defaultDreamThemes: ['Glitched Horizon', 'Infinite Checkpoint', 'Co-op Overworld', 'Latency Zero'],
    defaultLifestyles: ['Night Owl Streamer', 'Casual Explorer', 'High-Score Tactician', 'Story-Mode Wanderer'],
  },
  MYTHOLOGY: {
    id: 'MYTHOLOGY',
    name: 'Mythology',
    tagline: 'Ancient echoes, celestial fire, and timeless allegories.',
    description: 'Walk alongside constellations, ancient pantheons, and archetypal tales that illuminate modern inner journeys.',
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    aura: 'Solar Radiance',
    symbols: ['laurel-wreath', 'celestial-chariot', 'oracle-pyre', 'trident'],
    motto: 'The myths we speak today will chart the stars tomorrow.',
    defaultLifetimePaths: ['Pantheon Seeker', 'Oracle of Whispers', 'Odyssey Navigator', 'Rune Scribe'],
    defaultDreamThemes: ['Ascent to Olympus', 'Elysian Meadow', 'Forge of Hephaestus', 'Starlit Labyrinth'],
    defaultLifestyles: ['Philosopher Monk', 'Bard of the Plaza', 'Keeper of Relics', 'Celestial Watcher'],
  },
  CYBERPUNK: {
    id: 'CYBERPUNK',
    name: 'Cyberpunk',
    tagline: 'Neon rain, rogue frequencies, and chrome solidarity.',
    description: 'A subterranean synth realm where identity is modular, telemetry is poetic, and authentic empathy breaches the firewall.',
    primaryColor: '#06B6D4',
    secondaryColor: '#EC4899',
    aura: 'Neon Violet Glitch',
    symbols: ['neural-jack', 'neon-circuit', 'subgrid-key', 'hologram-prism'],
    motto: 'Your code writes tomorrow.',
    defaultLifetimePaths: ['Deckrunner', 'Augmented Lifespan', 'Subgrid Archivist', 'Cipher Broker'],
    defaultDreamThemes: ['System Disconnect', 'Rain Over Night City', 'Ghost in the Terminal', 'Megastructure Solitude'],
    defaultLifestyles: ['Neon Wanderer', 'Dark-Fiber Hermit', 'Bounty Synthesizer', 'Overclocked Dreamer'],
  },
  FANTASY: {
    id: 'FANTASY',
    name: 'Fantasy',
    tagline: 'Ancient groves, spellbound lanterns, and eternal wonder.',
    description: 'Enchanted forests, quiet libraries of forgotten incantations, and kindred travelers around campfire embers.',
    primaryColor: '#10B981',
    secondaryColor: '#84CC16',
    aura: 'Emerald Starlight',
    symbols: ['quill-scroll', 'elven-leaf', 'crystal-staff', 'moonlit-tower'],
    motto: 'Magic is merely empathy woven into the waking world.',
    defaultLifetimePaths: ['Mage of the Verdant Archive', 'Ranger of the Quiet Border', 'Alchemist of Solace', 'Paladin of Gentle Dawn'],
    defaultDreamThemes: ['Luminescent Forest', 'Whispering Spire', 'Twilight Campfire', 'Forgotten Grimoire'],
    defaultLifestyles: ['Herbalist Hermit', 'Tavern Storyteller', 'Wayfarer Pilgrim', 'Sanctuary Guardian'],
  },
  DEEP_OCEAN: {
    id: 'DEEP_OCEAN',
    name: 'Deep Ocean',
    tagline: 'Abyssal silence, bioluminescent pulses, and gentle depths.',
    description: 'Submerge into calm, quiet waters where sound softens, pressure dissolves into buoyant peace, and unseen currents carry us.',
    primaryColor: '#0284C7',
    secondaryColor: '#0E7490',
    aura: 'Abyssal Cyan',
    symbols: ['biolum-jellyfish', 'nautilus-shell', 'abyssal-pearl', 'tide-vortex'],
    motto: 'In the tranquil deep, every ripple is understood.',
    defaultLifetimePaths: ['Abyssal Diver', 'Hydrothermal Sentinel', 'Bioluminescent Navigator', 'Trench Cartographer'],
    defaultDreamThemes: ['Midnight Trench', 'Coral Sanctum', 'Sunken Observatory', 'Whale Song Twilight'],
    defaultLifestyles: ['Subsea Drifter', 'Silent Depths Scholar', 'Reef Tender', 'Abyssal Dreamer'],
  },
  TIME_TRAVEL: {
    id: 'TIME_TRAVEL',
    name: 'Time Travel',
    tagline: 'Paradox pendulums, vintage epochs, and divergent futures.',
    description: 'Traverse eras without regret. A haven for those contemplating their past chapters while stepping boldly into unwritten years.',
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    aura: 'Chrono-Prism Indigo',
    symbols: ['hourglass', 'astrolabe-gear', 'temporal-loom', 'infinite-loop'],
    motto: 'Every second lived is a timeline worth preserving.',
    defaultLifetimePaths: ['Epoch Chronologer', 'Paradox Weaver', 'Victorian Antiquarian', 'Future-Cast Pioneer'],
    defaultDreamThemes: ['Steampunk Clocktower', 'Divergent Branch 1920', 'Final Horizon 3099', 'Echoes of Yesteryear'],
    defaultLifestyles: ['Time-Stitcher', 'Relic Archivist', 'Continuum Drifter', 'Pendulum Thinker'],
  },
  NATURE: {
    id: 'NATURE',
    name: 'Nature',
    tagline: 'Canopy whispers, sunlit moss, and grounding roots.',
    description: 'Earthly tranquility for grounded souls seeking calm breathing, sunrise walks, rainfall rhythms, and undisturbed peace.',
    primaryColor: '#059669',
    secondaryColor: '#16A34A',
    aura: 'Boreal Mist',
    symbols: ['oak-leaf', 'dewdrop', 'pinecone', 'mountain-peak'],
    motto: 'Root deep, breathe wide, let the storm pass.',
    defaultLifetimePaths: ['Canopy Steward', 'Alpine Nomad', 'Wildwood Botanist', 'Valley Hermit'],
    defaultDreamThemes: ['Petrichor at Dawn', 'High Sierra Twilight', 'Mossy Riverbed', 'Ancient Redwood Grove'],
    defaultLifestyles: ['Forest Bather', 'Homestead Naturalist', 'Trail Wanderer', 'Solitary Gardener'],
  },
  ANIME: {
    id: 'ANIME',
    name: 'Anime',
    tagline: 'Cherry blossom breeze, slice-of-life warmth, and boundless courage.',
    description: 'Golden hour roof terraces, nostalgic train journeys, emotional determination, and deep bonds forged under skyward horizons.',
    primaryColor: '#F43F5E',
    secondaryColor: '#FB7185',
    aura: 'Sakura Blush Radiant',
    symbols: ['sakura-petal', 'origami-crane', 'school-rooftop-fence', 'comet-star'],
    motto: 'Even against the tempest, our hearts run forward.',
    defaultLifetimePaths: ['Slice-of-Life Protagonist', 'Shonen Resolve Seeker', 'Mecha Pilot in Solitude', 'Shojo Star-Gazer'],
    defaultDreamThemes: ['Rooftop Golden Hour', 'Suburban Railway Crossing', 'Summer Festival Fireflies', 'Comet Night Sky'],
    defaultLifestyles: ['After-School Dreamer', 'Café Sketcher', 'Late-Night Ramen Connoisseur', 'Quiet Melancholic'],
  },
};

// ==========================================
// 2. Initial Echo Rooms (Temporary Sanctuary Rooms)
// ==========================================

export const INITIAL_ECHO_ROOMS: Array<Omit<EchoRoomDto, 'id' | 'createdAt'>> = [
  {
    title: "Can't Sleep",
    category: 'CANT_SLEEP',
    activePresenceCount: 14,
    isSilentPresenceAllowed: true,
  },
  {
    title: 'Coding Together',
    category: 'CODING_TOGETHER',
    activePresenceCount: 22,
    isSilentPresenceAllowed: true,
  },
  {
    title: 'Exam Stress Relief',
    category: 'EXAM_STRESS',
    activePresenceCount: 9,
    isSilentPresenceAllowed: true,
  },
  {
    title: 'Startup Brainstorm',
    category: 'STARTUP_BRAINSTORM',
    activePresenceCount: 11,
    isSilentPresenceAllowed: false,
  },
  {
    title: 'Music Lovers Lounge',
    category: 'MUSIC_LOVERS',
    activePresenceCount: 18,
    isSilentPresenceAllowed: true,
  },
  {
    title: 'Midnight Talk',
    category: 'MIDNIGHT_TALK',
    activePresenceCount: 31,
    isSilentPresenceAllowed: true,
  },
];

// ==========================================
// 3. Crisis Resources Directory
// ==========================================

export const CRISIS_RESOURCES: CrisisResourceInfo[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    country: 'United States & Canada',
    contact: 'Call or text 988',
    description: '24/7, free and confidential support for people in distress, prevention and crisis resources for you or your loved ones.',
    freeAndConfidential: true,
    url: 'https://988lifeline.org',
  },
  {
    name: 'Crisis Text Line',
    country: 'US, UK, Canada',
    contact: 'Text HOME to 741741',
    description: 'Free, 24/7 crisis counseling via text message with trained crisis counselors.',
    freeAndConfidential: true,
    url: 'https://www.crisistextline.org',
  },
  {
    name: 'NHS Mental Health Services / Samaritans',
    country: 'United Kingdom',
    contact: 'Call 111 (NHS) or 116 123 (Samaritans)',
    description: 'Round-the-clock listening service and urgent mental health support.',
    freeAndConfidential: true,
    url: 'https://www.samaritans.org',
  },
  {
    name: 'Lifeline Australia',
    country: 'Australia',
    contact: 'Call 13 11 14',
    description: '24-hour Australian crisis support and suicide prevention services.',
    freeAndConfidential: true,
    url: 'https://www.lifeline.org.au',
  },
  {
    name: 'Befrienders Worldwide',
    country: 'International (Global Directory)',
    contact: 'Visit website for localized hotlines in over 30 countries',
    description: 'Volunteer-driven emotional support and crisis centers worldwide.',
    freeAndConfidential: true,
    url: 'https://www.befrienders.org',
  },
];

export const SOL_SAFETY_NOTICE =
  'Notice: Sol is an AI communication & reflection assistant. Sol is NOT a doctor, therapist, emergency service, or clinical provider. In an emergency or severe crisis, please reach out directly to licensed care or local emergency responders.';

// ==========================================
// 4. Cryptography & Security Parameters
// ==========================================

export const SECURITY_CONFIG = {
  ARGON2: {
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  },
  JWT: {
    ACCESS_TOKEN_TTL_SECONDS: 900, // 15 minutes
    REFRESH_TOKEN_TTL_DAYS: 30,    // 30 days
  },
  RATE_LIMITS: {
    AUTH_ATTEMPTS_PER_WINDOW: 10,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 mins
    API_STANDARD_PER_MINUTE: 120,
    SOL_PER_MINUTE: 20,
    JOURNAL_AUTO_SAVE_DEBOUNCE_MS: 1500,
  },
};
