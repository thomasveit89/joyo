import { Theme } from '@/types/flow';

export interface ThemeConfig {
  name: string;
  label: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    card: string;
    cardForeground: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    transition: string;
    pageTransition: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  'playful-pastel': {
    name: 'playful-pastel',
    label: 'Playful Pastel',
    description: 'Soft colors, fun and lighthearted',
    colors: {
      // Soft pink-purple gradient feel
      primary: 'hsl(320, 65%, 65%)',           // Vibrant pink
      primaryForeground: 'hsl(0, 0%, 100%)',   // White text on pink
      secondary: 'hsl(250, 60%, 70%)',         // Soft purple
      secondaryForeground: 'hsl(0, 0%, 100%)', // White text on purple
      background: 'hsl(330, 100%, 98%)',       // Very light pink tint
      foreground: 'hsl(330, 30%, 25%)',        // Dark pink-gray for text
      muted: 'hsl(330, 35%, 92%)',             // Light pink-gray
      mutedForeground: 'hsl(330, 15%, 45%)',   // Medium gray with pink tint
      accent: 'hsl(200, 70%, 65%)',            // Sky blue accent
      accentForeground: 'hsl(0, 0%, 100%)',    // White on blue
      card: 'hsl(0, 0%, 100%)',                // Pure white cards
      cardForeground: 'hsl(330, 30%, 20%)',    // Dark text on cards
    },
    fonts: {
      heading: 'var(--font-display)',
      body: 'var(--font-sans)',
    },
    animations: {
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      pageTransition: '500ms cubic-bezier(0.65, 0, 0.35, 1)',
    },
  },
  'elegant-dark': {
    name: 'elegant-dark',
    label: 'Elegant Dark',
    description: 'Sophisticated and mysterious',
    colors: {
      // Rich purple and gold accents on deep background
      primary: 'hsl(280, 60%, 55%)',           // Rich purple
      primaryForeground: 'hsl(0, 0%, 100%)',   // White text
      secondary: 'hsl(45, 80%, 65%)',          // Warm gold
      secondaryForeground: 'hsl(240, 15%, 10%)', // Dark text on gold
      background: 'hsl(240, 15%, 10%)',        // Deep navy-black
      foreground: 'hsl(0, 0%, 95%)',           // Off-white text
      muted: 'hsl(240, 10%, 20%)',             // Slightly lighter dark
      mutedForeground: 'hsl(240, 5%, 65%)',    // Medium gray
      accent: 'hsl(280, 70%, 65%)',            // Bright purple
      accentForeground: 'hsl(0, 0%, 100%)',    // White on bright purple
      card: 'hsl(240, 12%, 15%)',              // Dark card background
      cardForeground: 'hsl(0, 0%, 95%)',       // Light text on cards
    },
    fonts: {
      heading: 'var(--font-serif)',
      body: 'var(--font-sans)',
    },
    animations: {
      transition: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      pageTransition: '600ms cubic-bezier(0.65, 0, 0.35, 1)',
    },
  },
  'warm-mediterranean': {
    name: 'warm-mediterranean',
    label: 'Warm Mediterranean',
    description: 'Earthy tones, inviting and cozy',
    colors: {
      // Terracotta, olive, and ocean blues
      primary: 'hsl(15, 75%, 55%)',            // Terracotta
      primaryForeground: 'hsl(0, 0%, 100%)',   // White text
      secondary: 'hsl(180, 40%, 45%)',         // Teal/turquoise
      secondaryForeground: 'hsl(0, 0%, 100%)', // White text
      background: 'hsl(35, 30%, 95%)',         // Warm cream
      foreground: 'hsl(25, 25%, 20%)',         // Warm dark brown
      muted: 'hsl(35, 25%, 88%)',              // Light warm beige
      mutedForeground: 'hsl(30, 15%, 40%)',    // Medium warm gray
      accent: 'hsl(45, 70%, 60%)',             // Golden yellow
      accentForeground: 'hsl(25, 30%, 15%)',   // Dark text on yellow
      card: 'hsl(0, 0%, 100%)',                // White cards
      cardForeground: 'hsl(25, 25%, 18%)',     // Dark warm text
    },
    fonts: {
      heading: 'var(--font-serif)',
      body: 'var(--font-sans)',
    },
    animations: {
      transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      pageTransition: '500ms cubic-bezier(0.65, 0, 0.35, 1)',
    },
  },
  'minimal-zen': {
    name: 'minimal-zen',
    label: 'Minimal Zen',
    description: 'Clean, focused, and calm',
    colors: {
      // Pure black and white with subtle gray tones
      primary: 'hsl(0, 0%, 10%)',              // Near black
      primaryForeground: 'hsl(0, 0%, 100%)',   // White text
      secondary: 'hsl(0, 0%, 35%)',            // Medium gray
      secondaryForeground: 'hsl(0, 0%, 100%)', // White text
      background: 'hsl(0, 0%, 99%)',           // Off-white
      foreground: 'hsl(0, 0%, 8%)',            // Near black text
      muted: 'hsl(0, 0%, 92%)',                // Light gray
      mutedForeground: 'hsl(0, 0%, 45%)',      // Medium gray
      accent: 'hsl(0, 0%, 20%)',               // Dark gray accent
      accentForeground: 'hsl(0, 0%, 100%)',    // White on dark
      card: 'hsl(0, 0%, 100%)',                // Pure white cards
      cardForeground: 'hsl(0, 0%, 8%)',        // Near black text
    },
    fonts: {
      heading: 'var(--font-sans)',
      body: 'var(--font-sans)',
    },
    animations: {
      transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      pageTransition: '400ms cubic-bezier(0.65, 0, 0.35, 1)',
    },
  },
};
