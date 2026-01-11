export interface Example {
  id: string;
  category: 'romantic' | 'family' | 'travel' | 'celebrations';
  thumbnailUrl: string;
  demoUrl: string;
}

// English examples
export const examplesEN: Example[] = [
  {
    id: 'romantic1',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-anniversary-en.jpg',
    demoUrl: 'https://joyo.ch/en/play/6bf65f94f8ba12cc', // Proposal
  },
  {
    id: 'romantic2',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-proposal-en.jpg',
    demoUrl: 'https://joyo.ch/en/play/3d39d1ace0035a65', // Honeymoon
  },
  {
    id: 'family1',
    category: 'family',
    thumbnailUrl: '/examples/family-pregnancy-en.jpg',
    demoUrl: 'https://joyo.ch/en/play/b987566f54862b52', // Family
  },
  {
    id: 'family2',
    category: 'family',
    thumbnailUrl: '/examples/family-home-en.jpg',
    demoUrl: 'https://joyo.ch/en/play/bdd6c5de89ee60dc', // New home
  },
  {
    id: 'travel1',
    category: 'travel',
    thumbnailUrl: '/examples/travel-paris-en.jpg',
    demoUrl: 'https://joyo.ch/en/play/65c2a32d88c2de41', // City trip
  },
  {
    id: 'travel2',
    category: 'travel',
    thumbnailUrl: '/examples/travel-honeymoon-en.jpg',
    demoUrl: 'https://joyo.ch/en/play/6de2456fe5a31ce4', // Birthday
  },
];

// German examples (different screenshots with German text)
export const examplesDE: Example[] = [
  {
    id: 'romantic1',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-anniversary-de.jpg',
    demoUrl: 'https://joyo.ch/de/play/eafeea4ecdb611c5', // Proposal
  },
  {
    id: 'romantic2',
    category: 'romantic',
    thumbnailUrl: '/examples/romantic-proposal-de.jpg',
    demoUrl: 'https://joyo.ch/de/play/e7f52682d43a7f13', // Honeymoon
  },
  {
    id: 'family1',
    category: 'family',
    thumbnailUrl: '/examples/family-pregnancy-de.jpg',
    demoUrl: 'https://joyo.ch/de/play/4cec9540abc30fb7', // Family
  },
  {
    id: 'family2',
    category: 'family',
    thumbnailUrl: '/examples/family-home-de.jpg',
    demoUrl: 'https://joyo.ch/de/play/a330025d2385e943', // New home
  },
  {
    id: 'travel1',
    category: 'travel',
    thumbnailUrl: '/examples/travel-paris-de.jpg',
    demoUrl: 'https://joyo.ch/de/play/b2b9b5f45cd0d469', // City trip
  },
  {
    id: 'travel2',
    category: 'travel',
    thumbnailUrl: '/examples/travel-honeymoon-de.jpg',
    demoUrl: 'https://joyo.ch/de/play/1f15fece19849ee7', // Birthday
  },
];

export function getExamplesByLocale(locale: string): Example[] {
  return locale === 'de' ? examplesDE : examplesEN;
}
