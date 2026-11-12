import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { GalleryMedia } from '../types';
import { getAssetUrl, CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { Image as ImageIcon, X, ZoomIn, PlayCircle } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { language } = useLanguage();
  const { gallery } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);

  const uniqueCategories = Array.from(new Set(gallery.map((g) => g.category)));
  const categories = ['all', ...uniqueCategories];

  const filtered = gallery.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 w-full">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>{language === 'ur' ? 'بصری ریکارڈ' : 'Photo & Video Archive'}</span>
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
            {language === 'ur'
              ? 'تصویری و ویڈیو گیلری'
              : 'Constituency Photo & Video Gallery'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#123B28] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#F7F9F7]'
              }`}
            >
              {cat === 'all' ? (language === 'ur' ? 'تمام' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedMedia(item)}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col"
          >
            <div className="h-52 sm:h-56 w-full bg-slate-100 overflow-hidden relative">
              {item.mediaType === 'video' ? (
                <div className="w-full h-full bg-[#123B28] flex flex-col items-center justify-center text-white p-4 text-center">
                  <PlayCircle className="w-12 h-12 text-[#C9A227] mb-2" />
                  <span className="text-xs font-semibold line-clamp-2">
                    {language === 'ur' ? item.titleUrdu : item.title}
                  </span>
                </div>
              ) : (
                <img
                  src={getAssetUrl(item.mediaUrl)}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
                  }}
                />
              )}

              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-white/95 text-[#123B28] p-2.5 rounded-full shadow-lg">
                  {item.mediaType === 'video' ? (
                    <PlayCircle className="w-5 h-5" />
                  ) : (
                    <ZoomIn className="w-5 h-5" />
                  )}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-1">
              <div className="text-[11px] font-bold text-[#087A43]">
                {item.category} · <span className="font-mono text-slate-400">{item.date}</span>
              </div>
              <h4 className="font-bold text-xs text-[#123B28] line-clamp-1">
                {language === 'ur' ? item.titleUrdu : item.title}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {language === 'ur' ? item.captionUrdu : item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Photo & Video Lightbox */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 bg-black/60 hover:bg-black/80 text-white w-11 h-11 rounded-xl flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[65vh] w-full bg-slate-950 flex items-center justify-center">
              {selectedMedia.mediaType === 'video' ? (
                selectedMedia.mediaUrl.includes('youtube.com') ||
                selectedMedia.mediaUrl.includes('youtu.be') ? (
                  <iframe
                    src={selectedMedia.mediaUrl}
                    title={selectedMedia.title}
                    className="w-full h-[360px] sm:h-[420px]"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={getAssetUrl(selectedMedia.mediaUrl)}
                    controls
                    className="max-h-[65vh] w-full"
                  />
                )
              ) : (
                <img
                  src={getAssetUrl(selectedMedia.mediaUrl)}
                  alt={selectedMedia.title}
                  className="max-h-[65vh] w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
                  }}
                />
              )}
            </div>

            <div className="p-5 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-[#087A43]">{selectedMedia.category}</span>
                <span className="font-mono tabular-nums">{selectedMedia.date}</span>
              </div>
              <h3 className="font-editorial font-bold text-base text-[#123B28]">
                {language === 'ur' ? selectedMedia.titleUrdu : selectedMedia.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ur' ? selectedMedia.captionUrdu : selectedMedia.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
