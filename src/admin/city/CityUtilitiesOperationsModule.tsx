import React, { useState } from 'react';
import { useCityData } from '../../context/CityDataContext';
import { CitySewerageAsset, CityWasteRoute, CityWaterFacility } from '../../types';
import {
  ConfirmDeleteModal,
  EmptyVerifiedDataNotice,
  getConditionBadgeClass
} from './CitySharedUI';
import { Droplets, Trash2, Car, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CityUtilitiesOperationsModuleProps {
  section: 'water-sewerage' | 'sanitation' | 'traffic';
}

export const CityUtilitiesOperationsModule: React.FC<CityUtilitiesOperationsModuleProps> = ({
  section
}) => {
  const {
    cityWaterFacilities,
    citySewerageAssets,
    cityWasteRoutes,
    cityAssets,
    saveWaterFacility,
    deleteWaterFacility,
    saveSewerageAsset,
    deleteSewerageAsset,
    saveWasteRoute,
    deleteWasteRoute,
    saveCityAsset,
    deleteCityAsset
  } = useCityData();

  const [deleteInfo, setDeleteInfo] = useState<{ kind: string; id: string; label: string } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Water form
  const [wName, setWName] = useState('');
  const [wType, setWType] = useState<CityWaterFacility['facilityType']>('Filtration Plant');
  const [wLocality, setWLocality] = useState('');
  const [wStatus, setWStatus] = useState<CityWaterFacility['status']>('Operational');
  const [wQuality, setWQuality] = useState('');

  // Sewerage form
  const [sName, setSName] = useState('');
  const [sType, setSType] = useState<CitySewerageAsset['assetType']>('Disposal Station');
  const [sLocality, setSLocality] = useState('');
  const [sCondition, setSCondition] = useState<CitySewerageAsset['condition']>('Clear');

  // Sanitation route form
  const [rCode, setRCode] = useState('');
  const [rName, setRName] = useState('');
  const [rLocality, setRLocality] = useState('');
  const [rPoints, setRPoints] = useState('0');
  const [rDisposal, setRDisposal] = useState('');
  const [rVehicle, setRVehicle] = useState('');
  const [rVehicleStatus, setRVehicleStatus] = useState<CityWasteRoute['vehicleStatus']>('Active');
  const [rTons, setRTons] = useState('0');
  const [rSchedule, setRSchedule] = useState('Daily 06:00 AM');
  const [rStatus, setRStatus] = useState<CityWasteRoute['status']>('Scheduled');
  const [rVerifiedBy, setRVerifiedBy] = useState('');
  const [rNotes, setRNotes] = useState('');

  // Traffic form
  const [tName, setTName] = useState('');
  const [tLocality, setTLocality] = useState('');
  const [tSubType, setTSubType] = useState('Congested Road / Chowk');
  const [tStatus, setTStatus] = useState('Coordination Required');
  const [tDetails, setTDetails] = useState('');

  if (section === 'water-sewerage') {
    return (
      <div className="space-y-6">
        {/* Water Supply */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            <div>
              <h2 className="font-editorial text-lg font-bold text-[#123B28]">Water Supply Plants, Tube Wells & Quality Monitoring</h2>
              <p className="text-xs text-slate-500">Track filtration plants, overhead tanks, supply pipelines, laboratory test results, and leakage repairs.</p>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveWaterFacility({
                name: wName.trim(),
                facilityType: wType,
                locality: wLocality.trim() || 'Chichawatni',
                status: wStatus,
                qualityResult: wQuality.trim() || 'Pending Test',
                lastTested: new Date().toISOString().slice(0, 10)
              });
              setWName('');
              setWLocality('');
              setWQuality('');
            }}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200"
          >
            <input type="text" required value={wName} onChange={(e) => setWName(e.target.value)} placeholder="Plant / Tube Well Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={wType} onChange={(e) => setWType(e.target.value as CityWaterFacility['facilityType'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Filtration Plant">Filtration Plant</option>
              <option value="Tube Well">Tube Well</option>
              <option value="Supply Line">Supply Line</option>
              <option value="Overhead Tank">Overhead Tank</option>
              <option value="Quality Test">Quality Test Log</option>
              <option value="Leakage Issue">Leakage / Repair Issue</option>
            </select>
            <input type="text" value={wLocality} onChange={(e) => setWLocality(e.target.value)} placeholder="Locality" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={wStatus} onChange={(e) => setWStatus(e.target.value as CityWaterFacility['status'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Operational">Operational</option>
              <option value="Partial">Partial</option>
              <option value="Non-Functional">Non-Functional</option>
              <option value="Under Repair">Under Repair</option>
            </select>
            <input type="text" value={wQuality} onChange={(e) => setWQuality(e.target.value)} placeholder="TDS / Quality Result" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <button type="submit" className="min-h-[38px] bg-[#087A43] text-white font-bold rounded-xl cursor-pointer">Add Water Facility</button>
          </form>

          {cityWaterFacilities.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Water Supply Facilities Logged" description="Add Chichawatni filtration plants, tube wells, or leakage inspections above." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {cityWaterFacilities.map((w) => (
                <div key={w.id} className="p-3.5 border border-slate-200 rounded-xl flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-sm text-[#123B28]">{w.name}</div>
                    <div className="text-[11px] text-slate-600">{w.facilityType} · {w.locality}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getConditionBadgeClass(w.status)}`}>{w.status}</span>
                      {w.qualityResult && <span className="text-[11px] text-slate-500">Quality: {w.qualityResult}</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => setDeleteInfo({ kind: 'water', id: w.id, label: w.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sewerage & Drainage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-base text-[#123B28]">Sewerage Trunk Lines, Disposal Stations & Flooding Hotspots</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveSewerageAsset({
                name: sName.trim(),
                assetType: sType,
                locality: sLocality.trim() || 'Chichawatni',
                condition: sCondition,
                lastInspected: new Date().toISOString().slice(0, 10)
              });
              setSName('');
              setSLocality('');
            }}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs bg-[#F7F9F7] p-3.5 rounded-xl border border-slate-200"
          >
            <input type="text" required value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Disposal Station / Drain / Hotspot" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={sType} onChange={(e) => setSType(e.target.value as CitySewerageAsset['assetType'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Disposal Station">Disposal Station</option>
              <option value="Pumping Station">Pumping Station</option>
              <option value="Sewerage Line">Sewerage Trunk Line</option>
              <option value="Manhole Sector">Manhole Sector</option>
              <option value="Blocked Drain">Blocked Drain</option>
              <option value="Flooding Hotspot">Rainwater Flooding Hotspot</option>
            </select>
            <input type="text" value={sLocality} onChange={(e) => setSLocality(e.target.value)} placeholder="Locality" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={sCondition} onChange={(e) => setSCondition(e.target.value as CitySewerageAsset['condition'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Clear">Clear / Functional</option>
              <option value="Needs Desilting">Needs Desilting</option>
              <option value="Blocked">Blocked / Overflowing</option>
              <option value="Under Repair">Under Repair</option>
            </select>
            <button type="submit" className="min-h-[38px] bg-[#123B28] text-white font-bold rounded-xl cursor-pointer">Add Sewerage Asset</button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {citySewerageAssets.map((s) => (
              <div key={s.id} className="p-3.5 border border-slate-200 rounded-xl flex justify-between items-start gap-2">
                <div>
                  <div className="font-bold text-sm text-[#123B28]">{s.name}</div>
                  <div className="text-[11px] text-slate-600">{s.assetType} · {s.locality}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded border text-[10px] font-bold ${getConditionBadgeClass(s.condition)}`}>{s.condition}</span>
                </div>
                <button type="button" onClick={() => setDeleteInfo({ kind: 'sewer', id: s.id, label: s.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <ConfirmDeleteModal
          open={!!deleteInfo}
          title="Delete Utility Record?"
          message={`Remove "${deleteInfo?.label}"?`}
          onCancel={() => setDeleteInfo(null)}
          onConfirm={async () => {
            if (!deleteInfo) return;
            if (deleteInfo.kind === 'water') await deleteWaterFacility(deleteInfo.id);
            else await deleteSewerageAsset(deleteInfo.id);
            setDeleteInfo(null);
          }}
        />
      </div>
    );
  }

  if (section === 'sanitation') {
    const totalMeasuredTons = cityWasteRoutes.reduce((s, r) => s + (Number(r.wasteTonsMeasured) || 0), 0);
    const activeVehicles = cityWasteRoutes.filter((r) => r.vehicleStatus === 'Active').length;
    const completedRoutes = cityWasteRoutes.filter((r) => r.status === 'Completed').length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <span className="text-slate-500">Completed & Field-Verified Routes</span>
            <div className="text-2xl font-bold text-[#087A43] mt-1">{completedRoutes} / {cityWasteRoutes.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <span className="text-slate-500">Active Collection Vehicles</span>
            <div className="text-2xl font-bold text-[#123B28] mt-1">{activeVehicles}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <span className="text-slate-500">Measured Waste Collected</span>
            <div className="text-2xl font-bold text-[#123B28] mt-1">{totalMeasuredTons.toFixed(1)} Tons</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">Sanitation & Waste Collection Operations</h2>
            <p className="text-xs text-slate-500">
              Strict verification rule: Routes cannot be marked <strong>Completed</strong> without a named Field Verifier and verification notes.
            </p>
          </div>

          {errorBanner && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (rStatus === 'Completed' && (!rVerifiedBy.trim() || !rNotes.trim())) {
                setErrorBanner('Verification required: Enter Field Verifier Name and Field Notes before marking a sanitation route Completed.');
                return;
              }
              setErrorBanner(null);
              await saveWasteRoute({
                routeCode: rCode.trim() || `RT-${cityWasteRoutes.length + 1}`,
                routeName: rName.trim(),
                locality: rLocality.trim() || 'Chichawatni',
                collectionPointsCount: Number(rPoints) || 0,
                disposalSite: rDisposal.trim() || 'Designated Transfer Yard',
                vehicleReg: rVehicle.trim(),
                vehicleStatus: rVehicleStatus,
                wasteTonsMeasured: Number(rTons) || 0,
                schedule: rSchedule.trim(),
                status: rStatus,
                fieldVerifiedBy: rVerifiedBy.trim(),
                fieldVerificationNotes: rNotes.trim()
              });
              setRCode('');
              setRName('');
              setRLocality('');
              setRVerifiedBy('');
              setRNotes('');
            }}
            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200"
          >
            <input type="text" required value={rCode} onChange={(e) => setRCode(e.target.value)} placeholder="Route Code (e.g. SW-01)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" required value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Route / Market Sweeping Area" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={rLocality} onChange={(e) => setRLocality(e.target.value)} placeholder="Ward / Locality" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="number" min={0} value={rPoints} onChange={(e) => setRPoints(e.target.value)} placeholder="Collection Points Count" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={rVehicle} onChange={(e) => setRVehicle(e.target.value)} placeholder="Vehicle Reg (e.g. SL-402)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={rVehicleStatus} onChange={(e) => setRVehicleStatus(e.target.value as CityWasteRoute['vehicleStatus'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Active">Vehicle: Active</option>
              <option value="Maintenance">Vehicle: Under Maintenance</option>
              <option value="Out of Service">Vehicle: Out of Service</option>
            </select>
            <input type="number" step="0.1" min={0} value={rTons} onChange={(e) => setRTons(e.target.value)} placeholder="Measured Waste (Tons)" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={rSchedule} onChange={(e) => setRSchedule(e.target.value)} placeholder="Cleaning Schedule" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={rDisposal} onChange={(e) => setRDisposal(e.target.value)} placeholder="Disposal / Transfer Site" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <select value={rStatus} onChange={(e) => setRStatus(e.target.value as CityWasteRoute['status'])} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
              <option value="Scheduled">Status: Scheduled</option>
              <option value="In Progress">Status: In Progress</option>
              <option value="Completed">Status: Completed (Requires Verification)</option>
              <option value="Missed">Status: Missed</option>
            </select>
            <input type="text" value={rVerifiedBy} onChange={(e) => setRVerifiedBy(e.target.value)} placeholder="Field Verifier Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <input type="text" value={rNotes} onChange={(e) => setRNotes(e.target.value)} placeholder="Field Verification Notes" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
            <button type="submit" className="sm:col-span-3 lg:col-span-4 min-h-[40px] bg-[#087A43] text-white font-bold rounded-xl cursor-pointer">
              Save Sanitation Route
            </button>
          </form>

          {cityWasteRoutes.length === 0 ? (
            <EmptyVerifiedDataNotice title="No Sanitation Routes Logged Yet" description="Add waste collection routes, tractor-trolleys, schedules, and field verification logs above." />
          ) : (
            <div className="space-y-2 text-xs">
              {cityWasteRoutes.map((r) => (
                <div key={r.id} className="p-3.5 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-[#123B28]">
                      <span className="font-mono text-[#087A43] mr-2">{r.routeCode}</span>
                      {r.routeName}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {r.locality} · {r.collectionPointsCount || 0} bins · Vehicle: {r.vehicleReg || 'Unassigned'} ({r.vehicleStatus}) · {r.wasteTonsMeasured || 0} Tons
                    </div>
                    {r.fieldVerifiedBy && (
                      <div className="text-[11px] text-[#087A43] font-semibold inline-flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified by {r.fieldVerifiedBy}: {r.fieldVerificationNotes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#F7F9F7] border border-slate-200 font-bold">{r.status}</span>
                    <button type="button" onClick={() => setDeleteInfo({ kind: 'waste', id: r.id, label: r.routeName })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ConfirmDeleteModal
          open={!!deleteInfo}
          title="Delete Route?"
          message={`Remove sanitation route "${deleteInfo?.label}"?`}
          onCancel={() => setDeleteInfo(null)}
          onConfirm={async () => {
            if (deleteInfo) {
              await deleteWasteRoute(deleteInfo.id);
              setDeleteInfo(null);
            }
          }}
        />
      </div>
    );
  }

  // Traffic & Transportation
  const trafficAssets = cityAssets.filter((a) => a.domain === 'Traffic');
  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[#087A43]" />
          <div>
            <h2 className="font-editorial text-lg font-bold text-[#123B28]">Traffic, Parking, Bus Stops & Punjab Traffic Police Coordination</h2>
            <p className="text-xs text-slate-500">Map intersections, congested bazaars, bus/wagon stands, pedestrian crossings, loading zones, and black spots.</p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await saveCityAsset({
              domain: 'Traffic',
              name: tName.trim(),
              locality: tLocality.trim() || 'Chichawatni',
              subType: tSubType,
              status: tStatus,
              details: tDetails.trim()
            });
            setTName('');
            setTLocality('');
            setTDetails('');
          }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#F7F9F7] p-4 rounded-xl border border-slate-200"
        >
          <input type="text" required value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Chowk / Parking / Stand Name" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <input type="text" value={tLocality} onChange={(e) => setTLocality(e.target.value)} placeholder="Bazaar / Road Corridor" className="px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <select value={tSubType} onChange={(e) => setTSubType(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Major Intersection">Major Intersection</option>
            <option value="Congested Road / Bazaar">Congested Road / Bazaar</option>
            <option value="Parking Area">Parking Area</option>
            <option value="Bus / Transport Stop">Bus / Transport Stop</option>
            <option value="Pedestrian Crossing">Pedestrian Crossing</option>
            <option value="Accident-Prone Spot">Accident-Prone Spot</option>
            <option value="Loading / Unloading Zone">Loading / Unloading Point</option>
          </select>
          <select value={tStatus} onChange={(e) => setTStatus(e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl">
            <option value="Coordination Required">Traffic Police Coordination Required</option>
            <option value="Wardens Deployed">Wardens Deployed</option>
            <option value="Engineering Redesign Needed">Engineering Redesign Needed</option>
            <option value="Controlled">Smooth / Controlled</option>
          </select>
          <input type="text" value={tDetails} onChange={(e) => setTDetails(e.target.value)} placeholder="Peak hours, encroachment notes, or zebra crossing need..." className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          <button type="submit" className="sm:col-span-3 min-h-[40px] bg-[#087A43] text-white font-bold rounded-xl cursor-pointer">
            Add Traffic Node / Corridor Entry
          </button>
        </form>

        {trafficAssets.length === 0 ? (
          <EmptyVerifiedDataNotice title="No Traffic Nodes Recorded Yet" description="Document Chichawatni chowks, congested commercial markets, bus stops, and accident spots above." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {trafficAssets.map((a) => (
              <div key={a.id} className="p-3.5 border border-slate-200 rounded-xl flex justify-between items-start gap-2">
                <div>
                  <div className="font-bold text-sm text-[#123B28]">{a.name}</div>
                  <div className="text-[11px] text-[#087A43] font-semibold">{a.subType} · {a.locality}</div>
                  <div className="text-[11px] text-slate-600 mt-1">Status: <strong>{a.status}</strong> — {a.details}</div>
                </div>
                <button type="button" onClick={() => setDeleteInfo({ kind: 'traffic', id: a.id, label: a.name })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteInfo}
        title="Delete Traffic Node?"
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
