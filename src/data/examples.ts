export interface Example {
  id: string;
  category: 'romantic' | 'family' | 'travel' | 'celebrations';
  thumbnailUrl: string;
  demoUrl: string;
}

// English examples (placeholders - user will provide real demo URLs)
export const examplesEN: Example[] = [
  {
    id: 'romantic1',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-anniversary-en.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'romantic2',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-proposal-en.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'family1',
    category: 'family',
    thumbnailUrl: '/examples/family-pregnancy-en.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'family2',
    category: 'family',
    thumbnailUrl: '/examples/family-home-en.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'travel1',
    category: 'travel',
    thumbnailUrl: '/examples/travel-paris-en.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'travel2',
    category: 'travel',
    thumbnailUrl: '/examples/travel-honeymoon-en.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
];

// German examples (different screenshots with German text)
export const examplesDE: Example[] = [
  {
    id: 'romantic1',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-anniversary-de.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'romantic2',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-proposal-de.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'family1',
    category: 'family',
    thumbnailUrl: '/examples/family-pregnancy-de.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'family2',
    category: 'family',
    thumbnailUrl: '/examples/family-home-de.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'travel1',
    category: 'travel',
    thumbnailUrl: '/examples/travel-paris-de.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
  {
    id: 'travel2',
    category: 'travel',
    thumbnailUrl: '/examples/travel-honeymoon-de.jpg',
    demoUrl: 'https://example.com/placeholder',
  },
];

export function getExamplesByLocale(locale: string): Example[] {
  return locale === 'de' ? examplesDE : examplesEN;
}
