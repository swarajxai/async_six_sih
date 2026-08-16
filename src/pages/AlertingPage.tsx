import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CheckCircle2, Lock, Siren } from 'lucide-react';
import Brand from '../components/Brand';
import BloodBankCard from '../components/BloodBankCard';
import DonorCard from '../components/DonorCard';
import PrimaryButton from '../components/PrimaryButton';
import { useDemo } from '../context/DemoContext';

export default function AlertingPage() {
  const { donors, bloodBanks, primaryDonorId, alertProgress, openDonorModal, finishAlerting } = useDemo();
  const navigate = useNavigate();
  const locked = !!alertProgress.lockedAt;

  function onProceed() {
    finishAlerting();
    navigate('/coordination');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <div className="text-xs text-slate-500">Step 3 of 4 · Simultaneous Alerting</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          {/* Alert summary */}
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency">
                <Siren size={20} />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                  {locked ? 'First Eligible Confirmation Secured' : '10 Emergency Alerts Sent'}
                </h1>
                <p className="text-sm text-slate-500">
                  {locked
                    ? 'Remaining donor alerts paused. Coordinating primary donor now.'
                    : 'LIFE-LINK is reaching out to all eligible donors simultaneously…'}
                </p>
              </div>
              {locked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1.5 text-xs font-bold">
                  <CheckCircle2 size={14} /> Primary Donor Secured ✓
                </span>
              )}
            </div>

            {locked && (
              <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-sm text-emerald-800">
                <div className="font-semibold">First eligible confirmation secured. Remaining donor alerts paused.</div>
                <div className="text-xs mt-1">All other donors have been notified that the request is now being coordinated by the confirmed donor.</div>
              </div>
            )}
          </div>

          {/* Donor list */}
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900">Live Donor Coordination</h2>
              <div className="text-xs text-slate-500">Tap a card to preview the donor alert</div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {donors.map((d) => (
                <div key={d.id} className="relative">
                  {d.id === primaryDonorId && (
                    <div className="absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 shadow-pop">
                      <Lock size={10} /> PRIMARY
                    </div>
                  )}
                  <DonorCard
                    donor={d}
                    highlight={d.id === primaryDonorId}
                    onClick={() => openDonorModal(d.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {locked && (
            <div className="flex justify-end">
              <PrimaryButton size="lg" onClick={onProceed}>
                Proceed to Live Coordination <ArrowRight size={18} />
              </PrimaryButton>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-lg bg-navy-50 text-navy-800">
                <Bell size={18} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Alert Summary</div>
                <div className="text-base font-bold text-navy-900">{alertProgress.sent} of {alertProgress.total} sent</div>
              </div>
            </div>
            <ul className="mt-3 text-sm text-slate-700 space-y-1.5">
              <li>· Top 10 simultaneously (not one-by-one)</li>
              <li>· First confirmed donor locks in</li>
              <li>· Others paused automatically</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-lg bg-navy-50 text-navy-800">
                <Bell size={18} />
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Blood Bank Check (parallel)
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {bloodBanks.map((b) => (
                <BloodBankCard key={b.id} bank={b} />
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              LIFE-LINK checks blood banks in parallel — not after donor coordination fails.
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
