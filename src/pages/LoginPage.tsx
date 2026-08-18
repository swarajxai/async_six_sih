import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Droplet, Phone, Stethoscope } from 'lucide-react';
import Brand from '../components/Brand';
import DonorForgotPasswordModal from '../components/DonorForgotPasswordModal';
import DonorRegistrationModal from '../components/DonorRegistrationModal';
import EmergencyBadge from '../components/EmergencyBadge';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import HospitalRegistrationModal from '../components/HospitalRegistrationModal';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { useDemo } from '../context/DemoContext';
import { useDonor } from '../context/DonorContext';
import { DONOR_DEMO_CREDENTIALS } from '../data/donorData';
import type { UserRole } from '../types';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: typeof Building2 }[] = [
  { value: 'hospital', label: 'Hospital', description: 'Coordinate emergencies', icon: Building2 },
  { value: 'donor', label: 'Blood Donor', description: 'Respond to alerts', icon: Droplet },
];

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('hospital');
  const [hospitalId, setHospitalId] = useState('VSS-HOSP-001');
  const [password, setPassword] = useState('demo');
  const [donorPhone, setDonorPhone] = useState(DONOR_DEMO_CREDENTIALS.phone);
  const [donorPassword, setDonorPassword] = useState(DONOR_DEMO_CREDENTIALS.password);
  const [donorError, setDonorError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showDonorForgotPassword, setShowDonorForgotPassword] = useState(false);
  const [showDonorRegistration, setShowDonorRegistration] = useState(false);
  const { loginAs, logout: logoutHospital } = useDemo();
  const { loginDonor, logoutDonor } = useDonor();
  const navigate = useNavigate();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (role === 'donor') {
      if (!loginDonor(donorPhone, donorPassword)) {
        setDonorError('Use the demo donor credentials shown below.');
        return;
      }
      setDonorError('');
      logoutHospital();
      navigate('/donor/eligibility');
      return;
    }
    logoutDonor();
    loginAs('hospital');
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex relative bg-navy-900 text-white p-12 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-navy-700/60" />
          <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-navy-800/70" />
          <div className="relative z-10 max-w-md flex flex-col h-full">
            <Brand size="lg" variant="light" />
            <div className="mt-auto">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                Right Blood. <br />
                Right Donor. <br />
                <span className="text-emergency">Right Time.</span>
              </h1>
              <p className="mt-4 text-white/80 text-base">
                LIFE-LINK actively coordinates and helps secure a confirmed
                blood source in real time — not just a static directory.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-emergency" />Simultaneous alerts to top eligible donors</li>
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-emerald-400" />Multiple confirmed donors for multi-unit needs</li>
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-amber-300" />Standby donors activate automatically</li>
                <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-white" />Live hospital coordination status</li>
              </ul>
            </div>
            <div className="mt-8 text-xs text-white/50">SIH 2026 · Team Async Six · MEDTECH / BIOTECH</div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8"><Brand size="lg" showTagline /></div>
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-extrabold text-navy-900">Sign in</h2>
              <p className="text-slate-500 text-sm">Real-Time Emergency Blood Coordination</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 bg-white rounded-2xl p-6 shadow-card ring-1 ring-slate-100">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">I am signing in as</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = role === option.value;
                    return (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => { setRole(option.value); setDonorError(''); }}
                        className={[
                          'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold ring-1 transition',
                          active ? 'bg-navy-900 text-white ring-navy-900 shadow-pop' : 'bg-white text-navy-800 ring-slate-200 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <Icon size={18} />
                        {option.label}
                        <span className={active ? 'text-white/65 font-normal' : 'text-slate-400 font-normal'}>{option.description}</span>
                      </button>
                    );
                  })}
                </div>
                {role === 'hospital' && <div className="mt-2"><EmergencyBadge tone="navy">Hospital · Recommended for SIH Demo</EmergencyBadge></div>}
              </div>

              {role === 'hospital' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hospital User ID</label>
                    <div className="mt-1 relative">
                      <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={hospitalId}
                        onChange={(event) => setHospitalId(event.target.value)}
                        className="w-full h-11 pl-9 pr-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
                        placeholder="VSS-HOSP-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                    <input
                      value={password}
                      type="password"
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
                      placeholder="demo"
                    />
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500">Any value works in the SIH demo.</span>
                      <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[11px] font-semibold text-navy-700 underline">Forgot Password?</button>
                    </div>
                  </div>

                  <PrimaryButton size="lg" block type="submit">Login <ArrowRight size={16} /></PrimaryButton>
                  <SecondaryButton block type="button" onClick={() => setShowRegistration(true)}>Create Hospital Account</SecondaryButton>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</label>
                    <div className="mt-1 relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={donorPhone} inputMode="numeric" onChange={(event) => setDonorPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full h-11 pl-9 pr-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none" placeholder="9876543210" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
                    <input value={donorPassword} type="password" onChange={(event) => setDonorPassword(event.target.value)} className="mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none" />
                    <div className="mt-1 flex items-center justify-between gap-2"><span className="text-[11px] text-slate-500">Demo: {DONOR_DEMO_CREDENTIALS.phone} / {DONOR_DEMO_CREDENTIALS.password}</span><button type="button" onClick={() => setShowDonorForgotPassword(true)} className="text-[11px] font-semibold text-navy-700 underline">Forgot Password?</button></div>
                  </div>
                  {donorError && <div className="text-xs text-red-600 font-medium">{donorError}</div>}
                  <PrimaryButton size="lg" block type="submit">Login <ArrowRight size={16} /></PrimaryButton>
                  <SecondaryButton block type="button" onClick={() => setShowDonorRegistration(true)}>Create Donor Account</SecondaryButton>
                </>
              )}

              <div className="text-center text-[11px] text-slate-500">SIH Demo Environment · Frontend-only authentication</div>
            </form>
          </div>
        </div>
      </div>

      <ForgotPasswordModal open={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
      <HospitalRegistrationModal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
        onCreated={(createdUserId) => { setHospitalId(createdUserId); setRole('hospital'); }}
      />
      <DonorForgotPasswordModal open={showDonorForgotPassword} onClose={() => setShowDonorForgotPassword(false)} onUpdated={(phone) => { setDonorPhone(phone); setRole('donor'); setDonorPassword(''); }} />
      <DonorRegistrationModal open={showDonorRegistration} onClose={() => setShowDonorRegistration(false)} onCreated={(phone) => { setDonorPhone(phone); setDonorPassword(''); setRole('donor'); }} />
    </div>
  );
}
