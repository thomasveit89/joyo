import { z } from 'zod';

// Image source types
export type ImageSource = 'unsplash' | 'upload' | 'manual';

// Asset metadata from database
export interface AssetMetadata {
  id: string;
  userId: string;
  projectId?: string;
  storagePath: string;
  storageBucket: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  attribution?: string;
  createdAt: string;
}

// Image data structure used in node content
export interface ImageData {
  url: string;
  alt: string;
  attribution?: string;
  attributionUrl?: string; // Link to photo page for Unsplash images
  photographerName?: string; // Photographer name for Unsplash images
  photographerUrl?: string; // Link to photographer profile for Unsplash images
  source?: ImageSource;
  assetId?: string; // Link to assets table for uploads
}

// Validation schemas
export const ImageDataSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  attribution: z.string().optional(),
  attributionUrl: z.string().url().optional(),
  photographerName: z.string().optional(),
  photographerUrl: z.string().url().optional(),
  source: z.enum(['unsplash', 'upload', 'manual']).optional(),
  assetId: z.string().uuid().optional(),
});

export const AssetMetadataSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  storagePath: z.string(),
  storageBucket: z.string(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  altText: z.string().optional(),
  attribution: z.string().optional(),
  createdAt: z.string(),
});

// Upload validation constants
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf', // PDF support for vouchers
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes (increased for PDFs)
export const MAX_IMAGE_DIMENSION = 2000; // Max width or height in pixels
