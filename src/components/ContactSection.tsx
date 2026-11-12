import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ContactMessage } from '../types';
import {
  Building,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MapPin,
  AlertCircle
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { language } = useLanguage();
  const { profile, settings, submitContactMessage } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState<ContactMessage['inquiryType']>('General Inquiry');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    try {
      const map = L.map(mapRef.current, {
        center: [30.5333, 72.7000],
        zoom: 14,
        scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap | Chichawatni Secretariat'
      }).addTo(map);
      L.marker([30.5333, 72.7000])
        .addTo(map)
        .bindPopup(
          '<b>Chaudhry Asad Hanif Jutt Secretariat</b><br>PP-203 Chichawatni, District Sahiwal'
        )
        .openPopup();
      leafletRef.current = map;
    } catch (err) {
      console.warn('Secretariat map init:', err);
    }

    return () => {
      if (leafletRef.current) {
        try {
          leafletRef.current.remove();
        } catch {
          // ignore
        }
        leafletRef.current = null;
      }
    };
  }, []);

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setErrorMsg('');

    if (name.trim().length < 2 || phone.trim().length < 7 || message.trim().length < 5) {
      setErrorMsg(
        language === 'ur'
          ? 'براہ کرم نام، فون نمبر اور پیغام مکمل درج کریں۔'
          : 'Please complete your name, mobile number, and inquiry details.'
      );
      return;
    }

    setIsSending(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        inquiryType,
        preferredDate: preferredDate || undefined,
        message: message.trim()
      });
      setSentSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setPreferredDate('');
      setMessage('');
    } catch (err) {
      console.error('Contact message submit error:', err);
      setErrorMsg(
        language === 'ur'
          ? 'پیغام ارسال کرنے میں دشواری پیش آئی۔ دوبارہ کوشش کریں۔'
          : 'Unable to send your message at this moment. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-[#C9A227] shrink-0" />
          <span>{language === 'ur' ? 'عوامی سیکرٹریٹ رابطہ' : 'Constituent Secretariat'}</span>
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#123B28] mt-1 leading-tight">
          {language === 'ur'
            ? 'رابطہ سیکرٹریٹ و ملاقات کا وقت'
            : 'Contact Secretariat & Office Location'}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
          {language === 'ur'
            ? 'سیکرٹریٹ چوہدری اسد حنیف جٹ، چیچہ وطنی۔ عوامی وفود، ملاقات کی درخواست اور تجاویز کے لیے رابطہ کریں۔'
            : 'Reach out to the PP-203 Secretariat for public appointments, delegation visits, or constituency inquiries.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Office Info & Chichawatni Embedded Map */}
        <div className="lg:col-span-5 space-y-5 w-full">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
            <h3 className="font-editorial font-bold text-lg text-[#123B28] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#087A43] shrink-0" />
              <span>{language === 'ur' ? 'دفتر کی تفصیلات' : 'Secretariat Details'}</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123B28] mb-0.5">
                    {language === 'ur' ? 'پتہ:' : 'Secretariat Address'}
                  </strong>
                  <p className="leading-relaxed">
                    {language === 'ur' ? settings.officeLocationUrdu : settings.officeLocation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123B28] mb-0.5">
                    {language === 'ur' ? 'اوقاتِ کار:' : 'Office & Khuli Kachehri Hours'}
                  </strong>
                  <p className="leading-relaxed">
                    {language === 'ur' ? settings.officeHoursUrdu : settings.officeHours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123B28] mb-0.5">
                    {language === 'ur' ? 'ہیلپ لائن:' : 'Secretariat Helpline'}
                  </strong>
                  <a
                    href={`tel:${settings.helplinePhone}`}
                    className="text-[#087A43] font-mono font-bold hover:underline text-sm inline-flex items-center min-h-[32px]"
                  >
                    {settings.helplinePhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#123B28] mb-0.5">
                    {language === 'ur' ? 'ای میل:' : 'Official Email'}
                  </strong>
                  <a
                    href={`mailto:${profile.officialEmail}`}
                    className="font-mono text-[#087A43] hover:underline"
                  >
                    {profile.officialEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Chichawatni Leaflet Map */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#123B28] text-white text-xs font-semibold flex items-center justify-between">
              <span>Chichawatni Secretariat Location</span>
              <span className="font-mono text-[#C9A227] text-[11px]">30.5333° N, 72.7000° E</span>
            </div>
            <div ref={mapRef} className="w-full h-56 sm:h-64" />
          </div>
        </div>

        {/* Right: Validated Contact / Appointment Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs w-full">
          <h3 className="font-editorial font-bold text-lg text-[#123B28] mb-1">
            {language === 'ur'
              ? 'پیغام یا ملاقات کی درخواست ارسال کریں'
              : 'Send Inquiry or Appointment Request'}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            {language === 'ur'
              ? 'سیکرٹریٹ عملہ آپ کی درخواست کا جائزہ لے کر جلد رابطہ کرے گا۔'
              : 'All inquiries and appointment requests are recorded directly in the Secretariat registry.'}
          </p>

          {sentSuccess ? (
            <div className="bg-emerald-50 border border-[#087A43] text-[#123B28] p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#087A43] mx-auto" />
              <h4 className="font-bold text-base">
                {language === 'ur' ? 'پیغام سیکرٹریٹ میں موصول ہو گیا' : 'Inquiry Recorded Successfully'}
              </h4>
              <p className="text-xs text-slate-600">
                {language === 'ur'
                  ? 'آفس مینجر جلد آپ کے موبائل نمبر پر رابطہ کریں گے۔'
                  : 'The Secretariat Office Manager will review your request and follow up on your contact number.'}
              </p>
              <button
                type="button"
                onClick={() => setSentSuccess(false)}
                className="min-h-[44px] bg-[#123B28] text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
              >
                {language === 'ur' ? 'نیا پیغام بھیجیں' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleMessageSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malik Muhammad Tariq"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-sm min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 font-mono bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                    Inquiry / Meeting Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) =>
                      setInquiryType(e.target.value as ContactMessage['inquiryType'])
                    }
                    className="w-full px-3 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-sm min-h-[44px]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Appointment Request">Appointment Request</option>
                    <option value="Delegation Meeting">Delegation Meeting</option>
                    <option value="Development Feedback">Development Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                    Preferred Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-sm min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                  Message / Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="State your appointment request, delegation details, or constituent inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white text-sm leading-relaxed min-h-[110px]"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full min-h-[48px] bg-[#087A43] hover:bg-[#123B28] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>{isSending ? 'Submitting...' : 'Submit Inquiry to Secretariat'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
