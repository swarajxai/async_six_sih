import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Building2, MapPin, Shield } from 'lucide-react';
import Brand from '../components/Brand';
import PrimaryButton from '../components/PrimaryButton';
import EmergencyBadge from '../components/EmergencyBadge';
import { useDemo } from '../context/DemoContext';
import { HOSPITAL, INITIAL_REQUEST } from '../data/demoData';

export default function EmergencyRequestPage() {
  const { startAlerting } = useDemo();
  const navigate = useNavigate();

  function onStart() {
    startAlerting();
    navigate('/alerting');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <div className="text-xs text-slate-500">Step 1 of 4 · Verified Request</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency">
                <AlertCircle size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                  Raise Verified Emergency Request
                </h1>
                <p className="text-sm text-slate-500">Prefilled for the SIH demo · Adjust if needed</p>
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <Field label="Patient Name" value={INITIAL_REQUEST.patientName} />
              <Field
                label="Blood Group"
                value={INITIAL_REQUEST.bloodGroup}
                accent
              />
              <Field label="Units Required" value={`${INITIAL_REQUEST.units} units`} />
              <Field label="Urgency" value={INITIAL_REQUEST.urgency} accentRed />
              <Field label="Required Within" value={`${INITIAL_REQUEST.requiredWithinMinutes} minutes`} />
              <Field
                label="Hospital"
                value={HOSPITAL.name}
                icon={<Building2 size={14} className="text-slate-400" />}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Location"
                  value={INITIAL_REQUEST.location}
                  icon={<MapPin size={14} className="text-slate-400" />}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-navy-800 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-navy-900">Hospital-issued request</div>
                  <div className="text-xs text-slate-600">Verified by LIFE-LINK · Coordinates with nearby donors in real time</div>
                </div>
              </div>
              <EmergencyBadge tone="navy" dot>Auto-Verified</EmergencyBadge>
            </div>

            <div className="mt-6 flex justify-end">
              <PrimaryButton size="lg" onClick={onStart}>
                Start Emergency Matching <ArrowRight size={18} />
              </PrimaryButton>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Patient</div>
            <div className="mt-1 text-2xl font-extrabold text-navy-900">{INITIAL_REQUEST.patientName}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-10 min-w-10 px-3 rounded-lg bg-emergency text-white font-extrabold text-lg">
                {INITIAL_REQUEST.bloodGroup}
              </span>
              <EmergencyBadge tone="red" dot>Critical · {INITIAL_REQUEST.requiredWithinMinutes} min</EmergencyBadge>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-slate-400" />
                {HOSPITAL.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={14} className="text-slate-400" />
                {INITIAL_REQUEST.location}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Why LIFE-LINK</div>
            <div className="mt-1 text-base font-semibold">Active coordination, not a directory</div>
            <ul className="mt-3 space-y-2 text-sm text-white/85">
              <li>· Smart ranking on compatibility, distance, eligibility, reliability</li>
              <li>· Simultaneous alerts to top eligible donors</li>
              <li>· First-confirmed locks in; backups stand by</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  accent,
  accentRed,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  accentRed?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div
        className={[
          'mt-1 h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-slate-50 flex items-center gap-2 text-sm font-semibold',
          accent ? 'text-navy-900' : '',
          accentRed ? 'text-emergency' : '',
        ].join(' ')}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}
