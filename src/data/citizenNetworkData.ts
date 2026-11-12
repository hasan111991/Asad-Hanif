import {
  CitizenConsentCategory,
  CitizenContactMethod,
  CitizenInterestTopic,
  OrganizationCategory
} from '../types';

export const CITIZEN_INTEREST_TOPICS: {
  id: CitizenInterestTopic;
  en: string;
  ur: string;
}[] = [
  { id: 'Roads and Infrastructure', en: 'Roads and Infrastructure', ur: 'سڑکیں اور انفراسٹرکچر' },
  { id: 'Cleanliness and Sanitation', en: 'Cleanliness and Sanitation', ur: 'صفائی اور سینیٹیشن' },
  { id: 'Water Supply', en: 'Water Supply', ur: 'پینے کا صاف پانی' },
  { id: 'Education', en: 'Education', ur: 'تعلیم' },
  { id: 'Healthcare', en: 'Healthcare', ur: 'صحت کی سہولیات' },
  { id: 'Youth and Sports', en: 'Youth and Sports', ur: 'نوجوان اور کھیل' },
  { id: 'Business and Employment', en: 'Business and Employment', ur: 'کاروبار اور روزگار' },
  { id: 'Agriculture', en: 'Agriculture', ur: 'زراعت و کسان' },
  { id: 'Environment', en: 'Environment', ur: 'ماحولیات و شجرکاری' },
  { id: 'Community Welfare', en: 'Community Welfare', ur: 'سماجی فلاح و بہبود' },
  { id: 'Public Safety', en: 'Public Safety', ur: 'عوامی تحفظ و روشنی' },
  { id: 'General City Updates', en: 'General City Updates', ur: 'شہری اعلانات' }
];

export const CITIZEN_CONSENT_OPTIONS: {
  key: CitizenConsentCategory;
  en: string;
  ur: string;
  descEn: string;
  descUr: string;
}[] = [
  {
    key: 'publicDevelopmentUpdates',
    en: 'Public development updates',
    ur: 'عوامی ترقیاتی منصوبوں کی اپ ڈیٹس',
    descEn: 'Verified progress milestones on roads, water plants, schools, and civic facilities.',
    descUr: 'سڑکوں، واٹر پلانٹس، اسکولوں اور شہری سہولیات کی تصدیق شدہ پیش رفت۔'
  },
  {
    key: 'cityServiceAnnouncements',
    en: 'City service announcements',
    ur: 'شہری خدمات کے اعلانات',
    descEn: 'Sanitation schedules, water filtration maintenance notices, and civic advisories.',
    descUr: 'صفائی کے اوقات، واٹر فلٹریشن مرمت اور میونسپل اعلانات۔'
  },
  {
    key: 'communityEventNotifications',
    en: 'Community event notifications',
    ur: 'سماجی و کمیونٹی پروگرامز کی اطلاعات',
    descEn: 'Voluntary cleanliness drives, tree plantation campaigns, and civic workshops.',
    descUr: 'رضاکارانہ صفائی مہم، شجرکاری اور شہری ورکشاپس۔'
  },
  {
    key: 'surveyInvitations',
    en: 'Survey invitations',
    ur: 'عوامی سروے اور رائے شماری کے دعوت نامے',
    descEn: 'Voluntary neighborhood priority feedback questionnaires for city planning.',
    descUr: 'شہری منصوبہ بندی کے لیے رضاکارانہ عوامی فیڈبیک سروے۔'
  },
  {
    key: 'emergencyPublicAlerts',
    en: 'Emergency public alerts',
    ur: 'ہنگامی عوامی الرٹس',
    descEn: 'Monsoon drainage warnings, road closures, and urgent municipal safety advisories.',
    descUr: 'بارشوں کے ہنگامی نکاسی آب انتباہات اور حفاظتی ہدایات۔'
  }
];

export const CITIZEN_CONTACT_METHODS: CitizenContactMethod[] = [
  'WhatsApp',
  'SMS',
  'Email',
  'In-App'
];

export const ORGANIZATION_CATEGORIES: OrganizationCategory[] = [
  'Local Business',
  'Traders & Market Association',
  'NGO & Welfare Organization',
  'Educational Institution',
  'Healthcare Institution',
  'Community Organization'
];

export const VOLUNTARY_GROUP_TEMPLATES: {
  name: string;
  nameUrdu: string;
  interestCategory: CitizenInterestTopic | 'Multi-Sector Civic';
  description: string;
}[] = [
  {
    name: 'Clean Chichawatni Community',
    nameUrdu: 'کلین چیچہ وطنی کمیونٹی',
    interestCategory: 'Cleanliness and Sanitation',
    description: 'Voluntary resident coordination for neighborhood cleanliness awareness and waste collection feedback.'
  },
  {
    name: 'Education Support Network',
    nameUrdu: 'تعلیمی معاونت نیٹ ورک',
    interestCategory: 'Education',
    description: 'Parents, teachers, and civic volunteers sharing public school facility needs and library initiatives.'
  },
  {
    name: 'Youth & Sports Network',
    nameUrdu: 'نوجوان و کھیل نیٹ ورک',
    interestCategory: 'Youth and Sports',
    description: 'Local sports grounds upkeep, youth skill workshops, and healthy community activities.'
  },
  {
    name: 'Business Community Network',
    nameUrdu: 'تاجر و کاروباری نیٹ ورک',
    interestCategory: 'Business and Employment',
    description: 'Non-political market sanitation, bazaar lighting, parking, and civic infrastructure coordination.'
  },
  {
    name: 'Environment Volunteers',
    nameUrdu: 'ماحولیات و شجرکاری رضاکار',
    interestCategory: 'Environment',
    description: 'Urban greenbelt care, canal-bank tree plantation, and park preservation volunteers.'
  },
  {
    name: 'Public Facilities Feedback Group',
    nameUrdu: 'عوامی سہولیات فیڈبیک گروپ',
    interestCategory: 'General City Updates',
    description: 'Voluntary civic reporting on filtration plants, streetlights, dispensaries, and public parks.'
  }
];

export const COMMUNICATION_TEMPLATES: {
  name: string;
  consentCategory: CitizenConsentCategory;
  subject: string;
  body: string;
}[] = [
  {
    name: 'City Water Plant Maintenance Notice',
    consentCategory: 'cityServiceAnnouncements',
    subject: 'Chichawatni City Service Notice: Water Filtration Maintenance',
    body: 'Dear Community Member, scheduled filter replacement and water quality testing is underway in your sector. Normal supply hours will resume per municipal schedule. Reply or manage preferences anytime on the portal.'
  },
  {
    name: 'Monthly Development Progress Digest',
    consentCategory: 'publicDevelopmentUpdates',
    subject: 'Chichawatni 2030 Master Plan: Verified Development Update',
    body: 'Verified update on approved municipal infrastructure works and public facility upgrades in Chichawatni. View full project records on the official City 2030 portal.'
  },
  {
    name: 'Community Cleanliness & Tree Plantation Drive',
    consentCategory: 'communityEventNotifications',
    subject: 'Voluntary Community Initiative: Clean & Green Chichawatni',
    body: 'Join our voluntary non-political neighborhood cleanliness and tree plantation drive this weekend. Register your availability in the Citizen Participation portal.'
  },
  {
    name: 'Civic Priority Feedback Survey',
    consentCategory: 'surveyInvitations',
    subject: 'Share Your Local Priorities: Chichawatni Community Survey',
    body: 'A short voluntary survey on local roads, drainage, streetlights, and parks is now open. Your feedback helps inform technical planning.'
  },
  {
    name: 'Monsoon Drainage & Safety Advisory',
    consentCategory: 'emergencyPublicAlerts',
    subject: 'Important Safety Advisory: Heavy Rain & Drainage Monitoring',
    body: 'Please keep storm drains clear of solid waste and report waterlogging hotspots immediately through the Municipal Complaint Portal.'
  }
];

/**
 * TEST SANDBOX DATA FOR DEMO / PREVIEW MODE (No real PII, no CNIC, no home street address).
 * Used when logging into Demo Admin (asad@gmail.com / pp203) or previewing public Community pages before live Firestore population.
 */
import type {
  CitizenConsent,
  CitizenGroup,
  CitizenInterestRecord,
  CitizenProfile,
  CitizenSuggestion,
  CitizenSurvey,
  CitizenVolunteer,
  CommunicationPreferences,
  RegisteredOrganization
} from '../types';

export const TEST_CITIZEN_GROUPS: CitizenGroup[] = [
  {
    id: 'grp-clean-chichawatni',
    name: 'Clean Chichawatni Community',
    nameUrdu: 'کلین چیچہ وطنی کمیونٹی',
    interestCategory: 'Cleanliness and Sanitation',
    localityFilter: 'All Chichawatni Wards',
    description: 'Voluntary resident coordination for neighborhood cleanliness awareness and waste collection feedback.',
    isNonPoliticalConfirmed: true,
    memberCount: 2,
    isActive: true,
    createdBy: 'demo-admin',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'grp-education-support',
    name: 'Education Support Network',
    nameUrdu: 'تعلیمی معاونت نیٹ ورک',
    interestCategory: 'Education',
    localityFilter: 'College Road & Block Sectors',
    description: 'Parents, teachers, and civic volunteers sharing public school facility needs and library initiatives.',
    isNonPoliticalConfirmed: true,
    memberCount: 1,
    isActive: true,
    createdBy: 'demo-admin',
    createdAt: '2026-10-02T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'grp-youth-sports',
    name: 'Youth & Sports Network',
    nameUrdu: 'نوجوان و کھیل نیٹ ورک',
    interestCategory: 'Youth and Sports',
    localityFilter: 'Tehsil Stadium & Peri-Urban Sectors',
    description: 'Local sports grounds upkeep, youth skill workshops, and healthy community activities.',
    isNonPoliticalConfirmed: true,
    memberCount: 1,
    isActive: true,
    createdBy: 'demo-admin',
    createdAt: '2026-10-03T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'grp-business-network',
    name: 'Business Community Network',
    nameUrdu: 'تاجر و کاروباری نیٹ ورک',
    interestCategory: 'Business and Employment',
    localityFilter: 'Main Bazaar & Grain Market',
    description: 'Non-political market sanitation, bazaar lighting, parking, and civic infrastructure coordination.',
    isNonPoliticalConfirmed: true,
    memberCount: 1,
    isActive: true,
    createdBy: 'demo-admin',
    createdAt: '2026-10-04T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z'
  },
  {
    id: 'grp-environment-volunteers',
    name: 'Environment Volunteers',
    nameUrdu: 'ماحولیات و شجرکاری رضاکار',
    interestCategory: 'Environment',
    localityFilter: 'Canal Bank & Public Parks',
    description: 'Urban greenbelt care, canal-bank tree plantation, and park preservation volunteers.',
    isNonPoliticalConfirmed: true,
    memberCount: 1,
    isActive: true,
    createdBy: 'demo-admin',
    createdAt: '2026-10-05T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z'
  }
];

export const TEST_CITIZEN_SURVEYS: CitizenSurvey[] = [
  {
    id: 'srv-city-2027-priorities',
    title: 'Chichawatni 2027–2030 Priority Civic Services Survey (Test)',
    titleUrdu: 'چیچہ وطنی 2027–2030 ترجیحی شہری خدمات سروے',
    topic: '2027–2030 Civic Priorities',
    description: 'Help planning teams understand which neighborhood services need immediate technical inspection.',
    questions: [
      {
        id: 'q1',
        prompt: 'Which civic sector requires top priority in your ward?',
        options: ['Roads & Street Paving', 'Water Filtration & Supply', 'Sewerage & Drainage', 'Streetlights & Sanitation']
      },
      {
        id: 'q2',
        prompt: 'Which neighborhood facility needs fastest inspection?',
        options: ['Drinking Water Filtration Point', 'Streetlights & Poles', 'Neighborhood Drain / Culvert', 'School or Dispensary Access']
      }
    ],
    status: 'Active',
    responseCount: 2,
    createdBy: 'demo-admin',
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z'
  }
];

export const TEST_REGISTERED_ORGANIZATIONS: RegisteredOrganization[] = [
  {
    id: 'org-test-traders',
    orgName: 'Chichawatni Central Bazaar Welfare & Traders Forum (Test)',
    orgCategory: 'Traders & Market Association',
    locality: 'Main Bazaar & Railway Road',
    registrationNumber: 'REG-CW-TEST-01',
    focalPersonName: 'Haji Muhammad Tariq (Test Contact)',
    publicContactPhone: '+923000000211',
    description: 'Coordinates market cleanliness schedules, bazaar solar backup lighting awareness, and orderly loading zones.',
    servicesOffered: 'Market Sanitation Coordination, Trader Helpdesk',
    submittedByUid: 'test-citizen-4',
    verificationStatus: 'Verified',
    isPublicPublished: true,
    createdAt: '2026-10-10T08:00:00.000Z',
    updatedAt: '2026-10-12T08:00:00.000Z'
  },
  {
    id: 'org-test-welfare',
    orgName: 'Green Chichawatni Civic Welfare Society (Test)',
    orgCategory: 'NGO & Welfare Organization',
    locality: 'Model Town & Canal Colony',
    registrationNumber: 'NGO-SWL-TEST-02',
    focalPersonName: 'Dr. Saima Nawaz (Test Contact)',
    publicContactPhone: '+923000000212',
    description: 'Non-political neighborhood tree plantation, clean water testing awareness, and public library book drives.',
    servicesOffered: 'Tree Plantation, Free Eye & Hygiene Camps',
    submittedByUid: 'test-citizen-2',
    verificationStatus: 'Verified',
    isPublicPublished: true,
    createdAt: '2026-10-14T08:00:00.000Z',
    updatedAt: '2026-10-15T08:00:00.000Z'
  }
];

export const TEST_CITIZEN_PROFILES: CitizenProfile[] = [
  {
    id: 'test-citizen-1',
    uid: 'test-citizen-1',
    fullName: 'Muhammad Bilal Raza (Test)',
    phoneE164: '+923000000201',
    phoneHash: 'test-hash-201',
    phoneVerified: true,
    verificationMethod: 'firebase_phone_auth',
    email: 'bilal.test@example.com',
    cityLocality: 'Model Town Chichawatni',
    ucWard: 'UC-91',
    profession: 'Civil Engineer',
    preferredLanguage: 'en',
    preferredContactMethod: 'WhatsApp',
    accountStatus: 'Active',
    retentionPolicyAcceptedAt: '2026-10-05T09:00:00.000Z',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z'
  },
  {
    id: 'test-citizen-2',
    uid: 'test-citizen-2',
    fullName: 'Ayesha Siddiqa (Test)',
    phoneE164: '+923000000202',
    phoneHash: 'test-hash-202',
    phoneVerified: true,
    verificationMethod: 'firebase_phone_auth',
    cityLocality: 'College Road Sector',
    ucWard: 'UC-92',
    profession: 'Lecturer',
    preferredLanguage: 'ur',
    preferredContactMethod: 'SMS',
    accountStatus: 'Active',
    retentionPolicyAcceptedAt: '2026-10-08T10:00:00.000Z',
    createdAt: '2026-10-08T10:00:00.000Z',
    updatedAt: '2026-10-08T10:00:00.000Z'
  },
  {
    id: 'test-citizen-3',
    uid: 'test-citizen-3',
    fullName: 'Usman Ghani Farmer (Test)',
    phoneE164: '+923000000203',
    phoneHash: 'test-hash-203',
    phoneVerified: false,
    verificationMethod: 'pending_verification',
    cityLocality: 'Chak 112/7-R Okanwala Belt',
    villageArea: 'Chak 112/7-R',
    ucWard: 'UC-94',
    profession: 'Agriculture',
    preferredLanguage: 'ur',
    preferredContactMethod: 'In-App',
    accountStatus: 'Active',
    retentionPolicyAcceptedAt: '2026-10-12T11:00:00.000Z',
    createdAt: '2026-10-12T11:00:00.000Z',
    updatedAt: '2026-10-12T11:00:00.000Z'
  },
  {
    id: 'test-citizen-4',
    uid: 'test-citizen-4',
    fullName: 'Tariq Mahmood Trader (Test)',
    phoneE164: '+923000000204',
    phoneHash: 'test-hash-204',
    phoneVerified: true,
    verificationMethod: 'firebase_phone_auth',
    cityLocality: 'Main Bazaar Chichawatni',
    ucWard: 'UC-93',
    profession: 'Small Business',
    preferredLanguage: 'en',
    preferredContactMethod: 'WhatsApp',
    accountStatus: 'Active',
    retentionPolicyAcceptedAt: '2026-10-18T14:00:00.000Z',
    createdAt: '2026-10-18T14:00:00.000Z',
    updatedAt: '2026-10-18T14:00:00.000Z'
  }
];

export const TEST_CITIZEN_CONSENTS: CitizenConsent[] = [
  {
    id: 'test-citizen-1',
    uid: 'test-citizen-1',
    publicDevelopmentUpdates: true,
    cityServiceAnnouncements: true,
    communityEventNotifications: false,
    surveyInvitations: true,
    emergencyPublicAlerts: true,
    nonPoliticalStatementAccepted: true,
    privacyPolicyAccepted: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-05T09:00:00.000Z'
  },
  {
    id: 'test-citizen-2',
    uid: 'test-citizen-2',
    publicDevelopmentUpdates: true,
    cityServiceAnnouncements: false,
    communityEventNotifications: true,
    surveyInvitations: true,
    emergencyPublicAlerts: true,
    nonPoliticalStatementAccepted: true,
    privacyPolicyAccepted: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-08T10:00:00.000Z'
  },
  {
    id: 'test-citizen-3',
    uid: 'test-citizen-3',
    publicDevelopmentUpdates: false,
    cityServiceAnnouncements: true,
    communityEventNotifications: false,
    surveyInvitations: false,
    emergencyPublicAlerts: true,
    nonPoliticalStatementAccepted: true,
    privacyPolicyAccepted: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-12T11:00:00.000Z'
  },
  {
    id: 'test-citizen-4',
    uid: 'test-citizen-4',
    publicDevelopmentUpdates: true,
    cityServiceAnnouncements: true,
    communityEventNotifications: true,
    surveyInvitations: false,
    emergencyPublicAlerts: true,
    nonPoliticalStatementAccepted: true,
    privacyPolicyAccepted: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-18T14:00:00.000Z'
  }
];

export const TEST_CITIZEN_INTERESTS: CitizenInterestRecord[] = [
  {
    id: 'test-citizen-1',
    uid: 'test-citizen-1',
    interests: ['Roads and Infrastructure', 'Water Supply', 'Environment'],
    cityLocality: 'Model Town Chichawatni',
    profession: 'Civil Engineer',
    updatedAt: '2026-10-05T09:00:00.000Z'
  },
  {
    id: 'test-citizen-2',
    uid: 'test-citizen-2',
    interests: ['Education', 'Environment', 'Community Welfare'],
    cityLocality: 'College Road Sector',
    profession: 'Lecturer',
    updatedAt: '2026-10-08T10:00:00.000Z'
  },
  {
    id: 'test-citizen-3',
    uid: 'test-citizen-3',
    interests: ['Agriculture', 'Roads and Infrastructure', 'Water Supply'],
    cityLocality: 'Chak 112/7-R Okanwala Belt',
    profession: 'Agriculture',
    updatedAt: '2026-10-12T11:00:00.000Z'
  },
  {
    id: 'test-citizen-4',
    uid: 'test-citizen-4',
    interests: ['Business and Employment', 'Cleanliness and Sanitation', 'Public Safety'],
    cityLocality: 'Main Bazaar Chichawatni',
    profession: 'Small Business',
    updatedAt: '2026-10-18T14:00:00.000Z'
  }
];

export const TEST_CITIZEN_COMM_PREFS: CommunicationPreferences[] = [
  {
    id: 'test-citizen-1',
    uid: 'test-citizen-1',
    preferredLanguage: 'en',
    preferredChannel: 'WhatsApp',
    whatsappOptIn: true,
    smsOptIn: false,
    emailOptIn: true,
    inAppOptIn: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-05T09:00:00.000Z'
  },
  {
    id: 'test-citizen-2',
    uid: 'test-citizen-2',
    preferredLanguage: 'ur',
    preferredChannel: 'SMS',
    whatsappOptIn: false,
    smsOptIn: true,
    emailOptIn: false,
    inAppOptIn: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-08T10:00:00.000Z'
  },
  {
    id: 'test-citizen-3',
    uid: 'test-citizen-3',
    preferredLanguage: 'ur',
    preferredChannel: 'In-App',
    whatsappOptIn: false,
    smsOptIn: false,
    emailOptIn: false,
    inAppOptIn: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-12T11:00:00.000Z'
  },
  {
    id: 'test-citizen-4',
    uid: 'test-citizen-4',
    preferredLanguage: 'en',
    preferredChannel: 'WhatsApp',
    whatsappOptIn: true,
    smsOptIn: false,
    emailOptIn: false,
    inAppOptIn: true,
    unsubscribedAll: false,
    updatedAt: '2026-10-18T14:00:00.000Z'
  }
];

export const TEST_CITIZEN_SUGGESTIONS: CitizenSuggestion[] = [
  {
    id: 'sug-test-1',
    uid: 'test-citizen-1',
    citizenDisplayName: 'Muhammad Bilal Raza (Test)',
    locality: 'Model Town Chichawatni',
    sector: 'B. Water Supply',
    title: 'Add Shaded Canopy & Dual Taps at Model Town Filtration Point',
    description: 'Community suggestion to inspect pressure valve and add shaded waiting bench for elderly visitors.',
    status: 'Under Community Review',
    isPublishedSummary: true,
    adminFeedback: 'Forwarded for technical feasibility review (not an approved expenditure).',
    createdAt: '2026-10-19T12:00:00.000Z',
    updatedAt: '2026-10-20T09:00:00.000Z'
  }
];

export const TEST_CITIZEN_VOLUNTEERS: CitizenVolunteer[] = [
  {
    id: 'vol-test-1',
    uid: 'test-citizen-2',
    volunteerName: 'Ayesha Siddiqa (Test)',
    locality: 'College Road Sector',
    initiativeTitle: 'Canal Bank Shade Tree Plantation Brigade',
    areaOfInterest: 'Environment',
    availability: 'Weekends (Morning)',
    skillsNote: 'School eco-club coordination',
    status: 'Approved',
    isNonPoliticalConfirmed: true,
    createdAt: '2026-10-16T09:00:00.000Z',
    updatedAt: '2026-10-17T09:00:00.000Z'
  }
];

