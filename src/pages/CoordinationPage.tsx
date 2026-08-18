import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Car, CheckCircle2, Clock, Heart, Hourglass, MapPin, Phone, Stethoscope, Users } from 'lucide-react';
import Brand from '../components/Brand';
import CoordinationDonorCard from '../components/CoordinationDonorCard';
import DonorCard from '../components/DonorCard';
import EmergencyBadge from '../components/EmergencyBadge';
import MapPlaceholder from '../components/MapPlaceholder';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Timeline from '../components/Timeline';
import { useDemo } from '../context/DemoContext';
import type { DonorTravelStatus, TimelineEntry } from '../types';

export default function CoordinationPage() {
  const {
    activeRequest,
    donors,
    confirmedDonorIds,
    standbyDonorIds,
    failedDonorIds,
    donorCoordination,
    trackedDonorId,
    replacementCount,
    replacementPending,
    coordinationElapsedMs,
    tickDonorEtas,
    tickCoordination,
    selectDonorForTracking,
    simulateScreeningFailure,
    completeDonation,
    openDonorModal,
  } = useDemo();
  const navigate = useNavigate();
  const required = activeRequest?.units ?? 0;
  const activeDonors = confirmedDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const failedDonors = failedDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const standbyDonors = standbyDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);
  const trackedDonor = donors.find((donor) => donor.id === trackedDonorId) ?? activeDonors[0];
  const trackedCoordination = trackedDonor ? donorCoordination[trackedDonor.id] : null;
  const replacementDonor = activeDonors.find((donor) => donorCoordination[donor.id]?.isReplacement);
  const mapProgress = trackedDonor && trackedCoordination
    ? Math.max(0, Math.min(1, 1 - trackedCoordination.etaSeconds / (trackedDonor.etaMinutes * 60)))
    : 0;
  const lastFailedDonor = failedDonors[failedDonors.length - 1];

  useEffect(() => {
    const id = setInterval(tickDonorEtas, 1000);
    return () => clearInterval(id);
  }, [tickDonorEtas]);

  useEffect(() => {
    const id = setInterval(tickCoordination, 1000);
    return () => clearInterval(id);
  }, [tickCoordination]);

  useEffect(() => {
    if (!trackedDonorId && activeDonors[0]) selectDonorForTracking(activeDonors[0].id);
  }, [trackedDonorId, activeDonors, selectDonorForTracking]);

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
                <div><div className="font-semibold">{lastFailedDonor?.name ?? 'Selected donor'} failed screening.</div><div className="text-xs">Activating highest-ranked standby donor…</div></div>
              </div>
            )}
            {replacementCount > 0 && !replacementPending && (
              <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 mb-4 text-emerald-900 text-sm flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5" />
                <div><div className="font-semibold">{replacementDonor?.name ?? 'Standby donor'} activated as the confirmed replacement.</div><div className="text-xs">Required donor capacity restored to {confirmedDonorIds.length} / {required}.</div></div>
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
                <CoordinationDonorCard
                  key={donor.id}
                  donor={donor}
                  coordination={donorCoordination[donor.id]}
                  selected={trackedDonor?.id === donor.id}
                  onClick={() => selectDonorForTracking(donor.id)}
                />
              ))}
            </div>

            {trackedDonor && trackedCoordination && (
              <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Individual Donor Tracking</div>
                    <h2 className="mt-0.5 text-lg font-bold text-navy-900">Tracking {trackedDonor.name}</h2>
                  </div>
                  <EmergencyBadge tone={trackedCoordination.status === 'screening-failed' ? 'red' : trackedCoordination.status === 'screening' ? 'amber' : 'green'} dot>
                    {coordinationStatusLabel(trackedCoordination.status, trackedCoordination.isReplacement)}
                  </EmergencyBadge>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <TrackingDetail icon={<MapPin size={12} />} label="Distance" value={`${trackedDonor.distanceKm} km`} />
                  <TrackingDetail icon={<Clock size={12} />} label="Current ETA" value={formatEta(trackedCoordination.etaSeconds)} />
                  <TrackingDetail icon={<Car size={12} />} label="Travel Mode" value={trackedCoordination.travelMode} />
                  <TrackingDetail icon={<Stethoscope size={12} />} label="Current Status" value={coordinationStatusLabel(trackedCoordination.status, trackedCoordination.isReplacement)} />
                </div>
                <div className="mt-4">
                <MapPlaceholder progress={mapProgress} />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-navy-900">Hospital Coordination Status</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-6">
              <Timeline entries={entries} />
              <div className="space-y-3">
                <div className="text-xs text-slate-500">Selected donor: <span className="font-semibold text-navy-900">{trackedDonor?.name ?? 'None'}</span></div>
                <SecondaryButton block onClick={() => openDonorModal(trackedDonor?.id ?? 'd-1')}><Phone size={16} /> View Selected Donor Alert</SecondaryButton>
                <SecondaryButton block disabled={replacementPending || standbyDonorIds.length === 0 || !trackedDonorId || !confirmedDonorIds.includes(trackedDonorId)} onClick={simulateScreeningFailure}>
                  <AlertTriangle size={16} /> Simulate Screening Failure
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
            <div className="mt-1 text-sm text-slate-600">{activeRequest?.bloodGroup} · {activeRequest?.units} donor units · {activeRequest?.urgency}</div>
          </div>

          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Donor Coordination</div>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2"><Stethoscope size={14} className="text-emerald-300" /> {required} donor units required</li>
              <li className="flex items-center gap-2"><Users size={14} className="text-amber-300" /> {confirmedDonorIds.length} active donors tracked</li>
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

function coordinationStatusLabel(status: DonorTravelStatus, isReplacement: boolean): string {
  if (status === 'screening-failed') return 'Screening Failed';
  if (status === 'screening') return 'Screening';
  if (status === 'ready') return 'Ready to Donate';
  if (status === 'donated') return 'Donation Completed';
  return isReplacement ? 'Confirmed Replacement' : 'En Route';
}

function formatEta(seconds: number): string {
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}

function TrackingDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white ring-1 ring-slate-200 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">{icon}{label}</div>
      <div className="mt-0.5 text-xs font-semibold text-navy-900">{value}</div>
    </div>
  );
}
