export type Language = 'en' | 'ur';

export type AdminRole =
  | 'Super Admin'
  | 'Admin'
  | 'City Manager'
  | 'Department Manager'
  | 'Field Officer'
  | 'Finance Officer'
  | 'Office Manager'
  | 'Project Manager'
  | 'Media Manager'
  | 'Data Entry Operator';

export interface AdminUser {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  role: AdminRole;
  status: 'Active' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
}

export interface LeaderProfile {
  id?: string;
  fullName: string;
  fullNameUrdu: string;
  title: string;
  titleUrdu: string;
  party: string;
  partyUrdu: string;
  constituency: string;
  constituencyUrdu: string;
  district: string;
  districtUrdu: string;
  bio: string;
  bioUrdu: string;
  politicalJourney: string;
  politicalJourneyUrdu: string;
  education: string;
  educationUrdu: string;
  assemblyTenure: string;
  assemblyTenureUrdu: string;
  officeAddress: string;
  officeAddressUrdu: string;
  officeHours: string;
  officeHoursUrdu: string;
  officialEmail: string;
  officialPhone: string;
  verifiedNotice: string;
  verifiedNoticeUrdu: string;
  photoUrl: string;
  leadPortraitUrl: string;
  assemblyImageUrl: string;
  chichawatniSceneUrl: string;
  introVideoUrl?: string;
  constituencyVideoUrl?: string;
}

export interface UnionCouncil {
  id: string;
  code: string;
  name: string;
  nameUrdu: string;
  type: 'Urban' | 'Rural';
  headquarters: string;
  headquartersUrdu: string;
  estimatedPopulation: number;
  villagesCount: number;
  latitude: number;
  longitude: number;
  keyVillages: string[];
  keyVillagesUrdu: string[];
  mainIssues: string[];
}

export interface VillageMouza {
  id: string;
  name: string;
  nameUrdu: string;
  unionCouncilCode: string;
  type: 'Chak' | 'Mouza' | 'Town' | 'Urban Locality';
  latitude: number;
  longitude: number;
  estimatedPopulation: number;
  households: number;
  hasSchool: boolean;
  hasHealthFacility: boolean;
  hasWaterPlant: boolean;
  roadCondition: 'Good' | 'Fair' | 'Poor' | 'Unpaved';
  verifiedStatus: 'Verified' | 'Pending Field Survey';
}

export interface EducationFacility {
  id: string;
  name: string;
  nameUrdu: string;
  unionCouncil: string;
  level: 'Primary' | 'Middle' | 'High School' | 'Higher Secondary' | 'College' | 'Technical/Vocational';
  gender: 'Boys' | 'Girls' | 'Co-education';
  sector: 'Government' | 'Private' | 'TEVTA';
  enrollment: number;
  teachersCount: number;
  classroomsCount: number;
  condition: 'Good' | 'Needs Renovation' | 'Critical Shortage';
  missingFacilities: string[];
  latitude: number;
  longitude: number;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  nameUrdu: string;
  unionCouncil: string;
  type: 'THQ Hospital' | 'Rural Health Center (RHC)' | 'Basic Health Unit (BHU)' | 'Dispensary' | 'Mother & Child Center';
  beds: number;
  doctorsAvailable: number;
  ambulanceAvailable: boolean;
  emergency24h: boolean;
  services: string[];
  condition: 'Functional' | 'Requires Equipment' | 'Staff Shortage';
  latitude: number;
  longitude: number;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  nameUrdu: string;
  category: 'Main Road' | 'Link Road' | 'Canal Bridge' | 'Water Filtration Plant' | 'Drainage & Sewerage' | 'Street Lighting';
  unionCouncil: string;
  location: string;
  lengthKm?: number;
  condition: 'Good' | 'Fair' | 'Deteriorated' | 'Under Repair';
  lastInspected: string;
  notes: string;
  latitude: number;
  longitude: number;
}

export type ProjectCategory =
  | 'Roads and Infrastructure'
  | 'Education'
  | 'Healthcare'
  | 'Clean Drinking Water'
  | 'Electricity'
  | 'Sanitation'
  | 'Public Facilities';

export type ProjectStatus = 'Proposed' | 'Approved' | 'In Progress' | 'Completed';

export type FundingType = 'Government-Funded' | 'Department-Led' | 'MPA Priority Grant' | 'District ADP';

export interface Project {
  id: string;
  title: string;
  titleUrdu: string;
  category: ProjectCategory;
  categoryUrdu: string;
  unionCouncil: string;
  location: string;
  locationUrdu: string;
  description: string;
  descriptionUrdu: string;
  status: ProjectStatus;
  statusUrdu: string;
  department: string;
  departmentUrdu: string;
  budget: string;
  startDate: string;
  completionDate: string;
  imageUrl: string;
  videoUrl?: string;
  fundingType: FundingType;
  fundingTypeUrdu: string;
  progressPercent: number;
  latitude: number;
  longitude: number;
}

export type AssemblyActivityCategory =
  | 'Question Raised'
  | 'Bill & Resolution'
  | 'Committee Participation'
  | 'Parliamentary Activity'
  | 'Official Announcement';

export interface AssemblyActivity {
  id: string;
  title: string;
  titleUrdu: string;
  category: AssemblyActivityCategory;
  categoryUrdu: string;
  sessionDate: string;
  referenceNo?: string;
  summary: string;
  summaryUrdu: string;
  imageUrl?: string;
  videoUrl?: string;
  status?: string;
}

export type ComplaintCategory =
  | 'Roads & Infrastructure'
  | 'Water Supply'
  | 'Electricity'
  | 'Education Concerns'
  | 'Healthcare Facilities'
  | 'Sanitation & Sewerage'
  | 'Agriculture & Irrigation'
  | 'Other Public Service';

export type ComplaintStatus =
  | 'Received'
  | 'Under Review'
  | 'Referred to Department'
  | 'Resolved'
  | 'Closed';

export interface CitizenComplaint {
  id: string;
  trackingId: string;
  citizenName: string;
  phone: string;
  districtTehsil: string;
  unionCouncil: string;
  locality: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  priority: 'Normal' | 'High' | 'Urgent';
  departmentReferred?: string;
  adminRemarks?: string;
  assignedOfficer?: string;
  resolutionEvidenceUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  inquiryType: 'General Inquiry' | 'Appointment Request' | 'Delegation Meeting' | 'Development Feedback';
  preferredDate?: string;
  message: string;
  status: 'Pending' | 'Reviewed' | 'Scheduled' | 'Completed';
  adminNotes?: string;
  createdAt: string;
}

export type NoticeCategory =
  | 'Public Announcements'
  | 'Development Updates'
  | 'Office Notifications'
  | 'Public Meetings'
  | 'Important Documents';

export interface PublicNotice {
  id: string;
  title: string;
  titleUrdu: string;
  category: NoticeCategory;
  categoryUrdu: string;
  publishDate: string;
  description: string;
  descriptionUrdu: string;
  imageUrl?: string;
  videoUrl?: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  isPublished: boolean;
  officialRef?: string;
  createdAt?: string;
}

export type NewsCategory =
  | 'Latest Updates'
  | 'Press Releases'
  | 'Assembly News'
  | 'Constituency Visits'
  | 'Public Darbar';

export interface NewsItem {
  id: string;
  title: string;
  titleUrdu: string;
  category: NewsCategory;
  categoryUrdu: string;
  date: string;
  summary: string;
  summaryUrdu: string;
  content: string;
  contentUrdu: string;
  imageUrl: string;
  videoUrl?: string;
  isFeatured?: boolean;
}

export interface GalleryMedia {
  id: string;
  title: string;
  titleUrdu: string;
  category: string;
  categoryUrdu: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  imageUrl?: string;
  videoUrl?: string;
  date: string;
  caption: string;
  captionUrdu: string;
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  trackingId: string;
  message: string;
  provider: string;
  senderId: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Simulated';
  sentBy: string;
  timestamp: string;
}

export interface SiteSettings {
  announcement: string;
  announcementUrdu: string;
  announcementActive: boolean;
  helplinePhone: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  smsProvider: string;
  smsSenderId: string;
  smsEnabled: boolean;
  ga4MeasurementId: string;
  officeLocation: string;
  officeLocationUrdu: string;
  officeHours: string;
  officeHoursUrdu: string;
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  action: string;
  adminEmail: string;
  adminUid?: string;
  targetCollection?: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export type PolicyModalType =
  | 'privacy'
  | 'terms'
  | 'data_protection'
  | 'complaint_disclaimer';

// ============================================================================
// CHICHAWATNI CITY MANAGEMENT & MASTER DEVELOPMENT SYSTEM (2027-2030)
// ============================================================================

export type MasterPlanSectorCode =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L';

export type CityProjectStatus =
  | 'Proposed'
  | 'Under Survey'
  | 'Feasibility in Progress'
  | 'Submitted for Approval'
  | 'Approved'
  | 'Funding Requested'
  | 'Funds Released'
  | 'Tendering'
  | 'In Progress'
  | 'Delayed'
  | 'Completed'
  | 'Cancelled';

export type CityPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type CityFeasibility = 'High' | 'Medium' | 'Low' | 'Pending';

export type CityFundingSource =
  | 'Punjab Government'
  | 'Federal Government'
  | 'Municipal Funds'
  | 'Departmental Maintenance Budget'
  | 'Corporate CSR'
  | 'Registered Welfare Organizations'
  | 'Public-Private Partnership'
  | 'Other Verified Sources';

export type CityBudgetStage =
  | 'Proposed'
  | 'Requested'
  | 'Approved'
  | 'Released'
  | 'Expended';

export type CityComplaintCategory =
  | 'Garbage'
  | 'Sewerage'
  | 'Roads'
  | 'Drinking Water'
  | 'Streetlights'
  | 'Traffic'
  | 'Parks'
  | 'Public Facilities'
  | 'Encroachment'
  | 'Other Municipal Issues';

export type CityComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Verification'
  | 'Resolved'
  | 'Reopened'
  | 'Rejected';

export type CityAssetDomain =
  | 'Parks'
  | 'Health'
  | 'Education'
  | 'Markets'
  | 'Traffic'
  | 'Streetlights'
  | 'TownPlanning'
  | 'PublicBuildings';

export type CityRoadCondition =
  | 'Excellent'
  | 'Good'
  | 'Average'
  | 'Poor'
  | 'Critical';

export interface CityArea {
  id: string;
  name: string;
  nameUrdu?: string;
  wardCode: string;
  zoneType: 'Residential' | 'Commercial' | 'Mixed' | 'Industrial' | 'Expansion Belt';
  populationVerified?: number | null;
  populationSource?: string;
  streetsCount?: number;
  householdsVerified?: number;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
  updatedAt: string;
}

export interface CityLocality {
  id: string;
  areaId?: string;
  name: string;
  nameUrdu?: string;
  streetCount?: number;
  householdsVerified?: number;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
  updatedAt: string;
}

export interface CityRoad {
  id: string;
  name: string;
  nameUrdu?: string;
  locality: string;
  roadType:
    | 'Main Road'
    | 'Link Road'
    | 'Street'
    | 'Bridge'
    | 'Culvert'
    | 'Footpath'
    | 'Drainage Channel';
  lengthKm?: number;
  surfaceType?: string;
  condition: CityRoadCondition;
  maintenancePriority: CityPriority;
  lastInspected?: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
  updatedAt: string;
}

export interface CityAsset {
  id: string;
  domain: CityAssetDomain;
  name: string;
  nameUrdu?: string;
  locality: string;
  subType: string;
  status: string;
  condition?: CityRoadCondition | string;
  functionalCount?: number;
  nonFunctionalCount?: number;
  areaSqFt?: string;
  missingFacilities?: string[];
  details?: string;
  latitude?: number | null;
  longitude?: number | null;
  lastInspected?: string;
  updatedAt: string;
}

export interface CityWaterFacility {
  id: string;
  name: string;
  facilityType:
    | 'Tube Well'
    | 'Filtration Plant'
    | 'Supply Line'
    | 'Overhead Tank'
    | 'Quality Test'
    | 'Leakage Issue';
  locality: string;
  status: 'Operational' | 'Partial' | 'Non-Functional' | 'Under Repair';
  qualityResult?: string;
  lastTested?: string;
  repairNotes?: string;
  latitude?: number | null;
  longitude?: number | null;
  updatedAt: string;
}

export interface CitySewerageAsset {
  id: string;
  name: string;
  assetType:
    | 'Sewerage Line'
    | 'Manhole Sector'
    | 'Disposal Station'
    | 'Pumping Station'
    | 'Blocked Drain'
    | 'Flooding Hotspot';
  locality: string;
  condition: 'Clear' | 'Needs Desilting' | 'Blocked' | 'Under Repair';
  lastInspected?: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
  updatedAt: string;
}

export interface CityWasteRoute {
  id: string;
  routeCode: string;
  routeName: string;
  locality: string;
  collectionPointsCount?: number;
  disposalSite?: string;
  vehicleReg?: string;
  vehicleStatus?: 'Active' | 'Maintenance' | 'Out of Service';
  assignedStaffCount?: number;
  wasteTonsMeasured?: number;
  schedule: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Missed';
  fieldVerifiedBy?: string;
  fieldVerificationNotes?: string;
  latitude?: number | null;
  longitude?: number | null;
  updatedAt: string;
}

export interface CityProject {
  id: string;
  projectCode: string;
  name: string;
  nameUrdu?: string;
  sectorCode: MasterPlanSectorCode;
  sector: string;
  description: string;
  exactLocation: string;
  locality: string;
  department: string;
  estimatedCostPkr: number;
  approvedCostPkr: number;
  fundsReleasedPkr: number;
  expenditurePkr: number;
  fundingSource: CityFundingSource | string;
  priority: CityPriority;
  feasibility: CityFeasibility;
  startDate: string;
  expectedCompletionDate: string;
  status: CityProjectStatus;
  targetYear: 2027 | 2028 | 2029 | 2030;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  contractor?: string;
  approvalReference?: string;
  feasibilityDocUrl?: string;
  pciDocUrl?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  isSampleTemplate?: boolean;
  updatedAt: string;
}

export interface CityProjectUpdate {
  id: string;
  projectId: string;
  year: 2027 | 2028 | 2029 | 2030;
  note: string;
  progressPercent: number;
  inspectionOutcome?: string;
  updatedBy: string;
  createdAt: string;
}

export interface CityBudgetRecord {
  id: string;
  title: string;
  fiscalYear: string;
  fundingSource: CityFundingSource;
  fundingStage: CityBudgetStage;
  amountPkr: number;
  sector: string;
  projectCode?: string;
  evidenceRef?: string;
  notes?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface CityDepartment {
  id: string;
  name: string;
  nameUrdu?: string;
  jurisdiction: string;
  focalPerson?: string;
  contactPhone?: string;
  officeAddress?: string;
  correspondenceNotes?: string;
  isIndependentControlDisclaimer: boolean;
  updatedAt: string;
}

export interface CityComplaint {
  id: string;
  trackingId: string;
  citizenName: string;
  phone: string;
  area?: string;
  locality: string;
  category: CityComplaintCategory;
  description: string;
  imageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: CityComplaintStatus;
  priority: CityPriority;
  department?: string;
  assignedOfficer?: string;
  internalNotes?: string;
  resolutionNotes?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  citizenFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitySurvey {
  id: string;
  title: string;
  sector: string;
  locality: string;
  conditionGrade: CityRoadCondition;
  repairRecommendation: string;
  photoUrl?: string;
  officerName: string;
  verificationStatus: 'Draft' | 'Pending Verification' | 'Verified';
  latitude?: number | null;
  longitude?: number | null;
  offlinePendingSync?: boolean;
  createdAt: string;
}

export interface CityInspection {
  id: string;
  targetType: 'Project' | 'Road' | 'Water' | 'Sewerage' | 'Sanitation' | 'Facility';
  targetId: string;
  targetTitle?: string;
  inspectorName: string;
  findings: string;
  outcome: 'Passed' | 'Action Required' | 'Failed';
  photoUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  inspectedAt: string;
}

export type CityReportType =
  | 'Daily Sanitation Report'
  | 'Weekly Complaint Resolution Report'
  | 'Monthly Department Performance Report'
  | 'Quarterly Development Progress Report'
  | 'Annual City Development Report'
  | 'Sector-Wise Progress Report'
  | 'Budget Utilization Report'
  | 'Road Condition Assessment Report'
  | 'Water & Sewerage Status Report'
  | 'Public Facility Condition Report';

export interface CityReport {
  id: string;
  reportType: CityReportType;
  title: string;
  period: string;
  dataSource: string;
  department: string;
  verificationStatus: 'Draft' | 'Provisional' | 'Verified';
  isPublished: boolean;
  summary: string;
  metricsSnapshot?: Record<string, string | number>;
  lastUpdated: string;
}

export interface CityNotice {
  id: string;
  title: string;
  titleUrdu?: string;
  category: string;
  publishDate: string;
  description: string;
  attachmentUrl?: string;
  isPublished: boolean;
}

export interface CityAuditLog {
  id: string;
  action: string;
  module: string;
  actorEmail: string;
  details: string;
  timestamp: string;
}

// ============================================================================
// CHICHAWATNI CITIZEN REGISTRATION & COMMUNITY NETWORK
// ============================================================================

export type CitizenInterestTopic =
  | 'Roads and Infrastructure'
  | 'Cleanliness and Sanitation'
  | 'Water Supply'
  | 'Education'
  | 'Healthcare'
  | 'Youth and Sports'
  | 'Business and Employment'
  | 'Agriculture'
  | 'Environment'
  | 'Community Welfare'
  | 'Public Safety'
  | 'General City Updates';

export type CitizenContactMethod = 'WhatsApp' | 'SMS' | 'Email' | 'In-App';

export type CitizenConsentCategory =
  | 'publicDevelopmentUpdates'
  | 'cityServiceAnnouncements'
  | 'communityEventNotifications'
  | 'surveyInvitations'
  | 'emergencyPublicAlerts';

export interface CitizenProfile {
  id: string; // Firebase Auth UID
  uid: string;
  fullName: string;
  phoneE164: string;
  phoneHash: string;
  phoneVerified: boolean;
  verificationMethod: 'firebase_phone_auth' | 'pending_verification';
  email?: string;
  cityLocality: string;
  villageArea?: string;
  ucWard?: string;
  profession?: string;
  preferredLanguage: Language;
  preferredContactMethod: CitizenContactMethod;
  accountStatus: 'Active' | 'Inactive' | 'Deletion Requested';
  retentionPolicyAcceptedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenConsent {
  id: string;
  uid: string;
  publicDevelopmentUpdates: boolean;
  cityServiceAnnouncements: boolean;
  communityEventNotifications: boolean;
  surveyInvitations: boolean;
  emergencyPublicAlerts: boolean;
  nonPoliticalStatementAccepted: boolean;
  privacyPolicyAccepted: boolean;
  unsubscribedAll: boolean;
  updatedAt: string;
}

export interface CitizenInterestRecord {
  id: string;
  uid: string;
  interests: CitizenInterestTopic[];
  cityLocality: string;
  profession?: string;
  updatedAt: string;
}

export interface CommunicationPreferences {
  id: string;
  uid: string;
  preferredLanguage: Language;
  preferredChannel: CitizenContactMethod;
  whatsappOptIn: boolean;
  smsOptIn: boolean;
  emailOptIn: boolean;
  inAppOptIn: boolean;
  unsubscribedAll: boolean;
  updatedAt: string;
}

export interface CitizenGroup {
  id: string;
  name: string;
  nameUrdu?: string;
  interestCategory: CitizenInterestTopic | 'Multi-Sector Civic';
  localityFilter?: string;
  description: string;
  isNonPoliticalConfirmed: boolean;
  isActive: boolean;
  memberCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenGroupMember {
  id: string; // `${groupId}_${uid}`
  groupId: string;
  groupName: string;
  uid: string;
  memberDisplayName: string;
  locality: string;
  joinedVia: 'Citizen Self-Join' | 'Admin Organized';
  status: 'Active' | 'Left';
  joinedAt: string;
}

export interface CitizenSuggestion {
  id: string;
  uid: string;
  citizenDisplayName: string;
  locality: string;
  sector: string;
  title: string;
  description: string;
  status:
    | 'Submitted'
    | 'Under Community Review'
    | 'Forwarded for Technical Feasibility'
    | 'Archived';
  adminFeedback?: string;
  isPublishedSummary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenSurveyQuestion {
  id: string;
  prompt: string;
  promptUrdu?: string;
  options: string[];
}

export interface CitizenSurvey {
  id: string;
  title: string;
  titleUrdu?: string;
  topic: string;
  description: string;
  questions: CitizenSurveyQuestion[];
  status: 'Draft' | 'Active' | 'Closed';
  responseCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenSurveyResponse {
  id: string; // uid
  surveyId: string;
  uid: string;
  locality: string;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface CitizenVolunteer {
  id: string;
  uid: string;
  volunteerName: string;
  locality: string;
  initiativeTitle: string;
  areaOfInterest: CitizenInterestTopic;
  availability: string;
  skillsNote?: string;
  status: 'Registered' | 'Approved' | 'Active' | 'Completed' | 'Withdrawn';
  isNonPoliticalConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationCategory =
  | 'Local Business'
  | 'Traders & Market Association'
  | 'NGO & Welfare Organization'
  | 'Educational Institution'
  | 'Healthcare Institution'
  | 'Community Organization';

export interface RegisteredOrganization {
  id: string;
  submittedByUid: string;
  orgName: string;
  orgCategory: OrganizationCategory;
  locality: string;
  registrationNumber?: string;
  focalPersonName: string;
  publicContactPhone?: string;
  publicEmail?: string;
  description: string;
  servicesOffered?: string;
  verificationStatus: 'Pending Verification' | 'Verified' | 'Rejected';
  isPublicPublished: boolean;
  verifiedByAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  batchId: string;
  channel: CitizenContactMethod;
  consentCategory: CitizenConsentCategory;
  templateName: string;
  subject: string;
  messageBody: string;
  recipientUid: string;
  recipientName: string;
  recipientMaskedContact: string;
  deliveryStatus:
    | 'Queued'
    | 'Sent'
    | 'Delivered'
    | 'Failed'
    | 'Skipped - No Consent'
    | 'Simulated - Gateway Pending';
  failedReason?: string;
  sentByEmail: string;
  sentAt: string;
}
