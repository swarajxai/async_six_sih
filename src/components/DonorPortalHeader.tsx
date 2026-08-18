import { BellRing, Gift, HeartPulse, History, LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDonor } from '../context/DonorContext';
import Brand from './Brand';
import EmergencyBadge from './EmergencyBadge';

export default function DonorPortalHeader() {
  const { logoutDonor, emergencyResponse } = useDonor();
  const navigate = useNavigate();

  function logout() {
    logoutDonor();
    navigate('/login');
  }

  const nav = [
    { label: 'Dashboard', icon: HeartPulse, target: '/donor/dashboard' },
    { label: 'Emergency', icon: BellRing, target: emergencyResponse === 'accepted' ? '/donor/emergency' : '/donor/dashboard#emergency' },
    { label: 'Rewards', icon: Gift, target: '/donor/dashboard#rewards' },
    { label: 'History', icon: History, target: '/donor/dashboard#history' },
    { label: 'Profile', icon: UserRound, target: '/donor/dashboard#profile' },
  ];

  return (
    <header className="bg-white border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 min-h-16 py-2 flex flex-wrap items-center justify-between gap-2">
        <Brand size="md" />
        <nav className="order-3 sm:order-2 w-full sm:w-auto flex items-center gap-1 overflow-x-auto" aria-label="Donor navigation">
          {nav.map(({ label, icon: Icon, target }) => <button key={label} onClick={() => navigate(target)} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-navy-900"><Icon size={13} /> {label}</button>)}
        </nav>
        <div className="order-2 sm:order-3 flex items-center gap-2">
          <EmergencyBadge tone="green" dot>Donor Portal</EmergencyBadge>
          <button onClick={logout} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy-900"><LogOut size={14} /> Logout</button>
        </div>
      </div>
    </header>
  );
}
