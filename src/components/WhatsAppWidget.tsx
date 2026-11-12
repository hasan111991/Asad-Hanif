import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { MessageCircle, X, Send } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const { language } = useLanguage();
  const { settings } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('general');

  if (!settings.whatsappEnabled || !settings.whatsappNumber) {
    return null;
  }

  const templates = [
    {
      id: 'general',
      titleEn: 'General Inquiry',
      titleUr: 'عمومی استفسار',
      msgEn:
        'Assalam-o-Alaikum PP-203 Secretariat, I would like to submit a general inquiry regarding Chichawatni constituency services.',
      msgUr:
        'السلام علیکم پی پی 203 سیکرٹریٹ! میں حلقہ چیچہ وطنی کی عوامی خدمات سے متعلق عمومی معلومات حاصل کرنا چاہتا ہوں۔'
    },
    {
      id: 'complaint',
      titleEn: 'Complaint Follow-up',
      titleUr: 'شکایت کا فالو اپ',
      msgEn:
        'Assalam-o-Alaikum PP-203 Secretariat, I would like to follow up on my registered complaint. My Tracking ID is: ',
      msgUr:
        'السلام علیکم! میں اپنی درج شدہ شکایت کی صورتحال معلوم کرنا چاہتا ہوں۔ میرا ٹریکنگ نمبر یہ ہے: '
    },
    {
      id: 'development',
      titleEn: 'Development Inquiry',
      titleUr: 'ترقیاتی منصوبوں کی معلومات',
      msgEn:
        'Assalam-o-Alaikum, I would like to share a community need / development inquiry for my Union Council in PP-203 Chichawatni.',
      msgUr:
        'السلام علیکم! میں اپنی یونین کونسل چیچہ وطنی میں ترقیاتی کام یا عوامی ضرورت کے حوالے سے رابطہ کر رہا ہوں۔'
    },
    {
      id: 'appointment',
      titleEn: 'Appointment Request',
      titleUr: 'ملاقات کی درخواست',
      msgEn:
        'Assalam-o-Alaikum PP-203 Secretariat, I would like to request an appointment or delegation meeting during Public Khuli Kachehri.',
      msgUr:
        'السلام علیکم! میں مرکزی سیکرٹریٹ میں عوامی کھلی کچہری / ملاقات کے لیے وقت کی درخواست کرنا چاہتا ہوں۔'
    }
  ];

  const activeTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];
  const messageText = language === 'ur' ? activeTemplate.msgUr : activeTemplate.msgEn;
  const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const waHref = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 no-print">
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-[#123B28] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm">
                {language === 'ur' ? 'واٹس ایپ عوامی ہیلپ ڈیسک' : 'WhatsApp Secretariat Desk'}
              </h4>
              <p className="text-[11px] text-emerald-200">PP-203 Chichawatni</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-emerald-100 cursor-pointer"
              aria-label="Close WhatsApp widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">
              {language === 'ur' ? 'موضوع منتخب کریں:' : 'Select Inquiry Template:'}
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`min-h-[38px] px-3 py-2 rounded-lg border text-left rtl:text-right font-semibold transition cursor-pointer ${
                    selectedTemplate === tpl.id
                      ? 'bg-emerald-50 border-[#087A43] text-[#123B28]'
                      : 'bg-[#F7F9F7] border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {language === 'ur' ? tpl.titleUr : tpl.titleEn}
                </button>
              ))}
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>{language === 'ur' ? 'واٹس ایپ چیٹ شروع کریں' : 'Start WhatsApp Chat'}</span>
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xl flex items-center justify-center border-2 border-white transition cursor-pointer"
        aria-label="Open WhatsApp Secretariat Helpdesk"
        title="WhatsApp Office Helpdesk"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
