import React, { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCityData } from '../context/CityDataContext';
import { useCitizenNetwork, CitizenRegistrationPayload } from '../context/CitizenNetworkContext';
import {
  CITIZEN_CONSENT_OPTIONS,
  CITIZEN_CONTACT_METHODS,
  CITIZEN_INTEREST_TOPICS,
  ORGANIZATION_CATEGORIES
} from '../data/citizenNetworkData';
import { MASTER_PLAN_SECTORS, OFFICIAL_APPROVED_PROJECT_STATUSES } from '../data/cityManagementData';
import {
  CitizenContactMethod,
  CitizenInterestTopic,
  Language,
  RegisteredOrganization
} from '../types';
import {
  Users,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  Lock,
  Bell,
  FileText,
  Building2,
  Download,
  Trash2,
  HeartHandshake,
  MessageSquare,
  ClipboardList,
  LogOut,
  KeyRound,
  Mail,
  Send
} from 'lucide-react';

type CommunitySubTab = 'register' | 'participation' | 'organizations';

const RECAPTCHA_CONTAINER_ID = 'citizen-recaptcha-container';

export const CommunityNetworkPortal: React.FC<{ onNavigatePublic?: (tab: string) => void }> = ({
  onNavigatePublic
}) => {
  const { language } = useLanguage();
  const { cityAreas, cityProjects } = useCityData();
  const {
    citizenUser,
    citizenLoading,
    myProfile,
    myConsent,
    myInterests,
    myCommPrefs,
    myMemberships,
    mySuggestions,
    myVolunteers,
    myOrganizations,
    myInAppMessages,
    otpPending,
    isTestCitizenSession,
    testOtpPhone,
    sendPhoneOtp,
    confirmOtpAndRegister,
    signInExistingCitizenWithOtp,
    cancelPendingOtp,
    linkRecoveryEmail,
    signInCitizenWithEmail,
    sendRecoveryPasswordReset,
    logoutCitizen,
    updateMyProfile,
    updateMyConsentsAndPrefs,
    unsubscribeAllCommunications,
    exportMyCitizenDataJSON,
    deleteMyCitizenAccount,
    activeGroups,
    publicSuggestions,
    activeSurveys,
    verifiedOrganizations,
    joinVoluntaryGroup,
    leaveVoluntaryGroup,
    submitCitySuggestion,
    submitSurveyResponse,
    checkMySurveySubmitted,
    registerVolunteer,
    withdrawVolunteer,
    submitOrganizationListing
  } = useCitizenNetwork();

  const isCitizenAuthenticated = Boolean(citizenUser || isTestCitizenSession);

  const [subTab, setSubTab] = useState<CommunitySubTab>('register');
  const [authMode, setAuthMode] = useState<'register' | 'signin' | 'recovery'>('register');
  const formRef = useRef<HTMLDivElement>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [email, setEmail] = useState('');
  const [cityLocality, setCityLocality] = useState('');
  const [villageArea, setVillageArea] = useState('');
  const [ucWard, setUcWard] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<CitizenInterestTopic[]>([]);
  const [prefLang, setPrefLang] = useState<Language>(language);
  const [prefContact, setPrefContact] = useState<CitizenContactMethod>('WhatsApp');

  // Granular Consent Checkboxes — strictly ALL false by default (never auto-subscribed!)
  const [consents, setConsents] = useState({
    publicDevelopmentUpdates: false,
    cityServiceAnnouncements: false,
    communityEventNotifications: false,
    surveyInvitations: false,
    emergencyPublicAlerts: false,
    nonPoliticalStatementAccepted: false,
    privacyPolicyAccepted: false
  });

  // OTP & Feedback State
  const [otpCode, setOtpCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Recovery / Email Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [recoveryEmailLink, setRecoveryEmailLink] = useState('');
  const [recoveryPasswordLink, setRecoveryPasswordLink] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Self-service Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocality, setEditLocality] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editUcWard, setEditUcWard] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editInterests, setEditInterests] = useState<CitizenInterestTopic[]>([]);

  // Participation Forms State
  const [sugTitle, setSugTitle] = useState('');
  const [sugSector, setSugSector] = useState<string>(MASTER_PLAN_SECTORS[0].name);
  const [sugLocality, setSugLocality] = useState('');
  const [sugDesc, setSugDesc] = useState('');

  const [volInitiative, setVolInitiative] = useState('');
  const [volInterest, setVolInterest] = useState<CitizenInterestTopic>('Cleanliness and Sanitation');
  const [volAvailability, setVolAvailability] = useState('Weekends (Morning)');
  const [volSkills, setVolSkills] = useState('');

  const [activeSurveyAnswers, setActiveSurveyAnswers] = useState<Record<string, Record<string, string>>>({});
  const [submittedSurveys, setSubmittedSurveys] = useState<Record<string, boolean>>({});

  // Organization Directory Submission State
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [orgFormOpen, setOrgFormOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgCategory, setOrgCategory] = useState<RegisteredOrganization['orgCategory']>('Local Business');
  const [orgLocality, setOrgLocality] = useState('');
  const [orgRegNo, setOrgRegNo] = useState('');
  const [orgFocal, setOrgFocal] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgDesc, setOrgDesc] = useState('');
  const [orgServices, setOrgServices] = useState('');

  const scrollToForm = () => {
    setSubTab('register');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const toggleInterest = (topic: CitizenInterestTopic) => {
    setSelectedInterests((prev) =>
      prev.includes(topic) ? prev.filter((i) => i !== topic) : [...prev, topic]
    );
  };

  const fillTestRegistrationValues = () => {
    setFullName('Muhammad Bilal (Test)');
    setPhoneRaw('0300-1234567');
    setEmail('bilal.test@chichawatni.example');
    setCityLocality('Civil Lines');
    setVillageArea('Chak 112/7-R');
    setUcWard('Ward 04');
    setProfession('School Teacher');
    setSelectedInterests(['Cleanliness and Sanitation', 'Education']);
    setConsents((prev) => ({
      ...prev,
      nonPoliticalStatementAccepted: true,
      privacyPolicyAccepted: true
    }));
    setStatusBanner({
      type: 'ok',
      text: 'Test resident values filled (optional communication alerts left unchecked so you can choose separately). Click "Quick Test OTP (123456)" to test verification.'
    });
  };

  const requestRegistrationOtp = async (useTestMode = false) => {
    setStatusBanner(null);

    if (fullName.trim().length < 2) {
      setStatusBanner({ type: 'err', text: 'Please enter your full name.' });
      return;
    }
    if (cityLocality.trim().length < 2) {
      setStatusBanner({ type: 'err', text: 'Please enter your city locality or area.' });
      return;
    }
    if (selectedInterests.length === 0) {
      setStatusBanner({ type: 'err', text: 'Select at least one area of civic interest.' });
      return;
    }
    if (!consents.nonPoliticalStatementAccepted || !consents.privacyPolicyAccepted) {
      setStatusBanner({
        type: 'err',
        text: 'Please read and accept the voluntary civic privacy, non-political use, and data retention policy.'
      });
      return;
    }

    setBusy(true);
    const res = await sendPhoneOtp(phoneRaw, RECAPTCHA_CONTAINER_ID, useTestMode);
    setBusy(false);
    if (!res.ok) {
      setStatusBanner({ type: 'err', text: res.error || 'Could not send OTP.' });
    } else if (res.isTestMode) {
      setStatusBanner({
        type: 'ok',
        text: `Test Verification Mode active for ${res.phoneE164}. Enter OTP code 123456 below to verify and test immediately.`
      });
    } else {
      setStatusBanner({
        type: 'ok',
        text: `Verification OTP sent to ${res.phoneE164}. Enter the 6-digit code below to complete registration.`
      });
    }
  };

  const handleRequestRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestRegistrationOtp(false);
  };

  const handleVerifyRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    setBusy(true);
    const payload: CitizenRegistrationPayload = {
      fullName,
      phoneRaw,
      email: email.trim() || undefined,
      cityLocality,
      villageArea: villageArea.trim() || undefined,
      ucWard: ucWard.trim() || undefined,
      profession: profession.trim() || undefined,
      interests: selectedInterests,
      preferredLanguage: prefLang,
      preferredContactMethod: prefContact,
      consents
    };
    const res = await confirmOtpAndRegister(otpCode, payload);
    setBusy(false);
    if (!res.ok) {
      setStatusBanner({ type: 'err', text: res.error || 'Verification failed.' });
      return;
    }
    setOtpCode('');
    if (res.duplicateDetected) {
      setStatusBanner({
        type: 'ok',
        text: 'Existing verified registration loaded for your mobile number. Duplicate accounts are automatically prevented.'
      });
    } else {
      setStatusBanner({
        type: 'ok',
        text: 'Mobile verified! Welcome to the Chichawatni Community Network.'
      });
    }
  };

  const requestSignInOtp = async (useTestMode = false, phoneOverride?: string) => {
    setStatusBanner(null);
    setBusy(true);
    const res = await sendPhoneOtp(phoneOverride ?? phoneRaw, RECAPTCHA_CONTAINER_ID, useTestMode);
    setBusy(false);
    if (!res.ok) {
      setStatusBanner({ type: 'err', text: res.error || 'Failed to send sign-in OTP.' });
    } else if (res.isTestMode) {
      setStatusBanner({
        type: 'ok',
        text: `Test Sign-In Mode active for ${res.phoneE164}. Enter OTP code 123456 below.`
      });
    } else {
      setStatusBanner({ type: 'ok', text: `OTP sent to ${res.phoneE164}.` });
    }
  };

  const handleRequestSignInOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestSignInOtp(false);
  };

  const handleVerifySignInOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    setBusy(true);
    const res = await signInExistingCitizenWithOtp(otpCode);
    setBusy(false);
    if (!res.ok) {
      setStatusBanner({ type: 'err', text: res.error || 'OTP sign-in failed.' });
    } else if (!res.profileFound) {
      setAuthMode('register');
      setStatusBanner({
        type: 'err',
        text: 'No Community Network profile found for this mobile number yet. Complete the voluntary registration form below.'
      });
    } else {
      setOtpCode('');
      setStatusBanner({ type: 'ok', text: 'Signed in to your verified Community Network account.' });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusBanner(null);
    setBusy(true);
    const res = await signInCitizenWithEmail(loginEmail, loginPassword);
    setBusy(false);
    if (!res.ok) {
      setStatusBanner({ type: 'err', text: res.error || 'Email recovery sign-in failed.' });
    } else {
      setStatusBanner({ type: 'ok', text: 'Signed in via recovery email.' });
    }
  };

  const handlePasswordReset = async () => {
    if (!loginEmail.trim()) {
      setStatusBanner({ type: 'err', text: 'Enter your linked recovery email first.' });
      return;
    }
    setBusy(true);
    const res = await sendRecoveryPasswordReset(loginEmail);
    setBusy(false);
    if (res.ok) {
      setStatusBanner({ type: 'ok', text: 'Password reset instructions sent to your linked email.' });
    } else {
      setStatusBanner({ type: 'err', text: res.error || 'Could not send reset email.' });
    }
  };

  const handleDownloadMyData = () => {
    const json = exportMyCitizenDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chichawatni-Citizen-Data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publicCityProjects = useMemo(
    () =>
      cityProjects
        .filter((p) => !p.isSampleTemplate)
        .filter((p) => OFFICIAL_APPROVED_PROJECT_STATUSES.includes(p.status))
        .slice(0, 8),
    [cityProjects]
  );

  const visibleOrgs = useMemo(
    () =>
      verifiedOrganizations.filter(
        (o) => orgFilter === 'all' || o.orgCategory === orgFilter
      ),
    [verifiedOrganizations, orgFilter]
  );

  return (
    <div className="bg-[#F7F9F7] min-h-screen">
      {/* 1. Editorial Hero Banner */}
      <section className="bg-[#123B28] text-white border-b-4 border-[#C9A227]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
              {language === 'ur'
                ? 'چیچہ وطنی کمیونٹی نیٹ ورک · رضاکارانہ شہری شمولیت'
                : 'Register with Chichawatni Community Network'}
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight text-white [text-wrap:balance]">
              {language === 'ur'
                ? 'چیچہ وطنی کی ترقی کا حصہ بنیں'
                : "Be Part of Chichawatni's Development"}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              {language === 'ur'
                ? 'شہری اپ ڈیٹس حاصل کرنے، مقامی مسائل کی نشاندہی کرنے اور کمیونٹی کی بہتری کے اقدامات میں رضاکارانہ طور پر شریک ہونے کے لیے رجسٹریشن کروائیں۔'
                : 'Register voluntarily to receive city updates, share local concerns and participate in community improvement initiatives.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-[#C9A227] hover:bg-[#b5901d] text-[#123B28] font-bold text-sm transition cursor-pointer"
              >
                {language === 'ur' ? 'ابھی رجسٹر کریں' : 'Register Now'}
              </button>
              <button
                type="button"
                onClick={() => setSubTab('participation')}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold text-sm transition cursor-pointer"
              >
                {language === 'ur' ? 'شہری شمولیت اور سروے' : 'Participation & Surveys'}
              </button>
              <button
                type="button"
                onClick={() => setSubTab('organizations')}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold text-sm transition cursor-pointer"
              >
                {language === 'ur' ? 'ادارہ جاتی ڈائریکٹری' : 'Organizations Directory'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Secondary Section: How Your Participation Helps */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#087A43]">
                {language === 'ur' ? 'رضاکارانہ شہری تعاون' : 'Civic Collaboration'}
              </p>
              <h2 className="font-editorial text-2xl font-bold text-[#123B28] mt-1">
                {language === 'ur'
                  ? 'آپ کی شرکت کس طرح مددگار ثابت ہوتی ہے'
                  : 'How Your Participation Helps'}
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              {language === 'ur'
                ? 'یہ نیٹ ورک مکمل طور پر غیر سیاسی، رضاکارانہ اور شہری خدمات کی بہتری کے لیے مختص ہے۔'
                : 'Voluntary, non-political civic registration strictly protected under explicit opt-in privacy rules.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: '01',
                titleEn: 'Better understanding of local needs',
                titleUr: 'مقامی ضروریات کی بہتر تفہیم',
                descEn: 'Neighborhood-level input helps identify water, road, sanitation, and streetlight priorities.',
                descUr: 'محلہ اور چک کی سطح پر رائے سے پانی، سڑکوں اور صفائی کی ترجیحات واضح ہوتی ہیں۔'
              },
              {
                num: '02',
                titleEn: 'Improved communication about public services',
                titleUr: 'عوامی خدمات کے بارے میں بہتر آگاہی',
                descEn: 'Receive only the service notices or emergency alerts you explicitly choose to receive.',
                descUr: 'صرف وہی اعلانات اور الرٹس موصول کریں جن کی آپ واضح اجازت دیں۔'
              },
              {
                num: '03',
                titleEn: 'Community feedback and surveys',
                titleUr: 'کمیونٹی فیڈبیک اور عوامی سروے',
                descEn: 'Participate in voluntary local surveys and track shared community suggestions.',
                descUr: 'رضاکارانہ عوامی سروے میں حصہ لیں اور تجاویز کا جائزہ لیں۔'
              },
              {
                num: '04',
                titleEn: 'More informed city planning',
                titleUr: 'مؤثر اور باخبر شہری منصوبہ بندی',
                descEn: 'Verified community feedback supports technical feasibility reviews for City 2030 planning.',
                descUr: 'تصدیق شدہ عوامی رائے سٹی 2030 کی تکنیکی منصوبہ بندی میں معاون ثابت ہوتی ہے۔'
              }
            ].map((item) => (
              <div key={item.num} className="space-y-2 pt-2">
                <span className="font-mono text-xs font-bold text-[#087A43] tabular-nums">
                  {item.num}
                </span>
                <h3 className="font-bold text-sm text-[#123B28]">
                  {language === 'ur' ? item.titleUr : item.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ur' ? item.descUr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Main Interactive Workspace */}
      <section ref={formRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* Workspace Segmented Navigation */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl w-fit">
          {[
            { id: 'register' as const, label: isCitizenAuthenticated ? 'My Community Account' : 'Register / Sign In' },
            { id: 'participation' as const, label: 'Citizen Participation' },
            { id: 'organizations' as const, label: 'Businesses, NGOs & Institutions' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                subTab === tab.id
                  ? 'bg-[#123B28] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {statusBanner && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              statusBanner.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {statusBanner.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{statusBanner.text}</span>
          </div>
        )}

        {/* TAB 1: REGISTRATION OR SELF-SERVICE PROFILE */}
        {subTab === 'register' && (
          <>
            {citizenLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-600">
                Verifying citizen session...
              </div>
            ) : isCitizenAuthenticated && myProfile ? (
              <div className="space-y-6">
                {/* Account Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#087A43]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {myProfile.phoneVerified
                          ? 'Verified Mobile Registration'
                          : 'Pending Mobile Verification'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-600">{myProfile.phoneE164}</span>
                      {isTestCitizenSession && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">
                          Test Sandbox Session
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial text-2xl font-bold text-[#123B28]">
                      {myProfile.fullName}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {myProfile.cityLocality}
                      {myProfile.ucWard ? ` · ${myProfile.ucWard}` : ''}
                      {myProfile.profession ? ` · ${myProfile.profession}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile((prev) => !prev);
                        setEditName(myProfile.fullName);
                        setEditLocality(myProfile.cityLocality);
                        setEditVillage(myProfile.villageArea || '');
                        setEditUcWard(myProfile.ucWard || '');
                        setEditProfession(myProfile.profession || '');
                        setEditInterests(myInterests?.interests || []);
                      }}
                      className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#123B28] hover:bg-slate-50 cursor-pointer"
                    >
                      {editingProfile ? 'Cancel Edit' : 'Update My Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadMyData}
                      className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export My Data</span>
                    </button>
                    <button
                      type="button"
                      onClick={logoutCitizen}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Edit Profile Panel */}
                {editingProfile && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await updateMyProfile(
                        {
                          fullName: editName,
                          cityLocality: editLocality,
                          villageArea: editVillage,
                          ucWard: editUcWard,
                          profession: editProfession
                        },
                        editInterests
                      );
                      setEditingProfile(false);
                      setStatusBanner({ type: 'ok', text: 'Your profile and civic interests have been updated.' });
                    }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                  >
                    <h4 className="font-bold text-sm text-[#123B28]">Update Profile & Civic Interests</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700">Full Name</span>
                        <input
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700">City / Locality</span>
                        <input
                          required
                          value={editLocality}
                          onChange={(e) => setEditLocality(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700">Village / Area</span>
                        <input
                          value={editVillage}
                          onChange={(e) => setEditVillage(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700">UC / Ward</span>
                        <input
                          value={editUcWard}
                          onChange={(e) => setEditUcWard(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="font-semibold text-slate-700">Profession (Optional)</span>
                        <input
                          value={editProfession}
                          onChange={(e) => setEditProfession(e.target.value)}
                          className="w-full min-h-[42px] px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-700 block">Areas of Interest</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {CITIZEN_INTEREST_TOPICS.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 text-xs p-2 rounded-lg border border-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editInterests.includes(t.id)}
                              onChange={() =>
                                setEditInterests((prev) =>
                                  prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                                )
                              }
                            />
                            <span>{language === 'ur' ? t.ur : t.en}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#087A43] text-white text-xs font-bold cursor-pointer"
                    >
                      Save Profile Updates
                    </button>
                  </form>
                )}

                {/* Consent & Channel Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#087A43]" />
                        <span>Revocable Communication Consents</span>
                      </h4>
                      <button
                        type="button"
                        onClick={async () => {
                          await unsubscribeAllCommunications();
                          setStatusBanner({
                            type: 'ok',
                            text: 'Unsubscribed from all optional civic communications.'
                          });
                        }}
                        className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                      >
                        Unsubscribe from All
                      </button>
                    </div>

                    {myConsent && (
                      <div className="space-y-2.5">
                        {CITIZEN_CONSENT_OPTIONS.map((opt) => (
                          <label
                            key={opt.key}
                            className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(myConsent[opt.key]) && !myConsent.unsubscribedAll}
                              onChange={async (e) => {
                                await updateMyConsentsAndPrefs(
                                  {
                                    [opt.key]: e.target.checked,
                                    unsubscribedAll: false
                                  },
                                  { unsubscribedAll: false }
                                );
                              }}
                              className="mt-0.5"
                            />
                            <div>
                              <span className="text-xs font-semibold text-[#123B28] block">
                                {language === 'ur' ? opt.ur : opt.en}
                              </span>
                              <span className="text-[11px] text-slate-600">
                                {language === 'ur' ? opt.descUr : opt.descEn}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Channel Preferences, Account Recovery & Account Deletion */}
                  <div className="space-y-6">
                    {myCommPrefs && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                        <h4 className="font-bold text-sm text-[#123B28]">
                          Preferred Language & Contact Channels
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Language</span>
                            <select
                              value={myCommPrefs.preferredLanguage}
                              onChange={(e) =>
                                updateMyConsentsAndPrefs(
                                  {},
                                  { preferredLanguage: e.target.value as Language }
                                )
                              }
                              className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                            >
                              <option value="en">English</option>
                              <option value="ur">اردو (Urdu)</option>
                            </select>
                          </label>
                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Primary Channel</span>
                            <select
                              value={myCommPrefs.preferredChannel}
                              onChange={(e) =>
                                updateMyConsentsAndPrefs(
                                  {},
                                  { preferredChannel: e.target.value as CitizenContactMethod }
                                )
                              }
                              className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                            >
                              {CITIZEN_CONTACT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          {(
                            [
                              ['whatsappOptIn', 'WhatsApp Updates'],
                              ['smsOptIn', 'SMS Alerts'],
                              ['emailOptIn', 'Email Updates'],
                              ['inAppOptIn', 'In-App Notifications']
                            ] as const
                          ).map(([key, label]) => (
                            <label key={key} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={myCommPrefs[key]}
                                onChange={(e) =>
                                  updateMyConsentsAndPrefs(
                                    {},
                                    { [key]: e.target.checked, unsubscribedAll: false }
                                  )
                                }
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Account Recovery Linking (Firebase Auth Email Credential — zero password in Firestore) */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                      <h4 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#087A43]" />
                        <span>Account Recovery Setup</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Link a recovery email & password directly inside Firebase Authentication (never stored in Firestore) in case you lose access to your mobile SIM.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="email"
                          placeholder="Recovery email"
                          value={recoveryEmailLink}
                          onChange={(e) => setRecoveryEmailLink(e.target.value)}
                          className="min-h-[40px] px-3 border border-slate-300 rounded-xl"
                        />
                        <input
                          type="password"
                          placeholder="Recovery password (min 6 chars)"
                          value={recoveryPasswordLink}
                          onChange={(e) => setRecoveryPasswordLink(e.target.value)}
                          className="min-h-[40px] px-3 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const r = await linkRecoveryEmail(recoveryEmailLink, recoveryPasswordLink);
                          setStatusBanner({
                            type: r.ok ? 'ok' : 'err',
                            text: r.ok
                              ? 'Recovery email linked in Firebase Authentication.'
                              : r.error || 'Failed to link recovery email.'
                          });
                        }}
                        className="min-h-[40px] px-4 py-2 rounded-xl bg-[#123B28] text-white text-xs font-semibold cursor-pointer"
                      >
                        Link Recovery Email
                      </button>

                      {/* Permanent Account Deletion */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-600">
                          Right to Erasure & Data Retention Control
                        </span>
                        {!confirmDeleteOpen ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteOpen(true)}
                            className="text-xs font-semibold text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete My Account</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const r = await deleteMyCitizenAccount();
                                setConfirmDeleteOpen(false);
                                setStatusBanner({
                                  type: r.ok ? 'ok' : 'err',
                                  text: r.ok
                                    ? r.error || 'Your Community Network account and personal records have been deleted.'
                                    : r.error || 'Deletion failed.'
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Confirm Permanent Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOpen(false)}
                              className="px-2 py-1.5 text-xs text-slate-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Unauthenticated Visitor: Voluntary Registration + Sign-In + Recovery */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28]">
                      Register with Chichawatni Community Network
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Mobile OTP verified · Zero CNIC or home street address collected · Strictly non-political
                    </p>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                    {(
                      [
                        ['register', 'New Registration'],
                        ['signin', 'Member OTP Sign-In'],
                        ['recovery', 'Account Recovery']
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          cancelPendingOtp();
                          setAuthMode(id);
                          setStatusBanner(null);
                        }}
                        className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                          authMode === id ? 'bg-white text-[#123B28] shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visible Firebase reCAPTCHA anchor */}
                <div id={RECAPTCHA_CONTAINER_ID} />

                {authMode === 'register' && (
                  <>
                    {!otpPending ? (
                      <form onSubmit={handleRequestRegistrationOtp} className="space-y-6">
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <Lock className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-semibold">Privacy & Minimal Data Guarantee</p>
                              <p className="leading-relaxed">
                                We do <strong>not</strong> collect CNIC numbers, exact home street addresses, or family details. Registration data is never used for political profiling, voter targeting, political persuasion, or shared with any political organization.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={fillTestRegistrationValues}
                            className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-[#123B28] font-semibold hover:bg-emerald-100 transition cursor-pointer shrink-0"
                          >
                            Fill Test Resident Values
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Full Name *</span>
                            <input
                              required
                              minLength={2}
                              maxLength={120}
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Muhammad Bilal"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Mobile Number (OTP Verified) *</span>
                            <input
                              required
                              type="tel"
                              value={phoneRaw}
                              onChange={(e) => setPhoneRaw(e.target.value)}
                              placeholder="0300-1234567 or +923001234567"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono"
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Email Address (Optional)</span>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="resident@example.com"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">City / Locality *</span>
                            <input
                              required
                              list="chichawatni-localities-datalist"
                              value={cityLocality}
                              onChange={(e) => setCityLocality(e.target.value)}
                              placeholder="e.g. Chichawatni City / Civil Lines"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            />
                            <datalist id="chichawatni-localities-datalist">
                              {cityAreas.map((a) => (
                                <option key={a.id} value={a.name} />
                              ))}
                              <option value="Chichawatni City" />
                              <option value="Civil Lines" />
                              <option value="Railway Road" />
                              <option value="Ghallah Mandi" />
                            </datalist>
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Village / Area (if applicable)</span>
                            <input
                              value={villageArea}
                              onChange={(e) => setVillageArea(e.target.value)}
                              placeholder="Optional Chak or Mohallah"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">UC / Ward (if verified)</span>
                            <input
                              value={ucWard}
                              onChange={(e) => setUcWard(e.target.value)}
                              placeholder="Optional Ward or UC"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Profession (Optional)</span>
                            <input
                              value={profession}
                              onChange={(e) => setProfession(e.target.value)}
                              placeholder="e.g. Teacher, Farmer, Trader, Student"
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            />
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Preferred Language</span>
                            <select
                              value={prefLang}
                              onChange={(e) => setPrefLang(e.target.value as Language)}
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            >
                              <option value="en">English</option>
                              <option value="ur">اردو (Urdu)</option>
                            </select>
                          </label>

                          <label className="space-y-1">
                            <span className="font-semibold text-slate-700">Preferred Contact Method</span>
                            <select
                              value={prefContact}
                              onChange={(e) => setPrefContact(e.target.value as CitizenContactMethod)}
                              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                            >
                              {CITIZEN_CONTACT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        {/* Areas of Interest */}
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-700 block">
                            Areas of Interest * (select one or more voluntary topics)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                            {CITIZEN_INTEREST_TOPICS.map((topic) => (
                              <label
                                key={topic.id}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                                  selectedInterests.includes(topic.id)
                                    ? 'border-[#087A43] bg-emerald-50 text-[#123B28] font-semibold'
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedInterests.includes(topic.id)}
                                  onChange={() => toggleInterest(topic.id)}
                                />
                                <span>{language === 'ur' ? topic.ur : topic.en}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Explicit Granular Consent */}
                        <div className="border-t border-slate-200 pt-5 space-y-3">
                          <h4 className="font-bold text-sm text-[#123B28]">
                            Explicit Communication Consent (Optional & Revocable)
                          </h4>
                          <p className="text-xs text-slate-600">
                            Choose separately which updates you wish to receive. None are pre-selected, and you can unsubscribe anytime.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {CITIZEN_CONSENT_OPTIONS.map((opt) => (
                              <label
                                key={opt.key}
                                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={consents[opt.key]}
                                  onChange={(e) =>
                                    setConsents((prev) => ({ ...prev, [opt.key]: e.target.checked }))
                                  }
                                  className="mt-0.5"
                                />
                                <div>
                                  <span className="font-semibold text-[#123B28] block">
                                    {language === 'ur' ? opt.ur : opt.en}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {language === 'ur' ? opt.descUr : opt.descEn}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>

                          <div className="space-y-2 pt-2 text-xs">
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                required
                                checked={consents.nonPoliticalStatementAccepted}
                                onChange={(e) =>
                                  setConsents((prev) => ({
                                    ...prev,
                                    nonPoliticalStatementAccepted: e.target.checked
                                  }))
                                }
                                className="mt-0.5"
                              />
                              <span className="text-slate-700">
                                I understand registration is strictly voluntary, non-political, and will never be used for voter targeting or political persuasion.
                              </span>
                            </label>
                            <label className="flex items-start gap-2.5 cursor-pointer">
                              <input
                                type="checkbox"
                                required
                                checked={consents.privacyPolicyAccepted}
                                onChange={(e) =>
                                  setConsents((prev) => ({
                                    ...prev,
                                    privacyPolicyAccepted: e.target.checked
                                  }))
                                }
                                className="mt-0.5"
                              />
                              <span className="text-slate-700">
                                I accept the Data Retention Policy (24-month review cycle with anytime JSON export & permanent deletion controls).
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="submit"
                            disabled={busy}
                            className="min-h-[48px] px-6 py-3 rounded-xl bg-[#087A43] hover:bg-[#123B28] text-white font-bold text-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            <Phone className="w-4 h-4 text-[#C9A227]" />
                            <span>{busy ? 'Sending Verification OTP...' : 'Verify Mobile & Register'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => requestRegistrationOtp(true)}
                            className="min-h-[48px] px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold text-xs cursor-pointer disabled:opacity-60"
                          >
                            Quick Test OTP (123456)
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyRegistrationOtp} className="max-w-md space-y-4">
                        {testOtpPhone && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-2">
                            <span>
                              <strong>Test OTP Mode Active:</strong> Use code <code className="font-mono font-bold">123456</code> for {testOtpPhone}.
                            </span>
                            <button
                              type="button"
                              onClick={() => setOtpCode('123456')}
                              className="px-2.5 py-1 rounded bg-white border border-amber-300 font-bold text-amber-950 cursor-pointer shrink-0"
                            >
                              Auto-fill 123456
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-slate-700">
                          {testOtpPhone
                            ? 'Enter test OTP code 123456 below to verify your test registration:'
                            : 'Enter the 6-digit SMS verification code sent via Firebase Phone Authentication:'}
                        </p>
                        <input
                          required
                          maxLength={8}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="6-digit OTP code"
                          className="w-full min-h-[48px] px-4 py-2 border border-slate-300 rounded-xl font-mono text-lg tracking-widest text-center"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="submit"
                            disabled={busy}
                            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#087A43] text-white text-xs font-bold cursor-pointer"
                          >
                            {busy ? 'Verifying...' : 'Confirm OTP & Complete Registration'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelPendingOtp}
                            className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            Back
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {authMode === 'signin' && (
                  <div className="max-w-md space-y-4">
                    {!otpPending ? (
                      <form onSubmit={handleRequestSignInOtp} className="space-y-3 text-xs">
                        <label className="space-y-1 block">
                          <span className="font-semibold text-slate-700">Registered Mobile Number</span>
                          <input
                            required
                            type="tel"
                            value={phoneRaw}
                            onChange={(e) => setPhoneRaw(e.target.value)}
                            placeholder="0300-1234567"
                            className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="submit"
                            disabled={busy}
                            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#123B28] text-white font-bold cursor-pointer"
                          >
                            {busy ? 'Sending...' : 'Send Sign-In OTP'}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              const phoneToUse = phoneRaw.trim() || '0300-1234567';
                              if (!phoneRaw.trim()) setPhoneRaw(phoneToUse);
                              void requestSignInOtp(true, phoneToUse);
                            }}
                            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold cursor-pointer"
                          >
                            Quick Test Sign-In (OTP: 123456)
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifySignInOtp} className="space-y-3 text-xs">
                        {testOtpPhone && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-2">
                            <span>
                              <strong>Test OTP Mode:</strong> Enter <code className="font-mono font-bold">123456</code>
                            </span>
                            <button
                              type="button"
                              onClick={() => setOtpCode('123456')}
                              className="px-2.5 py-1 rounded bg-white border border-amber-300 font-bold text-amber-950 cursor-pointer"
                            >
                              Auto-fill 123456
                            </button>
                          </div>
                        )}
                        <input
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="6-digit OTP code"
                          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono text-center tracking-widest"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={busy}
                            className="min-h-[44px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold cursor-pointer"
                          >
                            Verify & Sign In
                          </button>
                          <button
                            type="button"
                            onClick={cancelPendingOtp}
                            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {authMode === 'recovery' && (
                  <form onSubmit={handleEmailSignIn} className="max-w-md space-y-3 text-xs">
                    <p className="text-slate-600">
                      Sign in with a previously linked recovery email and password, or request a Firebase password reset link.
                    </p>
                    <input
                      required
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Linked recovery email"
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                    />
                    <input
                      required
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={busy}
                        className="min-h-[44px] px-5 py-2 rounded-xl bg-[#123B28] text-white font-bold cursor-pointer"
                      >
                        Sign In via Recovery Email
                      </button>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-xs font-semibold text-[#087A43] hover:underline cursor-pointer"
                      >
                        Send Password Reset Email
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 2: CITIZEN PARTICIPATION */}
        {subTab === 'participation' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950">
              <strong>Civic Participation Notice:</strong> Community suggestions, voluntary service groups, and surveys inform neighborhood priorities and remain strictly separate from official government project approvals and municipal budget authorizations.
            </div>

            {!isCitizenAuthenticated && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-700">
                  Verify your mobile number via the Registration tab to submit suggestions, vote in surveys, join service groups, or volunteer.
                </span>
                <button
                  type="button"
                  onClick={() => setSubTab('register')}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#087A43] text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  Register / Sign In
                </button>
              </div>
            )}

            {/* In-App Notifications & Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Submit City Improvement Suggestion */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-bold text-base text-[#123B28] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#087A43]" />
                    <span>Submit City Improvement Suggestion</span>
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!isCitizenAuthenticated || !myProfile) {
                        setStatusBanner({ type: 'err', text: 'Sign in with your verified registration first.' });
                        return;
                      }
                      await submitCitySuggestion({
                        title: sugTitle,
                        sector: sugSector,
                        locality: sugLocality || myProfile.cityLocality,
                        description: sugDesc
                      });
                      setSugTitle('');
                      setSugDesc('');
                      setStatusBanner({ type: 'ok', text: 'Improvement suggestion recorded for community review.' });
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        required
                        minLength={3}
                        placeholder="Suggestion Title"
                        value={sugTitle}
                        onChange={(e) => setSugTitle(e.target.value)}
                        className="min-h-[42px] px-3 border border-slate-300 rounded-xl sm:col-span-2"
                      />
                      <select
                        value={sugSector}
                        onChange={(e) => setSugSector(e.target.value)}
                        className="min-h-[42px] px-3 border border-slate-300 rounded-xl"
                      >
                        {MASTER_PLAN_SECTORS.map((s) => (
                          <option key={s.code} value={s.name}>
                            {s.code}. {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      placeholder="Specific Locality / Area"
                      value={sugLocality}
                      onChange={(e) => setSugLocality(e.target.value)}
                      className="w-full min-h-[42px] px-3 border border-slate-300 rounded-xl"
                    />
                    <textarea
                      required
                      minLength={10}
                      rows={3}
                      placeholder="Describe the neighborhood improvement need and suggested civic solution..."
                      value={sugDesc}
                      onChange={(e) => setSugDesc(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-xl"
                    />
                    <button
                      type="submit"
                      disabled={!isCitizenAuthenticated}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-[#087A43] text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Suggestion</span>
                    </button>
                  </form>

                  {/* My & Published Suggestions */}
                  {(mySuggestions.length > 0 || publicSuggestions.length > 0) && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700">Recent Community Suggestions</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {[...mySuggestions, ...publicSuggestions.filter((ps) => !mySuggestions.some((ms) => ms.id === ps.id))].map(
                          (s) => (
                            <div key={s.id} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-[#123B28]">{s.title}</strong>
                                <span className="text-[11px] font-semibold text-[#087A43]">{s.status}</span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {s.sector} · {s.locality}
                              </div>
                              <p className="text-slate-700">{s.description}</p>
                              {s.adminFeedback && (
                                <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                                  Review Note: {s.adminFeedback}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Voluntary Public Surveys */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-bold text-base text-[#123B28] flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#087A43]" />
                    <span>Voluntary Community Surveys</span>
                  </h3>
                  {activeSurveys.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No active community surveys published right now. Opt into Survey Invitations to be notified when one opens.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activeSurveys.map((srv) => {
                        const already = submittedSurveys[srv.id];
                        return (
                          <div key={srv.id} className="p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <strong className="text-sm text-[#123B28]">{srv.title}</strong>
                                <div className="text-[11px] text-slate-500">
                                  {srv.topic} · {srv.status}
                                </div>
                              </div>
                              {isCitizenAuthenticated && srv.status === 'Active' && !already && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const res = await checkMySurveySubmitted(srv.id);
                                    if (res) {
                                      setSubmittedSurveys((prev) => ({ ...prev, [srv.id]: true }));
                                    }
                                  }}
                                  className="text-[11px] text-[#087A43] underline cursor-pointer"
                                >
                                  Check Status
                                </button>
                              )}
                            </div>
                            <p className="text-slate-600">{srv.description}</p>
                            {srv.status === 'Active' && !already && (
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  if (!isCitizenAuthenticated) {
                                    setStatusBanner({ type: 'err', text: 'Sign in with verified mobile to submit survey.' });
                                    return;
                                  }
                                  await submitSurveyResponse(srv.id, activeSurveyAnswers[srv.id] || {});
                                  setSubmittedSurveys((prev) => ({ ...prev, [srv.id]: true }));
                                  setStatusBanner({ type: 'ok', text: 'Thank you! Your voluntary survey feedback was recorded.' });
                                }}
                                className="space-y-3 pt-2"
                              >
                                {srv.questions.map((q) => (
                                  <div key={q.id} className="space-y-1.5">
                                    <span className="font-semibold text-slate-800 block">{q.prompt}</span>
                                    <div className="flex flex-wrap gap-2">
                                      {q.options.map((opt) => (
                                        <label
                                          key={opt}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                                        >
                                          <input
                                            type="radio"
                                            name={`${srv.id}-${q.id}`}
                                            value={opt}
                                            required
                                            checked={(activeSurveyAnswers[srv.id]?.[q.id] || '') === opt}
                                            onChange={() =>
                                              setActiveSurveyAnswers((prev) => ({
                                                ...prev,
                                                [srv.id]: { ...(prev[srv.id] || {}), [q.id]: opt }
                                              }))
                                            }
                                          />
                                          <span>{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="submit"
                                  disabled={!isCitizenAuthenticated}
                                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#123B28] text-white font-bold disabled:opacity-50 cursor-pointer"
                                >
                                  Submit Survey Response
                                </button>
                              </form>
                            )}
                            {already && (
                              <p className="text-emerald-800 font-semibold">Response submitted under your verified UID.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Voluntary Groups, Volunteering, Complaint & Project Shortcuts */}
              <div className="space-y-6">
                {/* Voluntary Non-Political Groups */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h3 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#087A43]" />
                    <span>Voluntary Civic Groups</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Member mobile numbers are strictly private and never visible to other group members.
                  </p>
                  {activeGroups.length === 0 ? (
                    <p className="text-xs text-slate-500">No community groups published yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {activeGroups.map((g) => {
                        const joined = myMemberships.some((m) => m.groupId === g.id && m.status === 'Active');
                        return (
                          <div key={g.id} className="p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <strong className="text-[#123B28]">{g.name}</strong>
                              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                                {g.memberCount || 0} members
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{g.description}</p>
                            {isCitizenAuthenticated && (
                              <button
                                type="button"
                                onClick={() => (joined ? leaveVoluntaryGroup(g.id) : joinVoluntaryGroup(g))}
                                className={`min-h-[34px] px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                                  joined
                                    ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700'
                                    : 'bg-[#087A43] text-white'
                                }`}
                              >
                                {joined ? 'Leave Group' : 'Join Voluntarily'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Volunteer Registration */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <h3 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-[#087A43]" />
                    <span>Volunteer for Approved Initiatives</span>
                  </h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!isCitizenAuthenticated || !myProfile) {
                        setStatusBanner({ type: 'err', text: 'Sign in with verified mobile to volunteer.' });
                        return;
                      }
                      await registerVolunteer({
                        locality: myProfile.cityLocality,
                        initiativeTitle: volInitiative,
                        areaOfInterest: volInterest,
                        availability: volAvailability,
                        skillsNote: volSkills
                      });
                      setVolInitiative('');
                      setVolSkills('');
                      setStatusBanner({ type: 'ok', text: 'Volunteer registration submitted.' });
                    }}
                    className="space-y-2.5 text-xs"
                  >
                    <input
                      required
                      placeholder="Initiative (e.g. Canal Greenbelt Plantation)"
                      value={volInitiative}
                      onChange={(e) => setVolInitiative(e.target.value)}
                      className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                    />
                    <select
                      value={volInterest}
                      onChange={(e) => setVolInterest(e.target.value as CitizenInterestTopic)}
                      className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                    >
                      {CITIZEN_INTEREST_TOPICS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.en}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      placeholder="Availability (e.g. Weekends 9am-12pm)"
                      value={volAvailability}
                      onChange={(e) => setVolAvailability(e.target.value)}
                      className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                    />
                    <input
                      placeholder="Relevant skills or notes (optional)"
                      value={volSkills}
                      onChange={(e) => setVolSkills(e.target.value)}
                      className="w-full min-h-[40px] px-3 border border-slate-300 rounded-xl"
                    />
                    <button
                      type="submit"
                      disabled={!isCitizenAuthenticated}
                      className="w-full min-h-[40px] bg-[#123B28] text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                    >
                      Register as Volunteer
                    </button>
                  </form>

                  {myVolunteers.length > 0 && (
                    <div className="pt-2 space-y-1.5 text-[11px]">
                      {myVolunteers.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                          <span className="truncate font-semibold">{v.initiativeTitle}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[#087A43]">{v.status}</span>
                            {v.status !== 'Withdrawn' && (
                              <button
                                type="button"
                                onClick={() => withdrawVolunteer(v.id)}
                                className="text-red-600 underline cursor-pointer"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* In-App Notifications & Official Trackers */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-sm text-[#123B28] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#087A43]" />
                    <span>My In-App Updates</span>
                  </h4>
                  {myInAppMessages.length === 0 ? (
                    <p className="text-[11px] text-slate-500">No in-app notifications received yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {myInAppMessages.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                          <strong className="text-[#123B28] block">{m.subject}</strong>
                          <p className="text-[11px] text-slate-700">{m.messageBody}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {onNavigatePublic && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigatePublic('city')}
                        className="min-h-[38px] px-3 py-2 rounded-xl border border-slate-300 text-[#123B28] font-semibold hover:bg-slate-50 cursor-pointer text-left"
                      >
                        Report Municipal Issue / Track Complaints →
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigatePublic('projects')}
                        className="min-h-[38px] px-3 py-2 rounded-xl border border-slate-300 text-[#123B28] font-semibold hover:bg-slate-50 cursor-pointer text-left"
                      >
                        View Approved City Projects ({publicCityProjects.length}) →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUSINESSES, NGOS & INSTITUTIONS DIRECTORY */}
        {subTab === 'organizations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#123B28] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#087A43]" />
                    <span>Verified Organizations & Business Directory</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Only admin-verified businesses, trade associations, NGOs, schools, and clinics appear publicly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrgFormOpen((p) => !p)}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#087A43] text-white text-xs font-bold cursor-pointer shrink-0"
                >
                  {orgFormOpen ? 'Close Registration Form' : 'Register Organization'}
                </button>
              </div>

              {orgFormOpen && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!isCitizenAuthenticated) {
                      setStatusBanner({
                        type: 'err',
                        text: 'Verify your mobile number via Register / Sign In before submitting an organization listing.'
                      });
                      return;
                    }
                    await submitOrganizationListing({
                      orgName,
                      orgCategory,
                      locality: orgLocality,
                      registrationNumber: orgRegNo,
                      focalPersonName: orgFocal,
                      publicContactPhone: orgPhone,
                      publicEmail: orgEmail,
                      description: orgDesc,
                      servicesOffered: orgServices
                    });
                    setOrgName('');
                    setOrgDesc('');
                    setOrgFormOpen(false);
                    setStatusBanner({
                      type: 'ok',
                      text: 'Organization submitted for admin verification prior to public directory publication.'
                    });
                  }}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                >
                  <h4 className="font-bold text-sm text-[#123B28]">
                    Submit Local Business, Association, NGO, School or Clinic
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input
                      required
                      placeholder="Organization / Business Name *"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    />
                    <select
                      value={orgCategory}
                      onChange={(e) => setOrgCategory(e.target.value as RegisteredOrganization['orgCategory'])}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    >
                      {ORGANIZATION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      required
                      placeholder="Locality / Market Area *"
                      value={orgLocality}
                      onChange={(e) => setOrgLocality(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    />
                    <input
                      required
                      placeholder="Focal Person Name *"
                      value={orgFocal}
                      onChange={(e) => setOrgFocal(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    />
                    <input
                      placeholder="Registration / License No (optional)"
                      value={orgRegNo}
                      onChange={(e) => setOrgRegNo(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    />
                    <input
                      placeholder="Public Desk Phone (optional)"
                      value={orgPhone}
                      onChange={(e) => setOrgPhone(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    />
                    <input
                      type="email"
                      placeholder="Public Contact Email (optional)"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl"
                    />
                    <input
                      placeholder="Community / Civic Services Offered"
                      value={orgServices}
                      onChange={(e) => setOrgServices(e.target.value)}
                      className="min-h-[40px] px-3 bg-white border border-slate-300 rounded-xl sm:col-span-2"
                    />
                  </div>
                  <textarea
                    required
                    minLength={8}
                    rows={3}
                    placeholder="Brief description of services, welfare activities, or institutional role..."
                    value={orgDesc}
                    onChange={(e) => setOrgDesc(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-[#123B28] text-white font-bold cursor-pointer"
                  >
                    Submit for Verification
                  </button>
                </form>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5">
                {['all', ...ORGANIZATION_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setOrgFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      orgFilter === cat
                        ? 'bg-[#123B28] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              {myOrganizations.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                  <strong className="text-[#123B28] block">My Submitted Organization Listings</strong>
                  {myOrganizations.map((o) => (
                    <div key={o.id} className="flex items-center justify-between">
                      <span>
                        {o.orgName} ({o.orgCategory})
                      </span>
                      <span className="font-semibold text-amber-900">{o.verificationStatus}</span>
                    </div>
                  ))}
                </div>
              )}

              {visibleOrgs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  No verified organization listings published in this category yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleOrgs.map((org) => (
                    <div key={org.id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="text-[11px] font-semibold text-[#087A43]">
                        {org.orgCategory} · {org.locality}
                      </div>
                      <h4 className="font-bold text-sm text-[#123B28]">{org.orgName}</h4>
                      <p className="text-slate-600 leading-relaxed">{org.description}</p>
                      {org.servicesOffered && (
                        <div className="text-[11px] text-slate-500">
                          Services: {org.servicesOffered}
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Focal: {org.focalPersonName}</span>
                        {org.publicContactPhone && <span className="font-mono">{org.publicContactPhone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
