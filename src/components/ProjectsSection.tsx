import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Project, ProjectCategory, ProjectStatus } from '../types';
import { getAssetUrl, CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { HardHat, MapPin, X } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const { language, t } = useLanguage();
  const { projects } = useData();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  const categories: Array<'all' | ProjectCategory> = [
    'all',
    'Roads and Infrastructure',
    'Education',
    'Healthcare',
    'Clean Drinking Water',
    'Electricity',
    'Sanitation',
    'Public Facilities'
  ];

  const statuses: Array<'all' | ProjectStatus> = [
    'all',
    'Proposed',
    'Approved',
    'In Progress',
    'Completed'
  ];

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
            <HardHat className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>
              {language === 'ur' ? 'حلقہ کی تعمیر و ترقی' : 'PP-203 Development Portfolio'}
            </span>
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
            {language === 'ur'
              ? 'ترقیاتی منصوبے و بنیادی انفراسٹرکچر'
              : 'Development Projects & Public Works'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            {language === 'ur'
              ? 'سڑکیں، تعلیم، صحت، صاف پانی، بجلی، صفائی اور عوامی سہولیات کے منصوبوں کی پیش رفت۔'
              : 'Transparent tracking across 7 core sectors covering roads, education, healthcare, clean drinking water, electricity, sanitation, and public facilities.'}
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full lg:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by project category"
            className="text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 shadow-xs focus:ring-2 focus:ring-[#087A43] min-h-[44px]"
          >
            <option value="all">{language === 'ur' ? 'تمام شعبہ جات' : 'All Categories'}</option>
            {categories
              .filter((c) => c !== 'all')
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by project status"
            className="text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 shadow-xs focus:ring-2 focus:ring-[#087A43] min-h-[44px]"
          >
            <option value="all">{language === 'ur' ? 'تمام صورتحال' : 'All Statuses'}</option>
            {statuses
              .filter((s) => s !== 'all')
              .map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          {language === 'ur'
            ? 'منتخب فلٹرز کے تحت کوئی ترقیاتی منصوبہ نہیں ملا۔'
            : 'No development projects match the selected category and status filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              onClick={() => setActiveProjectModal(project)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#087A43]/40 transition flex flex-col cursor-pointer group"
            >
              <div className="h-44 sm:h-48 w-full bg-slate-100 relative overflow-hidden">
                <img
                  src={getAssetUrl(project.imageUrl || CHICHAWATNI_SCENE_PATH)}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
                  }}
                />
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs ${
                      project.status === 'Completed'
                        ? 'bg-[#087A43] text-white'
                        : project.status === 'In Progress'
                        ? 'bg-[#C9A227] text-[#123B28]'
                        : project.status === 'Approved'
                        ? 'bg-[#123B28] text-white'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 bg-[#123B28]/90 text-white text-[11px] font-mono font-semibold px-2.5 py-1 rounded tabular-nums">
                  {project.budget}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#087A43] font-semibold mb-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {project.unionCouncil} · {project.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#123B28] text-sm sm:text-base leading-snug group-hover:text-[#087A43] transition line-clamp-2">
                    {language === 'ur' ? project.titleUrdu : project.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {language === 'ur' ? project.descriptionUrdu : project.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 text-slate-600">
                      <span>{t('progress')}</span>
                      <span className="font-mono font-bold text-[#123B28] tabular-nums">
                        {project.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.progressPercent === 100
                            ? 'bg-[#087A43]'
                            : project.progressPercent > 40
                            ? 'bg-[#C9A227]'
                            : 'bg-[#123B28]'
                        }`}
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate max-w-[170px]">{project.department}</span>
                    <span className="font-bold text-[#087A43]">{t('viewDetails')}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setActiveProjectModal(null)}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-10 rtl:pr-0 rtl:pl-10">
              <div className="text-xs font-bold text-[#087A43]">
                {activeProjectModal.category} · {activeProjectModal.status}
              </div>
              <h3 className="font-editorial text-lg sm:text-2xl font-bold text-[#123B28] leading-snug">
                {language === 'ur' ? activeProjectModal.titleUrdu : activeProjectModal.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#087A43] shrink-0" />
                <span>
                  {activeProjectModal.unionCouncil} —{' '}
                  {language === 'ur'
                    ? activeProjectModal.locationUrdu
                    : activeProjectModal.location}
                </span>
              </p>
            </div>

            <div className="h-48 sm:h-64 w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={getAssetUrl(activeProjectModal.imageUrl || CHICHAWATNI_SCENE_PATH)}
                alt={activeProjectModal.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAssetUrl(CHICHAWATNI_SCENE_PATH);
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F9F7] p-4 rounded-xl border border-slate-200 text-xs tabular-nums">
              <div>
                <span className="text-slate-400 block">Budget</span>
                <span className="font-mono font-bold text-[#123B28]">
                  {activeProjectModal.budget}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Progress</span>
                <span className="font-mono font-bold text-[#087A43]">
                  {activeProjectModal.progressPercent}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Start Date</span>
                <span className="font-mono text-slate-700">{activeProjectModal.startDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Target Completion</span>
                <span className="font-mono text-slate-700">
                  {activeProjectModal.completionDate}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                {language === 'ur' ? 'منصوبے کی تفصیل' : 'Project Scope'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F7F9F7] p-4 rounded-xl border border-slate-200">
                {language === 'ur'
                  ? activeProjectModal.descriptionUrdu
                  : activeProjectModal.description}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 text-xs text-slate-600">
              <span>
                {t('department')}: <strong>{activeProjectModal.department}</strong>
              </span>
              <button
                onClick={() => setActiveProjectModal(null)}
                className="min-h-[44px] bg-[#123B28] hover:bg-[#087A43] text-white font-semibold px-6 py-2 rounded-xl text-xs cursor-pointer"
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
