import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { NewsItem, NewsCategory } from '../types';
import { getAssetUrl, CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { MediaPreviewBlock } from './MediaPreviewBlock';
import { Newspaper, Calendar, ArrowRight, PlayCircle, X } from 'lucide-react';

export const NewsSection: React.FC = () => {
  const { language } = useLanguage();
  const { news } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const categories: Array<'all' | NewsCategory> = [
    'all',
    'Latest Updates',
    'Press Releases',
    'Assembly News',
    'Constituency Visits',
    'Public Darbar'
  ];

  const filtered = news.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );
  const featured = filtered.find((n) => n.isFeatured) || filtered[0] || null;
  const remaining = filtered.filter((n) => !featured || n.id !== featured.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
            <Newspaper className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>{language === 'ur' ? 'پریس و میڈیا ڈیسک' : 'News & Media Center'}</span>
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
            {language === 'ur'
              ? 'تازہ ترین خبریں، سرگرمیاں و عوامی رابطے'
              : 'Constituency News & Press Statements'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#123B28] text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#F7F9F7]'
              }`}
            >
              {cat === 'all' ? (language === 'ur' ? 'تمام' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Spotlight */}
      {featured && (
        <article
          onClick={() => setSelectedArticle(featured)}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-5 h-56 lg:h-auto bg-slate-100 overflow-hidden">
            <img
              src={getAssetUrl(featured.imageUrl || CHICHAWATNI_SCENE_PATH)}
              alt={featured.title}
              loading="lazy"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
              }}
            />
          </div>
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#087A43] flex flex-wrap items-center gap-1.5">
                <span>{language === 'ur' ? 'نمایاں خبر' : 'Featured Release'}</span>
                <span>·</span>
                <span>{featured.category}</span>
                <span>·</span>
                <span className="font-mono text-slate-500 tabular-nums">{featured.date}</span>
                {featured.videoUrl && featured.videoUrl.trim() && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-[#123B28]">
                      <PlayCircle className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>{language === 'ur' ? 'ویڈیو' : 'Video'}</span>
                    </span>
                  </>
                )}
              </div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28] leading-snug">
                {language === 'ur' ? featured.titleUrdu : featured.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'ur' ? featured.summaryUrdu : featured.summary}
              </p>
            </div>
            <div className="text-xs font-bold text-[#087A43] inline-flex items-center gap-1.5">
              <span>{language === 'ur' ? 'مکمل بیان پڑھیں' : 'Read Full Statement'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </div>
          </div>
        </article>
      )}

      {/* Article Cards */}
      {remaining.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {remaining.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedArticle(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="h-44 sm:h-48 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={getAssetUrl(item.imageUrl || CHICHAWATNI_SCENE_PATH)}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
                    }}
                  />
                  {item.videoUrl && item.videoUrl.trim() && (
                    <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-[#123B28]/90 text-[#C9A227] text-[10px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1 shadow-xs">
                      <PlayCircle className="w-3 h-3" />
                      <span>{language === 'ur' ? 'ویڈیو' : 'Video'}</span>
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <div className="text-xs text-slate-500 font-medium flex items-center justify-between gap-2">
                    <span className="font-bold text-[#087A43]">{item.category}</span>
                    <span className="font-mono tabular-nums inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#123B28] text-sm sm:text-base leading-snug group-hover:text-[#087A43] transition line-clamp-2">
                    {language === 'ur' ? item.titleUrdu : item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {language === 'ur' ? item.summaryUrdu : item.summary}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#087A43]">
                <span>{language === 'ur' ? 'تفصیل پڑھیں' : 'Read Release'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-10 rtl:pr-0 rtl:pl-10">
              <div className="text-xs font-bold text-[#087A43]">
                {selectedArticle.category} ·{' '}
                <span className="font-mono text-slate-500 tabular-nums">
                  {selectedArticle.date}
                </span>
              </div>
              <h3 className="font-editorial text-lg sm:text-2xl font-bold text-[#123B28] leading-snug">
                {language === 'ur' ? selectedArticle.titleUrdu : selectedArticle.title}
              </h3>
            </div>

            <MediaPreviewBlock
              imageUrl={selectedArticle.imageUrl || CHICHAWATNI_SCENE_PATH}
              videoUrl={selectedArticle.videoUrl}
              title={selectedArticle.title}
              fallbackImage={CHICHAWATNI_SCENE_PATH}
              heightClass="h-52 sm:h-72"
              objectPositionClass="object-cover object-top"
            />

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p className="font-semibold text-[#123B28] bg-[#F7F9F7] p-4 rounded-xl border border-slate-200">
                {language === 'ur' ? selectedArticle.summaryUrdu : selectedArticle.summary}
              </p>
              <p>{language === 'ur' ? selectedArticle.contentUrdu : selectedArticle.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="min-h-[44px] bg-[#123B28] text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-[#087A43] transition cursor-pointer"
              >
                {language === 'ur' ? 'بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
