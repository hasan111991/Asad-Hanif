import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { NoticeCategory, PublicNotice } from '../types';
import { getAssetUrl, CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { MediaPreviewBlock } from './MediaPreviewBlock';
import { Bell, Download, Search, Calendar, FileText, PlayCircle, X, ShieldCheck } from 'lucide-react';

export const PublicNotices: React.FC = () => {
  const { language, t } = useLanguage();
  const { notices } = useData();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<PublicNotice | null>(null);

  const categories: Array<'all' | NoticeCategory> = [
    'all',
    'Public Announcements',
    'Development Updates',
    'Office Notifications',
    'Public Meetings',
    'Important Documents'
  ];

  const publishedNotices = notices.filter((n) => n.isPublished !== false);
  const filtered = publishedNotices.filter((n) => {
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    if (
      searchTerm &&
      !n.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !n.titleUrdu.includes(searchTerm) &&
      !n.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleDownload = (notice: PublicNotice) => {
    const content = [
      'OFFICIAL CONSTITUENCY GAZETTE & CIRCULAR',
      'Office of Chaudhry Asad Hanif Jutt (MPA PP-203 Chichawatni, District Sahiwal)',
      `Reference: ${notice.officialRef || 'PP203/SEC/2026'}`,
      `Category: ${notice.category}`,
      `Date: ${notice.publishDate}`,
      '------------------------------------------------------------',
      notice.title,
      '',
      notice.description,
      '',
      '------------------------------------------------------------',
      notice.titleUrdu,
      notice.descriptionUrdu,
      '',
      'DISCLAIMER: Published by the political representative office of Chaudhry Asad Hanif Jutt (PP-203 Chichawatni). Not a government department or ministry portal.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = notice.fileName || `${notice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 w-full">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>
              {language === 'ur' ? 'سرکاری اعلانات و سرکلرز' : 'Gazette Notices & Circulars'}
            </span>
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
            {language === 'ur'
              ? 'عوامی اعلانات، نوٹیفیکیشنز و دستاویزات'
              : 'Downloadable Public Notices & Circulars'}
          </h2>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'نوٹس تلاش کریں...' : 'Search notices or ref #...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] min-h-[44px]"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#123B28] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#F7F9F7]'
            }`}
          >
            {cat === 'all' ? (language === 'ur' ? 'تمام اعلانات' : 'All Notices') : cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          {language === 'ur'
            ? 'کوئی اعلان یا سرکلر نہیں ملا۔'
            : 'No public notices match your filter.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((notice) => (
            <article
              key={notice.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-[#087A43]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {notice.imageUrl && notice.imageUrl.trim() && (
                <div className="w-full md:w-28 h-32 md:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={getAssetUrl(notice.imageUrl)}
                    alt={notice.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
                    }}
                  />
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-[#087A43]">
                    {notice.officialRef || 'PP-203/SEC'}
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-slate-700">
                    {language === 'ur' ? notice.categoryUrdu : notice.category}
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {notice.publishDate}
                  </span>
                  {notice.videoUrl && notice.videoUrl.trim() && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#123B28]">
                        <PlayCircle className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>{language === 'ur' ? 'ویڈیو' : 'Video'}</span>
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#123B28] leading-snug">
                  {language === 'ur' ? notice.titleUrdu : notice.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'ur' ? notice.descriptionUrdu : notice.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="min-h-[44px] bg-[#F7F9F7] hover:bg-emerald-50 border border-slate-200 text-[#123B28] font-semibold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#087A43]" />
                  <span>{language === 'ur' ? 'مکمل نوٹس پڑھیں' : 'Read Gazette'}</span>
                </button>

                <button
                  onClick={() => handleDownload(notice)}
                  className="min-h-[44px] bg-[#123B28] hover:bg-[#087A43] text-white font-semibold px-4 py-2 rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#C9A227]" />
                  <span>
                    {language === 'ur' ? 'ڈاؤن لوڈ' : 'Download'} ({notice.fileSize || 'TXT'})
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Official Gazette Reader Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-8 space-y-5 shadow-2xl relative border-t-4 border-[#C9A227]">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-4 pr-10 rtl:pr-0 rtl:pl-10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#087A43] block">
                Official Representative Circular · {selectedNotice.officialRef || 'PP203/SEC'}
              </span>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28] leading-snug">
                {language === 'ur' ? selectedNotice.titleUrdu : selectedNotice.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono tabular-nums">
                {selectedNotice.category} · Published {selectedNotice.publishDate}
              </p>
            </div>

            <MediaPreviewBlock
              imageUrl={selectedNotice.imageUrl}
              videoUrl={selectedNotice.videoUrl}
              title={selectedNotice.title}
              fallbackImage={CHICHAWATNI_SCENE_PATH}
              heightClass="h-52 sm:h-72"
            />

            <div className="bg-[#F7F9F7] p-5 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed space-y-3">
              <p>{language === 'ur' ? selectedNotice.descriptionUrdu : selectedNotice.description}</p>
            </div>

            {/* Non-government disclaimer in gazette reader modal */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-[11px] text-slate-700 flex items-start gap-2.5 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
              <span>{t('officialDisclaimerShort')}</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownload(selectedNotice)}
                className="min-h-[44px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#C9A227]" />
                <span>{language === 'ur' ? 'دستاویز ڈاؤن لوڈ کریں' : 'Download Copy'}</span>
              </button>
              <button
                onClick={() => setSelectedNotice(null)}
                className="min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
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
