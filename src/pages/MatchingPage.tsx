import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Eye, Smartphone, Activity } from 'lucide-react';
import Brand from '../components/Brand';
import DonorCard from '../components/DonorCard';
import PrimaryButton from '../components/PrimaryButton';
import { useDemo } from '../context/DemoContext';

const STEPS: { label: string; sub: string; icon: typeof CheckCircle2 }[] = [
  { label: 'Request verified', sub: 'Hospital authentication · Patient ID validated', icon: CheckCircle2 },
  { label: 'Blood compatibility checked', sub: 'O- recipients · universal donor compatibility', icon: CheckCircle2 },
  { label: 'Donor eligibility history checked', sub: 'Last donation · medical deferrals · consent', icon: CheckCircle2 },
  { label: 'Nearby donors ranked', sub: 'Distance · reliability · availability', icon: CheckCircle2 },
  { label: 'Blood bank inventory checked in parallel', sub: 'Partner banks queried in real time', icon: CheckCircle2 },
];

export default function MatchingPage() {
  const { donors, openDonorModal, finishAlerting } = useDemo();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (showResults) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) {
          setShowResults(true);
          clearInterval(id);
          return s;
        }
        return s + 1;
      });
    }, 550);
    return () => clearInterval(id);
  }, [showResults]);

  // Skip animation helper
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' && !showResults) {
        e.preventDefault();
        setStep(STEPS.length - 1);
        setShowResults(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showResults]);

  const ranked = useMemo(() => donors.slice(0, 10), [donors]);
  const visible = useMemo(() => ranked.slice(0, 5), [ranked]);

  function onAlert() {
    finishAlerting();
    navigate('/alerting');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <div className="text-xs text-slate-500">Step 2 of 4 · Matching Engine</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          {/* Engine checklist */}
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-navy-50 text-navy-800">
                <Activity size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                  Real-Time Matching Engine
                </h1>
                <p className="text-sm text-slate-500">LIFE-LINK is processing your request in real time</p>
              </div>
            </div>

            <ul className="mt-5 space-y-3">
              {STEPS.map((s, idx) => {
                const done = idx <= step && (showResults || idx < step);
                const active = !showResults && idx === step && idx < STEPS.length - 1;
                return (
                  <li key={s.label} className="flex items-start gap-3">
                    <div
                      className={[
                        'grid place-items-center h-7 w-7 rounded-full text-white',
                        done ? 'bg-emerald-500' : active ? 'bg-navy-900' : 'bg-slate-300',
                      ].join(' ')}
                    >
                      {done ? <CheckCircle2 size={14} /> : <Activity size={12} className={active ? 'animate-pulse' : ''} />}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${done || active ? 'text-navy-900' : 'text-slate-500'}`}>
                        {s.label}
                      </div>
                      <div className="text-xs text-slate-500">{s.sub}</div>
                    </div>
                    {active && <span className="text-[11px] text-navy-700 font-semibold">Running…</span>}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Results */}
          {showResults && (
            <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-sm text-slate-500">Matching result</div>
                  <div className="text-2xl font-extrabold text-navy-900">10 Eligible Donors Found</div>
                  <div className="mt-1 text-xs text-slate-500">Ranked by blood compatibility · distance · eligibility · availability · reliability</div>
                </div>
                <PrimaryButton size="lg" onClick={onAlert}>
                  <Bell size={18} /> Alert Top 10 Donors Simultaneously
                </PrimaryButton>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {visible.map((d) => (
                  <DonorCard key={d.id} donor={d} onClick={() => openDonorModal(d.id)} />
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-500 text-center">
                Showing top 5 of 10 matched donors · click any card to preview the donor-side alert
              </div>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Request</div>
            <div className="mt-1 text-base font-semibold text-navy-900">Aarav Mishra</div>
            <div className="mt-1 text-sm text-slate-600">O- · 2 units · Critical · 60 min</div>
          </div>
          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Ranking Factors</div>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Blood compatibility</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Distance</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Donation eligibility</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Availability</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Reliability</li>
            </ul>
          </div>
          {!showResults && (
            <button
              onClick={() => {
                setStep(STEPS.length - 1);
                setShowResults(true);
              }}
              className="w-full text-xs text-slate-500 underline"
            >
              Skip animation (Space)
            </button>
          )}
          {showResults && (
            <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-navy-900">
                <Smartphone size={16} /> Donor preview
              </div>
              <p className="mt-1 text-xs">
                Click any donor card to see the alert they receive on their phone.
              </p>
              <div className="mt-2 text-xs text-slate-500">Use this if a judge asks "what does the donor see?"</div>
            </div>
          )}
          <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-xs text-emerald-800">
            <div className="flex items-center gap-2 font-semibold">
              <Eye size={14} /> Demo tip
            </div>
            <p className="mt-1">
              LIFE-LINK doesn't make the hospital call donors one-by-one. One tap alerts the top 10 at once.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
