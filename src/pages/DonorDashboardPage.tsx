import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Award, BellRing, CheckCircle2, Clock, Droplet, Gift, Heart, History, MapPin, Moon, Phone, ShieldCheck, Star, ToggleLeft, ToggleRight, UserRound } from 'lucide-react';
import DonorPortalHeader from '../components/DonorPortalHeader';
import EmergencyBadge from '../components/EmergencyBadge';
import MetricCard from '../components/MetricCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { DONOR_INCOMING_EMERGENCY, PARTNER_BENEFITS } from '../data/donorData';
import { useDonor } from '../context/DonorContext';

export default function DonorDashboardPage() {
  const {
    profile,
    eligibilityResult,
    emergencyResponse,
    rewardPoints,
    donationHistory,
    badges,
    toggleEmergencyAvailability,
    toggleNightEmergency,
    respondToEmergency,
    resetEmergencyResponse,
  } = useDonor();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  function acceptEmergency() {
    respondToEmergency('accepted');
    navigate('/donor/emergency');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DonorPortalHeader />
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Welcome,</div><h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">{profile.fullName}</h1><p className="mt-1 text-sm text-slate-500">{profile.district}, {profile.state} · Verified Blood Donor</p></div>
          <div className="flex flex-wrap gap-2"><EmergencyBadge tone="red">{profile.bloodGroup}</EmergencyBadge><EmergencyBadge tone={eligibilityResult === 'likely-eligible' ? 'green' : 'amber'} dot>{eligibilityResult === 'likely-eligible' ? 'Eligible' : 'Medical Review'}</EmergencyBadge><EmergencyBadge tone={profile.availableForEmergency ? 'green' : 'slate'}>{profile.availableForEmergency ? 'Available for Emergency' : 'Unavailable'}</EmergencyBadge><EmergencyBadge tone="navy"><Moon size={12} /> Night Emergency {profile.nightEmergencyVolunteer ? 'Enabled' : 'Disabled'}</EmergencyBadge></div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard icon={Gift} label="Reward Points" value={rewardPoints} hint="LIFE-LINK rewards" tone="amber" />
          <MetricCard icon={Droplet} label="Total Donations" value={donationHistory.length} hint="Verified completions" tone="red" />
          <MetricCard icon={Heart} label="Lives Supported" value={donationHistory.length} hint="Completed donor contributions" tone="green" />
          <MetricCard icon={ShieldCheck} label="Current Eligibility" value={eligibilityResult === 'likely-eligible' ? 'Eligible' : 'Review'} hint="Pre-screening status" tone="navy" />
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6" id="emergency">
            <div className="flex items-start gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency"><BellRing size={20} /></div>
              <div className="flex-1"><div className="text-xs uppercase tracking-wider text-emergency font-semibold">Incoming Emergency</div><h2 className="mt-0.5 text-xl font-extrabold text-navy-900">Emergency Blood Request</h2></div>
              <EmergencyBadge tone="red" dot>{DONOR_INCOMING_EMERGENCY.urgency}</EmergencyBadge>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Detail label="Hospital" value={DONOR_INCOMING_EMERGENCY.hospitalName} />
              <Detail label="Blood Needed" value={DONOR_INCOMING_EMERGENCY.bloodGroup} />
              <Detail label="Distance" value={`${DONOR_INCOMING_EMERGENCY.distanceKm} km`} />
              <Detail label="Required Within" value={`${DONOR_INCOMING_EMERGENCY.requiredWithinMinutes} min`} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 size={14} className="text-emerald-600" /> Verified Hospital · {DONOR_INCOMING_EMERGENCY.hospitalLocation}</div>
            <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-600">Only minimum emergency information is shown. Patient medical details are not exposed to the donor.</div>
            {emergencyResponse === 'pending' ? <div className="mt-4 grid sm:grid-cols-2 gap-2"><PrimaryButton size="lg" disabled={!profile.availableForEmergency} onClick={acceptEmergency}>Accept Emergency</PrimaryButton><SecondaryButton size="lg" onClick={() => respondToEmergency('unavailable')}>Unavailable</SecondaryButton>{!profile.availableForEmergency && <div className="sm:col-span-2 text-xs text-amber-700">Turn on Available for Emergency before accepting a request.</div>}</div> : emergencyResponse === 'unavailable' ? <div className="mt-4 rounded-xl bg-slate-100 ring-1 ring-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="font-semibold text-navy-900">Marked Unavailable</div><div className="text-xs text-slate-500">You will not be coordinated for this demo request.</div></div><SecondaryButton onClick={resetEmergencyResponse}>Make Available Again</SecondaryButton></div> : <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="font-semibold text-emerald-900">Emergency Accepted</div><div className="text-xs text-emerald-800">Hospital notified · donor slot confirmed</div></div><PrimaryButton onClick={() => navigate('/donor/emergency')}>Continue Coordination</PrimaryButton></div>}
          </div>

          <div className="space-y-4">
            <AvailabilityControl label="Available for Emergency" description="Participate in compatible emergency matching" enabled={profile.availableForEmergency} onToggle={toggleEmergencyAvailability} />
            <AvailabilityControl label="Night Emergency Volunteer" description="12:00 AM–6:00 AM voluntary alerts" enabled={profile.nightEmergencyVolunteer} onToggle={toggleNightEmergency} night />
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6" id="rewards">
          <div className="lg:col-span-2 rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-2"><Award size={18} className="text-amber-600" /><h2 className="text-lg font-bold text-navy-900">LIFE-LINK Rewards</h2></div>
            <p className="mt-1 text-xs text-slate-500">One successful donation earns 100 base reward points.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {badges.map((badge) => <div key={badge.id} className={['rounded-xl ring-1 p-3', badge.unlocked ? 'bg-white ring-slate-200' : 'bg-slate-50 ring-slate-200 opacity-65'].join(' ')}><div className="flex items-center justify-between gap-2"><div className="font-semibold text-navy-900">{badge.name}</div><EmergencyBadge tone={badge.unlocked ? badge.tone : 'slate'}>{badge.unlocked ? 'Unlocked' : 'Locked'}</EmergencyBadge></div><div className="mt-1 text-xs text-slate-500">{badge.description}</div></div>)}
            </div>
          </div>
          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="flex items-center gap-2"><Star size={17} className="text-amber-300" /><div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Partner Benefits · Prototype</div></div>
            <ul className="mt-3 space-y-2 text-sm text-white/85">{PARTNER_BENEFITS.map((benefit) => <li key={benefit}>· {benefit}</li>)}</ul>
            <p className="mt-4 text-xs text-white/60">Benefits depend on participating partners and are not guaranteed or nationally available.</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6" id="history">
          <div className="flex items-center gap-2"><History size={18} className="text-navy-700" /><h2 className="text-lg font-bold text-navy-900">Donation History</h2></div>
          <div className="mt-4 grid md:grid-cols-2 gap-3">{donationHistory.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-navy-900">{item.facility}</div><div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-2"><span><Clock size={11} className="inline" /> {item.date}</span><span>· {item.units} unit</span><span>· {item.bloodGroup}</span></div></div><EmergencyBadge tone="green">{item.status}</EmergencyBadge></div><div className="mt-2 text-xs font-semibold text-amber-700">+{item.rewardPoints} points</div></div>)}</div>
        </section>

        <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6" id="profile">
          <div className="flex items-center gap-2"><UserRound size={18} className="text-navy-700" /><h2 className="text-lg font-bold text-navy-900">Donor Profile</h2></div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"><Detail label="Name" value={profile.fullName} /><Detail label="Blood Group" value={profile.bloodGroup} /><Detail label="Date of Birth" value={profile.dateOfBirth} /><Detail label="Gender" value={profile.gender} /><Detail label="Phone" value={profile.phone} /><Detail label="Identity" value={profile.maskedIdentity} /><Detail label="Verification" value={profile.identityStatus} /><Detail label="Address" value={`${profile.address}, ${profile.pinCode}`} /></div>
          <div className="mt-3 text-xs text-slate-500 flex items-start gap-2"><Phone size={13} className="mt-0.5" /> Location is shared only when required for active emergency coordination.</div>
        </section>
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-sm font-semibold text-navy-900">{value}</div></div>;
}

function AvailabilityControl({ label, description, enabled, onToggle, night = false }: { label: string; description: string; enabled: boolean; onToggle: () => void; night?: boolean }) {
  return <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-4"><div className="flex items-center gap-3"><div className={['grid place-items-center h-10 w-10 rounded-xl', night ? 'bg-navy-50 text-navy-800' : 'bg-emerald-50 text-emerald-700'].join(' ')}>{night ? <Moon size={19} /> : <MapPin size={19} />}</div><div className="flex-1"><div className="font-semibold text-navy-900">{label}</div><div className="text-xs text-slate-500">{description}</div></div><button onClick={onToggle} aria-label={`Toggle ${label}`} className={enabled ? 'text-emerald-600' : 'text-slate-400'}>{enabled ? <ToggleRight size={34} /> : <ToggleLeft size={34} />}</button></div><div className="mt-2"><EmergencyBadge tone={enabled ? 'green' : 'slate'}>{enabled ? 'ON' : 'OFF'}</EmergencyBadge></div></div>;
}
