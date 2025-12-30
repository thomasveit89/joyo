import { createApi } from 'unsplash-js';
import { FlowSpec } from '@/types/flow';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

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
    const result = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: 1,
      orientation,
    });

    if (result.type === 'error') {
      console.error('Unsplash search error:', result.errors);
      return null;
    }

    const photo = result.response.results[0];
    if (!photo) {
      console.warn(`No Unsplash results for query: "${query}"`);
      return null;
    }

    // Trigger download endpoint (required by Unsplash API guidelines)
    try {
      await unsplash.photos.trackDownload({
        downloadLocation: photo.links.download_location,
      });
    } catch (error) {
      console.warn('Failed to track Unsplash download:', error);
    }

    return {
      url: photo.urls.regular,
      alt: photo.alt_description || photo.description || query,
      attribution: `Photo by ${photo.user.name} on Unsplash`,
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
