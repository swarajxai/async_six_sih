import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Heart, Hourglass, Phone, Sparkles, Stethoscope, Users } from 'lucide-react';
import Brand from '../components/Brand';
import CoordinationDonorCard from '../components/CoordinationDonorCard';
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
    activeRequest,
    donors,
    confirmedDonorIds,
    standbyDonorIds,
    failedDonorIds,
    donorCoordination,
    replacementCount,
    replacementPending,
    coordinationElapsedMs,
    tickDonorEtas,
    tickCoordination,
    simulateScreeningFailure,
    completeDonation,
    openDonorModal,
  } = useDemo();
  const navigate = useNavigate();
  const required = activeRequest?.donorUnitsRequired ?? 0;
  const activeDonors = confirmedDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const failedDonors = failedDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const standbyDonors = standbyDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const mapDonor = activeDonors[0];
  const mapCoordination = mapDonor ? donorCoordination[mapDonor.id] : null;
  const mapProgress = mapDonor && mapCoordination
    ? Math.max(0, Math.min(1, 1 - mapCoordination.etaSeconds / (mapDonor.etaMinutes * 60)))
    : 0;

  useEffect(() => {
    const id = setInterval(tickDonorEtas, 1000);
    return () => clearInterval(id);
  }, [tickDonorEtas]);

  useEffect(() => {
    const id = setInterval(tickCoordination, 1000);
    return () => clearInterval(id);
  }, [tickCoordination]);

  const entries: TimelineEntry[] = useMemo(() => [
    { stage: 'request-raised', label: 'Request raised by hospital', done: true, active: false },
    { stage: 'donors-matched', label: `${required} donor contributions matched`, done: true, active: false },
    { stage: 'donor-confirmed', label: `${confirmedDonorIds.length} / ${required} donors secured`, done: confirmedDonorIds.length >= required, active: confirmedDonorIds.length < required },
    { stage: 'en-route', label: 'Independent donor travel tracked', done: coordinationElapsedMs >= 2000, active: coordinationElapsedMs < 2000 },
    { stage: 'screening', label: failedDonorIds.length ? 'Screening issue handled with standby' : 'Pre-donation screening', done: coordinationElapsedMs >= 4500, active: coordinationElapsedMs >= 2000 && coordinationElapsedMs < 4500 },
    { stage: 'donation', label: 'Donation coordination ready', done: coordinationElapsedMs >= 5500, active: coordinationElapsedMs >= 4500 },
  ], [required, confirmedDonorIds.length, failedDonorIds.length, coordinationElapsedMs]);

  function onContinue() {
    completeDonation();
    navigate('/success');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <div className="text-xs text-slate-500">Step 4 of 4 · Multi-Donor Coordination</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            {replacementPending && (
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 mb-4 text-amber-900 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5" />
                <div><div className="font-semibold">Screening failed for one secured donor.</div><div className="text-xs">Activating highest-ranked standby donor…</div></div>
              </div>
            )}
            {replacementCount > 0 && !replacementPending && (
              <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 mb-4 text-emerald-900 text-sm flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5" />
                <div><div className="font-semibold">Standby replacement activated automatically.</div><div className="text-xs">Required donor capacity restored to {confirmedDonorIds.length} / {required}.</div></div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-navy-50 text-navy-800"><Users size={20} /></div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">{confirmedDonorIds.length} Donors Secured</h1>
                <p className="text-sm text-slate-500">Independent ETA, travel, and screening states</p>
              </div>
              <EmergencyBadge tone={confirmedDonorIds.length >= required ? 'green' : 'amber'} dot>{confirmedDonorIds.length} / {required} Secured</EmergencyBadge>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {activeDonors.map((donor) => donorCoordination[donor.id] && (
                <CoordinationDonorCard key={donor.id} donor={donor} coordination={donorCoordination[donor.id]} />
              ))}
            </div>

            {mapDonor && (
              <div className="mt-5">
                <div className="mb-2 text-xs text-slate-500">Active route preview · {mapDonor.name}</div>
                <MapPlaceholder progress={mapProgress} />
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-navy-900">Hospital Coordination Status</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-6">
              <Timeline entries={entries} />
              <div className="space-y-3">
                <SecondaryButton block onClick={() => openDonorModal(confirmedDonorIds[0] ?? 'd-1')}><Phone size={16} /> View Donor Alert</SecondaryButton>
                <SecondaryButton block disabled={replacementPending || standbyDonorIds.length === 0 || failedDonorIds.length > 0} onClick={simulateScreeningFailure}>
                  <AlertTriangle size={16} /> {failedDonorIds.length ? 'Screening Failure Simulated' : 'Simulate Screening Failure'}
                </SecondaryButton>
                <PrimaryButton block size="lg" disabled={replacementPending || confirmedDonorIds.length < required} onClick={onContinue}>
                  <CheckCircle2 size={18} /> Continue Successful Donation <ArrowRight size={16} />
                </PrimaryButton>
              </div>
            </div>
          </div>

          {failedDonors.length > 0 && (
            <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-navy-900">Screening History</h2>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {failedDonors.map((donor) => donorCoordination[donor.id] && <CoordinationDonorCard key={donor.id} donor={donor} coordination={donorCoordination[donor.id]} />)}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Patient</div>
            <div className="mt-1 text-lg font-extrabold text-navy-900">{activeRequest?.patientName ?? 'Aarav Mishra'}</div>
            <div className="mt-1 text-sm text-slate-600">{activeRequest?.bloodGroup} · {activeRequest?.units} total units · {activeRequest?.urgency}</div>
          </div>

          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Source Coordination</div>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2"><Sparkles size={14} className="text-amber-300" /> {activeRequest?.bloodBankUnitsSecured ?? 0} blood-bank units secured</li>
              <li className="flex items-center gap-2"><Stethoscope size={14} className="text-emerald-300" /> {required} donor units required</li>
              <li className="flex items-center gap-2"><Heart size={14} className="text-red-300" /> {standbyDonorIds.length} donor{standbyDonorIds.length === 1 ? '' : 's'} on standby</li>
            </ul>
          </div>

          {standbyDonors.length > 0 && (
            <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Standby Queue</div>
              <div className="mt-2 space-y-2">{standbyDonors.map((donor) => <DonorCard key={donor.id} donor={donor} compact />)}</div>
            </div>
          )}

          <div className="rounded-2xl bg-slate-100 ring-1 ring-slate-200 p-4 text-xs text-slate-600 flex items-start gap-2">
            <Hourglass size={14} className="mt-0.5" />
            <div>Each donor is tracked independently. Clinical screening remains the hospital's final suitability check.</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
