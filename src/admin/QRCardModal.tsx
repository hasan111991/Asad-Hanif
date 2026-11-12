import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useData } from '../context/DataContext';
import { getAssetUrl, PORTRAIT_IMAGE_PATH } from '../utils/assetUrl';
import { X, Download, Printer, QrCode } from 'lucide-react';

interface QRCardModalProps {
  onClose: () => void;
}

type QrTargetType = 'website' | 'vcard' | 'appointment' | 'complaint';

export const QRCardModal: React.FC<QRCardModalProps> = ({ onClose }) => {
  const { profile, settings } = useData();
  const [target, setTarget] = useState<QrTargetType>('website');
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://chasadhanif.pk';

  const getQrPayload = (type: QrTargetType): string => {
    switch (type) {
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${profile.fullName}`,
          `TITLE:${profile.title}`,
          `ORG:Chaudhry Secretariat PP-203 Chichawatni`,
          `TEL;TYPE=WORK,VOICE:${settings.helplinePhone || profile.officialPhone}`,
          `EMAIL:${profile.officialEmail}`,
          `ADR;TYPE=WORK:;;${profile.officeAddress};Chichawatni;Punjab;;Pakistan`,
          `URL:${origin}`,
          'END:VCARD'
        ].join('\n');
      case 'appointment':
        return `${origin}/#contact`;
      case 'complaint':
        return `${origin}/#complaints`;
      case 'website':
      default:
        return `${origin}/`;
    }
  };

  useEffect(() => {
    const payload = getQrPayload(target);
    let mounted = true;

    QRCode.toDataURL(payload, {
      width: 420,
      margin: 2,
      color: {
        dark: '#123B28',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (mounted) setQrPngUrl(url);
      })
      .catch((err) => console.error('QR PNG error:', err));

    QRCode.toString(payload, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#123B28',
        light: '#FFFFFF'
      }
    })
      .then((svg) => {
        if (mounted) setQrSvgString(svg);
      })
      .catch((err) => console.error('QR SVG error:', err));

    return () => {
      mounted = false;
    };
  }, [target, profile, settings]);

  const handleDownloadPng = () => {
    if (!qrPngUrl) return;
    const a = document.createElement('a');
    a.href = qrPngUrl;
    a.download = `PP203-${target}-qrcode.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PP203-${target}-qrcode.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targetOptions: { id: QrTargetType; label: string }[] = [
    { id: 'website', label: 'Official Website' },
    { id: 'vcard', label: 'Representative vCard' },
    { id: 'appointment', label: 'Appointment Request' },
    { id: 'complaint', label: 'Complaint Portal' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-6 relative my-auto">
        <button
          onClick={onClose}
          className="no-print absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="no-print pr-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087A43] inline-flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#C9A227]" />
            <span>Secretariat Stationery & Digital Access</span>
          </span>
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#123B28] mt-1">
            Official QR Generator & Visiting Card Studio
          </h3>
        </div>

        {/* Target Tabs */}
        <div className="no-print flex flex-wrap gap-2">
          {targetOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTarget(opt.id)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                target === opt.id
                  ? 'bg-[#123B28] text-white'
                  : 'bg-[#F7F9F7] border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* QR Download & Card Preview Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* QR Box */}
          <div className="no-print lg:col-span-4 bg-[#F7F9F7] border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center space-y-4">
            {qrPngUrl ? (
              <img
                src={qrPngUrl}
                alt={`QR Code for ${target}`}
                className="w-44 h-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xs"
              />
            ) : (
              <div className="w-44 h-44 rounded-xl bg-slate-200 animate-pulse" />
            )}
            <div className="text-[11px] text-slate-600 font-mono break-all">
              {target === 'vcard' ? 'vCard 3.0 Contact Payload' : getQrPayload(target)}
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex-1 min-h-[42px] bg-[#087A43] hover:bg-[#123B28] text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>PNG</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex-1 min-h-[42px] bg-white border border-slate-300 hover:bg-slate-100 text-[#123B28] font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#087A43]" />
                <span>SVG</span>
              </button>
            </div>
          </div>

          {/* Printable Front & Back Visiting Card Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="no-print flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Front & Back Visiting Card (Print Ready)
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[40px] bg-[#123B28] hover:bg-[#087A43] text-white font-bold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#C9A227]" />
                <span>Print Visiting Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Side */}
              <div className="aspect-[1.75/1] bg-gradient-to-br from-[#123B28] via-[#0e4a2e] to-[#087A43] text-white rounded-xl p-4 sm:p-5 border-2 border-[#C9A227] shadow-md flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227] block">
                      Pakistan Muslim League (N)
                    </span>
                    <h4 className="font-editorial text-sm sm:text-base font-bold text-white leading-snug truncate mt-0.5">
                      {profile.fullName}
                    </h4>
                    <p className="text-[10px] text-emerald-100 leading-tight">
                      Member Provincial Assembly · PP-203 Chichawatni
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] overflow-hidden shrink-0 bg-slate-900">
                    <img
                      src={getAssetUrl(profile.photoUrl || PORTRAIT_IMAGE_PATH)}
                      alt={profile.fullName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="border-t border-white/15 pt-2.5 text-[10px] space-y-0.5 text-emerald-50">
                  <p className="truncate">{profile.officeAddress}</p>
                  <p className="font-mono text-[#C9A227]">
                    {settings.helplinePhone} · {profile.officialEmail}
                  </p>
                </div>
              </div>

              {/* Back Side */}
              <div className="aspect-[1.75/1] bg-white text-[#123B28] rounded-xl p-4 sm:p-5 border-2 border-[#123B28] shadow-md flex items-center justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#087A43] block">
                    Constituent Service Portal
                  </span>
                  <h5 className="font-bold text-xs sm:text-sm text-[#123B28] leading-snug">
                    Scan to Access Official Profile & Complaint Desk
                  </h5>
                  <p className="font-urdu-title text-xs text-[#087A43] leading-relaxed" dir="rtl">
                    حلقہ پی پی 203 چیچہ وطنی — عوامی خدمت پورٹل
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    {origin.replace(/^https?:\/\//, '')}
                  </p>
                </div>

                <div className="shrink-0 bg-[#F7F9F7] p-1.5 rounded-lg border border-slate-200">
                  {qrPngUrl && (
                    <img
                      src={qrPngUrl}
                      alt="Visiting card QR"
                      className="w-20 h-20 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
