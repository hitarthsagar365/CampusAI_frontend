import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email format (e.g. user@example.com).');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(cleanEmail);
      setSubmitted(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to send reset email. Please verify the email and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Decorative Ambient Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl shadow-indigo-500/5 p-8 sm:p-10 transition-all">
          
          {submitted ? (
            /* Success State Confirmation */
            <div className="text-center py-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-emerald-100">
                <CheckCircle2 size={34} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Check Your Email
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                We sent password reset instructions to{' '}
                <span className="font-semibold text-slate-900 break-all">{email}</span>.
                The link is valid for <span className="font-semibold text-indigo-600">15 minutes</span>.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 text-left space-y-1.5 mb-6">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Didn’t receive an email?</span>
                </div>
                <p>• Make sure the email matches your Student, Faculty, or Admin account.</p>
                <p>• Check your spam or promotions folder.</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full py-3 px-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 rounded-xl transition-all"
                >
                  Resend or try another email
                </button>

                <Link
                  to="/login"
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Input Form State */
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/25">
                  <KeyRound size={28} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  Enter your email address and we'll send a secure password reset link to your inbox.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="student@campus.edu or faculty@campus.edu"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Supports Student, Faculty, and Administrator accounts dynamically.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Navigation */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
