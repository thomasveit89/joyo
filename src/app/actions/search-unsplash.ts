'use server';

import { createApi } from 'unsplash-js';
import { ImageData } from '@/types/assets';

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
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

    const result = await unsplash.search.getPhotos({
      query: query.trim(),
      page,
      perPage,
      orientation,
    });

    if (result.type === 'error') {
      console.error('Unsplash search error:', result.errors);
      return { success: false, error: 'Failed to search Unsplash' };
    }

    const photos = result.response.results.map((photo) => ({
      id: photo.id,
      urls: photo.urls,
      alt_description: photo.alt_description,
      description: photo.description,
      user: {
        name: photo.user.name,
        username: photo.user.username,
      },
      links: {
        download_location: photo.links.download_location,
      },
      width: photo.width,
      height: photo.height,
    }));

    return {
      success: true,
      photos,
      total: result.response.total,
    };
  } catch (error) {
    console.error('Unexpected error in searchUnsplashAction:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function selectUnsplashImageAction(photo: UnsplashPhoto): Promise<
  { success: true; imageData: ImageData } | { success: false; error: string }
> {
  try {
    // Trigger download tracking (required by Unsplash API)
    try {
      await unsplash.photos.trackDownload({
        downloadLocation: photo.links.download_location,
      });
    } catch (error) {
      console.warn('Failed to track Unsplash download:', error);
      // Continue anyway - tracking is a courtesy, not critical
    }

    const imageData: ImageData = {
      url: photo.urls.regular,
      alt: photo.alt_description || photo.description || 'Photo from Unsplash',
      attribution: `Photo by ${photo.user.name} on Unsplash`,
      source: 'unsplash',
    };

    return { success: true, imageData };
  } catch (error) {
    console.error('Unexpected error in selectUnsplashImageAction:', error);
    return { success: false, error: 'Failed to select image' };
  }
}
