import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { NewsItem } from '../types';
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Share2,
  X
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';

export const NewsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const { news } = useData();
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press & Media Desk</span>
        </div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {language === 'ur' ? 'تازہ ترین خبریں، سرگرمیاں و عوامی رابطے' : 'Latest News & Legislative Updates'}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
          {language === 'ur'
            ? 'چوہدری اسد حنیف جٹ کے حلقہ چیچہ وطنی کے دوروں، ترقیاتی کاموں کے معائنے اور پنجاب اسمبلی میں پیش رفت کی تفصیلات۔'
            : 'Press releases, constituency visits, call-attention notices in Punjab Assembly, and public darbar achievements.'}
        </p>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {news.map((item) => (
          <article
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
          >
            <div>
              <div className="h-44 sm:h-48 w-full bg-slate-100 overflow-hidden relative">
                <img
                  src={getAssetUrl(item.imageUrl || 'images/chichawatni_scene_1794225848060.jpg')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAssetUrl('images/chichawatni_scene_1794225848060.jpg');
                  }}
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                  <span className="text-[10px] font-bold bg-[#087A43] text-white px-2 py-0.5 rounded shadow-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.date}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition line-clamp-2">
                  {language === 'ur' ? item.titleUrdu : item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {language === 'ur' ? item.summaryUrdu : item.summary}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 pt-0 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-emerald-700 min-h-[44px]">
              <span>{language === 'ur' ? 'مکمل خبر پڑھیں' : 'Read Full Release'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
            </div>
          </article>
        ))}
      </div>

      {/* Modal for Article Reading (Mobile friendly) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-1 pr-8 rtl:pr-0 rtl:pl-8">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                {selectedArticle.category}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 mt-2 leading-snug">
                {language === 'ur' ? selectedArticle.titleUrdu : selectedArticle.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{selectedArticle.date}</p>
            </div>

            <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={getAssetUrl(selectedArticle.imageUrl || 'images/chichawatni_scene_1794225848060.jpg')}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl('images/chichawatni_scene_1794225848060.jpg');
                }}
              />
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p className="font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {language === 'ur' ? selectedArticle.summaryUrdu : selectedArticle.summary}
              </p>
              <p>
                {language === 'ur' ? selectedArticle.contentUrdu : selectedArticle.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="min-h-[44px] bg-slate-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-slate-900 transition flex items-center justify-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
