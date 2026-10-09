import OpenAI from 'openai';
import {
  SolChatRequest,
  SolChatResponse,
  SolReflectionType,
  JournalAIReflectionDto,
  CrisisResourceInfo,
} from '@empathylink/types';
import { CRISIS_RESOURCES, SOL_SAFETY_NOTICE } from '@empathylink/config';

export interface SolServiceConfig {
  apiKey?: string;
  model?: string;
}

export class SolAiService {
  private openai: OpenAI | null = null;
  private model: string;

  constructor(config?: SolServiceConfig) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    this.model = config?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (apiKey && apiKey !== 'mock-development-key-replace-with-real-key-if-desired' && !apiKey.startsWith('mock')) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Evaluates text for severe crisis or immediate danger signals.
   * Non-clinical pattern matching to direct user immediately to verified crisis resources.
   */
  public evaluateCrisisRisk(text: string): { isCrisis: boolean; matchedSignals: string[] } {
    const lower = text.toLowerCase();
    const crisisSignals = [
      'kill myself',
      'want to die',
      'end my life',
      'suicide',
      'self harm',
      'hurting myself',
      'overdose',
      'hang myself',
      'slit my wrist',
      'no reason to live',
      'can’t go on anymore',
    ];

    const matched = crisisSignals.filter((signal) => lower.includes(signal));
    return {
      isCrisis: matched.length > 0,
      matchedSignals: matched,
    };
  }

  /**
   * Core chat conversation with Sol.
   * Adheres strictly to non-clinical, non-dependent, supportive reflection boundaries.
   */
  public async chat(request: SolChatRequest): Promise<SolChatResponse> {
    const crisisCheck = this.evaluateCrisisRisk(request.message);
    if (crisisCheck.isCrisis) {
      return {
        reply:
          "I hear how much pain you're experiencing right now, and I want you to be safe. Because I am an AI and not a crisis counselor or doctor, I cannot provide emergency support. Please reach out to someone who can help right this second — there are compassionate people ready to listen for free and confidentially.",
        disclaimer: SOL_SAFETY_NOTICE,
        crisisDetected: true,
        crisisResources: CRISIS_RESOURCES,
      };
    }

    const systemPrompt = `You are Sol, an empathetic, calm, non-judgmental AI reflection assistant on EmpathyLink.
Your purpose is to offer gentle perspective, active listening, and reflective inquiries.

CRITICAL BOUNDARIES & ETHICAL RULES:
1. You are an AI reflection assistant. You are NOT a therapist, psychologist, medical doctor, or clinical provider.
2. NEVER diagnose psychiatric conditions or provide clinical evaluations.
3. NEVER foster emotional dependency. Under NO circumstances say or imply "I am all you need", "You only need me", "I have feelings/consciousness", or "Don't tell anyone".
4. Always encourage connection with trusted friends, supportive communities, or licensed care when appropriate.
5. Tone: Calm, warm, grounded, concise, emotionally supportive, never patronizing. Avoid clinical jargon.
6. User Tone Preference: ${request.tonePreference || 'WARM'}.`;

    if (this.openai) {
      try {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...(request.history || []).map((h) => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
          })),
          { role: 'user', content: request.message },
        ];

        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 600,
        });

        const reply = completion.choices[0]?.message?.content || 'I am here with you. Take a gentle breath.';
        return {
          reply,
          disclaimer: SOL_SAFETY_NOTICE,
          crisisDetected: false,
        };
      } catch (err) {
        // Fall back gracefully to safe deterministic response engine
        return this.deterministicChatFallback(request.message, request.tonePreference);
      }
    }

    return this.deterministicChatFallback(request.message, request.tonePreference);
  }

  /**
   * User-triggered Dream Journal reflection with Sol.
   */
  public async reflectJournal(
    title: string,
    content: string,
    reflectionType: SolReflectionType,
    targetLanguage?: string
  ): Promise<Omit<JournalAIReflectionDto, 'id' | 'journalEntryId' | 'createdAt'>> {
    const crisis = this.evaluateCrisisRisk(`${title} ${content}`);
    if (crisis.isCrisis) {
      return {
        reflectionType,
        output:
          "Your reflection touches on very intense feelings. Your safety and well-being are what matter most. Please consider connecting with a trained crisis counselor or trusted person immediately (988 in the US/Canada or 111 in the UK).",
        disclaimer: SOL_SAFETY_NOTICE,
      };
    }

    if (this.openai) {
      try {
        const instructions = this.getReflectionInstructions(reflectionType, targetLanguage);
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are Sol, an AI reflection companion. Help the user process their private journal entry with warmth and gentle structure. Do NOT diagnose or give medical advice.',
            },
            {
              role: 'user',
              content: `Journal Title: ${title}\nContent:\n${content}\n\nTask: ${instructions}`,
            },
          ],
          temperature: 0.6,
          max_tokens: 800,
        });

        const output = completion.choices[0]?.message?.content || 'Thank you for sharing your thoughts.';

        let thoughtMapNodes: Array<{ id: string; label: string; group: string }> | undefined;
        let thoughtMapEdges: Array<{ from: string; to: string; relationship: string }> | undefined;

        if (reflectionType === 'THOUGHT_MAP') {
          const map = this.generateDeterministicThoughtMap(title, content);
          thoughtMapNodes = map.nodes;
          thoughtMapEdges = map.edges;
        }

        return {
          reflectionType,
          output,
          thoughtMapNodes,
          thoughtMapEdges,
          disclaimer: SOL_SAFETY_NOTICE,
        };
      } catch (err) {
        return this.deterministicJournalReflection(title, content, reflectionType, targetLanguage);
      }
    }

    return this.deterministicJournalReflection(title, content, reflectionType, targetLanguage);
  }

  private getReflectionInstructions(type: SolReflectionType, targetLang?: string): string {
    switch (type) {
      case 'SUMMARIZE':
        return 'Provide a concise, 3-bullet compassionate summary of the key themes in this entry.';
      case 'ORGANIZE_THOUGHTS':
        return 'Group these thoughts into 3 constructive themes: Present Situation, Emotional Tone, and Inner Strength.';
      case 'KEY_IDEAS':
        return 'Extract the 3 most significant insights or recurring values expressed in this writing.';
      case 'ACTION_STEPS':
        return 'Suggest 2-3 tiny, restorative, non-overwhelming self-care or intentional micro-steps based on what was written.';
      case 'GENTLE_REFLECTION':
        return 'Provide a warm, supportive 2-paragraph reflection honoring the feelings expressed and offering a grounded perspective.';
      case 'TRANSLATE':
        return `Translate this journal entry sensitively into ${targetLang || 'Spanish'}, maintaining its intimate emotional tone.`;
      case 'THOUGHT_MAP':
        return 'Deconstruct this reflection into interconnected core themes and relationships.';
    }
  }

  /**
   * Deterministic local fallback reflection engine ensuring full local autonomy
   */
  private deterministicChatFallback(message: string, tone?: string): SolChatResponse {
    const lower = message.toLowerCase();
    let reply =
      "I appreciate you sharing that with me. It takes courage to put thoughts into words. What part of that feels most important for you right now?";

    if (lower.includes('stress') || lower.includes('overwhelmed') || lower.includes('busy')) {
      reply =
        "It sounds like there are a lot of demands on your energy right now. When things pile up, even a momentary pause can be an anchor. What is one small thing you can set aside for today?";
    } else if (lower.includes('lonely') || lower.includes('alone') || lower.includes('isolated')) {
      reply =
        "Feeling alone can be one of the heaviest spaces to navigate. Even though I am an AI, I am here listening without judgment. What kind of connection would feel most nourishing to you right now?";
    } else if (lower.includes('grateful') || lower.includes('happy') || lower.includes('peace')) {
      reply =
        "That warmth comes through clearly. Celebrating moments of peace or gratitude helps us remember what anchors us. What made that moment stand out for you?";
    } else if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('sleep')) {
      reply =
        "Rest isn't just something to earn; it's a vital human necessity. How can you be especially kind to your body this evening?";
    }

    return {
      reply,
      disclaimer: SOL_SAFETY_NOTICE,
      crisisDetected: false,
    };
  }

  private deterministicJournalReflection(
    title: string,
    content: string,
    type: SolReflectionType,
    targetLanguage?: string
  ): Omit<JournalAIReflectionDto, 'id' | 'journalEntryId' | 'createdAt'> {
    let output = '';
    let thoughtMapNodes: Array<{ id: string; label: string; group: string }> | undefined;
    let thoughtMapEdges: Array<{ from: string; to: string; relationship: string }> | undefined;

    switch (type) {
      case 'SUMMARIZE':
        output = `• **Core Emotional Theme:** Exploring personal thoughts on "${title || 'this chapter'}".\n• **Expressed Context:** Processing daily experiences and underlying emotions with clarity.\n• **Forward Glance:** Moving through the experience with awareness and gentle self-compassion.`;
        break;
      case 'ORGANIZE_THOUGHTS':
        output = `### 1. What You Experienced\nProcessing recent moments in your life with vulnerability.\n\n### 2. How It Felt\nAcknowledging that every emotion contains valuable information about what you value.\n\n### 3. What You Need\nSpace, patience, and honoring your own pace without pressure.`;
        break;
      case 'KEY_IDEAS':
        output = `1. **Self-Awareness:** Pausing to reflect allows you to notice patterns rather than merely react.\n2. **Resilience:** Expressing your inner dialogue in writing is itself an act of resilience.\n3. **Values:** Your reflections reveal a genuine commitment to emotional truth.`;
        break;
      case 'ACTION_STEPS':
        output = `1. **Hydrate & Unwind:** Take three slow deep breaths and drink a glass of water.\n2. **Gentle Boundary:** Release any obligation to resolve everything immediately today.\n3. **Rest:** Allow your mind to step away from analysis and simply rest.`;
        break;
      case 'GENTLE_REFLECTION':
        output = `Reading through "${title || 'your reflection'}", what stands out is your sincerity. Life often carries more complexity than we expect, yet writing it down gives shape to what previously felt amorphous.\n\nBe gentle with yourself as you navigate this. You don't need all the answers today; taking note of where you are right now is already enough.`;
        break;
      case 'TRANSLATE':
        output = `[Translation to ${targetLang || 'Spanish'}]:\n"${title}"\n${content}`;
        break;
      case 'THOUGHT_MAP': {
        const map = this.generateDeterministicThoughtMap(title, content);
        thoughtMapNodes = map.nodes;
        thoughtMapEdges = map.edges;
        output = `Generated interactive thought map mapping ${map.nodes.length} connected concept nodes and relationships.`;
        break;
      }
    }

    return {
      reflectionType: type,
      output,
      thoughtMapNodes,
      thoughtMapEdges,
      disclaimer: SOL_SAFETY_NOTICE,
    };
  }

  private generateDeterministicThoughtMap(
    title: string,
    content: string
  ): {
    nodes: Array<{ id: string; label: string; group: string }>;
    edges: Array<{ from: string; to: string; relationship: string }>;
  } {
    const centerTitle = title || 'Core Reflection';
    const words = content.split(/\s+/).filter((w) => w.length > 4);
    const sampleThemes = Array.from(new Set(words)).slice(0, 4);

    const nodes = [
      { id: 'center', label: centerTitle, group: 'core' },
      { id: 'theme-1', label: sampleThemes[0] || 'Present Focus', group: 'theme' },
      { id: 'theme-2', label: sampleThemes[1] || 'Emotional Tone', group: 'theme' },
      { id: 'theme-3', label: sampleThemes[2] || 'Aspirations', group: 'theme' },
      { id: 'insight-1', label: 'Self-Compassion', group: 'insight' },
      { id: 'insight-2', label: 'Forward Action', group: 'insight' },
    ];

    const edges = [
      { from: 'center', to: 'theme-1', relationship: 'expresses' },
      { from: 'center', to: 'theme-2', relationship: 'resonates with' },
      { from: 'center', to: 'theme-3', relationship: 'aspires toward' },
      { from: 'theme-1', to: 'insight-1', relationship: 'deepens' },
      { from: 'theme-3', to: 'insight-2', relationship: 'inspires' },
    ];

    return { nodes, edges };
  }
}
