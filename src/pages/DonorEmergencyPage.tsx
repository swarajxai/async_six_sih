import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Car, CheckCircle2, Clock, Hospital, MapPin, ShieldCheck, Stethoscope } from 'lucide-react';
import DonorPortalHeader from '../components/DonorPortalHeader';
import EmergencyBadge from '../components/EmergencyBadge';
import MapPlaceholder from '../components/MapPlaceholder';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Timeline from '../components/Timeline';
import { DEMO_DONOR_ETA_MINUTES, DONOR_INCOMING_EMERGENCY } from '../data/donorData';
import { useDonor } from '../context/DonorContext';
import type { DonorJourneyStatus, DonorTravelMode, TimelineEntry } from '../types';

export default function DonorEmergencyPage() {
  const {
    profile,
    emergencyResponse,
    travelMode,
    journeyStatus,
    chooseTravelMode,
    markArrived,
    beginScreening,
    clearScreening,
    completeDonorDonation,
  } = useDonor();
  const navigate = useNavigate();

  if (emergencyResponse !== 'accepted') {
    return <div className="min-h-screen bg-slate-50"><DonorPortalHeader /><main className="mx-auto max-w-3xl px-4 sm:px-6 py-8"><div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-6 text-center"><h1 className="text-xl font-extrabold text-navy-900">No Active Donor Coordination</h1><p className="mt-2 text-sm text-slate-500">Accept the verified emergency request from your dashboard to begin.</p><div className="mt-4"><PrimaryButton onClick={() => navigate('/donor/dashboard#emergency')}>Return to Dashboard</PrimaryButton></div></div></main></div>;
  }

  const progress = journeyStatus === 'en-route' ? 0.38 : journeyStatus === 'idle' ? 0 : 1;
  const statusLabel = getJourneyStatusLabel(journeyStatus, travelMode);
  const entries: TimelineEntry[] = [
    { stage: 'request-raised', label: 'Emergency received', done: true, active: false },
    { stage: 'donors-matched', label: 'Emergency accepted', done: true, active: false },
    { stage: 'donor-confirmed', label: 'Hospital notified · donor slot confirmed', done: true, active: false },
    { stage: 'en-route', label: 'En route to hospital', done: journeyStatus !== 'idle', active: journeyStatus === 'en-route' },
    { stage: 'screening', label: 'Reached hospital · medical screening', done: ['screening', 'screening-cleared', 'completed'].includes(journeyStatus), active: journeyStatus === 'arrived' || journeyStatus === 'screening' },
    { stage: 'donation', label: 'Donation completed', done: journeyStatus === 'completed', active: journeyStatus === 'screening-cleared' },
  ];

  function complete() {
    completeDonorDonation();
    navigate('/donor/success');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DonorPortalHeader />
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={20} /></div>
              <div className="flex-1"><div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">Emergency Accepted</div><h1 className="mt-0.5 text-xl sm:text-2xl font-extrabold text-navy-900">Your donor slot is confirmed</h1><p className="mt-1 text-sm text-slate-500">Hospital Notified ✓ · You are one of the confirmed donors for this emergency.</p></div>
              <EmergencyBadge tone={journeyStatus === 'completed' ? 'green' : journeyStatus === 'screening' ? 'amber' : 'navy'} dot>{statusLabel}</EmergencyBadge>
            </div>

            {!travelMode ? (
              <div className="mt-6">
                <h2 className="text-lg font-bold text-navy-900">How will you reach the hospital?</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  <TravelChoice icon={<Car size={22} />} title="Self Travel" description={`Simulated ETA ${DEMO_DONOR_ETA_MINUTES} minutes`} onClick={() => chooseTravelMode('Self Travel')} primary />
                  <TravelChoice icon={<MapPin size={22} />} title="Need Pickup" description="Pickup coordination will be simulated" onClick={() => chooseTravelMode('Pickup')} />
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Detail label="Hospital" value={DONOR_INCOMING_EMERGENCY.hospitalName} />
                  <Detail label="Distance" value={`${DONOR_INCOMING_EMERGENCY.distanceKm} km`} />
                  <Detail label="ETA" value={journeyStatus === 'en-route' ? `${DEMO_DONOR_ETA_MINUTES} min` : 'Arrived'} />
                  <Detail label="Travel" value={travelMode} />
                </div>
                {travelMode === 'Pickup' && journeyStatus === 'en-route' && <div className="mt-3 rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-sm text-navy-900"><strong>Pickup Requested</strong><div className="text-xs text-slate-600">Driver and hospital coordination are simulated for this frontend demo.</div></div>}
                <div className="mt-4"><MapPlaceholder progress={progress} /></div>
                <div className="mt-4 flex justify-end">
                  {journeyStatus === 'en-route' && <PrimaryButton size="lg" onClick={markArrived}>Mark Arrived <ArrowRight size={17} /></PrimaryButton>}
                  {journeyStatus === 'arrived' && <PrimaryButton size="lg" onClick={beginScreening}><Stethoscope size={17} /> Begin Screening</PrimaryButton>}
                  {journeyStatus === 'screening' && <PrimaryButton size="lg" onClick={clearScreening}><ShieldCheck size={17} /> Screening Cleared</PrimaryButton>}
                  {journeyStatus === 'screening-cleared' && <PrimaryButton size="lg" onClick={complete}><CheckCircle2 size={17} /> Complete Donation</PrimaryButton>}
                </div>
                {journeyStatus === 'screening' && <div className="mt-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 text-xs text-amber-900">Medical screening is performed by trained hospital or blood-bank personnel. The donor does not self-certify eligibility.</div>}
                {journeyStatus === 'screening-cleared' && <div className="mt-3 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 text-sm text-emerald-900"><strong>Screening Cleared</strong><div className="text-xs">Hospital screening status recorded. Donation coordination can now be completed.</div></div>}
              </>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5"><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Donor</div><div className="mt-1 text-lg font-extrabold text-navy-900">{profile.fullName}</div><div className="mt-2 flex gap-2"><EmergencyBadge tone="red">{profile.bloodGroup}</EmergencyBadge><EmergencyBadge tone="green" dot>Confirmed</EmergencyBadge></div></div>
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5"><h2 className="font-bold text-navy-900">Donor Journey</h2><div className="mt-4"><Timeline entries={entries} /></div></div>
          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5"><div className="flex items-center gap-2 font-semibold"><Hospital size={16} className="text-red-300" /> {DONOR_INCOMING_EMERGENCY.hospitalName}</div><div className="mt-2 text-sm text-white/80 flex items-center gap-1"><MapPin size={13} /> {DONOR_INCOMING_EMERGENCY.hospitalLocation}</div><div className="mt-2 text-xs text-white/60 flex items-center gap-1"><Clock size={12} /> Required within {DONOR_INCOMING_EMERGENCY.requiredWithinMinutes} minutes</div></div>
          <SecondaryButton block onClick={() => navigate('/donor/dashboard')}><ArrowLeft size={15} /> Back to Dashboard</SecondaryButton>
        </aside>
      </main>
    </div>
  );
}

function getJourneyStatusLabel(status: DonorJourneyStatus, travelMode: DonorTravelMode | null): string {
  if (!travelMode) return 'Travel Choice';
  if (status === 'arrived') return 'Arrived';
  if (status === 'screening') return 'Medical Screening';
  if (status === 'screening-cleared') return 'Screening Cleared';
  if (status === 'completed') return 'Completed';
  return 'En Route';
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-xs font-semibold text-navy-900">{value}</div></div>;
}

function TravelChoice({ icon, title, description, onClick, primary = false }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; primary?: boolean }) {
  return <button onClick={onClick} className={['rounded-2xl p-4 text-left ring-1 transition hover:shadow-pop', primary ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-900 ring-slate-200'].join(' ')}><div className={primary ? 'text-red-300' : 'text-navy-700'}>{icon}</div><div className="mt-2 font-bold">{title}</div><div className={['mt-1 text-xs', primary ? 'text-white/70' : 'text-slate-500'].join(' ')}>{description}</div></button>;
}
