import React, { useState } from 'react';
import { getAssetUrl, CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { Image as ImageIcon, PlayCircle } from 'lucide-react';

interface MediaPreviewBlockProps {
  imageUrl?: string;
  videoUrl?: string;
  title: string;
  fallbackImage?: string;
  heightClass?: string;
  objectPositionClass?: string;
}

export function getVideoEmbedInfo(rawUrl?: string): {
  kind: 'iframe' | 'video' | null;
  src: string;
} {
  const url = rawUrl?.trim();
  if (!url) return { kind: null, src: '' };

  // YouTube standard, short, or live links
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (ytMatch?.[1]) {
    return {
      kind: 'iframe',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
    };
  }

  // Vimeo links
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch?.[1]) {
    return {
      kind: 'iframe',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Direct MP4 / WebM / OGG / data:video / local path
  return {
    kind: 'video',
    src: getAssetUrl(url)
  };
}

export const MediaPreviewBlock: React.FC<MediaPreviewBlockProps> = ({
  imageUrl,
  videoUrl,
  title,
  fallbackImage = CHICHAWATNI_SCENE_PATH,
  heightClass = 'h-52 sm:h-64',
  objectPositionClass = 'object-cover'
}) => {
  const hasImage = Boolean(imageUrl && imageUrl.trim());
  const videoInfo = getVideoEmbedInfo(videoUrl);
  const hasVideo = Boolean(videoInfo.kind);

  const [activeTab, setActiveTab] = useState<'image' | 'video'>(
    hasImage ? 'image' : hasVideo ? 'video' : 'image'
  );

  if (!hasImage && !hasVideo) {
    return null;
  }

  const effectiveTab =
    activeTab === 'video' && hasVideo
      ? 'video'
      : hasImage
        ? 'image'
        : hasVideo
          ? 'video'
          : 'image';

  return (
    <div className="space-y-2.5 w-full">
      {hasImage && hasVideo && (
        <div className="inline-flex items-center gap-1 p-1 bg-[#F7F9F7] border border-slate-200 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
              effectiveTab === 'image'
                ? 'bg-[#123B28] text-white'
                : 'text-slate-600 hover:text-[#123B28]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
              effectiveTab === 'video'
                ? 'bg-[#123B28] text-white'
                : 'text-slate-600 hover:text-[#123B28]'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Video</span>
          </button>
        </div>
      )}

      <div className={`w-full ${heightClass} rounded-xl overflow-hidden bg-slate-950 border border-slate-200`}>
        {effectiveTab === 'video' && hasVideo ? (
          videoInfo.kind === 'iframe' ? (
            <iframe
              src={videoInfo.src}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoInfo.src}
              controls
              playsInline
              poster={hasImage ? getAssetUrl(imageUrl) : undefined}
              className="w-full h-full object-contain bg-black"
            />
          )
        ) : (
          <img
            src={getAssetUrl(imageUrl || fallbackImage)}
            alt={title}
            className={`w-full h-full ${objectPositionClass}`}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = getAssetUrl(fallbackImage);
            }}
          />
        )}
      </div>
    </div>
  );
};
