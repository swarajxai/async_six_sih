import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, Gift, Heart, Star } from 'lucide-react';
import Brand from '../components/Brand';
import EmergencyBadge from '../components/EmergencyBadge';
import PrimaryButton from '../components/PrimaryButton';
import { DONOR_INCOMING_EMERGENCY } from '../data/donorData';
import { useDonor } from '../context/DonorContext';

export default function DonorSuccessPage() {
  const { profile, journeyStatus, pointsAwarded, newlyUnlockedBadgeNames, rewardPoints, donationHistory } = useDonor();
  const navigate = useNavigate();

  if (journeyStatus !== 'completed') {
    return <div className="min-h-screen bg-slate-50"><header className="bg-white border-b border-slate-100"><div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center"><Brand size="md" /></div></header><main className="mx-auto max-w-3xl px-4 py-8"><div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-6 text-center"><h1 className="text-xl font-extrabold text-navy-900">Donation Not Yet Completed</h1><div className="mt-4"><PrimaryButton onClick={() => navigate('/donor/dashboard')}>Return to Dashboard</PrimaryButton></div></div></main></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100"><div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between"><Brand size="md" /><div className="text-xs text-slate-500">Donor Journey Complete</div></div></header>
      <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-pop p-6 sm:p-8 text-center">
            <CheckCircle2 size={36} className="mx-auto" />
            <div className="mt-3 text-xs uppercase tracking-wider text-white/80 font-semibold">Donation Completed</div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Thank You, {profile.fullName.split(' ')[0]}</h1>
            <p className="mt-2 text-white/85">Your emergency blood donation was successfully completed.</p>
            <div className="mt-5 grid grid-cols-2 gap-3"><Stat label="LIFE-LINK Reward" value={`+${pointsAwarded} points`} /><Stat label="Total Reward Points" value={String(rewardPoints)} /></div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">{newlyUnlockedBadgeNames.map((name) => <EmergencyBadge key={name} tone="amber"><Star size={12} /> {name}</EmergencyBadge>)}</div>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-navy-900">Donation Summary</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-3"><Summary label="Hospital" value={DONOR_INCOMING_EMERGENCY.hospitalName} /><Summary label="Blood Group" value={profile.bloodGroup} /><Summary label="Contribution" value="1 donor unit" /></div>
            <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 text-sm text-emerald-900"><strong>Dashboard updated</strong><div className="text-xs">Reward points, donation count, history, and badge progress now reflect this completed donation.</div></div>
          </div>

          <PrimaryButton size="lg" onClick={() => navigate('/donor/dashboard')}>Return to Donor Dashboard</PrimaryButton>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5"><div className="grid place-items-center h-10 w-10 rounded-xl bg-amber-50 text-amber-700"><Gift size={20} /></div><div className="mt-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">Reward Earned</div><div className="mt-1 text-2xl font-extrabold text-navy-900">+{pointsAwarded}</div><div className="text-xs text-slate-500">Base donation points</div></div>
          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5"><div className="flex items-center gap-2"><Award size={18} className="text-amber-300" /><div className="font-bold">Achievement Updated</div></div><div className="mt-3 text-sm text-white/85">{newlyUnlockedBadgeNames.join(' · ')}</div></div>
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5"><div className="flex items-center gap-2 text-sm text-navy-900 font-semibold"><Heart size={15} className="text-red-500" /> {donationHistory.length} completed donations</div></div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 ring-1 ring-white/20 p-3"><div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">{label}</div><div className="mt-0.5 text-lg font-extrabold">{value}</div></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-sm font-semibold text-navy-900">{value}</div></div>;
}
