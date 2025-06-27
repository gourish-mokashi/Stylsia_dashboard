import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Loader } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface LogoUploadProps {
  currentLogoUrl?: string;
  brandName?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
}

export default function LogoUpload({ 
  currentLogoUrl, 
  brandName = 'Brand',
  onUploadSuccess,
  onUploadError
}: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size exceeds 5MB limit';
    }
    
    // Check file type
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!acceptedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and SVG files are accepted';
    }
    
    // Check dimensions (for JPG/PNG)
    if (file.type !== 'image/svg+xml') {
      return new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 200 || img.height < 200) {
            resolve('Image dimensions must be at least 200x200 pixels');
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve('Failed to load image for validation');
        img.src = URL.createObjectURL(file);
      });
    }
    
    return null;
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setError(null);
    
    // Validate file
    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Set file and preview
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Upload file to Supabase Storage
  const handleUpload = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `brand-logos/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);
      
      // Call success callback with the URL
      onUploadSuccess(publicUrl);
      
      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload logo');
      onUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  // Clear selected file
  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Brand Logo
      </label>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {/* Current or preview logo */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Logo preview" 
              className="w-full h-full object-cover"
            />
          ) : currentLogoUrl ? (
            <img 
              src={currentLogoUrl} 
              alt={brandName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-primary-600">
              {brandName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          {/* Dropzone */}
          {!previewUrl && (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-5 w-5 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the logo here...'
                  : 'Drag & drop your logo, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG • Max 5MB • Min 200x200px
              </p>
            </div>
          )}
          
          {/* Upload/Clear buttons */}
          {previewUrl && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleUpload}
                loading={uploading}
                disabled={uploading}
                icon={uploading ? Loader : Upload}
              >
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                disabled={uploading}
                icon={X}
              >
                Cancel
              </Button>
            </div>
          )}
          
          {/* Help text */}
          <p className="text-xs text-gray-500">
            Recommended: 400x400px, PNG or JPG format
          </p>
        </div>
      </div>
    </div>
  );
}