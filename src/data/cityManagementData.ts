import {
  CityComplaintCategory,
  CityComplaintStatus,
  CityDepartment,
  CityFundingSource,
  CityProject,
  CityProjectStatus,
  CityReportType,
  MasterPlanSectorCode
} from '../types';

export interface MasterPlanSectorMeta {
  code: MasterPlanSectorCode;
  name: string;
  nameUrdu: string;
  color: string;
  focus: string;
}

export const MASTER_PLAN_SECTORS: MasterPlanSectorMeta[] = [
  { code: 'A', name: 'Roads & Transportation', nameUrdu: 'سڑکیں اور ٹرانسپورٹ', color: '#087A43', focus: 'Arterial paving, bypass links, traffic nodes & pedestrian safety' },
  { code: 'B', name: 'Water Supply', nameUrdu: 'صاف پانی کی فراہمی', color: '#0284C7', focus: 'Filtration plants, tube wells, pressure lines & water quality testing' },
  { code: 'C', name: 'Sewerage & Drainage', nameUrdu: 'سیوریج اور نکاسی آب', color: '#0369A1', focus: 'Trunk sewers, disposal stations, desilting & monsoon drainage' },
  { code: 'D', name: 'Solid Waste Management', nameUrdu: 'صفائی اور سالڈ ویسٹ', color: '#15803D', focus: 'Primary collection routes, transfer points, fleet & disposal sites' },
  { code: 'E', name: 'Education', nameUrdu: 'تعلیم', color: '#7C3AED', focus: 'Schools missing facilities, STEM/IT labs, libraries & technical institutes' },
  { code: 'F', name: 'Healthcare', nameUrdu: 'صحت', color: '#DC2626', focus: 'THQ upgrades, BHUs, Mother & Child centers, emergency & diagnostics' },
  { code: 'G', name: 'Agriculture & Livestock Coordination', nameUrdu: 'زراعت اور لائیو اسٹاک', color: '#65A30D', focus: 'Grain market links, veterinary coordination, water channels & peri-urban cold chain' },
  { code: 'H', name: 'Parks & Public Spaces', nameUrdu: 'پارکس اور عوامی مقامات', color: '#059669', focus: 'Family parks, playgrounds, green belts & public washrooms' },
  { code: 'I', name: 'Energy & Environment', nameUrdu: 'توانائی اور ماحولیات', color: '#D97706', focus: 'Solar streetlights, solarized water pumps & urban tree plantation' },
  { code: 'J', name: 'Youth, Sports & Skills Development', nameUrdu: 'نوجوان، کھیل اور ہنر', color: '#2563EB', focus: 'Sports complexes, vocational centers & youth digital skill hubs' },
  { code: 'K', name: 'Business, Markets & Employment', nameUrdu: 'کاروبار، مارکیٹس اور روزگار', color: '#B45309', focus: 'Organized bazaars, commercial parking, loading bays & SME facilitation' },
  { code: 'L', name: 'Digital Governance & Public Safety', nameUrdu: 'ڈیجیٹل گورننس اور عوامی تحفظ', color: '#123B28', focus: 'GIS mapping, citizen grievance redressal, streetlights & CCTV coordination' }
];

export const CITY_PROJECT_STATUSES: CityProjectStatus[] = [
  'Proposed',
  'Under Survey',
  'Feasibility in Progress',
  'Submitted for Approval',
  'Approved',
  'Funding Requested',
  'Funds Released',
  'Tendering',
  'In Progress',
  'Delayed',
  'Completed',
  'Cancelled'
];

export const OFFICIAL_APPROVED_PROJECT_STATUSES: CityProjectStatus[] = [
  'Approved',
  'Funding Requested',
  'Funds Released',
  'Tendering',
  'In Progress',
  'Delayed',
  'Completed'
];

export const CITY_FUNDING_SOURCES: CityFundingSource[] = [
  'Punjab Government',
  'Federal Government',
  'Municipal Funds',
  'Departmental Maintenance Budget',
  'Corporate CSR',
  'Registered Welfare Organizations',
  'Public-Private Partnership',
  'Other Verified Sources'
];

export const CITY_COMPLAINT_CATEGORIES: CityComplaintCategory[] = [
  'Garbage',
  'Sewerage',
  'Roads',
  'Drinking Water',
  'Streetlights',
  'Traffic',
  'Parks',
  'Public Facilities',
  'Encroachment',
  'Other Municipal Issues'
];

export const CITY_COMPLAINT_STATUSES: CityComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Awaiting Verification',
  'Resolved',
  'Reopened',
  'Rejected'
];

export const CITY_REPORT_TYPES: CityReportType[] = [
  'Daily Sanitation Report',
  'Weekly Complaint Resolution Report',
  'Monthly Department Performance Report',
  'Quarterly Development Progress Report',
  'Annual City Development Report',
  'Sector-Wise Progress Report',
  'Budget Utilization Report',
  'Road Condition Assessment Report',
  'Water & Sewerage Status Report',
  'Public Facility Condition Report'
];

// 13 Municipal & Provincial Coordination Departments (structural baseline; contacts must be verified by Secretariat)
export const STRUCTURAL_CITY_DEPARTMENTS: Omit<CityDepartment, 'id' | 'updatedAt'>[] = [
  {
    name: 'Municipal Committee Chichawatni (MC)',
    nameUrdu: 'میونسپل کمیٹی چیچہ وطنی',
    jurisdiction: 'Municipal streets, drainage, streetlights, building control, parks & bazaars',
    officeAddress: 'Municipal Committee Complex, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'District Administration (DC Office Sahiwal / AC Chichawatni)',
    nameUrdu: 'ضلعی انتظامیہ / اسسٹنٹ کمشنر آفس چیچہ وطنی',
    jurisdiction: 'Tehsil revenue, price control, anti-encroachment & inter-departmental coordination',
    officeAddress: 'Tehsil Complex, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'Public Health Engineering Department (PHED)',
    nameUrdu: 'محکمہ پبلک ہیلتھ انجینئرنگ',
    jurisdiction: 'Water supply lines, tube wells, filtration plants & municipal sewerage schemes',
    officeAddress: 'District Sahiwal / Sub-Division Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'Provincial Highways & Communication & Works (C&W)',
    nameUrdu: 'محکمہ ہائی ویز اینڈ سی اینڈ ڈبلیو',
    jurisdiction: 'Major highways, GT Road arteries, canal bridges & inter-city links',
    officeAddress: 'Sub-Division Office, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'Solid Waste Management Company / MC Sanitation Wing',
    nameUrdu: 'سالڈ ویسٹ مینجمنٹ و صفائی ونگ',
    jurisdiction: 'Primary & secondary waste collection routes, transfer stations & fleet',
    officeAddress: 'MC Sanitation Yard, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'District Health Authority (DHA) & THQ Hospital Chichawatni',
    nameUrdu: 'ڈسٹرکٹ ہیلتھ اتھارٹی و ٹی ایچ کیو ہسپتال',
    jurisdiction: 'THQ Hospital, dispensaries, BHUs, RHCs & immunization programs',
    officeAddress: 'THQ Hospital Campus, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'School Education & Higher Education Department',
    nameUrdu: 'محکمہ اسکول ایجوکیشن و ہائر ایجوکیشن',
    jurisdiction: 'Government schools, colleges, classrooms, laboratories & missing facilities',
    officeAddress: 'Dy. DEO Office, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'TEVTA / Technical & Vocational Training Coordination',
    nameUrdu: 'ٹیوٹا و فنی تربیتی ادارے',
    jurisdiction: 'Youth vocational training, technical institutes & computer skill labs',
    officeAddress: 'Government Technical Training Center, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'MEPCO (Multan Electric Power Company)',
    nameUrdu: 'میپکو چیچہ وطنی ڈویژن',
    jurisdiction: 'Power feeders, transformers, pole shifting & streetlight grid supply coordination',
    officeAddress: 'MEPCO XEN Office, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'SNGPL (Sui Northern Gas Pipelines Limited)',
    nameUrdu: 'سوئی ناردرن گیس پائپ لائنز',
    jurisdiction: 'Gas pipeline maintenance, road-cut restoration & pressure coordination',
    officeAddress: 'SNGPL Sub-Office, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'Punjab Traffic Police — Chichawatni Sector',
    nameUrdu: 'ٹریفک پولیس چیچہ وطنی',
    jurisdiction: 'Junction signalization, bazaar congestion management & pedestrian safety',
    officeAddress: 'Traffic Police Sector Office, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'Punjab Police — Tehsil Chichawatni Division',
    nameUrdu: 'پنجاب پولیس چیچہ وطنی',
    jurisdiction: 'Public safety coordination, bazaar patrolling & civic security support',
    officeAddress: 'SDPO Office, Chichawatni',
    isIndependentControlDisclaimer: true
  },
  {
    name: 'Agriculture, Irrigation & Livestock Departments',
    nameUrdu: 'محکمہ زراعت، آبپاشی و لائیو اسٹاک',
    jurisdiction: 'Canal minors, grain market coordination, veterinary hospitals & rural links',
    officeAddress: 'Tehsil Agriculture & Veterinary Complex, Chichawatni',
    isIndependentControlDisclaimer: true
  }
];

/**
 * OPTIONAL PLANNING TEMPLATE PACK (100 structured planning placeholders across Sectors A-L).
 * NEVER seeded automatically on app load and NEVER marked Approved/Funded.
 * Administrators may optionally import these clearly labeled "Sample Template" proposals
 * to structure the 2027-2030 Master Plan pipeline, then verify, estimate, and edit real data.
 */
const SECTOR_TEMPLATE_TOPICS: Record<MasterPlanSectorCode, string[]> = {
  A: [
    'G.T. Road Service Lane Rehabilitation',
    'College Road & Chowk Resurfacing Proposal',
    'Railway Station Approach Road Widening',
    'Okanwala Road Urban Belt Drainage & Paving',
    'Burewala Road Commercial Corridor Improvement',
    'Kassowal Link Junction Safety Redesign',
    'Harappa-Chichawatni Peri-Urban Link Upgrade',
    'Pedestrian Footpath & Curb Accessibility Program',
    'Canal Bridge Approach Expansion Feasibility'
  ],
  B: [
    'Municipal Water Filtration Plant — Block A Zone',
    'Drinking Water Pipeline Replacement (Old Abadi)',
    'Solarized Borehole & Overhead Tank Assessment',
    'Clean Water Testing & Chlorination Unit',
    'Main Bazaar Pressure Boosting Line Proposal',
    'School Drinking Water Cooler & RO Integration',
    'Colony Zone Tube Well Rehabilitation',
    'Water Leakage Telemetry & Valve Mapping'
  ],
  C: [
    'Stormwater Drainage Master Trunk Survey',
    'Main Disposal Pumping Station Generator Backup',
    'Covered RCC Drain — Railway Bazaar Sector',
    'Monsoon Flooding Hotspot Culvert Expansion',
    'Old City Sewerage Line Desilting & Replacement',
    'Industrial Belt Effluent Pretreatment Screening',
    'Manhole Cover & Safety Grating Standardization',
    'Low-Lying Mohallah Outfall Carrier Drain'
  ],
  D: [
    'Ward-Wise Door-to-Door Waste Collection Zoning',
    'Secondary Waste Transfer Station Screening Wall',
    'Compactor & Tractor-Trolley Fleet Maintenance Yard',
    'Commercial Bazaar Night-Sweeping Program',
    'Covered Container Points Installation Plan',
    'Biodegradable Market Waste Composting Pilot',
    'Sanitation Worker Protective Gear & Registry',
    'Scientific Landfill Site Selection Feasibility'
  ],
  E: [
    'Government High School Additional Classrooms Block',
    'Girls Degree College Science & Computer Lab Upgrade',
    'Public Library Digital Reading Hall Expansion',
    'Primary School Boundary Wall & Washroom Drive',
    'City Model School Solar Power Backup Proposal',
    'Career Counseling & Exam Prep Resource Corner',
    'Inclusive Ramp & Drinking Water Access in Schools',
    'Teachers Smart Classroom Equipment Request'
  ],
  F: [
    'THQ Hospital Emergency Ward Triage Expansion',
    'Mother & Child Healthcare Center Diagnostic Equipment',
    'Peri-Urban Dispensary Essential Medicine Logistics',
    'THQ Hospital Clean Water & Waiting Shed Improvement',
    'Mobile Health Outreach Scheduling Coordination',
    'Public Ambulance Bay & Emergency Access Lane',
    'Dengue & Seasonal Vector Control Coordination Plan',
    'Blood Screening & Lab Modernization Proposal'
  ],
  G: [
    'Grain Market Access Road & Drainage Coordination',
    'Tehsil Veterinary Hospital Shed & Cold-Chain Support',
    'Canal Distributary Desilting Coordination Schedule',
    'Farmer Advisory & Soil Testing Camp Facilitation',
    'Livestock Vaccination Camp Logistics Support',
    'Agri-Input Quality Inspection Coordination Cell',
    'Subzi & Fruit Mandi Sanitation & Shed Upgrade',
    'Dairy Cluster Hygiene & Fodder Market Layout'
  ],
  H: [
    'City Central Family Park Jogging Track & Benches',
    'Children Playgrounds Inclusive Swings & Turf',
    'Canal Bank Green Belt & Walkway Plantation',
    'Tehsil Football & Cricket Ground Lighting & Pavilion',
    'Public Washroom & Drinking Water Kiosk in Parks',
    'Senior Citizen Shaded Seating Corner',
    'Neighborhood Pocket Parks Rehabilitation',
    'Native Shade Tree Urban Forestry Drive'
  ],
  I: [
    'Main Boulevard Solar Streetlight Conversion Phase-I',
    'Bazaar Solar Backup for Emergency Lighting',
    'Municipal Office Rooftop Solar Net-Metering',
    'Tube Well Solar Hybrid Conversion Feasibility',
    'Anti-Smog Urban Dust Control & Plantation Plan',
    'Energy-Efficient LED Retrofit for Public Buildings',
    'Clean Air & Traffic Emissions Awareness Campaign',
    'Public Park Solar Illumination Program'
  ],
  J: [
    'Youth Digital Skills & E-Commerce Incubation Lab',
    'TEVTA Short-Course Equipment Modernization',
    'Tehsil Youth Indoor Badminton & Table Tennis Hall',
    'Girls Vocational Stitching & Handicraft Training Wing',
    'Annual Inter-School Athletics & Cricket Tournament',
    'Freelancing & Coding Bootcamp Sponsorship Window',
    'Youth Volunteer Civic Cleanliness Brigades',
    'Apprenticeship Linkage with Local Industry'
  ],
  K: [
    'Main Bazaar Parking Plaza Feasibility Assessment',
    'Organized Fruit & Vegetable Vendor Cart Zone',
    'Truck & Mandi Loading/Unloading Off-Peak Bay',
    'Commercial Market Public Toilet & Cleanliness Unit',
    'Small Trader Facilitation & License Helpdesk',
    'Industrial Estate Drainage & Power Coordination',
    'Women Entrepreneur Bazaar Display Corner',
    'Cold Storage & Warehouse Access Road Proposal'
  ],
  L: [
    'GIS Parcel & Utility Asset Digital Registry',
    'Unified Citizen Complaint Tracking & Escalation Hub',
    'Key Chowk Safe-City CCTV & Lighting Coordination',
    'Monthly Open-Data City Performance Dashboard',
    'QR-Coded Municipal Service Directory Boards',
    'Emergency Flood & Heatwave Citizen Alert System',
    'Digitized Field Inspection & Photo Verification App',
    'Bilingual Urdu/English Public Service Portal'
  ]
};

export function generateSampleCityProjectTemplates(): Omit<CityProject, 'id'>[] {
  const now = new Date().toISOString();
  const list: Omit<CityProject, 'id'>[] = [];
  let seq = 1;
  const years: (2027 | 2028 | 2029 | 2030)[] = [2027, 2028, 2029, 2030];

  for (const sectorMeta of MASTER_PLAN_SECTORS) {
    const topics = SECTOR_TEMPLATE_TOPICS[sectorMeta.code] || [];
    for (const topic of topics) {
      const code = `CW-2030-${String(seq).padStart(3, '0')}`;
      const year = years[(seq - 1) % years.length];
      list.push({
        projectCode: code,
        name: `[Sample Template] ${topic}`,
        sectorCode: sectorMeta.code,
        sector: `${sectorMeta.code}. ${sectorMeta.name}`,
        description: `Structured planning template for ${sectorMeta.name} (${sectorMeta.focus}). Replace with verified survey, cost estimate, and departmental reference before submission.`,
        exactLocation: 'Chichawatni Municipal Area (To Be Verified)',
        locality: 'Chichawatni City',
        department: 'Pending Department Assignment',
        estimatedCostPkr: 0,
        approvedCostPkr: 0,
        fundsReleasedPkr: 0,
        expenditurePkr: 0,
        fundingSource: 'Punjab Government',
        priority: seq % 4 === 1 ? 'High' : 'Medium',
        feasibility: 'Pending',
        startDate: `${year}-07-01`,
        expectedCompletionDate: `${year}-12-31`,
        status: 'Proposed',
        targetYear: year,
        physicalProgressPercent: 0,
        financialProgressPercent: 0,
        isSampleTemplate: true,
        updatedAt: now
      });
      seq++;
    }
  }
  return list;
}

import type {
  CityArea,
  CityAsset,
  CityBudgetRecord,
  CityComplaint,
  CityNotice,
  CityReport,
  CityRoad,
  CitySewerageAsset,
  CitySurvey,
  CityWasteRoute,
  CityWaterFacility
} from '../types';

export function getDemoCitySandboxState(): {
  areas: CityArea[];
  roads: CityRoad[];
  water: CityWaterFacility[];
  sewerage: CitySewerageAsset[];
  waste: CityWasteRoute[];
  assets: CityAsset[];
  projects: CityProject[];
  budgets: CityBudgetRecord[];
  departments: CityDepartment[];
  complaints: CityComplaint[];
  surveys: CitySurvey[];
  reports: CityReport[];
  notices: CityNotice[];
} {
  const now = new Date().toISOString();
  const areas: CityArea[] = [
    {
      id: 'area-test-1',
      name: 'Model Town & Block A–C (Test)',
      nameUrdu: 'ماڈل ٹاؤن و بلاک اے تا سی',
      wardCode: 'Ward-01',
      zoneType: 'Residential',
      populationVerified: 42500,
      populationSource: 'Test / Demo Estimate',
      streetsCount: 48,
      householdsVerified: 6800,
      latitude: 30.5335,
      longitude: 72.6978,
      notes: 'Test sandbox ward record.',
      updatedAt: now
    },
    {
      id: 'area-test-2',
      name: 'Main Bazaar & Railway Road (Test)',
      nameUrdu: 'مین بازار و ریلوے روڈ',
      wardCode: 'Ward-02',
      zoneType: 'Commercial',
      populationVerified: 31200,
      populationSource: 'Test / Demo Estimate',
      streetsCount: 34,
      householdsVerified: 4950,
      latitude: 30.5301,
      longitude: 72.7031,
      notes: 'Central commercial hub (Test data).',
      updatedAt: now
    },
    {
      id: 'area-test-3',
      name: 'College Road & Okanwala Belt (Test)',
      nameUrdu: 'کالج روڈ و اوکانوالہ بیلٹ',
      wardCode: 'Ward-03',
      zoneType: 'Mixed',
      populationVerified: 38900,
      populationSource: 'Test / Demo Estimate',
      streetsCount: 52,
      householdsVerified: 6100,
      latitude: 30.5245,
      longitude: 72.6902,
      notes: 'Education and residential expansion belt (Test data).',
      updatedAt: now
    }
  ];

  const roads: CityRoad[] = [
    {
      id: 'rd-test-1',
      name: 'G.T. Road Urban Service Corridor (Test)',
      locality: 'Model Town & Main Chowk',
      roadType: 'Main Road',
      lengthKm: 4.2,
      surfaceType: 'Asphalt',
      condition: 'Good',
      maintenancePriority: 'Medium',
      lastInspected: '2026-10-15',
      latitude: 30.534,
      longitude: 72.701,
      updatedAt: now
    },
    {
      id: 'rd-test-2',
      name: 'College Road Link Section (Test)',
      locality: 'College Road Sector',
      roadType: 'Main Road',
      lengthKm: 2.8,
      surfaceType: 'Asphalt',
      condition: 'Poor',
      maintenancePriority: 'High',
      lastInspected: '2026-10-20',
      notes: 'Patchwork and drainage shoulder survey flagged.',
      latitude: 30.525,
      longitude: 72.692,
      updatedAt: now
    }
  ];

  const water: CityWaterFacility[] = [
    {
      id: 'wat-test-1',
      name: 'Model Town Solar Filtration Plant (Test)',
      facilityType: 'Filtration Plant',
      locality: 'Model Town Chichawatni',
      status: 'Operational',
      qualityResult: 'TDS 290 ppm (Tested)',
      lastTested: '2026-10-25',
      latitude: 30.532,
      longitude: 72.696,
      updatedAt: now
    },
    {
      id: 'wat-test-2',
      name: 'Railway Bazaar Tube Well #2 (Test)',
      facilityType: 'Tube Well',
      locality: 'Main Bazaar',
      status: 'Under Repair',
      repairNotes: 'Motor rewinding queued in test record.',
      latitude: 30.529,
      longitude: 72.705,
      updatedAt: now
    }
  ];

  const sewerage: CitySewerageAsset[] = [
    {
      id: 'sew-test-1',
      name: 'Main Disposal Pumping Station (Test)',
      assetType: 'Disposal Station',
      locality: 'South Outfall Belt',
      condition: 'Clear',
      lastInspected: '2026-10-22',
      latitude: 30.519,
      longitude: 72.706,
      updatedAt: now
    },
    {
      id: 'sew-test-2',
      name: 'Burewala Road Junction Culvert (Test)',
      assetType: 'Blocked Drain',
      locality: 'Burewala Road',
      condition: 'Blocked',
      lastInspected: '2026-10-28',
      notes: 'Desilting inspection flagged.',
      latitude: 30.522,
      longitude: 72.712,
      updatedAt: now
    }
  ];

  const waste: CityWasteRoute[] = [
    {
      id: 'wst-test-1',
      routeCode: 'RT-01',
      routeName: 'Main Bazaar & Railway Road Morning Beat (Test)',
      locality: 'Main Bazaar',
      collectionPointsCount: 18,
      disposalSite: 'MC Transfer Yard',
      vehicleReg: 'SWL-MC-104',
      vehicleStatus: 'Active',
      assignedStaffCount: 12,
      wasteTonsMeasured: 8.5,
      schedule: 'Daily 06:00 AM',
      status: 'Completed',
      updatedAt: now
    }
  ];

  const assets: CityAsset[] = [
    {
      id: 'ast-test-1',
      domain: 'Parks',
      name: 'Chichawatni Central Family Park (Test)',
      locality: 'Model Town',
      subType: 'Family Park',
      status: 'Open',
      condition: 'Good',
      latitude: 30.5345,
      longitude: 72.6955,
      updatedAt: now
    },
    {
      id: 'ast-test-2',
      domain: 'Health',
      name: 'THQ Hospital Chichawatni (Test)',
      locality: 'Hospital Road',
      subType: 'THQ Hospital',
      status: 'Operational',
      condition: 'Good',
      latitude: 30.531,
      longitude: 72.689,
      updatedAt: now
    },
    {
      id: 'ast-test-3',
      domain: 'Education',
      name: 'Govt. Municipal High School (Test)',
      locality: 'College Road',
      subType: 'High School',
      status: 'Operational',
      condition: 'Average',
      latitude: 30.526,
      longitude: 72.693,
      updatedAt: now
    },
    {
      id: 'ast-test-4',
      domain: 'Streetlights',
      name: 'G.T. Road & Bazaar LED Corridor (Test)',
      locality: 'Main Bazaar & GT Road',
      subType: 'LED Streetlights',
      status: 'Partially Active',
      functionalCount: 142,
      nonFunctionalCount: 18,
      updatedAt: now
    }
  ];

  const projects: CityProject[] = [
    {
      id: 'cp-test-1',
      projectCode: 'CW-2027-T01',
      name: 'Model Town Dual-Tap Filtration & Shade Upgrade (Test)',
      sectorCode: 'B',
      sector: 'B. Water Supply',
      description: 'Test sandbox approved project entry for immediate dashboard & chart preview.',
      exactLocation: 'Model Town Block B Park Corner',
      locality: 'Model Town',
      department: 'Municipal Committee Chichawatni',
      estimatedCostPkr: 4500000,
      approvedCostPkr: 4200000,
      fundsReleasedPkr: 3000000,
      expenditurePkr: 2450000,
      fundingSource: 'Municipal Funds',
      priority: 'High',
      feasibility: 'High',
      startDate: '2026-09-01',
      expectedCompletionDate: '2027-03-31',
      status: 'In Progress',
      targetYear: 2027,
      physicalProgressPercent: 62,
      financialProgressPercent: 58,
      latitude: 30.533,
      longitude: 72.696,
      updatedAt: now
    },
    {
      id: 'cp-test-2',
      projectCode: 'CW-2028-T02',
      name: 'College Road Drainage & Resurfacing Proposal (Test)',
      sectorCode: 'A',
      sector: 'A. Roads & Transportation',
      description: 'Test proposed Master Plan 2028 item — separated cleanly from approved funds.',
      exactLocation: 'College Road Chowk to Degree College',
      locality: 'College Road Sector',
      department: 'Communication & Works (C&W) / Highways Department',
      estimatedCostPkr: 18500000,
      approvedCostPkr: 0,
      fundsReleasedPkr: 0,
      expenditurePkr: 0,
      fundingSource: 'Punjab Government',
      priority: 'Critical',
      feasibility: 'Medium',
      startDate: '2028-01-15',
      expectedCompletionDate: '2028-09-30',
      status: 'Proposed',
      targetYear: 2028,
      physicalProgressPercent: 0,
      financialProgressPercent: 0,
      latitude: 30.525,
      longitude: 72.692,
      updatedAt: now
    }
  ];

  const budgets: CityBudgetRecord[] = [
    {
      id: 'bdg-test-1',
      title: 'Water Filtration Maintenance Allocation (Test)',
      fiscalYear: '2026-27',
      fundingSource: 'Municipal Funds',
      fundingStage: 'Approved',
      amountPkr: 4200000,
      sector: 'B. Water Supply',
      projectCode: 'CW-2027-T01',
      updatedBy: 'asad@gmail.com',
      updatedAt: now
    },
    {
      id: 'bdg-test-2',
      title: 'Water Filtration First Tranche Release (Test)',
      fiscalYear: '2026-27',
      fundingSource: 'Municipal Funds',
      fundingStage: 'Released',
      amountPkr: 3000000,
      sector: 'B. Water Supply',
      projectCode: 'CW-2027-T01',
      updatedBy: 'asad@gmail.com',
      updatedAt: now
    }
  ];

  const departments: CityDepartment[] = STRUCTURAL_CITY_DEPARTMENTS.slice(0, 6).map((d, i) => ({
    ...d,
    id: `dept-test-${i + 1}`,
    updatedAt: now
  }));

  const complaints: CityComplaint[] = [
    {
      id: 'CITY-2026-TEST1',
      trackingId: 'CITY-2026-TEST1',
      citizenName: 'Test Citizen (Demo)',
      phone: '+923000000201',
      area: 'Ward-02',
      locality: 'Railway Road Bazaar',
      category: 'Streetlights',
      description: 'Test municipal complaint: 3 LED fixtures non-functional near junction.',
      status: 'In Progress',
      priority: 'High',
      department: 'Municipal Committee Chichawatni',
      latitude: 30.5305,
      longitude: 72.703,
      createdAt: '2026-10-25T10:00:00.000Z',
      updatedAt: now
    },
    {
      id: 'CITY-2026-TEST2',
      trackingId: 'CITY-2026-TEST2',
      citizenName: 'Test Resident (Demo)',
      phone: '+923000000202',
      area: 'Ward-01',
      locality: 'Model Town Block B',
      category: 'Garbage',
      description: 'Test municipal complaint: Morning collection trolley request.',
      status: 'Resolved',
      priority: 'Medium',
      department: 'Municipal Committee Chichawatni',
      resolutionNotes: 'Cleared by morning sanitation beat RT-01.',
      createdAt: '2026-10-20T09:00:00.000Z',
      updatedAt: now
    }
  ];

  const surveys: CitySurvey[] = [
    {
      id: 'csrv-test-1',
      title: 'College Road Shoulder & Drain Inspection (Test)',
      sector: 'A. Roads & Transportation',
      locality: 'College Road',
      conditionGrade: 'Poor',
      repairRecommendation: 'Clear side culvert and patch 400m asphalt shoulder.',
      officerName: 'Demo Field Officer',
      verificationStatus: 'Verified',
      latitude: 30.525,
      longitude: 72.692,
      createdAt: '2026-10-21T11:00:00.000Z'
    }
  ];

  const reports: CityReport[] = [
    {
      id: 'crep-test-1',
      reportType: 'Monthly Department Performance Report',
      title: 'Chichawatni Civic Coordination Summary (Test Preview)',
      period: '2026-10',
      dataSource: 'Test Sandbox Dataset',
      department: 'Municipal Coordination Desk',
      verificationStatus: 'Provisional',
      isPublished: true,
      summary: 'Sample provisional test summary demonstrating monthly sanitation beats, filtration plant testing, and complaint tracking metrics.',
      lastUpdated: now
    }
  ];

  const notices: CityNotice[] = [
    {
      id: 'cnot-test-1',
      title: 'Scheduled Water Filtration Filter Servicing — Ward 1 & 2 (Test Notice)',
      titleUrdu: 'وارڈ 1 اور 2 میں واٹر فلٹریشن پلانٹ کی سروسنگ کا شیڈول',
      category: 'Municipal Advisory',
      publishDate: '2026-11-01',
      description: 'Sample municipal maintenance notice for public portal demonstration.',
      isPublished: true
    }
  ];

  return {
    areas,
    roads,
    water,
    sewerage,
    waste,
    assets,
    projects,
    budgets,
    departments,
    complaints,
    surveys,
    reports,
    notices
  };
}

