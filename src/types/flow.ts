import { z } from 'zod';

// Node Types
export type NodeType = 'hero' | 'choice' | 'text-input' | 'reveal' | 'media' | 'end';

// Theme Types
export type Theme = 'playful-pastel' | 'elegant-dark' | 'warm-mediterranean' | 'minimal-zen';

// Base Node Schema
export const BaseNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['hero', 'choice', 'text-input', 'reveal', 'media', 'end']),
  orderIndex: z.number().int().min(0),
});

// Hero Node (Story Screen)
export const HeroNodeContentSchema = z.object({
  headline: z.string().min(1).max(200),
  body: z.string().max(1000).optional(),
  backgroundColor: z.string().optional(), // hex color or 'transparent'
  backgroundImage: z.object({
    url: z.string().url(),
    alt: z.string(),
    attribution: z.string().optional(),
  }).optional(),
});

export const HeroNodeSchema = BaseNodeSchema.extend({
  type: z.literal('hero'),
  content: HeroNodeContentSchema,
});

// Choice Node
export const ChoiceNodeContentSchema = z.object({
  question: z.string().min(1).max(200),
  options: z.array(z.object({
    id: z.string(),
    label: z.string().min(1).max(100),
  })).min(2).max(4),
  allowMultiple: z.boolean().default(false),
});

export const ChoiceNodeSchema = BaseNodeSchema.extend({
  type: z.literal('choice'),
  content: ChoiceNodeContentSchema,
});

// Text Input Node
export const TextInputNodeContentSchema = z.object({
  question: z.string().min(1).max(200),
  placeholder: z.string().max(100).optional(),
  maxLength: z.number().int().min(1).max(500).default(200),
});

export const TextInputNodeSchema = BaseNodeSchema.extend({
  type: z.literal('text-input'),
  content: TextInputNodeContentSchema,
});

// Reveal Node (Big Moment)
export const RevealNodeContentSchema = z.object({
  headline: z.string().min(1).max(200),
  body: z.string().max(1000).optional(),
  cta: z.object({
    label: z.string().min(1).max(50),
    url: z.string().url(),
  }).optional(),
  confetti: z.boolean().default(true),
  backgroundImage: z.object({
    url: z.string().url(),
    alt: z.string(),
    attribution: z.string().optional(),
  }).optional(),
});

export const RevealNodeSchema = BaseNodeSchema.extend({
  type: z.literal('reveal'),
  content: RevealNodeContentSchema,
});

// Media Node
export const MediaNodeContentSchema = z.object({
  image: z.object({
    url: z.string().url(),
    alt: z.string(),
    attribution: z.string().optional(),
  }),
  caption: z.string().max(200).optional(),
});

export const MediaNodeSchema = BaseNodeSchema.extend({
  type: z.literal('media'),
  content: MediaNodeContentSchema,
});

// End Node
export const EndNodeContentSchema = z.object({
  headline: z.string().min(1).max(200),
  body: z.string().max(500).optional(),
  sharePrompt: z.string().max(100).optional(),
});

export const EndNodeSchema = BaseNodeSchema.extend({
  type: z.literal('end'),
  content: EndNodeContentSchema,
});

// Union of all node types
export const NodeSchema = z.discriminatedUnion('type', [
  HeroNodeSchema,
  ChoiceNodeSchema,
  TextInputNodeSchema,
  RevealNodeSchema,
  MediaNodeSchema,
  EndNodeSchema,
]);

export type Node = z.infer<typeof NodeSchema>;
export type HeroNode = z.infer<typeof HeroNodeSchema>;
export type ChoiceNode = z.infer<typeof ChoiceNodeSchema>;
export type TextInputNode = z.infer<typeof TextInputNodeSchema>;
export type RevealNode = z.infer<typeof RevealNodeSchema>;
export type MediaNode = z.infer<typeof MediaNodeSchema>;
export type EndNode = z.infer<typeof EndNodeSchema>;

// Flow Structure (what AI generates)
export const FlowSpecSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  theme: z.enum(['playful-pastel', 'elegant-dark', 'warm-mediterranean', 'minimal-zen']),
  nodes: z.array(NodeSchema).min(1).max(20),
});

export type FlowSpec = z.infer<typeof FlowSpecSchema>;

// Project (database model)
export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  theme: Theme;
  published: boolean;
  shareSlug?: string;
  createdAt: string;
  updatedAt: string;
}

// Session & Answers
export interface SessionAnswer {
  nodeId: string;
  answer: string | string[]; // string for text-input, string[] for choices
  timestamp: string;
}

export interface Session {
  id: string;
  projectId: string;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
  answers: SessionAnswer[];
  metadata: Record<string, unknown>;
}
