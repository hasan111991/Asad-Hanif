import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Layers, Filter, Search, Maximize2, Minimize2, Hospital, GraduationCap, HardHat, Droplets, AlertTriangle } from 'lucide-react';

export const ConstituencyMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const { unionCouncils, villages, education, healthcare, infrastructure, projects, complaints } = useData();
  const { language, isRTL } = useLanguage();

  const [activeLayer, setActiveLayer] = useState<'all' | 'health' | 'education' | 'infra' | 'projects' | 'complaints'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUC, setSelectedUC] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | PP-203 GIS Portal',
        maxZoom: 18,
      }).addTo(map);

      // PP-203 Approximate Constituency Boundary Polygon
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
        fillOpacity: 0.07,
      }).addTo(map).bindPopup('<b>PP-203 Constituency Boundary</b><br>Tehsil Chichawatni, District Sahiwal');

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance mounted across normal renders
    };
  }, []);

  // Update Markers based on Filters
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    // Custom Icon Generator
    const createIcon = (bgHex: string, iconLabel: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: ${bgHex}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff; font-size: 13px; font-weight: bold;">
            ${iconLabel}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
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
          <div style="font-family: inherit; min-width: 200px;">
            <div style="background: #087A43; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${uc.code} - ${language === 'ur' ? uc.nameUrdu : uc.name}
            </div>
            <div style="padding: 8px; font-size: 12px;">
              <p><b>Type:</b> ${uc.type} Council</p>
              <p><b>Headquarters:</b> ${language === 'ur' ? uc.headquartersUrdu : uc.headquarters}</p>
              <p><b>Est. Population:</b> ${uc.estimatedPopulation.toLocaleString()}</p>
              <p><b>Chaks/Localities:</b> ${uc.villagesCount}</p>
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
          <div style="font-family: inherit; min-width: 220px;">
            <div style="background: #DC2626; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${language === 'ur' ? h.nameUrdu : h.name}
            </div>
            <div style="padding: 8px; font-size: 12px; line-height: 1.5;">
              <p><b>Category:</b> ${h.type}</p>
              <p><b>Beds:</b> ${h.beds} | <b>Doctors:</b> ${h.doctorsAvailable}</p>
              <p><b>24/7 Emergency:</b> ${h.emergency24h ? 'Yes (Active)' : 'No'}</p>
              <p><b>Ambulance:</b> ${h.ambulanceAvailable ? 'Available' : 'None'}</p>
              <p><b>Condition:</b> <span style="color: ${h.condition === 'Functional' ? '#16A34A' : '#D97706'}">${h.condition}</span></p>
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
          <div style="font-family: inherit; min-width: 220px;">
            <div style="background: #2563EB; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${language === 'ur' ? e.nameUrdu : e.name}
            </div>
            <div style="padding: 8px; font-size: 12px;">
              <p><b>Level:</b> ${e.level} (${e.gender})</p>
              <p><b>Sector:</b> ${e.sector}</p>
              <p><b>Enrollment:</b> ${e.enrollment.toLocaleString()} students</p>
              <p><b>Faculty:</b> ${e.teachersCount} teachers</p>
              <p><b>Condition:</b> ${e.condition}</p>
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
          <div style="font-family: inherit; min-width: 220px;">
            <div style="background: #D97706; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${language === 'ur' ? inf.nameUrdu : inf.name}
            </div>
            <div style="padding: 8px; font-size: 12px;">
              <p><b>Type:</b> ${inf.category}</p>
              <p><b>Location:</b> ${inf.location}</p>
              <p><b>Condition:</b> ${inf.condition}</p>
              <p style="color: #64748B; font-size: 11px;">${inf.notes}</p>
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
          <div style="font-family: inherit; min-width: 230px;">
            <div style="background: #7C3AED; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${language === 'ur' ? p.titleUrdu : p.title}
            </div>
            <div style="padding: 8px; font-size: 12px;">
              <p><b>Status:</b> ${p.status} (${p.progressPercent}%)</p>
              <p><b>Budget:</b> ${p.budget}</p>
              <p><b>Department:</b> ${p.department}</p>
              <p style="color: #475569; font-size: 11px;">${p.location}</p>
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
          <div style="font-family: inherit; min-width: 200px;">
            <div style="background: ${c.status === 'Resolved' ? '#16A34A' : '#EA580C'}; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${c.trackingId} [${c.status}]
            </div>
            <div style="padding: 8px; font-size: 12px;">
              <p><b>Category:</b> ${c.category}</p>
              <p><b>Locality:</b> ${c.locality}</p>
              <p style="font-size: 11px; color: #334155;">"${c.description.substring(0, 75)}..."</p>
            </div>
          </div>
        `);
        layerGroupRef.current?.addLayer(marker);
      });
    }
  }, [activeLayer, searchQuery, selectedUC, unionCouncils, education, healthcare, infrastructure, projects, complaints, language]);

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border border-emerald-950/10 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[640px]'}`}>
      {/* Top Map Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Layer selector & Search */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'ur' ? 'علاقہ یا ادارہ تلاش کریں...' : 'Search facility or village...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-44 md:w-56"
            />
          </div>

          <select
            value={selectedUC}
            onChange={(e) => setSelectedUC(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-700"
          >
            <option value="all">{language === 'ur' ? 'تمام یونین کونسلز' : 'All Union Councils'}</option>
            {unionCouncils.map(uc => (
              <option key={uc.code} value={uc.code}>
                {uc.code} - {language === 'ur' ? uc.nameUrdu : uc.name}
              </option>
            ))}
          </select>

          {/* Layer Filter Buttons */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2">
            {[
              { id: 'all', label: language === 'ur' ? 'سب' : 'All', color: 'bg-slate-800' },
              { id: 'health', label: language === 'ur' ? 'صحت' : 'Health', color: 'bg-red-600' },
              { id: 'education', label: language === 'ur' ? 'تعلیم' : 'Education', color: 'bg-blue-600' },
              { id: 'infra', label: language === 'ur' ? 'انفراسٹرکچر' : 'Infra', color: 'bg-amber-600' },
              { id: 'projects', label: language === 'ur' ? 'منصوبے' : 'Projects', color: 'bg-purple-600' },
              { id: 'complaints', label: language === 'ur' ? 'شکایات' : 'Needs', color: 'bg-orange-600' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveLayer(btn.id as any)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeLayer === btn.id
                    ? `${btn.color} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="pointer-events-auto bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 text-xs hidden sm:block max-w-xs">
        <div className="font-semibold text-slate-800 mb-2 flex items-center justify-between">
          <span>{language === 'ur' ? 'علامات و نقشہ گائیڈ' : 'GIS Legend & Markers'}</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">PP-203</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#087A43] inline-block" />
            <span>{language === 'ur' ? 'یونین کونسل' : 'Union Council'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block" />
            <span>{language === 'ur' ? 'ہسپتال / بی ایچ یو' : 'Health Facility'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2563EB] inline-block" />
            <span>{language === 'ur' ? 'اسکول و کالجز' : 'Schools & Colleges'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#D97706] inline-block" />
            <span>{language === 'ur' ? 'صاف پانی و سڑکیں' : 'Water & Roads'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#7C3AED] inline-block" />
            <span>{language === 'ur' ? 'ترقیاتی منصوبہ' : 'Dev Project'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#EA580C] inline-block" />
            <span>{language === 'ur' ? 'عوامی شکایت' : 'Complaint Spot'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
