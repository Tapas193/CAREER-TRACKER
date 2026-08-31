import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, TrendingUp, Briefcase, FolderOpen, Building2, Shield, ArrowRight } from 'lucide-react';
import { Button, Modal } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor academics, CGPA and achievements in one place.' },
  { icon: Briefcase, title: 'Career Management', desc: 'Build skills, projects and internships that shape your future.' },
  { icon: Building2, title: 'Placement Support', desc: 'Follow drives, rounds and offers from applied to offered.' },
  { icon: FolderOpen, title: 'Document Center', desc: 'Store and access certificates and offer letters securely.' },
];

const SECURITY_POINTS = [
  'University account authentication',
  'Secure session management',
  'Role-based access',
  'Protected student records',
];

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
    <div className="flex min-h-screen w-full overflow-hidden bg-background">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 shrink-0 flex-col justify-between overflow-hidden bg-[#0b1f4b] px-10 py-10 text-white lg:flex xl:px-16">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-[#1d3a75] blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-wide">Career Track</p>
            <p className="text-xs text-white/60">Student Career Lifecycle Management</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Empowering Students.
            <br />
            Building Futures.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            A comprehensive platform to manage your academic journey, track achievements, and accelerate your career growth.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary-foreground">
                  <f.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Career Track · University ERP</p>
      </div>

      {/* Login card */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-lg font-semibold text-foreground">Career Track</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome Back!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to Career Track</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-email" className="field-label">University Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="field-input pl-9"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="field-label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="field-input pl-9 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={beginSso}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <Shield className="h-4 w-4" />
              Continue with University SSO
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Use your official university account to access Career Track
            </p>
          </form>

          <div className="mt-6 rounded-md border border-border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Security
            </p>
            <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {SECURITY_POINTS.map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-xs text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Authorized personnel only. All activity is monitored.
          </p>

          {/* Feature hint for small screens */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
            {FEATURES.slice(0, 4).map((f) => (
              <div key={f.title} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs font-medium text-foreground">{f.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* University SSO modal */}
      <Modal
        open={ssoStep !== 'idle'}
        onClose={closeSso}
        title={
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> University SSO
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
