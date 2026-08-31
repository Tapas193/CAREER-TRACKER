import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { Button, Modal } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

type SsoStep = 'idle' | 'continuingsso' | 'configuring';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoStep, setSsoStep] = useState<SsoStep>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message ?? 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SSO entry point. When a real OAuth/OIDC/SAML provider is integrated, this
  // function should redirect to the configured authorization URL. For now it only
  // advances the in-app informational flow — it never fakes a successful login.
  const beginSso = () => setSsoStep('continuingsso');
  const continueSso = () => setSsoStep('configuring');
  const closeSso = () => setSsoStep('idle');
  const ssoEmail = email.trim() || 'student@university.edu';

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #EFF6FF 0%, #EEF2FF 32%, #F8FAFC 100%)' }}
    >
      {/* Subtle radial glows + abstract shapes */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-blue-100/50 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute left-10 top-24 h-24 w-24 rounded-full border border-blue-200/50" />
      <div aria-hidden className="pointer-events-none absolute bottom-16 left-1/4 h-16 w-16 rounded-full border border-indigo-200/40" />
      <div aria-hidden className="pointer-events-none absolute right-12 bottom-40 h-20 w-20 rounded-full bg-white/50 blur-xl" />

      <div className="relative w-full max-w-[430px]">
        <div className="rounded-2xl border border-blue-100/80 bg-white p-8 shadow-[0_24px_60px_-16px_rgba(37,99,235,0.22)]">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#0F172A]">CareerTrack</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[#64748B]">Sign in to continue to Career Track.</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="field-input !h-12 bg-white pl-11 text-[15px] border-[#E2E8F0] focus:!border-[#2563EB] focus:!ring-blue-200"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="field-input !h-12 bg-white pl-11 pr-11 text-[15px] border-[#E2E8F0] focus:!border-[#2563EB] focus:!ring-blue-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#64748B] hover:text-[#0F172A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#64748B]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-blue-400"
                />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-[#2563EB] hover:text-[#4F46E5] hover:underline">
                Forgot password?
              </button>
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="!h-12 w-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-[15px] font-semibold text-white shadow-sm hover:from-[#1D4ED8] hover:to-[#4338CA]"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="relative my-1 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-xs font-medium uppercase tracking-wide text-[#64748B]">or</span>
              <span className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <button
              type="button"
              onClick={beginSso}
              className="flex !h-12 w-full items-center justify-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-4 text-[15px] font-semibold text-[#0F172A] transition-colors hover:bg-[#EFF6FF]"
            >
              <Shield className="h-4 w-4 text-[#2563EB]" />
              Sign in with university SSO
            </button>
          </form>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-[#64748B]">
          <Shield className="h-3.5 w-3.5 text-[#64748B]" />
          Authorized users only. Activity is monitored.
        </p>
      </div>

      {/* University SSO modal */}
      <Modal
        open={ssoStep !== 'idle'}
        onClose={closeSso}
        title={
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#2563EB]" /> University SSO
          </span>
        }
        description="Secure authentication through your university identity provider."
        size="sm"
        footer={
          ssoStep === 'continuingsso' ? (
            <>
              <Button variant="outline" type="button" onClick={closeSso}>Cancel</Button>
              <Button type="button" onClick={continueSso}><ArrowRight className="h-4 w-4" />Continue to University SSO</Button>
            </>
          ) : (
            <Button variant="outline" type="button" onClick={closeSso}>Close</Button>
          )
        }
      >
        {ssoStep === 'continuingsso' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Career Track uses your university identity to securely verify your institutional account.
            </p>
            <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{ssoEmail}</p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              SSO integration is currently being configured. Your session will continue through the standard secure sign-in until the identity provider is connected.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Contacting university identity provider…</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verifying your institutional account with {ssoEmail}. You will be redirected to the secure sign-in to continue.
                </p>
              </div>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Because no identity provider is connected yet, this flow does not grant access. Please use the standard sign-in above.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
