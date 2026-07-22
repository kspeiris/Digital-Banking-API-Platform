import React, { useState, useRef } from 'react';
import { Camera, User } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUpload: (file: File) => Promise<void>;
}

export function AvatarUpload({ currentAvatarUrl, onUpload }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPG, JPEG, and PNG formats are supported.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size cannot exceed 5MB.');
      return;
    }

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      setIsUploading(true);
      await onUpload(file);
    } catch (err) {
      console.error(err);
      alert('Failed to upload avatar image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <div className="h-24 w-24 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-center">
          {previewUrl || currentAvatarUrl ? (
            <img
              src={previewUrl || currentAvatarUrl}
              alt="Profile avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-zinc-400" />
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 rounded-full bg-zinc-900 p-2 text-white shadow-md hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Upload profile image"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          className="hidden"
        />
      </div>
      <p className="text-xs text-zinc-500">Allowed formats: PNG, JPG, JPEG. Max size 5MB.</p>
    </div>
  );
}
export default AvatarUpload;
