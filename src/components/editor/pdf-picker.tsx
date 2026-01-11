'use client';

import { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageData } from '@/types/assets';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PdfPickerProps {
  onSelect: (pdfData: ImageData) => void;
  value?: ImageData;
  projectId: string;
}

const ALLOWED_PDF_TYPE = 'application/pdf';
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export function PdfPicker({ onSelect, value, projectId }: PdfPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(value?.alt || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== ALLOWED_PDF_TYPE) {
      return 'Invalid file type. Only PDF files are allowed.';
    }
    if (file.size > MAX_PDF_SIZE) {
      return `File size must be less than ${MAX_PDF_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setFileName(file.name);

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('altText', file.name);

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
        const pdfData: ImageData = {
          url: result.publicUrl,
          alt: file.name,
          source: 'upload',
          assetId: result.asset.id,
        };
        onSelect(pdfData);
        toast.success('PDF uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload PDF');
        setFileName(null);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF');
      setFileName(null);
    }
  }, [projectId, onSelect]);

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
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        {fileName ? (
          <div className="space-y-4">
            <div className="w-full max-w-md mx-auto p-6 border-2 border-primary/50 rounded-lg bg-primary/5">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 mx-auto text-primary" />
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">PDF ready</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                onSelect({ url: '', alt: '', source: 'upload' });
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
              Drag and drop a PDF here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {MAX_PDF_SIZE / 1024 / 1024}MB • PDF only
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_PDF_TYPE}
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
    </div>
  );
}
