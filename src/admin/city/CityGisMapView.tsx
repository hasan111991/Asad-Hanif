import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useCityData } from '../../context/CityDataContext';
import { OFFICIAL_APPROVED_PROJECT_STATUSES } from '../../data/cityManagementData';
import { MapPin, Search, Download, Upload, Layers, Crosshair, CheckCircle2 } from 'lucide-react';

type LayerId =
  | 'areas'
  | 'roads'
  | 'water'
  | 'sewerage'
  | 'parks'
  | 'healthEdu'
  | 'markets'
  | 'streetlights'
  | 'traffic'
  | 'waste'
  | 'projects'
  | 'complaints';

const LAYER_LABELS: { id: LayerId; label: string; color: string }[] = [
  { id: 'areas', label: 'City Areas / Wards', color: '#123B28' },
  { id: 'roads', label: 'Roads & Infrastructure', color: '#475569' },
  { id: 'water', label: 'Water Filtration & Plants', color: '#0284C7' },
  { id: 'sewerage', label: 'Sewerage & Drains', color: '#0369A1' },
  { id: 'parks', label: 'Parks & Public Spaces', color: '#15803D' },
  { id: 'healthEdu', label: 'Schools, Colleges & Hospitals', color: '#7C3AED' },
  { id: 'markets', label: 'Commercial Markets', color: '#B45309' },
  { id: 'streetlights', label: 'Streetlight Zones', color: '#D97706' },
  { id: 'traffic', label: 'Traffic Intersections & Stops', color: '#DC2626' },
  { id: 'waste', label: 'Waste Collection Routes', color: '#166534' },
  { id: 'projects', label: '2027–2030 City Projects', color: '#087A43' },
  { id: 'complaints', label: 'Citizen Complaints', color: '#E11D48' }
];

export const CityGisMapView: React.FC = () => {
  const {
    cityAreas,
    cityRoads,
    cityAssets,
    cityWaterFacilities,
    citySewerageAssets,
    cityWasteRoutes,
    cityProjects,
    cityComplaints,
    saveCityArea
  } = useCityData();

  const [activeLayers, setActiveLayers] = useState<Record<LayerId, boolean>>({
    areas: true,
    roads: true,
    water: true,
    sewerage: true,
    parks: true,
    healthEdu: true,
    markets: true,
    streetlights: true,
    traffic: true,
    waste: true,
    projects: true,
    complaints: true
  });
  const [search, setSearch] = useState('');
  const [pickCoordsMode, setPickCoordsMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [quickAreaName, setQuickAreaName] = useState('');
  const [quickWardCode, setQuickWardCode] = useState('');
  const [importedFeatures, setImportedFeatures] = useState<
    { name: string; lat: number; lng: number; props: string }[]
  >([]);
  const [notice, setNotice] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geoItems = useMemo(() => {
    const q = search.toLowerCase();
    const list: { layer: LayerId; title: string; subtitle: string; lat: number; lng: number; color: string }[] = [];

    const pushIfValid = (
      layer: LayerId,
      title: string,
      subtitle: string,
      lat?: number | null,
      lng?: number | null,
      color = '#087A43'
    ) => {
      if (!activeLayers[layer]) return;
      if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return;
      if (q && !title.toLowerCase().includes(q) && !subtitle.toLowerCase().includes(q)) return;
      list.push({ layer, title, subtitle, lat, lng, color });
    };

    cityAreas.forEach((a) => pushIfValid('areas', a.name, `Ward ${a.wardCode} (${a.zoneType})`, a.latitude, a.longitude, '#123B28'));
    cityRoads.forEach((r) =>
      pushIfValid(
        'roads',
        r.name,
        `${r.roadType} · Condition: ${r.condition}`,
        r.latitude,
        r.longitude,
        r.condition === 'Critical' || r.condition === 'Poor' ? '#DC2626' : '#475569'
      )
    );
    cityWaterFacilities.forEach((w) =>
      pushIfValid('water', w.name, `${w.facilityType} · ${w.status}`, w.latitude, w.longitude, '#0284C7')
    );
    citySewerageAssets.forEach((s) =>
      pushIfValid(
        'sewerage',
        s.name,
        `${s.assetType} · ${s.condition}`,
        s.latitude,
        s.longitude,
        s.condition === 'Blocked' ? '#DC2626' : '#0369A1'
      )
    );
    cityAssets.forEach((a) => {
      const layerMap: Record<string, LayerId> = {
        Parks: 'parks',
        Health: 'healthEdu',
        Education: 'healthEdu',
        Markets: 'markets',
        Streetlights: 'streetlights',
        Traffic: 'traffic',
        TownPlanning: 'areas',
        PublicBuildings: 'markets'
      };
      const targetLayer = layerMap[a.domain] || 'markets';
      const meta = LAYER_LABELS.find((l) => l.id === targetLayer);
      pushIfValid(targetLayer, a.name, `${a.domain} · ${a.status}`, a.latitude, a.longitude, meta?.color || '#087A43');
    });
    cityWasteRoutes.forEach((w) =>
      pushIfValid('waste', w.routeName, `Route ${w.routeCode} · ${w.status}`, w.latitude, w.longitude, '#166534')
    );
    cityProjects
      .filter((p) => !p.isSampleTemplate)
      .forEach((p) =>
        pushIfValid(
          'projects',
          `${p.projectCode}: ${p.name}`,
          `${p.status} · ${p.physicalProgressPercent}%`,
          p.latitude,
          p.longitude,
          p.status === 'Completed'
            ? '#087A43'
            : OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status)
              ? '#C9A227'
              : '#64748B'
        )
      );
    cityComplaints.forEach((c) =>
      pushIfValid('complaints', `${c.trackingId}: ${c.category}`, `${c.locality} · ${c.status}`, c.latitude, c.longitude, '#E11D48')
    );

    return list;
  }, [
    activeLayers,
    search,
    cityAreas,
    cityRoads,
    cityAssets,
    cityWaterFacilities,
    citySewerageAssets,
    cityWasteRoutes,
    cityProjects,
    cityComplaints
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const map = L.map(mapRef.current).setView([30.5333, 72.7000], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    geoItems.forEach((item) => {
      L.circleMarker([item.lat, item.lng], {
        radius: 8,
        fillColor: item.color,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.92
      })
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:12px;"><strong>${item.title}</strong><br/><span>${item.subtitle}</span><br/><small>${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}</small></div>`
        )
        .addTo(map);
    });

    importedFeatures.forEach((f) => {
      L.circleMarker([f.lat, f.lng], {
        radius: 7,
        fillColor: '#9333EA',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.85
      })
        .bindPopup(`<strong>GeoJSON: ${f.name}</strong><br/><small>${f.props}</small>`)
        .addTo(map);
    });

    map.on('click', (ev: L.LeafletMouseEvent) => {
      if (pickCoordsMode) {
        setPickedCoords({ lat: Number(ev.latlng.lat.toFixed(6)), lng: Number(ev.latlng.lng.toFixed(6)) });
      }
    });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [geoItems, importedFeatures, pickCoordsMode]);

  const handleExportGeoJson = () => {
    const fc = {
      type: 'FeatureCollection',
      features: geoItems.map((item) => ({
        type: 'Feature',
        properties: { name: item.title, details: item.subtitle, layer: item.layer },
        geometry: { type: 'Point', coordinates: [item.lng, item.lat] }
      }))
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chichawatni-city-gis-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${geoItems.length} verified GeoJSON features.`);
  };

  const handleImportGeoJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const feats = Array.isArray(json.features) ? json.features : [];
        const parsed: { name: string; lat: number; lng: number; props: string }[] = [];
        for (const f of feats) {
          const coords = f?.geometry?.coordinates;
          if (f?.geometry?.type === 'Point' && Array.isArray(coords) && coords.length >= 2) {
            parsed.push({
              name: String(f.properties?.name || f.properties?.title || 'Imported Feature'),
              lng: Number(coords[0]),
              lat: Number(coords[1]),
              props: JSON.stringify(f.properties || {}).slice(0, 120)
            });
          }
        }
        setImportedFeatures(parsed);
        setNotice(`Loaded ${parsed.length} GeoJSON Point markers onto preview layer.`);
      } catch {
        setNotice('Invalid GeoJSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveQuickArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedCoords || !quickAreaName.trim()) return;
    await saveCityArea({
      name: quickAreaName.trim(),
      wardCode: quickWardCode.trim() || 'W-NEW',
      zoneType: 'Mixed',
      latitude: pickedCoords.lat,
      longitude: pickedCoords.lng,
      notes: 'Pinpointed via City GIS Coordinate Picker'
    });
    setQuickAreaName('');
    setQuickWardCode('');
    setPickedCoords(null);
    setPickCoordsMode(false);
    setNotice('Saved new municipal area coordinate pin to Firestore.');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#087A43]">
            Chichawatni Spatial Registry (OpenStreetMap + Leaflet)
          </span>
          <h2 className="font-editorial text-lg font-bold text-[#123B28]">
            City GIS Map & Infrastructure Layer Explorer
          </h2>
          <p className="text-xs text-slate-500">
            Displays only verified GPS markers stored in Firestore or imported GeoJSON files. Center: 30.5333° N, 72.7000° E.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPickCoordsMode(!pickCoordsMode)}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border ${
              pickCoordsMode
                ? 'bg-[#C9A227] text-[#123B28] border-[#C9A227]'
                : 'bg-[#F7F9F7] text-[#123B28] border-slate-300'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>{pickCoordsMode ? 'Click Map to Capture GPS (Active)' : 'Pick GPS on Map'}</span>
          </button>

          <input ref={fileInputRef} type="file" accept=".geojson,.json" onChange={handleImportGeoJson} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#123B28] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#087A43]" />
            <span>Import GeoJSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportGeoJson}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#C9A227]" />
            <span>Export GeoJSON ({geoItems.length})</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-[#123B28] rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#087A43]" />
          <span>{notice}</span>
        </div>
      )}

      {pickedCoords && (
        <form onSubmit={handleSaveQuickArea} className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-wrap items-end gap-3 text-xs">
          <div>
            <span className="font-bold text-[#123B28] block mb-1">Captured GPS Coordinates</span>
            <span className="font-mono bg-white px-2.5 py-2 rounded-lg border border-amber-200 inline-block">
              {pickedCoords.lat}, {pickedCoords.lng}
            </span>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="font-bold text-slate-700 block mb-1">New Municipal Area Name</label>
            <input type="text" required value={quickAreaName} onChange={(e) => setQuickAreaName(e.target.value)} placeholder="e.g. Housing Colony Sector II" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          </div>
          <div className="w-32">
            <label className="font-bold text-slate-700 block mb-1">Ward / Code</label>
            <input type="text" value={quickWardCode} onChange={(e) => setQuickWardCode(e.target.value)} placeholder="W-04" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl" />
          </div>
          <button type="submit" className="min-h-[38px] px-4 py-2 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer">
            Save Area Marker
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Layer Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter map pins..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-[#F7F9F7] border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-[#123B28] pt-1">
            <Layers className="w-4 h-4 text-[#087A43]" />
            <span>Map Data Layers ({geoItems.length} pins)</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {LAYER_LABELS.map((layer) => (
              <label key={layer.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-[#F7F9F7] cursor-pointer">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayers[layer.id]}
                    onChange={(e) => setActiveLayers({ ...activeLayers, [layer.id]: e.target.checked })}
                    className="accent-[#087A43]"
                  />
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                  <span className="text-slate-700 font-medium">{layer.label}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3">
          <div ref={mapRef} className="w-full h-[520px] rounded-xl border border-slate-200 z-0" />
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#087A43]" />
              {geoItems.length === 0
                ? 'No GPS markers saved in active layers yet — use "Pick GPS on Map" or add coordinates in modules.'
                : `Rendering ${geoItems.length} verified markers on OpenStreetMap.`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
