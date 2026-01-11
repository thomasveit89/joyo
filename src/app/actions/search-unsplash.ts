'use server';

import { ImageData } from '@/types/assets';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    html?: string; // Unsplash photo page URL for hotlinking
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    link?: string; // User profile URL for attribution
  };
  links: {
    download_location: string;
  };
  width: number;
  height: number;
}

export async function searchUnsplashAction(
  query: string,
  page: number = 1,
  perPage: number = 12,
  orientation?: 'landscape' | 'portrait' | 'squarish'
): Promise<
  { success: true; photos: UnsplashPhoto[]; total: number } | { success: false; error: string }
> {
  try {
    if (!query || query.trim().length === 0) {
      return { success: false, error: 'Search query is required' };
    }

    // Check if API key is configured
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.error('Unsplash API key not configured');
      return { success: false, error: 'Unsplash API key not configured. Please add UNSPLASH_ACCESS_KEY to your environment variables.' };
    }

    console.log('Searching Unsplash for:', query);

    // Build URL with query params
    const params = new URLSearchParams({
      query: query.trim(),
      page: page.toString(),
      per_page: perPage.toString(),
      ...(orientation && { orientation }),
    });

    const url = `https://api.unsplash.com/search/photos?${params.toString()}`;

    // Make direct fetch request with proper headers
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      // Disable Next.js caching for this external API call
      cache: 'no-store',
    });

    console.log('Unsplash response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash API error:', response.status, errorText);

      // Check for rate limiting
      if (response.status === 429) {
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'unknown';
        return {
          success: false,
          error: `Unsplash rate limit exceeded. Resets at ${resetTime}. Free tier allows 50 requests/hour.`
        };
      }

      if (response.status === 401) {
        return { success: false, error: 'Unsplash API authentication failed. Please check your UNSPLASH_ACCESS_KEY.' };
      }

      return { success: false, error: `Unsplash API error: ${response.status} ${response.statusText}` };
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.error('Unexpected Unsplash response structure:', data);
      return { success: false, error: 'Unexpected response from Unsplash API' };
    }

    const photos: UnsplashPhoto[] = data.results.map((photo: any) => ({
      id: photo.id,
      urls: {
        ...photo.urls,
        // Store the original Unsplash page URL for hotlinking
        html: photo.links.html,
      },
      alt_description: photo.alt_description,
      description: photo.description,
      user: {
        name: photo.user.name,
        username: photo.user.username,
        // Store user profile URL for attribution link
        link: photo.user.links.html,
      },
      links: {
        download_location: photo.links.download_location,
      },
      width: photo.width,
      height: photo.height,
    }));

    console.log(`Found ${photos.length} photos from Unsplash`);

    return {
      success: true,
      photos,
      total: data.total,
    };
  } catch (error) {
    console.error('Unexpected error in searchUnsplashAction:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { success: false, error: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function selectUnsplashImageAction(photo: UnsplashPhoto): Promise<
  { success: true; imageData: ImageData } | { success: false; error: string }
> {
  try {
    // Trigger download tracking (required by Unsplash API)
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey && photo.links.download_location) {
      try {
        await fetch(photo.links.download_location, {
          headers: {
            'Authorization': `Client-ID ${accessKey}`,
          },
          cache: 'no-store',
        });
      } catch (error) {
        console.warn('Failed to track Unsplash download:', error);
        // Continue anyway - tracking is a courtesy, not critical
      }
    }

    const imageData: ImageData = {
      url: photo.urls.regular,
      alt: photo.alt_description || photo.description || 'Photo from Unsplash',
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      attributionUrl: photo.urls.html, // Link to photo page
      photographerName: photo.user.name,
      photographerUrl: photo.user.link, // Link to photographer profile
      source: 'unsplash',
    };

    return { success: true, imageData };
  } catch (error) {
    console.error('Unexpected error in selectUnsplashImageAction:', error);
    return { success: false, error: 'Failed to select image' };
  }
}
