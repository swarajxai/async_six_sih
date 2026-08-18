import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Droplet, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';
import Brand from '../components/Brand';
import EmergencyBadge from '../components/EmergencyBadge';
import Modal from '../components/Modal';
import PrimaryButton from '../components/PrimaryButton';
import { useDemo } from '../context/DemoContext';
import type { UserRole } from '../types';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: typeof Building2 }[] = [
  { value: 'hospital', label: 'Hospital', description: 'Raise emergency requests', icon: Building2 },
  { value: 'patient', label: 'Patient', description: 'Track your request', icon: HeartPulse },
  { value: 'donor', label: 'Blood Donor', description: 'Respond to alerts', icon: Droplet },
];

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('hospital');
  const [hospitalId, setHospitalId] = useState('VSS-HOSP-001');
  const [password, setPassword] = useState('demo');
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const { loginAs } = useDemo();
  const navigate = useNavigate();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role !== 'hospital') {
      setShowRoleInfo(true);
      return;
    }
    loginAs('hospital');
    navigate('/dashboard');
  }

  function continueWithHospitalDemo() {
    setRole('hospital');
    setShowRoleInfo(false);
    loginAs('hospital');
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left: brand panel */}
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
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emergency" />
                  Simultaneous alerts to top eligible donors
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  First-confirmed donor locks in
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  Backup donor activates automatically
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Live hospital coordination status
                </li>
              </ul>
            </div>
            <div className="mt-8 text-xs text-white/50">
              SIH 2026 · Team Async Six · MEDTECH / BIOTECH
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <Brand size="lg" showTagline />
            </div>
            <div className="hidden lg:block mb-8">
              <h2 className="text-2xl font-extrabold text-navy-900">Sign in</h2>
              <p className="text-slate-500 text-sm">Real-Time Emergency Blood Coordination</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 bg-white rounded-2xl p-6 shadow-card ring-1 ring-slate-100">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  I am signing in as
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = role === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setRole(opt.value)}
                        className={[
                          'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold ring-1 transition',
                          active
                            ? 'bg-navy-900 text-white ring-navy-900 shadow-pop'
                            : 'bg-white text-navy-800 ring-slate-200 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        <Icon size={18} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <EmergencyBadge tone="navy">Hospital · Recommended for SIH Demo</EmergencyBadge>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hospital ID
                </label>
                <div className="mt-1 relative">
                  <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
                    placeholder="VSS-HOSP-001"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Password
                </label>
                <input
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none"
                  placeholder="demo"
                />
                <div className="mt-1 text-[11px] text-slate-500">Any value works in SIH Demo Environment.</div>
              </div>

              <PrimaryButton size="lg" block type="submit">
                Login <ArrowRight size={16} />
              </PrimaryButton>

              <div className="text-center text-[11px] text-slate-500">
                SIH Demo Environment · Single click login works
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        open={showRoleInfo}
        onClose={() => setShowRoleInfo(false)}
        title={`${role === 'patient' ? 'Patient' : 'Blood Donor'} Interface`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {role === 'patient' ? 'Patient' : 'Blood donor'} interface is part of the LIFE-LINK ecosystem.
            The SIH prototype demonstrates the hospital emergency coordination workflow.
          </p>
          <PrimaryButton block onClick={continueWithHospitalDemo}>
            Continue with Hospital Demo <ArrowRight size={16} />
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
