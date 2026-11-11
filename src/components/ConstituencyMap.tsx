import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import {
  MapPin,
  Layers,
  Filter,
  Search,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

export const ConstituencyMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const { unionCouncils, villages, education, healthcare, infrastructure, projects, complaints } = useData();
  const { language } = useLanguage();

  const [activeLayer, setActiveLayer] = useState<'all' | 'health' | 'education' | 'infra' | 'projects' | 'complaints'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUC, setSelectedUC] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30.5333, 72.7000],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap | PP-203 GIS',
        maxZoom: 18,
      }).addTo(map);

      // PP-203 Boundary Polygon
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
        weight: 3,
        dashArray: '6, 6',
        fillColor: '#087A43',
        fillOpacity: 0.08,
      }).addTo(map).bindPopup('<b>PP-203 Constituency Boundary</b><br>Tehsil Chichawatni, District Sahiwal');

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {};
  }, []);

  // Update Markers based on Filters
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const createIcon = (bgHex: string, iconLabel: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: ${bgHex}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid #ffffff; font-size: 12px; font-weight: bold;">
            ${iconLabel}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });
    };

    const q = searchQuery.toLowerCase().trim();

    // 1. Union Councils
    if (activeLayer === 'all') {
      unionCouncils.forEach(uc => {
        if (selectedUC !== 'all' && uc.code !== selectedUC) return;
        if (q && !uc.name.toLowerCase().includes(q) && !uc.code.toLowerCase().includes(q)) return;

        const marker = L.marker([uc.latitude, uc.longitude], {
          icon: createIcon('#087A43', 'UC'),
        });
        marker.bindPopup(`
          <div style="font-family: inherit; max-width: 240px;">
            <div style="background: #087A43; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px;">
              ${uc.code} - ${language === 'ur' ? uc.nameUrdu : uc.name}
            </div>
            <div style="padding: 8px; font-size: 12px; line-height: 1.4;">
              <p><b>Type:</b> ${uc.type} Council</p>
              <p><b>HQ:</b> ${language === 'ur' ? uc.headquartersUrdu : uc.headquarters}</p>
              <p><b>Population:</b> ${uc.estimatedPopulation.toLocaleString()}</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 2. Healthcare Facilities
    if (activeLayer === 'all' || activeLayer === 'health') {
      healthcare.forEach(h => {
        if (selectedUC !== 'all' && h.unionCouncil !== selectedUC) return;
        if (q && !h.name.toLowerCase().includes(q) && !h.type.toLowerCase().includes(q)) return;

        const marker = L.marker([h.latitude, h.longitude], {
          icon: createIcon('#DC2626', '✚'),
        });
        marker.bindPopup(`
          <div style="font-family: inherit; max-width: 240px;">
            <div style="background: #DC2626; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px;">
              ${language === 'ur' ? h.nameUrdu : h.name}
            </div>
            <div style="padding: 8px; font-size: 12px; line-height: 1.4;">
              <p><b>Type:</b> ${h.type}</p>
              <p><b>Beds:</b> ${h.beds} | <b>Doctors:</b> ${h.doctorsAvailable}</p>
              <p><b>Emergency:</b> ${h.emergency24h ? '24/7 Active' : 'Day OPD'}</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 3. Education Facilities
    if (activeLayer === 'all' || activeLayer === 'education') {
      education.forEach(e => {
        if (selectedUC !== 'all' && e.unionCouncil !== selectedUC) return;
        if (q && !e.name.toLowerCase().includes(q) && !e.level.toLowerCase().includes(q)) return;

        const marker = L.marker([e.latitude, e.longitude], {
          icon: createIcon('#2563EB', '🎓'),
        });
        marker.bindPopup(`
          <div style="font-family: inherit; max-width: 240px;">
            <div style="background: #2563EB; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px;">
              ${language === 'ur' ? e.nameUrdu : e.name}
            </div>
            <div style="padding: 8px; font-size: 12px; line-height: 1.4;">
              <p><b>Level:</b> ${e.level} (${e.gender})</p>
              <p><b>Enrollment:</b> ${e.enrollment.toLocaleString()} students</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 4. Infrastructure & Water
    if (activeLayer === 'all' || activeLayer === 'infra') {
      infrastructure.forEach(inf => {
        if (selectedUC !== 'all' && inf.unionCouncil !== selectedUC) return;
        if (q && !inf.name.toLowerCase().includes(q) && !inf.category.toLowerCase().includes(q)) return;

        const marker = L.marker([inf.latitude, inf.longitude], {
          icon: createIcon('#D97706', '⚙'),
        });
        marker.bindPopup(`
          <div style="font-family: inherit; max-width: 240px;">
            <div style="background: #D97706; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px;">
              ${language === 'ur' ? inf.nameUrdu : inf.name}
            </div>
            <div style="padding: 8px; font-size: 12px; line-height: 1.4;">
              <p><b>Category:</b> ${inf.category}</p>
              <p><b>Condition:</b> ${inf.condition}</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 5. Development Projects
    if (activeLayer === 'all' || activeLayer === 'projects') {
      projects.forEach(p => {
        if (selectedUC !== 'all' && p.unionCouncil !== selectedUC) return;
        if (q && !p.title.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return;

        const marker = L.marker([p.latitude, p.longitude], {
          icon: createIcon('#7C3AED', '🏗'),
        });
        marker.bindPopup(`
          <div style="font-family: inherit; max-width: 250px;">
            <div style="background: #7C3AED; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px;">
              ${language === 'ur' ? p.titleUrdu : p.title}
            </div>
            <div style="padding: 8px; font-size: 12px; line-height: 1.4;">
              <p><b>Status:</b> ${p.status} (${p.progressPercent}%)</p>
              <p><b>Budget:</b> ${p.budget}</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }

    // 6. Complaint Hotspots
    if (activeLayer === 'all' || activeLayer === 'complaints') {
      complaints.forEach(c => {
        if (!c.latitude || !c.longitude) return;
        if (selectedUC !== 'all' && c.unionCouncil !== selectedUC) return;
        if (q && !c.description.toLowerCase().includes(q) && !c.trackingId.toLowerCase().includes(q)) return;

        const marker = L.marker([c.latitude, c.longitude], {
          icon: createIcon(c.status === 'Resolved' ? '#16A34A' : '#EA580C', '!'),
        });
        marker.bindPopup(`
          <div style="font-family: inherit; max-width: 220px;">
            <div style="background: ${c.status === 'Resolved' ? '#16A34A' : '#EA580C'}; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 13px;">
              ${c.trackingId} [${c.status}]
            </div>
            <div style="padding: 8px; font-size: 12px;">
              <p><b>Sector:</b> ${c.category}</p>
              <p><b>Area:</b> ${c.locality}</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }
  }, [activeLayer, searchQuery, selectedUC, unionCouncils, education, healthcare, infrastructure, projects, complaints, language]);

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border border-emerald-950/10 overflow-hidden w-full ${
      isFullscreen
        ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
        : 'h-[400px] xs:h-[460px] sm:h-[540px] lg:h-[640px]'
    }`}>
      {/* Top Map Toolbar (Responsive) */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Search + UC Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200 flex-1 max-w-full sm:max-w-md">
            <div className="relative flex-1 min-w-[130px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ur' ? 'ادارہ یا چک تلاش کریں...' : 'Search facility or chak...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 min-h-[44px]"
              />
            </div>

            <select
              value={selectedUC}
              onChange={(e) => setSelectedUC(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-700 min-h-[44px] max-w-[130px] truncate"
            >
              <option value="all">{language === 'ur' ? 'تمام کونسلز' : 'All UCs'}</option>
              {unionCouncils.map(uc => (
                <option key={uc.code} value={uc.code}>
                  {uc.code}
                </option>
              ))}
            </select>
          </div>

          {/* Right utility buttons: Legend toggle & Fullscreen */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="bg-white/95 backdrop-blur-md px-3 py-2 min-h-[44px] rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition flex items-center gap-1"
              title="Toggle Map Legend"
            >
              <Info className="w-4 h-4 text-emerald-700" />
              <span className="hidden xs:inline">Legend</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white/95 backdrop-blur-md w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 transition flex items-center justify-center"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Horizontal Layer Buttons (Touch Friendly 44px) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 pointer-events-auto scrollbar-none">
          {[
            { id: 'all', label: language === 'ur' ? 'تمام' : 'All', color: 'bg-slate-800' },
            { id: 'health', label: language === 'ur' ? 'صحت' : 'Health', color: 'bg-red-600' },
            { id: 'education', label: language === 'ur' ? 'تعلیم' : 'Education', color: 'bg-blue-600' },
            { id: 'infra', label: language === 'ur' ? 'انفراسٹرکچر' : 'Infra', color: 'bg-amber-600' },
            { id: 'projects', label: language === 'ur' ? 'منصوبے' : 'Projects', color: 'bg-purple-600' },
            { id: 'complaints', label: language === 'ur' ? 'شکایات' : 'Needs', color: 'bg-orange-600' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveLayer(btn.id as any)}
              className={`text-xs px-3.5 py-2 min-h-[44px] rounded-xl font-semibold whitespace-nowrap transition shadow-xs flex items-center justify-center ${
                activeLayer === btn.id
                  ? `${btn.color} text-white shadow-sm`
                  : 'bg-white/95 backdrop-blur-md text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Responsive Collapsible Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 z-20 pointer-events-auto bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs max-w-xs animate-fade-in">
          <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
            <span>{language === 'ur' ? 'علامات و نقشہ گائیڈ' : 'Map Legend'}</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#087A43] shrink-0 inline-block" />
              <span className="truncate">Union Council</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#DC2626] shrink-0 inline-block" />
              <span className="truncate">Health Care</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2563EB] shrink-0 inline-block" />
              <span className="truncate">Schools</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#D97706] shrink-0 inline-block" />
              <span className="truncate">Water/Roads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#7C3AED] shrink-0 inline-block" />
              <span className="truncate">Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#EA580C] shrink-0 inline-block" />
              <span className="truncate">Complaint</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
