import { Sparkles, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { useDonor } from '../context/DonorContext';

export default function DemoBanner() {
  const { stage, resetDemo } = useDemo();
  const { isAuthenticated: donorAuthenticated, resetDonorDemo } = useDonor();
  const navigate = useNavigate();
  const location = useLocation();

  function onReset() {
    if (location.pathname.startsWith('/donor')) {
      resetDonorDemo();
      navigate(donorAuthenticated ? '/donor/dashboard' : '/login');
      return;
    }
    const destination = stage === 'login' ? '/login' : '/dashboard';
    resetDemo();
    navigate(destination);
  }

  return (
    <div className="w-full bg-navy-900 text-white text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/85">
          <Sparkles size={14} className="text-amber-300" />
          <span className="font-medium">SIH 2026 • Demo Mode</span>
          <span className="hidden sm:inline text-white/50">·</span>
          <span className="hidden sm:inline text-white/60">Team Async Six</span>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 transition px-2.5 py-1 font-medium"
        >
          <RotateCcw size={13} />
          Reset Demo
        </button>
      </div>
    </div>
  );
}
