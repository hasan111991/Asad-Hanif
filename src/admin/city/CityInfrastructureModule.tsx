import React, { useState } from 'react';
import { useCityData } from '../../context/CityDataContext';
import {
  CityArea,
  CityAsset,
  CityPriority,
  CityRoad,
  CityRoadCondition
} from '../../types';
import {
  ConfirmDeleteModal,
  EmptyVerifiedDataNotice,
  getConditionBadgeClass,
  getPriorityBadgeClass
} from './CitySharedUI';
import { Plus, Trash2, MapPin, Lightbulb, Compass, Route } from 'lucide-react';

interface CityInfrastructureModuleProps {
  section: 'areas' | 'roads' | 'streetlights' | 'town-planning';
}

export const CityInfrastructureModule: React.FC<CityInfrastructureModuleProps> = ({ section }) => {
  const {
    cityAreas,
    cityLocalities,
    cityRoads,
    cityAssets,
    saveCityArea,
    deleteCityArea,
    saveCityLocality,
    deleteCityLocality,
    saveCityRoad,
    deleteCityRoad,
    saveCityAsset,
    deleteCityAsset
  } = useCityData();

  const [deleteInfo, setDeleteInfo] = useState<{ kind: string; id: string; label: string } | null>(null);

  // Areas & Localities state
  const [areaName, setAreaName] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [zoneType, setZoneType] = useState<CityArea['zoneType']>('Residential');
  const [popVerified, setPopVerified] = useState('');
  const [popSource, setPopSource] = useState('');
  const [areaLat, setAreaLat] = useState('');
  const [areaLng, setAreaLng] = useState('');

  const [locName, setLocName] = useState('');
  const [locAreaId, setLocAreaId] = useState('');
  const [locStreets, setLocStreets] = useState('');

  // Roads & Infrastructure state
  const [roadName, setRoadName] = useState('');
  const [roadLocality, setRoadLocality] = useState('');
  const [roadType, setRoadType] = useState<CityRoad['roadType']>('Main Road');
  const [roadLength, setRoadLength] = useState('');
  const [roadSurface, setRoadSurface] = useState('Carpet / Asphalt');
  const [roadCondition, setRoadCondition] = useState<CityRoadCondition>('Average');
  const [roadPriority, setRoadPriority] = useState<CityPriority>('Medium');
  const [roadLat, setRoadLat] = useState('');
  const [roadLng, setRoadLng] = useState('');

  // Streetlights & Town Planning asset state
  const [assetName, setAssetName] = useState('');
  const [assetLocality, setAssetLocality] = useState('');
  const [assetSubType, setAssetSubType] = useState('');
  const [assetStatus, setAssetStatus] = useState('Operational');
  const [funcCount, setFuncCount] = useState('0');
  const [faultCount, setFaultCount] = useState('0');
  const [assetDetails, setAssetDetails] = useState('');

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCityArea({
      name: areaName.trim(),
      wardCode: wardCode.trim() || 'W-01',
      zoneType,
      populationVerified: popVerified ? Number(popVerified) : null,
      populationSource: popSource.trim() || undefined,
      latitude: areaLat ? Number(areaLat) : null,
      longitude: areaLng ? Number(areaLng) : null
    });
    setAreaName('');
    setWardCode('');
    setPopVerified('');
    setPopSource('');
    setAreaLat('');
    setAreaLng('');
  };

  const handleAddLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCityLocality({
      name: locName.trim(),
      areaId: locAreaId || undefined,
      streetCount: locStreets ? Number(locStreets) : 0
    });
    setLocName('');
    setLocStreets('');
  };

  const handleAddRoad = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCityRoad({
      name: roadName.trim(),
      locality: roadLocality.trim() || 'Chichawatni City',
      roadType,
      lengthKm: roadLength ? Number(roadLength) : 0,
      surfaceType: roadSurface.trim(),
      condition: roadCondition,
      maintenancePriority: roadPriority,
      lastInspected: new Date().toISOString().slice(0, 10),
      latitude: roadLat ? Number(roadLat) : null,
      longitude: roadLng ? Number(roadLng) : null
    });
    setRoadName('');
    setRoadLocality('');
    setRoadLength('');
    setRoadLat('');
    setRoadLng('');
  };

  const handleAddDomainAsset = async (domain: CityAsset['domain']) => {
    if (!assetName.trim()) return;
    await saveCityAsset({
      domain,
      name: assetName.trim(),
      locality: assetLocality.trim() || 'Chichawatni',
      subType: assetSubType.trim() || domain,
      status: assetStatus,
      functionalCount: domain === 'Streetlights' ? Number(funcCount) || 0 : undefined,
      nonFunctionalCount: domain === 'Streetlights' ? Number(faultCount) || 0 : undefined,
      details: assetDetails.trim()
    });
    setAssetName('');
    setAssetLocality('');
    setAssetSubType('');
    setAssetDetails('');
    setFuncCount('0');
    setFaultCount('0');
  };

  if (section === 'areas') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-[#123B28]">
            <MapPin className="w-5 h-5 text-[#087A43]" />
            <div>
              <h2 className="font-editorial text-lg font-bold">Municipal Areas, Wards & Localities</h2>
              <p className="text-xs text-slate-500">Record verified population figures (leave blank if unverified) and mapped mohallahs/colonies.</p>
            </div>
          </div>

          <form onSubmit={handleAddArea} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200">
            <input type="text" required value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="Municipal Area / Ward Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" required value={wardCode} onChange={(e) => setWardCode(e.target.value)} placeholder="Ward Code (e.g. W-01)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={zoneType} onChange={(e) => setZoneType(e.target.value as CityArea['zoneType'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed">Mixed</option>
              <option value="Industrial">Industrial</option>
              <option value="Expansion Belt">Expansion Belt</option>
            </select>
            <input type="number" min={0} value={popVerified} onChange={(e) => setPopVerified(e.target.value)} placeholder="Verified Population (optional)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={popSource} onChange={(e) => setPopSource(e.target.value)} placeholder="Population Census / Official Source" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="number" step="0.0001" value={areaLat} onChange={(e) => setAreaLat(e.target.value)} placeholder="GPS Lat (optional)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="number" step="0.0001" value={areaLng} onChange={(e) => setAreaLng(e.target.value)} placeholder="GPS Lng (optional)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <button type="submit" className="min-h-[40px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4 text-[#C9A227]" />
              <span>Add Municipal Area</span>
            </button>
          </form>

          {cityAreas.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Municipal Areas Mapped Yet" description="Add verified wards or zones in Chichawatni above to populate municipal demographic & spatial records." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {cityAreas.map((a) => (
                <div key={a.id} className="border border-slate-200 rounded-xl p-3.5 bg-white flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-[#087A43]">{a.wardCode} · {a.zoneType}</span>
                    <div className="font-bold text-sm text-[#123B28]">{a.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Population: {a.populationVerified ? `${a.populationVerified.toLocaleString()} (${a.populationSource || 'Verified'})` : 'Not yet verified'}
                    </div>
                  </div>
                  <button type="button" onClick={() => setDeleteInfo({ kind: 'area', id: a.id, label: a.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Localities */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#123B28]">Mohallahs, Blocks & Housing Colonies ({cityLocalities.length})</h3>
          <form onSubmit={handleAddLocality} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200">
            <input type="text" required value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="Locality / Colony Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={locAreaId} onChange={(e) => setLocAreaId(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="">Link to Area (Optional)</option>
              {cityAreas.map((a) => (
                <option key={a.id} value={a.id}>{a.wardCode} — {a.name}</option>
              ))}
            </select>
            <input type="number" min={0} value={locStreets} onChange={(e) => setLocStreets(e.target.value)} placeholder="Mapped Streets Count" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <button type="submit" className="min-h-[38px] bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">Add Locality</button>
          </form>

          <div className="divide-y divide-slate-100 text-xs">
            {cityLocalities.map((l) => (
              <div key={l.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-[#123B28]">{l.name}</strong>{' '}
                  <span className="text-slate-500">· {l.streetCount || 0} streets</span>
                </div>
                <button type="button" onClick={() => setDeleteInfo({ kind: 'locality', id: l.id, label: l.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <ConfirmDeleteModal
          open={!!deleteInfo}
          title="Delete Record?"
          message={`Remove "${deleteInfo?.label}" permanently?`}
          onCancel={() => setDeleteInfo(null)}
          onConfirm={async () => {
            if (!deleteInfo) return;
            if (deleteInfo.kind === 'area') await deleteCityArea(deleteInfo.id);
            else await deleteCityLocality(deleteInfo.id);
            setDeleteInfo(null);
          }}
        />
      </div>
    );
  }

  if (section === 'roads') {
    const publicBuildings = cityAssets.filter((a) => a.domain === 'PublicBuildings');
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-[#087A43]" />
            <div>
              <h2 className="font-editorial text-lg font-bold text-[#123B28]">Roads, Streets, Bridges, Culverts & Drainage Channels</h2>
              <p className="text-xs text-slate-500">5-tier engineering condition inventory (Excellent, Good, Average, Poor, Critical) with maintenance priorities.</p>
            </div>
          </div>

          <form onSubmit={handleAddRoad} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200">
            <input type="text" required value={roadName} onChange={(e) => setRoadName(e.target.value)} placeholder="Road / Street / Bridge Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={roadLocality} onChange={(e) => setRoadLocality(e.target.value)} placeholder="Locality / Sector" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={roadType} onChange={(e) => setRoadType(e.target.value as CityRoad['roadType'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Main Road">Main Road</option>
              <option value="Link Road">Link Road</option>
              <option value="Street">Street</option>
              <option value="Bridge">Bridge</option>
              <option value="Culvert">Culvert</option>
              <option value="Footpath">Footpath</option>
              <option value="Drainage Channel">Street Drainage Channel</option>
            </select>
            <input type="number" step="0.01" min={0} value={roadLength} onChange={(e) => setRoadLength(e.target.value)} placeholder="Length (km)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={roadSurface} onChange={(e) => setRoadSurface(e.target.value)} placeholder="Surface (Carpet / Tuff Tile / Brick)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={roadCondition} onChange={(e) => setRoadCondition(e.target.value as CityRoadCondition)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Excellent">Condition: Excellent</option>
              <option value="Good">Condition: Good</option>
              <option value="Average">Condition: Average</option>
              <option value="Poor">Condition: Poor</option>
              <option value="Critical">Condition: Critical</option>
            </select>
            <select value={roadPriority} onChange={(e) => setRoadPriority(e.target.value as CityPriority)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Critical">Priority: Critical</option>
              <option value="High">Priority: High</option>
              <option value="Medium">Priority: Medium</option>
              <option value="Low">Priority: Low</option>
            </select>
            <div className="flex gap-2">
              <input type="number" step="0.0001" value={roadLat} onChange={(e) => setRoadLat(e.target.value)} placeholder="Lat" className="w-1/2 px-2 py-2 bg-white border border-slate-200 rounded-xl" />
              <input type="number" step="0.0001" value={roadLng} onChange={(e) => setRoadLng(e.target.value)} placeholder="Lng" className="w-1/2 px-2 py-2 bg-white border border-slate-200 rounded-xl" />
            </div>
            <button type="submit" className="sm:col-span-3 lg:col-span-4 min-h-[40px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
              Add Road / Civil Infrastructure Record
            </button>
          </form>

          {cityRoads.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Road Condition Surveys Logged Yet" description="Add main arteries, bazaar streets, bridges, culverts, or footpaths above to track Chichawatni road conditions." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F7] border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-bold">Road / Asset</th>
                    <th className="p-3 font-bold">Type & Surface</th>
                    <th className="p-3 font-bold">Condition</th>
                    <th className="p-3 font-bold">Priority</th>
                    <th className="p-3 font-bold text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cityRoads.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3">
                        <div className="font-bold text-[#123B28]">{r.name}</div>
                        <div className="text-[11px] text-slate-500">{r.locality} · {r.lengthKm || 0} km</div>
                      </td>
                      <td className="p-3">{r.roadType} · {r.surfaceType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getConditionBadgeClass(r.condition)}`}>
                          {r.condition}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityBadgeClass(r.maintenancePriority)}`}>
                          {r.maintenancePriority}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button type="button" onClick={() => setDeleteInfo({ kind: 'road', id: r.id, label: r.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Public Buildings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
          <h3 className="font-bold text-sm text-[#123B28]">Public Buildings & Municipal Structures ({publicBuildings.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="Public Building / Office Name" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
            <input type="text" value={assetLocality} onChange={(e) => setAssetLocality(e.target.value)} placeholder="Locality" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
            <input type="text" value={assetDetails} onChange={(e) => setAssetDetails(e.target.value)} placeholder="Repair Status / Accessibility" className="px-3 py-2 bg-[#F7F9F7] border border-slate-200 rounded-xl" />
            <button type="button" onClick={() => handleAddDomainAsset('PublicBuildings')} className="min-h-[38px] bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
              Add Public Building
            </button>
          </div>
          {publicBuildings.map((b) => (
            <div key={b.id} className="p-2.5 border border-slate-200 rounded-xl flex justify-between items-center">
              <div><strong>{b.name}</strong> ({b.locality}) — {b.details || b.status}</div>
              <button type="button" onClick={() => setDeleteInfo({ kind: 'asset', id: b.id, label: b.name })} className="text-red-600 p-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>

        <ConfirmDeleteModal
          open={!!deleteInfo}
          title="Confirm Deletion"
          message={`Delete "${deleteInfo?.label}"?`}
          onCancel={() => setDeleteInfo(null)}
          onConfirm={async () => {
            if (!deleteInfo) return;
            if (deleteInfo.kind === 'road') await deleteCityRoad(deleteInfo.id);
            else await deleteCityAsset(deleteInfo.id);
            setDeleteInfo(null);
          }}
        />
      </div>
    );
  }

  // Streetlights OR Town Planning
  const targetDomain: CityAsset['domain'] = section === 'streetlights' ? 'Streetlights' : 'TownPlanning';
  const list = cityAssets.filter((a) => a.domain === targetDomain);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          {section === 'streetlights' ? <Lightbulb className="w-5 h-5 text-[#C9A227]" /> : <Compass className="w-5 h-5 text-[#087A43]" />}
          <div>
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">
              {section === 'streetlights' ? 'Streetlights & Public Safety Zones' : 'Town Planning & 2027–2030 Urban Expansion Belts'}
            </h2>
            <p className="text-xs text-slate-500">
              {section === 'streetlights'
                ? 'Track functional vs faulty fixtures, solar pole conversions, and police safe-city coordination.'
                : 'Manage urban growth boundaries, residential/commercial zoning, housing compliance, and green belts.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200">
          <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder={section === 'streetlights' ? 'Streetlight Zone / Feeder Name' : 'Expansion Belt / Zoning Sector Name'} className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={assetLocality} onChange={(e) => setAssetLocality(e.target.value)} placeholder="Locality / Chowk" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={assetSubType} onChange={(e) => setAssetSubType(e.target.value)} placeholder={section === 'streetlights' ? 'Fixture Type (LED / Solar)' : 'Zone Class (Residential / Commercial / Green Belt)'} className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />

          {section === 'streetlights' && (
            <>
              <input type="number" min={0} value={funcCount} onChange={(e) => setFuncCount(e.target.value)} placeholder="Functional Poles Count" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
              <input type="number" min={0} value={faultCount} onChange={(e) => setFaultCount(e.target.value)} placeholder="Non-Functional / Faulty Poles" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            </>
          )}

          <select value={assetStatus} onChange={(e) => setAssetStatus(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Operational">Operational / Approved</option>
            <option value="Partial">Partial / Under Review</option>
            <option value="Needs Action">Faulty / Action Required</option>
          </select>

          <input type="text" value={assetDetails} onChange={(e) => setAssetDetails(e.target.value)} placeholder="Inspection notes, safety/CCTV linkage, or boundary reference..." className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <button type="button" onClick={() => handleAddDomainAsset(targetDomain)} className="min-h-[40px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">
            Save {section === 'streetlights' ? 'Streetlight Zone' : 'Town Plan Entry'}
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyVerifiedDataNotice
            title={`No ${section === 'streetlights' ? 'Streetlight Zones' : 'Town Planning Records'} Logged Yet`}
            description="Record verified field counts or official town planning belts above."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {list.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-[#123B28]">{a.name}</div>
                  <div className="text-[11px] text-slate-600">{a.locality} · {a.subType} · <strong>{a.status}</strong></div>
                  {section === 'streetlights' && (
                    <div className="text-[11px] font-semibold text-[#087A43]">
                      Functional: {a.functionalCount || 0} · Non-Functional: <span className="text-red-700">{a.nonFunctionalCount || 0}</span>
                    </div>
                  )}
                  {a.details && <p className="text-[11px] text-slate-500">{a.details}</p>}
                </div>
                <button type="button" onClick={() => setDeleteInfo({ kind: 'asset', id: a.id, label: a.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteInfo}
        title="Delete Entry?"
        message={`Delete "${deleteInfo?.label}"?`}
        onCancel={() => setDeleteInfo(null)}
        onConfirm={async () => {
          if (deleteInfo) {
            await deleteCityAsset(deleteInfo.id);
            setDeleteInfo(null);
          }
        }}
      />
    </div>
  );
};
