import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Droplet,
  Heart,
  Hourglass,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import Brand from '../components/Brand';
import DonorCard from '../components/DonorCard';
import EmergencyBadge from '../components/EmergencyBadge';
import MapPlaceholder from '../components/MapPlaceholder';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Timeline from '../components/Timeline';
import { useDemo } from '../context/DemoContext';
import type { TimelineEntry } from '../types';

export default function CoordinationPage() {
  const {
    donors,
    primaryDonorId,
    backupDonorId,
    screeningFailed,
    etaSeconds,
    tickEta,
    tickCoordination,
    coordinationStartTime,
    coordinationElapsedMs,
    simulateScreeningFailure,
    completeDonation,
    openDonorModal,
  } = useDemo();
  const navigate = useNavigate();

  const primary = donors.find((d) => d.id === primaryDonorId) ?? null;
  const backup = donors.find((d) => d.id === backupDonorId) ?? null;
  const activeDonor = backup ?? primary;

  // ETA countdown
  useEffect(() => {
    const id = setInterval(() => tickEta(), 1000);
    return () => clearInterval(id);
  }, [tickEta]);

  // Elapsed coordination time
  useEffect(() => {
    const id = setInterval(() => tickCoordination(), 1000);
    return () => clearInterval(id);
  }, [tickCoordination]);

  // Animate map progress over ~12 seconds of ETA
  const etaStart = primary?.etaMinutes ? primary.etaMinutes * 60 : 12 * 60;
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const target = Math.max(0, Math.min(1, 1 - etaSeconds / etaStart));
    let raf = 0;
    function step() {
      setProgress((p) => p + (target - p) * 0.08);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [etaSeconds, etaStart]);

  const entries: TimelineEntry[] = useMemo(() => {
    const done = (ms: number) => coordinationStartTime !== null && coordinationElapsedMs >= ms;
    const items: TimelineEntry[] = [
      { stage: 'request-raised', label: 'Request raised by hospital', done: true, active: false },
      { stage: 'donors-matched', label: 'Donors matched and alerted', done: true, active: false },
      { stage: 'donor-confirmed', label: 'Donor confirmed', done: true, active: false },
      {
        stage: 'en-route',
        label: screeningFailed ? 'Backup donor en route' : 'Donor en route',
        done: done(1000),
        active: !done(1000),
      },
      {
        stage: 'screening',
        label: screeningFailed ? 'Screening failed for primary' : 'Pre-donation screening',
        done: done(2500) || screeningFailed,
        active: !done(2500) && !screeningFailed,
      },
      { stage: 'donation', label: 'Donation in progress', done: done(4000), active: !done(4000) },
    ];
    return items;
  }, [coordinationStartTime, coordinationElapsedMs, screeningFailed]);

  function onContinue() {
    completeDonation();
    navigate('/success');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <div className="text-xs text-slate-500">Step 4 of 4 · Live Coordination</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          {/* Primary donor header */}
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            {screeningFailed && backup ? (
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 mb-4 text-amber-900 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5" />
                <div>
                  <div className="font-semibold">Screening issue detected.</div>
                  <div className="text-xs">Activating next eligible donor automatically…</div>
                </div>
              </div>
            ) : null}

            {screeningFailed && backup && (
              <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 mb-4 text-emerald-900 text-sm flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5" />
                <div>
                  <div className="font-semibold">No Dead End — Backup Donor Activated Automatically</div>
                  <div className="text-xs">Priya Sharma confirmed · ETA 16 min</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-navy-50 text-navy-800">
                <Car size={20} />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                  {screeningFailed && backup ? 'Backup Donor — Priya Sharma' : 'Primary Donor — Rahul Das'}
                </h1>
                <p className="text-sm text-slate-500">Live ETA · Self travel · Active route</p>
              </div>
              <EmergencyBadge tone={screeningFailed ? 'amber' : 'green'} dot>
                {screeningFailed ? 'Backup Active' : 'En Route'}
              </EmergencyBadge>
            </div>

            {activeDonor && (
              <>
                <div className="mt-4 grid sm:grid-cols-4 gap-3">
                  <Stat icon={Droplet} label="Blood Group" value={activeDonor.bloodGroup} accent="bg-emergency text-white" />
                  <Stat icon={MapPin} label="Distance" value={`${activeDonor.distanceKm} km`} />
                  <Stat icon={Car} label="Travel" value="Self Travel" />
                  <Stat
                    icon={Clock}
                    label="ETA"
                    value={`${Math.floor(etaSeconds / 60)}m ${String(etaSeconds % 60).padStart(2, '0')}s`}
                    accent="bg-navy-900 text-white"
                  />
                </div>

                <div className="mt-4">
                  <MapPlaceholder progress={progress} />
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                    <div className="text-xs text-slate-500">Donor phone</div>
                    <div className="font-semibold text-navy-900 flex items-center gap-2">
                      <Phone size={14} /> {activeDonor.phone}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                    <div className="text-xs text-slate-500">Reliability</div>
                    <div className="font-semibold text-navy-900 flex items-center gap-2">
                      <Shield size={14} /> {activeDonor.reliability}%
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions / timeline */}
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-navy-900">Hospital Coordination Status</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-6">
              <Timeline entries={entries} />
              <div className="space-y-3">
                <SecondaryButton block onClick={() => openDonorModal(primaryDonorId ?? 'd-1')}>
                  <Phone size={16} /> View Donor Alert
                </SecondaryButton>
                {!screeningFailed ? (
                  <SecondaryButton block onClick={simulateScreeningFailure}>
                    <AlertTriangle size={16} /> Simulate Screening Failure
                  </SecondaryButton>
                ) : (
                  <SecondaryButton block disabled>
                    <AlertTriangle size={16} /> Screening Failure Simulated
                  </SecondaryButton>
                )}
                <PrimaryButton block size="lg" onClick={onContinue}>
                  <CheckCircle2 size={18} /> Continue Successful Donation
                  <ArrowRight size={16} />
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Patient</div>
            <div className="mt-1 text-lg font-extrabold text-navy-900">Aarav Mishra</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-md bg-emergency text-white font-bold text-sm">
                O-
              </span>
              <span className="text-sm text-slate-600">2 units · Critical</span>
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">LIFE-LINK innovations</div>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-amber-300" /> Parallel bank checks</li>
              <li className="flex items-center gap-2"><Stethoscope size={14} className="text-emerald-300" /> Live screening handling</li>
              <li className="flex items-center gap-2"><Heart size={14} className="text-red-300" /> Automatic backup donor</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Donor queue</div>
            <div className="mt-2 space-y-2">
              {primary && <DonorCard donor={primary} compact />}
              {backup && backup.id !== primary?.id && <DonorCard donor={backup} compact />}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100 ring-1 ring-slate-200 p-4 text-xs text-slate-600 flex items-start gap-2">
            <Hourglass size={14} className="mt-0.5" />
            <div>
              Real products would log every status update to an immutable audit trail for the hospital.
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl ring-1 ring-slate-200 p-3 bg-slate-50">
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </div>
      <div
        className={[
          'mt-1 inline-flex items-center px-2 py-0.5 rounded-md font-extrabold text-base',
          accent ?? 'text-navy-900',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  );
}
