import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { GalleryMedia } from '../types';
import { Image, X, ZoomIn, Filter } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { language } = useLanguage();
  const { gallery } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryMedia | null>(null);

  const categories = ['all', 'Public Meetings', 'Development', 'Parliamentary', 'Official Portrait'];

  const filtered = gallery.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Image className="w-3.5 h-3.5" />
            <span>Visual Archive</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {language === 'ur' ? 'تصویری گیلری و تصویری ریکارڈ' : 'Media Gallery & Constituency Highlights'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {language === 'ur'
              ? 'عوامی کھلی کچہری، حلقہ دورہ جات، اور ترقیاتی کاموں کی تصویری جھلکیاں۔'
              : 'Photographic records of community meetings, development inspections, and public secretariat proceedings.'}
          </p>
        </div>

        {/* Filter Buttons (Touch Friendly) */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3.5 py-2 min-h-[44px] rounded-xl font-semibold transition flex items-center justify-center active:scale-95 ${
                activeCategory === cat
                  ? 'bg-[#087A43] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
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
            onClick={() => setSelectedPhoto(item)}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col active:scale-[0.99]"
          >
            <div className="h-52 sm:h-56 w-full bg-slate-100 overflow-hidden relative">
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="bg-white/90 text-slate-900 p-2.5 rounded-full shadow-lg">
                  <ZoomIn className="w-5 h-5 text-emerald-700" />
                </span>
              </div>
              <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2">
                <span className="text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-3.5 space-y-1">
              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                {language === 'ur' ? item.titleUrdu : item.title}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {language === 'ur' ? item.captionUrdu : item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 bg-black/60 hover:bg-black/80 text-white w-11 h-11 rounded-xl flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-h-[60vh] sm:max-h-[65vh] w-full bg-slate-950 flex items-center justify-center">
              <img
                src={selectedPhoto.mediaUrl}
                alt={selectedPhoto.title}
                className="max-h-[60vh] sm:max-h-[65vh] w-full object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 bg-white space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-emerald-800">{selectedPhoto.category}</span>
                <span className="font-mono">{selectedPhoto.date}</span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {language === 'ur' ? selectedPhoto.titleUrdu : selectedPhoto.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ur' ? selectedPhoto.captionUrdu : selectedPhoto.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
