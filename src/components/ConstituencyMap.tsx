import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { getAssetUrl, CHICHAWATNI_SCENE_PATH } from '../utils/assetUrl';
import { Search, Maximize2, Minimize2, Info } from 'lucide-react';

export const ConstituencyMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const { unionCouncils, education, healthcare, projects } = useData();
  const { language } = useLanguage();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const projectCategories = [
    'Roads and Infrastructure',
    'Education',
    'Healthcare',
    'Clean Drinking Water',
    'Electricity',
    'Sanitation',
    'Public Facilities'
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number | null };
    if (container._leaflet_id && !mapInstanceRef.current) {
      container._leaflet_id = null;
    }

    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [30.5333, 72.7000],
          zoom: 12,
          zoomControl: true,
          scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap | PP-203 Chichawatni GIS',
          maxZoom: 18
        }).addTo(map);

        // PP-203 Chichawatni Constituency Perimeter
        const boundaryCoords: [number, number][] = [
          [30.6200, 72.7100],
          [30.6050, 72.7900],
          [30.5650, 72.8450],
          [30.4900, 72.7800],
          [30.4300, 72.6900],
          [30.4400, 72.6000],
          [30.5100, 72.5850],
          [30.5800, 72.6350],
          [30.6200, 72.7100]
        ];

        L.polygon(boundaryCoords, {
          color: '#087A43',
          weight: 2.5,
          dashArray: '6, 6',
          fillColor: '#087A43',
          fillOpacity: 0.06
        })
          .addTo(map)
          .bindPopup(
            '<b>PP-203 Chichawatni Boundary</b><br>District Sahiwal, Punjab, Pakistan'
          );

        layerGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Leaflet initialization notice:', err);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    const createIcon = (bgHex: string, label: string) =>
      L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background:${bgHex};color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #C9A227;font-size:11px;font-weight:700;box-shadow:0 3px 8px rgba(0,0,0,0.3);">${label}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
      });

    const q = searchQuery.toLowerCase().trim();

    // 1. Development Projects with Rich Photo + Budget + Progress + Status Popups
    projects.forEach((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return;
      if (statusFilter !== 'all' && p.status !== statusFilter) return;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q) &&
        !p.unionCouncil.toLowerCase().includes(q)
      ) {
        return;
      }

      const color =
        p.status === 'Completed'
          ? '#087A43'
          : p.status === 'In Progress'
          ? '#C9A227'
          : '#123B28';
      const photoUrl = getAssetUrl(p.imageUrl || CHICHAWATNI_SCENE_PATH);
      const safeTitle = (language === 'ur' ? p.titleUrdu : p.title).replace(/</g, '&lt;');

      const marker = L.marker([p.latitude, p.longitude], {
        icon: createIcon(color, 'PRJ')
      });

      marker.bindPopup(`
        <div style="width:240px;font-family:inherit;">
          <img src="${photoUrl}" alt="${safeTitle}" style="width:100%;height:105px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />
          <div style="font-size:10px;font-weight:700;color:#087A43;text-transform:uppercase;margin-bottom:3px;">${p.category} · ${p.unionCouncil}</div>
          <div style="font-size:13px;font-weight:700;color:#123B28;line-height:1.3;margin-bottom:6px;">${safeTitle}</div>
          <div style="font-size:11px;color:#334155;line-height:1.5;">
            <div><b>Budget:</b> ${p.budget}</div>
            <div><b>Progress:</b> ${p.progressPercent}%</div>
            <div><b>Status:</b> ${p.status}</div>
          </div>
        </div>
      `);
      layerGroupRef.current?.addLayer(marker);
    });

    // 2. Union Council Centers (shown when categoryFilter is 'all')
    if (categoryFilter === 'all' && statusFilter === 'all') {
      unionCouncils.forEach((uc) => {
        if (q && !uc.name.toLowerCase().includes(q) && !uc.code.toLowerCase().includes(q)) return;
        const marker = L.marker([uc.latitude, uc.longitude], {
          icon: createIcon('#123B28', 'UC')
        });
        marker.bindPopup(`
          <div style="max-width:220px;font-size:12px;">
            <div style="font-weight:700;color:#123B28;margin-bottom:4px;">${uc.code} — ${
          language === 'ur' ? uc.nameUrdu : uc.name
        }</div>
            <div><b>Type:</b> ${uc.type} Council</div>
            <div><b>Population:</b> ${uc.estimatedPopulation.toLocaleString()}</div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });

      healthcare.forEach((h) => {
        if (q && !h.name.toLowerCase().includes(q)) return;
        const marker = L.marker([h.latitude, h.longitude], {
          icon: createIcon('#B91C1C', '+')
        });
        marker.bindPopup(`
          <div style="max-width:220px;font-size:12px;">
            <div style="font-weight:700;color:#B91C1C;margin-bottom:4px;">${
              language === 'ur' ? h.nameUrdu : h.name
            }</div>
            <div><b>Type:</b> ${h.type}</div>
            <div><b>Beds:</b> ${h.beds} | <b>Doctors:</b> ${h.doctorsAvailable}</div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });

      education.forEach((e) => {
        if (q && !e.name.toLowerCase().includes(q)) return;
        const marker = L.marker([e.latitude, e.longitude], {
          icon: createIcon('#1D4ED8', 'E')
        });
        marker.bindPopup(`
          <div style="max-width:220px;font-size:12px;">
            <div style="font-weight:700;color:#1D4ED8;margin-bottom:4px;">${
              language === 'ur' ? e.nameUrdu : e.name
            }</div>
            <div><b>Level:</b> ${e.level}</div>
            <div><b>Enrollment:</b> ${e.enrollment.toLocaleString()}</div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }
  }, [categoryFilter, statusFilter, searchQuery, projects, unionCouncils, healthcare, education, language]);

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[430px] sm:h-[560px] lg:h-[620px]'
      }`}
    >
      {/* Responsive Map Filters Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          <div className="flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200 flex-1 max-w-2xl">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ur' ? 'منصوبہ یا علاقہ تلاش کریں...' : 'Search project or UC...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-2 text-xs bg-[#F7F9F7] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#087A43] min-h-[40px]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter map by project category"
              className="text-xs bg-[#F7F9F7] border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 min-h-[40px]"
            >
              <option value="all">{language === 'ur' ? 'تمام شعبے' : 'All Categories'}</option>
              {projectCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter map by project status"
              className="text-xs bg-[#F7F9F7] border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 min-h-[40px]"
            >
              <option value="all">{language === 'ur' ? 'تمام صورتحال' : 'All Statuses'}</option>
              <option value="Proposed">Proposed</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="bg-white/95 backdrop-blur-md px-3 py-2 min-h-[44px] rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#087A43] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#087A43]" />
              <span className="hidden xs:inline">Legend</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white/95 backdrop-blur-md w-11 h-11 rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-[#087A43] transition flex items-center justify-center cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Mount */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Collapsible Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 pointer-events-auto bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200 text-xs max-w-xs">
          <div className="font-bold text-[#123B28] mb-2 flex items-center justify-between">
            <span>{language === 'ur' ? 'نقشہ کی علامات' : 'GIS Map Legend'}</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#087A43] inline-block" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#C9A227] inline-block" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#123B28] inline-block" />
              <span>UC / Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#B91C1C] inline-block" />
              <span>Healthcare</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
