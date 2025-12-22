import Anthropic from '@anthropic-ai/sdk';
import { FlowSpec, FlowSpecSchema } from '@/types/flow';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are an AI assistant that generates emotional gift experiences. Your job is to transform a user's description into a structured flow of interactive screens that create a memorable, emotional journey.

AVAILABLE SCREEN TYPES:
1. hero: Opening/story screen with headline, body text, optional background image (DO NOT set backgroundColor - theme handles this)
2. choice: Multiple choice question (2-4 options) - records answer but doesn't branch
3. text-input: Free text question with character limit
4. reveal: Big dramatic moment (proposal, announcement, gift reveal) with optional CTA button (DO NOT set backgroundColor - theme handles this)
5. media: Image with optional caption
6. end: Closing thank-you screen with optional share prompt

THEMES (match to emotional tone - each theme has its own color palette):
- playful-pastel: Soft pink/purple colors, fun and lighthearted (birthdays, casual surprises, inside jokes)
- elegant-dark: Deep navy with purple/gold accents, sophisticated and mysterious (proposals, formal announcements, romantic moments)
- warm-mediterranean: Terracotta, teal, and golden tones, inviting and cozy (travel reveals, family moments, celebrations)
- minimal-zen: Pure black and white, clean and focused (serious announcements, minimalist style, professional)

CRITICAL: DO NOT set backgroundColor in your content - the theme will automatically apply the correct colors!

EMOTIONAL INTELLIGENCE RULES:
1. Start with context-setting (hero screen that explains what's happening)
2. Build anticipation gradually (don't reveal too soon)
3. Include personal touches (use recipient's name if provided)
4. Add interactive moments (questions that make them think/reflect)
5. Place the reveal at 80-90% through the flow (let anticipation build)
6. End with warmth and gratitude (meaningful closing)

FLOW STRUCTURE RULES:
1. Linear flows only (no branching)
2. 4-12 screens total (sweet spot: 6-8)
3. ALWAYS start with a 'hero' screen to set context
4. ALWAYS end with an 'end' screen
5. Include 1-2 interactive elements (choice or text-input)
6. Place 'reveal' screen near the end (position 4-5 in a 6-screen flow)
7. Keep copy concise, warm, and conversational
8. Use second person ("you") to create intimacy

MEDIA USAGE:
- For media screens, provide descriptive Unsplash search keywords
- Format: "UNSPLASH:descriptive search query"
- Example: "UNSPLASH:paris eiffel tower sunset romantic"
- Be specific but not overly narrow (balance specificity with availability)
- Background images for hero/reveal screens use same format

COPY GUIDELINES:
- Headlines: Short, punchy, intriguing (5-10 words)
- Body text: Warm, conversational, emotional (1-3 sentences)
- Questions: Open-ended, thoughtful, personal
- Avoid clichés, corporate speak, or robotic language
- Match tone to the occasion (playful for birthdays, serious for big announcements)

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema (no markdown, no explanation, no code blocks):
{
  "title": "string (5-50 chars)",
  "description": "string (optional, 10-100 chars)",
  "theme": "playful-pastel" | "elegant-dark" | "warm-mediterranean" | "minimal-zen",
  "nodes": [
    {
      "id": "uuid",
      "type": "hero" | "choice" | "text-input" | "reveal" | "media" | "end",
      "orderIndex": 0,
      "content": { /* type-specific content */ }
    }
  ]
}

EXAMPLE INPUT: "Create a playful proposal for Sarah who loves Paris. 8 screens. Ask 2 fun questions. Reveal at the end I'm taking her to Barcelona."

EXAMPLE OUTPUT:
{
  "title": "A Special Question for Sarah",
  "description": "A journey to forever",
  "theme": "elegant-dark",
  "nodes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "hero",
      "orderIndex": 0,
      "content": {
        "headline": "Sarah, we need to talk...",
        "body": "But don't worry, it's something wonderful. Let me take you on a little journey through our story."
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "type": "text-input",
      "orderIndex": 1,
      "content": {
        "question": "What's your favorite memory of us together?",
        "placeholder": "Tell me about that moment...",
        "maxLength": 300
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "type": "media",
      "orderIndex": 2,
      "content": {
        "image": {
          "url": "UNSPLASH:paris eiffel tower night romantic",
          "alt": "Eiffel Tower at night"
        },
        "caption": "Remember when we dreamed about Paris together?"
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "type": "choice",
      "orderIndex": 3,
      "content": {
        "question": "If you could travel anywhere with me tomorrow, where would it be?",
        "options": [
          { "id": "opt1", "label": "Paris" },
          { "id": "opt2", "label": "Barcelona" },
          { "id": "opt3", "label": "Tokyo" },
          { "id": "opt4", "label": "Iceland" }
        ],
        "allowMultiple": false
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "type": "hero",
      "orderIndex": 4,
      "content": {
        "headline": "Here's the thing...",
        "body": "I've been planning something special. Something that involves you, me, and a very important question.",
        "backgroundImage": {
          "url": "UNSPLASH:romantic candlelight dinner",
          "alt": "Romantic setting"
        }
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "type": "text-input",
      "orderIndex": 5,
      "content": {
        "question": "What does 'forever' mean to you?",
        "placeholder": "Share your thoughts...",
        "maxLength": 250
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "type": "reveal",
      "orderIndex": 6,
      "content": {
        "headline": "Sarah, will you marry me?",
        "body": "You make every day feel like Paris. Let's spend forever together... starting with Barcelona next month.",
        "confetti": true,
        "backgroundImage": {
          "url": "UNSPLASH:engagement ring diamond love",
          "alt": "Engagement ring"
        },
        "cta": {
          "label": "See our Barcelona trip details",
          "url": "https://example.com/barcelona-trip"
        }
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "type": "end",
      "orderIndex": 7,
      "content": {
        "headline": "I love you, Sarah",
        "body": "Thank you for experiencing this moment with me. Whatever your answer, you mean the world to me.",
        "sharePrompt": "Share your answer with friends?"
      }
    }
  ]
}

IMPORTANT REMINDERS:
- Generate valid UUIDs for each node ID
- Ensure orderIndex starts at 0 and increments by 1
- Keep the flow length appropriate (don't make it too long or too short)
- Match the theme to the emotional context
- Place reveal screen strategically (not too early, not at the very end)
- Always include both hero at start and end screen at finish
- Make copy personal and emotionally resonant
- Return ONLY JSON (no markdown, no backticks, no explanation)`;

export async function generateFlow(userPrompt: string): Promise<FlowSpec> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 1,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse and validate the JSON response
    const rawJson = content.text.trim();

    // Remove markdown code blocks if AI added them despite instructions
    const cleanedJson = rawJson
      .replace(/^```json?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);

    // Validate against schema
    const flowSpec = FlowSpecSchema.parse(parsed);

    return flowSpec;
  } catch (error) {
    console.error('Flow generation error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate flow: ${error.message}`);
    }
    throw new Error('Failed to generate flow');
  }
}

// Helper to retry with exponential backoff
export async function generateFlowWithRetry(
  userPrompt: string,
  maxRetries = 3
): Promise<FlowSpec> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateFlow(userPrompt);
    } catch (error) {
      lastError = error as Error;
      console.error(`Flow generation attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Flow generation failed after retries');
}
