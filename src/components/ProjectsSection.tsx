import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Project, ProjectCategory, ProjectStatus } from '../types';
import {
  HardHat,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { getAssetUrl } from '../utils/assetUrl';

export const ProjectsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const { projects } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  const categories = [
    'all',
    'Roads and Infrastructure',
    'Healthcare',
    'Clean Drinking Water',
    'Public Facilities',
    'Education'
  ];

  const statuses = ['all', 'Proposed', 'Approved', 'In Progress', 'Completed'];

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 py-8 sm:py-12 w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <HardHat className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'حلقہ کی تعمیر و ترقی' : 'Constituency Development Tracker'}</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {language === 'ur' ? 'ترقیاتی منصوبے و بنیادی انفراسٹرکچر' : 'Development Schemes & Public Works'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {language === 'ur'
              ? 'پی پی 203 کے تمام منظور شدہ، زیرِ تکمیل اور مکمل شدہ ترقیاتی کاموں کی شفاف مانیٹرنگ اور تفصیلی رپورٹ۔'
              : 'Verified monitoring of provincial development initiatives, road carpeting, clean water filtration, and healthcare infrastructure.'}
          </p>
        </div>

        {/* Filter Controls (Responsive on small mobile) */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 shadow-xs focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
          >
            <option value="all">{language === 'ur' ? 'تمام شعبہ جات' : 'All Categories'}</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 shadow-xs focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
          >
            <option value="all">{language === 'ur' ? 'تمام صورتحال' : 'All Statuses'}</option>
            {statuses.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid (1-col on mobile, 2-col on tablet, 3-col on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setActiveProjectModal(project)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer group active:scale-[0.99]"
          >
            {/* Project Image */}
            <div className="h-44 sm:h-48 w-full bg-slate-100 relative overflow-hidden">
              <img
                src={getAssetUrl(project.imageUrl || 'images/chichawatni_scene_1794225848060.jpg')}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl('images/chichawatni_scene_1794225848060.jpg');
                }}
              />
              <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                  project.status === 'Completed'
                    ? 'bg-emerald-600 text-white'
                    : project.status === 'In Progress'
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {project.budget}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{project.unionCouncil} — {project.location}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition line-clamp-2">
                  {language === 'ur' ? project.titleUrdu : project.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {language === 'ur' ? project.descriptionUrdu : project.description}
                </p>
              </div>

              {/* Progress and Footer */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-medium text-slate-600">
                    <span>{language === 'ur' ? 'کام کی پیش رفت:' : 'Progress:'}</span>
                    <span className="font-mono font-bold text-slate-800">{project.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        project.progressPercent === 100
                          ? 'bg-emerald-600'
                          : project.progressPercent > 50
                          ? 'bg-[#087A43]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${project.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{project.department}</span>
                  <span className="font-semibold text-emerald-700 min-h-[44px] flex items-center">
                    {t('viewDetails')} &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal (Mobile-Friendly) */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveProjectModal(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-1.5 pr-8 rtl:pr-0 rtl:pl-8">
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {activeProjectModal.category}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug">
                {language === 'ur' ? activeProjectModal.titleUrdu : activeProjectModal.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{activeProjectModal.unionCouncil} — {activeProjectModal.location}</span>
              </p>
            </div>

            <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={getAssetUrl(activeProjectModal.imageUrl || 'images/chichawatni_scene_1794225848060.jpg')}
                alt={activeProjectModal.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl('images/chichawatni_scene_1794225848060.jpg');
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Budget:</span>
                <span className="font-mono font-bold text-slate-800">{activeProjectModal.budget}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Status:</span>
                <span className="font-semibold text-emerald-800">{activeProjectModal.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Start Date:</span>
                <span className="font-mono text-slate-700">{activeProjectModal.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Completion:</span>
                <span className="font-mono text-slate-700">{activeProjectModal.completionDate}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Project Scope & Details:
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {language === 'ur' ? activeProjectModal.descriptionUrdu : activeProjectModal.description}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="truncate">Executing Agency: <strong>{activeProjectModal.department}</strong></span>
              <button
                onClick={() => setActiveProjectModal(null)}
                className="min-h-[44px] bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2 rounded-xl text-xs flex items-center justify-center"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
