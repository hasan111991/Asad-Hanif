import React, { useState } from 'react';
import { useCityData } from '../../context/CityDataContext';
import { CityAsset } from '../../types';
import { ConfirmDeleteModal, EmptyVerifiedDataNotice } from './CitySharedUI';
import { Trees, Stethoscope, Store, Trash2 } from 'lucide-react';

interface CityFacilitiesDirectoryModuleProps {
  section: 'parks' | 'health-edu' | 'markets';
}

export const CityFacilitiesDirectoryModule: React.FC<CityFacilitiesDirectoryModuleProps> = ({
  section
}) => {
  const { cityAssets, saveCityAsset, deleteCityAsset } = useCityData();

  const [name, setName] = useState('');
  const [locality, setLocality] = useState('');
  const [domainChoice, setDomainChoice] = useState<CityAsset['domain']>(
    section === 'parks' ? 'Parks' : section === 'markets' ? 'Markets' : 'Health'
  );
  const [subType, setSubType] = useState('');
  const [status, setStatus] = useState('Functional');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [missing, setMissing] = useState('');
  const [details, setDetails] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CityAsset | null>(null);

  const visibleAssets = cityAssets.filter((a) => {
    if (section === 'parks') return a.domain === 'Parks';
    if (section === 'markets') return a.domain === 'Markets';
    return a.domain === 'Health' || a.domain === 'Education';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDomain: CityAsset['domain'] =
      section === 'parks' ? 'Parks' : section === 'markets' ? 'Markets' : domainChoice;
    await saveCityAsset({
      domain: targetDomain,
      name: name.trim(),
      locality: locality.trim() || 'Chichawatni',
      subType: subType.trim() || targetDomain,
      status,
      areaSqFt: areaSqFt.trim() || undefined,
      missingFacilities: missing
        ? missing.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      details: details.trim(),
      lastInspected: new Date().toISOString().slice(0, 10)
    });
    setName('');
    setLocality('');
    setSubType('');
    setAreaSqFt('');
    setMissing('');
    setDetails('');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          {section === 'parks' ? (
            <Trees className="w-5 h-5 text-[#087A43]" />
          ) : section === 'markets' ? (
            <Store className="w-5 h-5 text-[#C9A227]" />
          ) : (
            <Stethoscope className="w-5 h-5 text-red-600" />
          )}
          <div>
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">
              {section === 'parks'
                ? 'Parks, Playgrounds & Public Green Spaces'
                : section === 'markets'
                  ? 'Business, Bazaars & Commercial Markets Directory'
                  : 'Health & Education Public Facilities Directory'}
            </h2>
            <p className="text-xs text-slate-500">
              {section === 'markets'
                ? 'Public commercial directories and aggregate market infrastructure only — never expose private citizen or trader PII.'
                : section === 'parks'
                  ? 'Manage parks, playgrounds, lighting, public toilets, and inspection history.'
                  : 'Track hospitals, BHUs, clinics, dispensaries, schools, colleges, technical institutes, libraries, and missing facilities.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200">
          {section === 'health-edu' && (
            <select value={domainChoice} onChange={(e) => setDomainChoice(e.target.value as 'Health' | 'Education')} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Health">Healthcare Facility</option>
              <option value="Education">Education Facility / Library / Lab</option>
            </select>
          )}
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Facility / Market / Park Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="Locality / Sector" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input
            type="text"
            value={subType}
            onChange={(e) => setSubType(e.target.value)}
            placeholder={
              section === 'parks'
                ? 'Family Park / Playground'
                : section === 'markets'
                  ? 'Bazaar / Mandi / Commercial Zone'
                  : 'THQ / BHU / High School / College / TEVTA'
            }
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Functional">Functional / Good Condition</option>
            <option value="Needs Renovation">Needs Maintenance / Upgrade</option>
            <option value="Critical Shortage">Critical Missing Facilities</option>
          </select>
          <input type="text" value={areaSqFt} onChange={(e) => setAreaSqFt(e.target.value)} placeholder={section === 'markets' ? 'Approx Shop Categories / Capacity' : 'Area / Beds / Classrooms'} className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={missing} onChange={(e) => setMissing(e.target.value)} placeholder="Missing Facilities / Needs (comma separated: Toilets, Lighting, Lab...)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Notes: trader feedback, emergency access, solar backup, parking..." className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <button type="submit" className="min-h-[40px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
            Save Public Facility
          </button>
        </form>

        {visibleAssets.length === 0 ? (
          <EmptyVerifiedDataNotice title="No Verified Facilities Saved Yet" description="Add public facilities above to build the verified Chichawatni asset directory." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {visibleAssets.map((a) => (
              <div key={a.id} className="p-4 border border-slate-200 rounded-xl bg-white flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-[#087A43] uppercase">{a.domain} · {a.subType}</div>
                  <div className="font-bold text-sm text-[#123B28]">{a.name}</div>
                  <div className="text-[11px] text-slate-600">{a.locality} · Status: <strong>{a.status}</strong> {a.areaSqFt ? `· ${a.areaSqFt}` : ''}</div>
                  {a.missingFacilities && a.missingFacilities.length > 0 && (
                    <div className="text-[11px] text-amber-800">Needs: {a.missingFacilities.join(', ')}</div>
                  )}
                  {a.details && <p className="text-[11px] text-slate-500">{a.details}</p>}
                </div>
                <button type="button" onClick={() => setDeleteTarget(a)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Delete Facility?"
        message={`Delete "${deleteTarget?.name}" from the city directory?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteCityAsset(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
};
