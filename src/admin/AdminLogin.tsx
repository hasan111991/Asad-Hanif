import React, { useState } from 'react';
import { useAuth, BOOTSTRAPPED_SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { getAssetUrl, PORTRAIT_IMAGE_PATH } from '../utils/assetUrl';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminLoginProps {
  onExitToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onExitToPublic }) => {
  const {
    loginWithEmail,
    loginWithGoogle,
    authError,
    failedAttempts,
    lockoutSecondsLeft
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const isLocked = lockoutSecondsLeft > 0;
  const lockoutMinutes = Math.floor(lockoutSecondsLeft / 60);
  const lockoutRemSeconds = lockoutSecondsLeft % 60;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || submitting) return;
    setLocalError('');

    if (!email.trim() || !password) {
      setLocalError('Please enter your authorized staff email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginWithEmail(email, password);
      if (!result.success && result.error) {
        setLocalError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLocked || submitting) return;
    setLocalError('');
    setSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.error) {
        setLocalError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#123B28] via-[#0e442c] to-[#082418] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#C9A227]/40 overflow-hidden">
        {/* Top Crest Header */}
        <div className="bg-[#123B28] text-white p-6 text-center border-b-2 border-[#C9A227]">
          <div className="w-16 h-16 rounded-full border-2 border-[#C9A227] overflow-hidden mx-auto bg-slate-900 shadow-md mb-3">
            <img
              src={getAssetUrl(PORTRAIT_IMAGE_PATH)}
              alt="Chaudhry Asad Hanif Jutt — Secretariat"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227] block">
            PP-203 Chichawatni · Restricted CMS
          </span>
          <h1 className="font-editorial text-xl font-bold text-white mt-1">
            Secretariat Admin Sign-In
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Authorized Secretariat staff and administrator access only.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {isLocked && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block">Sign-in Temporarily Locked</strong>
                <p className="tabular-nums">
                  Too many unsuccessful attempts. Retry in{' '}
                  <span className="font-mono font-bold">
                    {String(lockoutMinutes).padStart(2, '0')}:
                    {String(lockoutRemSeconds).padStart(2, '0')}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          {activeError && !isLocked && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  disabled={isLocked || submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asad@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123B28] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={isLocked || submitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter staff password"
                  className="w-full pl-9 pr-11 py-2.5 text-sm bg-[#F7F9F7] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A43] focus:bg-white min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {failedAttempts > 0 && !isLocked && (
              <div className="text-[11px] text-amber-700 font-medium tabular-nums">
                Failed attempts: {failedAttempts} of 5 before 5-minute security lockout.
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked || submitting}
              className="w-full min-h-[46px] bg-[#087A43] hover:bg-[#123B28] disabled:opacity-55 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#C9A227]" />
              <span>{submitting ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}</span>
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Or Federated Auth
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <button
            type="button"
            disabled={isLocked || submitting}
            onClick={handleGoogleSignIn}
            className="w-full min-h-[46px] bg-white hover:bg-[#F7F9F7] border border-slate-300 text-[#123B28] font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-55"
          >
            <ShieldCheck className="w-4 h-4 text-[#087A43]" />
            <span>Continue with Authorized Google Account</span>
          </button>

          <div className="bg-[#F7F9F7] border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed space-y-1">
            <p>
              <strong className="text-[#123B28]">No Public Registration:</strong> Staff accounts are provisioned internally by the Super Administrator (<span className="font-mono">{BOOTSTRAPPED_SUPER_ADMIN_EMAIL}</span>).
            </p>
            <p className="text-slate-500">
              Ensure Email/Password and Google providers are active under Firebase Authentication.
            </p>
          </div>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onExitToPublic}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#087A43] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
