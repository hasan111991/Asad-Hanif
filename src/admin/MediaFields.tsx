import React, { useRef, useState } from 'react';
import {
  getAssetUrl,
  PORTRAIT_IMAGE_PATH,
  CHICHAWATNI_SCENE_PATH,
  ASSEMBLY_IMAGE_PATH
} from '../utils/assetUrl';
import { Image as ImageIcon, Video, Upload, X, AlertCircle } from 'lucide-react';

interface MediaFieldsProps {
  imageUrl?: string;
  videoUrl?: string;
  onImageChange: (val: string) => void;
  onVideoChange: (val: string) => void;
  imageLabel?: string;
  videoLabel?: string;
}

const IMAGE_PRESETS = [
  { label: 'Chichawatni Civic Scene', path: CHICHAWATNI_SCENE_PATH },
  { label: 'Punjab Assembly', path: ASSEMBLY_IMAGE_PATH },
  { label: 'Representative Portrait', path: PORTRAIT_IMAGE_PATH }
];

async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => reject(new Error('Could not process image file.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

export const MediaFields: React.FC<MediaFieldsProps> = ({
  imageUrl = '',
  videoUrl = '',
  onImageChange,
  onVideoChange,
  imageLabel = 'Image (URL or Upload)',
  videoLabel = 'Video (YouTube / MP4 URL or Small Clip)'
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState('');

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const dataUrl = await compressImageToDataUrl(file);
      if (dataUrl.length > 350000) {
        setUploadError('Image is still too large after compression. Please use a smaller file or URL.');
        return;
      }
      onImageChange(dataUrl);
    } catch {
      setUploadError('Unable to read the selected image.');
    }
    e.target.value = '';
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (file.size > 550 * 1024) {
      setUploadError(
        'Uploaded video files must be under 550 KB for database storage. For longer videos, paste a YouTube or MP4 link.'
      );
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onVideoChange(String(reader.result));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3.5 text-xs">
      <div className="font-bold text-[#123B28] uppercase tracking-wider text-[10px]">
        Media Attachments (Image & Video)
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 flex items-center gap-2 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Field */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="font-bold text-slate-700 inline-flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#087A43]" />
            <span>{imageLabel}</span>
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onImageChange(e.target.value);
              }}
              className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-600"
              aria-label="Choose built-in image"
            >
              <option value="">Presets...</option>
              {IMAGE_PRESETS.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.label}
                </option>
              ))}
            </select>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-[#123B28] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-[#087A43]" />
              <span>Upload</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageChange(e.target.value)}
            placeholder="./assets/images/chichawatni_scene_1794225848060.jpg or https://..."
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px] min-h-[38px]"
          />
          {imageUrl && (
            <button
              type="button"
              onClick={() => onImageChange('')}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Clear image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {imageUrl && (
          <div className="h-24 w-40 rounded-lg overflow-hidden border border-slate-200 bg-white">
            <img
              src={getAssetUrl(imageUrl)}
              alt="Selected preview"
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
      </div>

      {/* Video Field */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="font-bold text-slate-700 inline-flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#087A43]" />
            <span>{videoLabel}</span>
          </label>
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-[#123B28] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-[#087A43]" />
              <span>Upload Clip</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => onVideoChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://.../video.mp4"
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px] min-h-[38px]"
          />
          {videoUrl && (
            <button
              type="button"
              onClick={() => onVideoChange('')}
              className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Clear video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
