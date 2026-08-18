import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CheckCircle2, Lock, ShieldCheck, Siren, Users } from 'lucide-react';
import Brand from '../components/Brand';
import DonorCard from '../components/DonorCard';
import EmergencyBadge from '../components/EmergencyBadge';
import PrimaryButton from '../components/PrimaryButton';
import { useDemo } from '../context/DemoContext';

export default function AlertingPage() {
  const {
    activeRequest,
    donors,
    bloodBankPlan,
    alertedDonorIds,
    confirmedDonorIds,
    standbyDonorIds,
    alertProgress,
    openDonorModal,
    finishAlerting,
  } = useDemo();
  const navigate = useNavigate();
  const required = activeRequest?.donorUnitsRequired ?? 0;
  const secured = confirmedDonorIds.length;
  const fulfilled = required > 0 && secured >= required && !!alertProgress.lockedAt;
  const alertedDonors = alertedDonorIds
    .map((id) => donors.find((donor) => donor.id === id))
    .filter((donor): donor is NonNullable<typeof donor> => !!donor);

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
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency"><Siren size={20} /></div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                  {fulfilled ? 'Required Donor Capacity Secured' : 'Emergency Alerts Sent Simultaneously'}
                </h1>
                <p className="text-sm text-slate-500">
                  {fulfilled ? 'Required donors are confirmed. Remaining compatible donors are on standby.' : 'LIFE-LINK keeps accepting confirmations until the donor-unit requirement is fulfilled.'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-navy-900">{secured} / {required}</div>
                <div className="text-xs text-slate-500">Donors Secured</div>
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${required ? Math.min(100, secured / required * 100) : 0}%` }} />
            </div>

            {fulfilled && (
              <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-sm text-emerald-800 flex items-start gap-2">
                <CheckCircle2 size={17} className="mt-0.5" />
                <div>
                  <div className="font-semibold">{secured} distinct donors confirmed for {required} remaining units.</div>
                  <div className="text-xs mt-1">{standbyDonorIds.length} compatible donor{standbyDonorIds.length === 1 ? '' : 's'} retained on standby for screening replacement.</div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-navy-900">Live Donor Coordination</h2>
              <div className="text-xs text-slate-500">Tap a card to preview the donor alert</div>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {alertedDonors.map((donor) => {
                const isConfirmed = confirmedDonorIds.includes(donor.id);
                const isStandby = standbyDonorIds.includes(donor.id);
                return (
                  <div key={donor.id} className="relative">
                    {(isConfirmed || isStandby) && (
                      <div className={[
                        'absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 rounded-full text-white text-[10px] font-bold px-2 py-0.5 shadow-pop',
                        isConfirmed ? 'bg-emerald-500' : 'bg-navy-700',
                      ].join(' ')}>
                        {isConfirmed ? <><Lock size={10} /> SECURED</> : <><Users size={10} /> STANDBY</>}
                      </div>
                    )}
                    <DonorCard donor={donor} highlight={isConfirmed} onClick={() => openDonorModal(donor.id)} />
                  </div>
                );
              })}
            </div>
          </div>

          {fulfilled && (
            <div className="flex justify-end">
              <PrimaryButton size="lg" onClick={onProceed}>Proceed to Multi-Donor Coordination <ArrowRight size={18} /></PrimaryButton>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-lg bg-navy-50 text-navy-800"><Bell size={18} /></div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Alert Summary</div>
                <div className="text-base font-bold text-navy-900">{alertProgress.sent} of {alertProgress.total} sent</div>
              </div>
            </div>
            <ul className="mt-3 text-sm text-slate-700 space-y-1.5">
              <li>· Top compatible donors alerted together</li>
              <li>· One donor contributes one demo unit</li>
              <li>· Confirmations stop at {required} secured donors</li>
              <li>· Remaining donors stay on standby</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700"><ShieldCheck size={18} /></div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Blood-Bank Contribution</div>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-navy-900">{activeRequest?.bloodBankUnitsSecured ?? 0} units</div>
            <div className="mt-1 text-xs text-slate-500">{bloodBankPlan?.bloodBankName ?? 'No blood-bank units secured'}</div>
            {bloodBankPlan?.status === 'secured' && <div className="mt-2"><EmergencyBadge tone="green" dot>Confirmed / Secured</EmergencyBadge></div>}
          </div>
        </aside>
      </main>
    </div>
  );
}
