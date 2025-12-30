'use client';

import { useState, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageData, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/types/assets';
// import { uploadImageAction } from '@/app/actions/upload-image'; // Using API route instead
import { searchUnsplashAction, selectUnsplashImageAction, type UnsplashPhoto } from '@/app/actions/search-unsplash';
import { Upload, Search, Link as LinkIcon, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImagePickerProps {
  onSelect: (imageData: ImageData) => void;
  defaultTab?: 'unsplash' | 'upload' | 'url';
  value?: ImageData;
  projectId: string;
}

export function ImagePicker({ onSelect, defaultTab = 'unsplash', value, projectId }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'unsplash' | 'upload' | 'url')} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="unsplash" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Unsplash
        </TabsTrigger>
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </TabsTrigger>
        <TabsTrigger value="url" className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          URL
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unsplash">
        <UnsplashTab onSelect={onSelect} value={value} />
      </TabsContent>

      <TabsContent value="upload">
        <UploadTab onSelect={onSelect} projectId={projectId} value={value} />
      </TabsContent>

      <TabsContent value="url">
        <UrlTab onSelect={onSelect} value={value} />
      </TabsContent>
    </Tabs>
  );
}

// Unsplash Search Tab
function UnsplashTab({ onSelect, value }: { onSelect: (img: ImageData) => void; value?: ImageData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(
    value?.source === 'unsplash' ? value.url : null
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    const result = await searchUnsplashAction(searchQuery, 1, 12);
    setIsLoading(false);

    if (result.success) {
      setPhotos(result.photos);
      if (result.photos.length === 0) {
        toast.info('No results found. Try a different search term.');
      }
    } else {
      toast.error(result.error || 'Failed to search Unsplash');
    }
  };

  const handleSelectPhoto = async (photo: UnsplashPhoto) => {
    const result = await selectUnsplashImageAction(photo);
    if (result.success) {
      setSelectedPhotoId(photo.id);
      onSelect(result.imageData);
      toast.success('Image selected from Unsplash');
    } else {
      toast.error(result.error || 'Failed to select image');
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for images..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => handleSelectPhoto(photo)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:scale-105 ${
                selectedPhotoId === photo.id ? 'border-primary ring-2 ring-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={photo.urls.small}
                alt={photo.alt_description || 'Unsplash photo'}
                fill
                className="object-cover"
              />
              {selectedPhotoId === photo.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <Check className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white truncate">{photo.user.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoading && photos.length === 0 && searchQuery && (
        <p className="text-center text-muted-foreground py-8">
          No results found. Try a different search term.
        </p>
      )}

      {!searchQuery && photos.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Search for images on Unsplash
        </p>
      )}
    </div>
  );
}

// Upload Tab
function UploadTab({ onSelect, projectId, value }: { onSelect: (img: ImageData) => void; projectId: string; value?: ImageData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value?.url || null);
  const [altText, setAltText] = useState(value?.alt || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress (since we don't have real upload progress)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('altText', altText || file.name);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);

      const result = await response.json();

      if (response.ok && result.success) {
        const imageData: ImageData = {
          url: result.publicUrl,
          alt: result.asset.altText || file.name,
          source: 'upload',
          assetId: result.asset.id,
        };
        onSelect(imageData);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload image');
        setPreview(null);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreview(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4 py-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video max-w-md mx-auto">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain rounded-md"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                setAltText('');
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {MAX_FILE_SIZE / 1024 / 1024}MB • JPEG, PNG, WebP, GIF
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {preview && !isUploading && (
        <div className="space-y-2">
          <Label htmlFor="alt-text">Alt Text (optional)</Label>
          <Input
            id="alt-text"
            type="text"
            placeholder="Describe the image..."
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

// Manual URL Tab
function UrlTab({ onSelect, value }: { onSelect: (img: ImageData) => void; value?: ImageData }) {
  const [url, setUrl] = useState(value?.source === 'manual' ? value.url : '');
  const [altText, setAltText] = useState(value?.alt || '');
  const [preview, setPreview] = useState<string | null>(value?.url || null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Invalid URL format');
      return;
    }

    setIsValidating(true);
    setPreview(url);

    // Set a timeout to simulate validation
    setTimeout(() => {
      setIsValidating(false);
    }, 500);
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!altText.trim()) {
      toast.error('Please enter alt text');
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error('Invalid URL format');
      return;
    }

    const imageData: ImageData = {
      url,
      alt: altText,
      source: 'manual',
    };

    onSelect(imageData);
    toast.success('Image URL added');
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="image-url">Image URL</Label>
        <div className="flex gap-2">
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleValidate();
              }
            }}
          />
          <Button onClick={handleValidate} disabled={isValidating || !url.trim()}>
            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Preview'}
          </Button>
        </div>
      </div>

      {preview && (
        <div className="space-y-4">
          <div className="relative w-full aspect-video max-w-md mx-auto border rounded-md overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
              onError={() => {
                toast.error('Failed to load image. Check the URL.');
                setPreview(null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url-alt-text">Alt Text</Label>
            <Input
              id="url-alt-text"
              type="text"
              placeholder="Describe the image..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={!altText.trim()}>
            Use This Image
          </Button>
        </div>
      )}
    </div>
  );
}
