import { FlowSpec } from '@/types/flow';

export interface UnsplashImage {
  url: string;
  alt: string;
  attribution: string;
}

export async function searchUnsplashImage(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<UnsplashImage | null> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.error('Unsplash API key not configured');
      return null;
    }

    const params = new URLSearchParams({
      query: query.trim(),
      page: '1',
      per_page: '1',
      orientation,
    });

    const url = `https://api.unsplash.com/search/photos?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 429) {
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'unknown';
        console.error(`Unsplash rate limit exceeded. Resets at ${resetTime}`);
      } else {
        console.error('Unsplash API error:', response.status, response.statusText);
      }
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`No Unsplash results for query: "${query}"`);
      return null;
    }

    const photo = data.results[0];

    // Trigger download endpoint (required by Unsplash API guidelines)
    if (photo.links?.download_location) {
      try {
        await fetch(photo.links.download_location, {
          headers: {
            'Authorization': `Client-ID ${accessKey}`,
          },
          cache: 'no-store',
        });
      } catch (error) {
        console.warn('Failed to track Unsplash download:', error);
      }
    }

    return {
      url: photo.urls.regular,
      alt: photo.alt_description || photo.description || query,
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      attributionUrl: photo.links.html, // Link to photo page
      photographerName: photo.user.name,
      photographerUrl: photo.user.links.html, // Link to photographer profile
    };
  } catch (error) {
    console.error('Unsplash API error:', error);
    return null;
  }
}

// Process a FlowSpec and replace UNSPLASH:query placeholders with actual images
export async function resolveUnsplashImages(flowSpec: FlowSpec): Promise<FlowSpec> {
  const processedNodes = await Promise.all(
    flowSpec.nodes.map(async (node) => {
      // Hero node with background image
      if (node.type === 'hero' && node.content.backgroundImage?.url.startsWith('UNSPLASH:')) {
        const query = node.content.backgroundImage.url.replace('UNSPLASH:', '');
        const image = await searchUnsplashImage(query, 'landscape');
        if (image) {
          return {
            ...node,
            content: {
              ...node.content,
              backgroundImage: image,
            },
          };
        } else {
          // Remove background image if Unsplash fails
          const { backgroundImage: _backgroundImage, ...restContent } = node.content;
          return {
            ...node,
            content: restContent,
          };
        }
      }

      // Media node
      if (node.type === 'media' && node.content.image.url.startsWith('UNSPLASH:')) {
        const query = node.content.image.url.replace('UNSPLASH:', '');
        const image = await searchUnsplashImage(query, 'landscape');
        if (image) {
          return {
            ...node,
            content: {
              ...node.content,
              image,
            },
          };
        } else {
          // Keep placeholder if Unsplash fails (will need to handle this in UI)
          return node;
        }
      }

      // Reveal node with background image
      if (node.type === 'reveal' && node.content.backgroundImage?.url.startsWith('UNSPLASH:')) {
        const query = node.content.backgroundImage.url.replace('UNSPLASH:', '');
        const image = await searchUnsplashImage(query, 'landscape');
        if (image) {
          return {
            ...node,
            content: {
              ...node.content,
              backgroundImage: image,
            },
          };
        } else {
          // Remove background image if Unsplash fails
          const { backgroundImage: _backgroundImage, ...restContent } = node.content;
          return {
            ...node,
            content: restContent,
          };
        }
      }

      return node;
    })
  );

  return {
    ...flowSpec,
    nodes: processedNodes,
  };
}
