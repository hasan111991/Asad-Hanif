import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { NoticeCategory, PublicNotice } from '../types';
import {
  Bell,
  Download,
  FileText,
  Search,
  Calendar,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

export const PublicNotices: React.FC = () => {
  const { language, t } = useLanguage();
  const { notices } = useData();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<PublicNotice | null>(null);

  const categories = [
    'all',
    'Public Announcements',
    'Development Updates',
    'Public Meetings',
    'Important Documents'
  ];

  const filtered = notices.filter(n => {
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase()) && !n.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleDownload = (notice: PublicNotice) => {
    const dummyText = `OFFICIAL NOTIFICATION - PP-203 CHICHAWATNI\nRef: ${notice.officialRef || 'PP203-SEC'}\nTitle: ${notice.title}\nDate: ${notice.publishDate}\n\n${notice.description}\n\nIssued by Secretariat Chaudhry Asad Hanif Jutt`;
    const blob = new Blob([dummyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = notice.fileName || 'Notification.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Official Communications</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'ur' ? 'عوامی اعلانات، نوٹیفیکیشنز و سرکلرز' : 'Public Notices & Official Announcements'}
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            {language === 'ur'
              ? 'کھلی کچہری کے شیڈول، کسان سہولت پروگرام، مفت ادویات اور ترقیاتی سکیموں کے مصدقہ نوٹیفیکیشنز۔'
              : 'Official notifications, agricultural advisories, development allocations, and grievance assembly schedules.'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'ur' ? 'نوٹس تلاش کریں...' : 'Search notices...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 w-44 sm:w-56"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 shadow-xs focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">{language === 'ur' ? 'تمام کیٹیگریز' : 'All Categories'}</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-emerald-300 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {notice.officialRef || 'PP-203/NOT'}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {notice.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.publishDate}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {language === 'ur' ? notice.titleUrdu : notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'ur' ? notice.descriptionUrdu : notice.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                onClick={() => handleDownload(notice)}
                className="bg-slate-100 hover:bg-[#087A43] hover:text-white text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2"
                title="Download Official Notice Document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ({notice.fileSize || 'PDF'})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
