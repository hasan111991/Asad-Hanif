export type Language = 'en' | 'ur';

export type AdminRole =
  | 'Super Admin'
  | 'Office Manager'
  | 'Complaint Manager'
  | 'Project Manager'
  | 'Media Manager'
  | 'Data Entry Operator'
  | 'Field Survey Officer'
  | 'Read-only Analyst';

export interface AdminUser {
  id: string;
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

export type FacilityCategory = 'Education' | 'Healthcare' | 'Water' | 'Infrastructure' | 'Agriculture';

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

export type ProjectStatus = 'Proposed' | 'Under Assessment' | 'Approved' | 'In Progress' | 'Completed' | 'Verified';

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
  fundingType: FundingType;
  fundingTypeUrdu: string;
  progressPercent: number;
  latitude: number;
  longitude: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
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
  | 'Verified'
  | 'Assigned'
  | 'Referred to Department'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

export interface CitizenComplaint {
  id: string;
  trackingId: string;
  citizenName: string;
  phone: string;
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

export interface FieldSurvey {
  id: string;
  surveyorName: string;
  surveyorPhone: string;
  unionCouncil: string;
  village: string;
  surveyType: 'Infrastructure' | 'School Inspection' | 'Healthcare Check' | 'Water/Sanitation' | 'Agriculture';
  roadCondition: string;
  facilityCondition: string;
  issuesIdentified: string;
  notes: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'Submitted' | 'Verified' | 'Action Scheduled';
  photoUrl?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  titleUrdu: string;
  location: string;
  unionCouncil: string;
  problemIdentified: string;
  evidenceUsed: string;
  sourceRecords: string;
  estimatedPopulationAffected: number;
  estimatedCostRange: string;
  priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  expectedBenefits: string;
  risksAndLimitations: string;
  suggestedNextAction: string;
  confidenceLevel: number;
  createdAt: string;
  status: 'Pending Review' | 'Accepted' | 'Under Feasibility' | 'Archived';
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
  date: string;
  caption: string;
  captionUrdu: string;
}

export interface SiteSettings {
  announcement: string;
  announcementUrdu: string;
  announcementActive: boolean;
  helplinePhone: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
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
  targetCollection?: string;
  targetId?: string;
  details: string;
  timestamp: string;
}
