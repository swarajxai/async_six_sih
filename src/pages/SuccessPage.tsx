import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Heart, RefreshCcw, Sparkles, Star, Timer, Users } from 'lucide-react';
import Brand from '../components/Brand';
import EmergencyBadge from '../components/EmergencyBadge';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Timeline from '../components/Timeline';
import { useDemo } from '../context/DemoContext';
import { formatElapsed } from '../utils/time';
import type { TimelineEntry } from '../types';

export default function SuccessPage() {
  const {
    activeRequest,
    donors,
    confirmedDonorIds,
    failedDonorIds,
    replacementCount,
    coordinationElapsedMs,
    resetDemo,
  } = useDemo();
  const navigate = useNavigate();
  const successfulDonors = confirmedDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const donorUnitsRequired = activeRequest?.units ?? 0;
  const elapsedLabel = coordinationElapsedMs > 0 ? formatElapsed(coordinationElapsedMs) : '0m 00s';

  const entries: TimelineEntry[] = [
    { stage: 'request-raised', label: 'Verified hospital request created', done: true, active: false },
    { stage: 'donors-matched', label: 'Compatible donors matched and alerted', done: true, active: false },
    { stage: 'donor-confirmed', label: `${successfulDonors.length} donor contributions secured`, done: true, active: false },
    { stage: 'en-route', label: 'Individual donor travel coordinated', done: true, active: false },
    { stage: 'screening', label: replacementCount ? 'Screening failure replaced from standby' : 'Screening completed', done: true, active: false },
    { stage: 'donation', label: 'Emergency donor coordination completed', done: true, active: false },
  ];

  function onBack() {
    navigate('/dashboard');
  }

  function onRunAgain() {
    resetDemo();
    navigate('/dashboard');
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
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/85 font-semibold"><Sparkles size={14} /> Live Hospital Status</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight">Emergency Donor Coordination Successful</h1>
            <p className="mt-1 text-white/85">LIFE-LINK coordinated one distinct donor for every requested donor unit.</p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Donor Units Requested" value={`${donorUnitsRequired} units`} />
              <Stat label="Successfully Coordinated" value={`${successfulDonors.length} / ${donorUnitsRequired}`} />
              <Stat label="Screening Failures" value={String(failedDonorIds.length)} />
              <Stat label="Standby Replacements" value={String(replacementCount)} />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <EmergencyBadge tone="green" dot>Requirement Fulfilled</EmergencyBadge>
              {replacementCount > 0 && <EmergencyBadge tone="amber">{replacementCount} standby replacement activated</EmergencyBadge>}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-2"><Users size={18} className="text-navy-700" /><h2 className="text-lg font-bold text-navy-900">Successful Individual Donors</h2></div>
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                {successfulDonors.map((donor) => (
                  <div key={donor.id} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2"><span className="font-semibold text-navy-900">{donor.name}</span><span className="rounded-md bg-emergency text-white font-bold text-xs px-2 py-1">{donor.bloodGroup}</span></div>
                    <div className="mt-1 text-xs text-slate-500">1 donor unit · Donation completed</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-500">Initial confirmations: {donorUnitsRequired} · Screening failures: {failedDonorIds.length} · Standby replacements: {replacementCount} · Final active donors: {successfulDonors.length}</div>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-navy-900">Request Timeline</h2>
            <div className="mt-4"><Timeline entries={entries} /></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <SecondaryButton size="lg" onClick={onBack}><ArrowLeft size={16} /> Back to Dashboard</SecondaryButton>
            <PrimaryButton size="lg" onClick={onRunAgain}><RefreshCcw size={16} /> Run Demo Again</PrimaryButton>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Donor Recognition</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-3 py-1.5 text-sm font-bold"><Star size={14} className="text-amber-500" fill="currentColor" /> +100 points each</div>
              <div className="mt-3 rounded-xl bg-navy-900 text-white p-4 flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-lg bg-white/10"><Award size={20} className="text-amber-300" /></div>
                <div><div className="text-xs text-white/70">Badge</div><div className="font-bold">Emergency Responder</div></div>
              </div>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Network Impact</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Heart size={14} className="text-red-500" /> 1 patient requirement fulfilled</li>
              <li className="flex items-center gap-2"><Timer size={14} className="text-navy-700" /> {elapsedLabel} demo coordination time</li>
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-amber-500" /> {successfulDonors.length} donor units coordinated</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 ring-1 ring-white/20 p-3"><div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">{label}</div><div className="mt-0.5 text-base font-extrabold">{value}</div></div>;
}
