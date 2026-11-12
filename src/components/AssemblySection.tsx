import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { AssemblyActivity, AssemblyActivityCategory } from '../types';
import { Landmark, Calendar, FileText, X } from 'lucide-react';

export const AssemblySection: React.FC = () => {
  const { language } = useLanguage();
  const { assemblyActivities } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRecord, setActiveRecord] = useState<AssemblyActivity | null>(null);

  const categories: Array<'all' | AssemblyActivityCategory> = [
    'all',
    'Question Raised',
    'Bill & Resolution',
    'Committee Participation',
    'Parliamentary Activity',
    'Official Announcement'
  ];

  const filtered = assemblyActivities.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8 w-full">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-[#C9A227] shrink-0" />
          <span>
            {language === 'ur'
              ? 'صوبائی اسمبلی پنجاب · ریکارڈ و کارروائی'
              : 'Provincial Assembly of the Punjab'}
          </span>
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
          {language === 'ur'
            ? 'پنجاب اسمبلی میں پارلیمانی سرگرمیاں'
            : 'Punjab Assembly Activities & Legislative Record'}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
          {language === 'ur'
            ? 'حلقہ پی پی 203 چیچہ وطنی کے عوامی مسائل پر اسمبلی میں اٹھائے گئے سوالات، قراردادیں، کمیٹی اجلاس اور سرکاری اعلانات۔'
            : 'Questions raised, legislative resolutions, standing committee participation, and parliamentary interventions advocating for PP-203 Chichawatni.'}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#123B28] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-[#F7F9F7]'
            }`}
          >
            {cat === 'all'
              ? language === 'ur'
                ? 'تمام سرگرمیاں'
                : 'All Activities'
              : cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          {language === 'ur'
            ? 'اس زمرے میں فی الحال کوئی اسمبلی سرگرمی موجود نہیں۔'
            : 'No legislative records found for this category.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <article
              key={item.id}
              onClick={() => setActiveRecord(item)}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-[#087A43] transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-bold text-[#087A43]">
                    {language === 'ur' ? item.categoryUrdu : item.category}
                  </span>
                  <span className="font-mono tabular-nums inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.sessionDate}
                  </span>
                </div>

                <h3 className="font-bold text-[#123B28] text-base sm:text-lg leading-snug">
                  {language === 'ur' ? item.titleUrdu : item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {language === 'ur' ? item.summaryUrdu : item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">
                  {item.referenceNo || 'PAP-PP203'}
                </span>
                <span className="font-bold text-[#087A43]">
                  {item.status || (language === 'ur' ? 'ریکارڈ شدہ' : 'Recorded')}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-8 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveRecord(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-10 rtl:pr-0 rtl:pl-10">
              <div className="text-xs font-bold text-[#087A43]">
                {language === 'ur' ? activeRecord.categoryUrdu : activeRecord.category} ·{' '}
                <span className="font-mono text-slate-500 tabular-nums">
                  {activeRecord.sessionDate}
                </span>
              </div>
              <h3 className="font-editorial text-lg sm:text-2xl font-bold text-[#123B28] leading-snug">
                {language === 'ur' ? activeRecord.titleUrdu : activeRecord.title}
              </h3>
              {activeRecord.referenceNo && (
                <p className="text-xs font-mono text-slate-500">
                  Ref: {activeRecord.referenceNo}
                </p>
              )}
            </div>

            <div className="bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {language === 'ur' ? activeRecord.summaryUrdu : activeRecord.summary}
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2">
              <FileText className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
              <span>
                {language === 'ur'
                  ? 'نوٹ: تمام پارلیمانی کارروائی صوبائی اسمبلی پنجاب کے سرکاری ریکارڈ سے مشروط ہے۔'
                  : 'Note: Parliamentary proceedings and assembly activities are subject to official Provincial Assembly of the Punjab records.'}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRecord(null)}
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
