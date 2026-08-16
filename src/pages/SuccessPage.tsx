import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Heart, RefreshCcw, Sparkles, Star, Timer } from 'lucide-react';
import Brand from '../components/Brand';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import EmergencyBadge from '../components/EmergencyBadge';
import Timeline from '../components/Timeline';
import { useDemo } from '../context/DemoContext';
import { formatElapsed, pad2 } from '../utils/time';
import type { TimelineEntry } from '../types';

export default function SuccessPage() {
  const { donors, primaryDonorId, backupDonorId, coordinationElapsedMs, activeRequest, resetDemo } = useDemo();
  const navigate = useNavigate();
  const primary = donors.find((d) => d.id === primaryDonorId) ?? null;
  const backup = donors.find((d) => d.id === backupDonorId) ?? null;
  const hero = backup ?? primary;
  // Add a small floor to elapsed so the success state shows a believable "4m 32s" feel.
  const elapsedLabel = coordinationElapsedMs > 0 ? formatElapsed(coordinationElapsedMs) : '4m 32s';

  const entries: TimelineEntry[] = [
    { stage: 'request-raised', label: 'Request raised by hospital', done: true, active: false },
    { stage: 'donors-matched', label: '10 donors alerted simultaneously', done: true, active: false },
    {
      stage: 'donor-confirmed',
      label: backup ? 'Backup donor auto-activated' : 'First eligible donor confirmed',
      done: true,
      active: false,
    },
    { stage: 'en-route', label: 'Donor en route', done: true, active: false },
    { stage: 'screening', label: 'Screening completed', done: true, active: false },
    { stage: 'donation', label: 'Donation completed', done: true, active: false },
  ];

  function onBack() {
    navigate('/dashboard');
  }

  function onRunAgain() {
    resetDemo();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <div className="text-xs text-slate-500">Coordination Complete</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-pop p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/85 font-semibold">
              <Sparkles size={14} /> Live Hospital Status
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight">
              Blood Coordination Successful
            </h1>
            <p className="mt-1 text-white/85">Right Blood. Right Donor. Right Time.</p>
            <div className="mt-5 grid sm:grid-cols-4 gap-3">
              <Stat label="Patient" value={activeRequest?.patientName ?? 'Aarav Mishra'} />
              <Stat label="Blood Group" value={activeRequest?.bloodGroup ?? 'O-'} />
              <Stat label="Primary Source" value="Confirmed Donor" />
              <Stat label="Coordination" value={elapsedLabel} />
            </div>
            <div className="mt-5 flex items-center gap-2">
              <EmergencyBadge tone="green" dot>Donation Completed</EmergencyBadge>
              {backup && <EmergencyBadge tone="amber">Backup path used</EmergencyBadge>}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-navy-900">Request Timeline</h2>
            <div className="mt-4">
              <Timeline entries={entries} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <SecondaryButton size="lg" onClick={onBack}>
              <ArrowLeft size={16} /> Back to Dashboard
            </SecondaryButton>
            <PrimaryButton size="lg" onClick={onRunAgain}>
              <RefreshCcw size={16} /> Run Demo Again
            </PrimaryButton>
          </div>
        </section>

        <aside className="space-y-4">
          {/* Reward */}
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Donor Reward</div>
            <div className="mt-1 text-lg font-extrabold text-navy-900">{hero?.name ?? 'Rahul Das'}</div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-3 py-1.5 text-sm font-bold">
              <Star size={14} className="text-amber-500" fill="currentColor" /> +100 LIFE-LINK Points
            </div>
            <div className="mt-3 rounded-xl bg-navy-900 text-white p-4 flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-white/10">
                <Award size={20} className="text-amber-300" />
              </div>
              <div>
                <div className="text-xs text-white/70">New badge</div>
                <div className="font-bold">Emergency Responder</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Donors are incentivized through tiered points, badges, and recognition to keep the network reliable.
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Network Impact</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Heart size={14} className="text-red-500" /> 1 patient stabilized</li>
              <li className="flex items-center gap-2"><Timer size={14} className="text-navy-700" /> {elapsedLabel} total coordination time</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /> {pad2(donors.length)} donors coordinated in parallel</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 ring-1 ring-white/20 p-3">
      <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">{label}</div>
      <div className="mt-0.5 text-base font-extrabold">{value}</div>
    </div>
  );
}
