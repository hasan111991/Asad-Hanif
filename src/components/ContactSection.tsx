import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  Building,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  QrCode,
  CheckCircle2,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { language, t } = useLanguage();
  const { profile, settings } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSentSuccess(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setSentSuccess(false);
    }, 4000);
  };

  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    language === 'ur'
      ? 'السلام علیکم چوہدری اسد حنیف جٹ سیکرٹریٹ! میں حلقہ پی پی 203 چیچہ وطنی سے رابطہ کر رہا ہوں۔'
      : 'Greetings Chaudhry Asad Hanif Jutt Secretariat. I am reaching out from constituency PP-203 Chichawatni.'
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#087A43] text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Phone className="w-3.5 h-3.5" />
          <span>Constituent Secretariat</span>
        </div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {language === 'ur' ? 'رابطہ سیکرٹریٹ و عوامی کھلی کچہری' : 'Contact Secretariat & Public Office'}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
          {language === 'ur'
            ? 'سیکرٹریٹ چوہدری اسد حنیف جٹ، بائی پاس روڈ چیچہ وطنی۔ عوام کے مسائل کے حل کے لیے دروازے ہمہ وقت کھلے ہیں۔'
            : 'Constituents are invited to the Central Secretariat for grievance redressal, development inquiries, and open public meetings.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Direct Secretariat Info & QR Code */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6 w-full">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-5">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#087A43] shrink-0" />
              <span>Office Details & Visiting Hours</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-xs sm:text-sm mb-0.5">Secretariat Address</strong>
                  <p className="leading-relaxed">{language === 'ur' ? profile.officeAddressUrdu : profile.officeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-xs sm:text-sm mb-0.5">Visiting & Darbar Hours</strong>
                  <p className="leading-relaxed">{language === 'ur' ? profile.officeHoursUrdu : profile.officeHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-xs sm:text-sm mb-0.5">Secretariat Helpline</strong>
                  <a href={`tel:${profile.officialPhone}`} className="text-emerald-700 font-mono font-bold hover:underline text-sm">
                    {profile.officialPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#087A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 text-xs sm:text-sm mb-0.5">Official Inquiries</strong>
                  <p className="font-mono">{profile.officialEmail}</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Click-to-Chat Button (Min 48px height) */}
            <div className="pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm text-xs sm:text-sm active:scale-98"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>{language === 'ur' ? 'واٹس ایپ پر فوری رابطہ کریں' : 'Connect via Official WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* QR Code Digital Card (Mobile responsive wrap) */}
          <div className="bg-emerald-50 rounded-2xl sm:rounded-3xl border border-emerald-200 p-4 sm:p-6 flex flex-col xs:flex-row items-center text-center xs:text-left rtl:xs:text-right gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-2 rounded-2xl shadow-xs border border-emerald-300 flex items-center justify-center shrink-0">
              <QrCode className="w-full h-full text-emerald-950" />
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Mobile QR Card</span>
              <h4 className="font-bold text-xs sm:text-sm text-emerald-950">Scan for Secretariat Contacts</h4>
              <p className="text-[11px] sm:text-xs text-emerald-800 leading-snug">
                Instantly save official helpline, email, and secretariat location directly to your smartphone.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Message Secretariat */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-xs w-full">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1">
            {language === 'ur' ? 'براہِ راست پیغام یا استفسار ارسال کریں' : 'Send Direct Message to Secretariat'}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            For personal assistance, meeting delegation requests, or civic recommendations.
          </p>

          {sentSuccess ? (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-6 rounded-2xl text-center space-y-2 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base">Message Received at Secretariat</h4>
              <p className="text-xs">Office manager will contact your mobile number shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleMessageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malik Muhammad Tariq"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white text-sm min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message / Purpose of Contact <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="State your meeting request, constituent query, or delegation purpose..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white text-sm leading-relaxed min-h-[100px]"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#087A43] hover:bg-[#064D2B] text-white font-bold py-3 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2 active:scale-98"
              >
                <Send className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Submit to Office Manager</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
