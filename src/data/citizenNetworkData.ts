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
