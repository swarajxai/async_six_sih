import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Clock, Droplet, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Brand from '../components/Brand';
import EmergencyBadge from '../components/EmergencyBadge';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { useDemo } from '../context/DemoContext';
import { getBloodAvailability } from '../services/eraktkoshService';
import type { BloodAvailabilityRecord, BloodComponent, BloodGroup } from '../types';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const component: BloodComponent = 'Red Cells / PRBC';
const controlClass = 'h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none';

export default function BloodAvailabilityPage() {
  const {
    user,
    requestDraft,
    bloodBankPlan,
    updateRequestDraft,
    selectBloodBankPlan,
    confirmBloodBankPlan,
    clearBloodBankPlan,
    raiseRequest,
    goTo,
  } = useDemo();
  const navigate = useNavigate();
  const [results, setResults] = useState<BloodAvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [plannedUnits, setPlannedUnits] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBloodAvailability({
      hospitalId: user?.hospital.id ?? 'h-vss',
      bloodGroup: requestDraft.bloodGroup,
      component,
    }).then((records) => {
      if (cancelled) return;
      setResults(records);
      setPlannedUnits(Object.fromEntries(records.map((record) => [record.id, Math.min(2, Math.max(1, record.unitsAvailable))])));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.hospital.id, requestDraft.bloodGroup]);

  const securedUnits = bloodBankPlan?.status === 'secured' ? Math.min(requestDraft.units, bloodBankPlan.unitsSecured) : 0;
  const remainingUnits = Math.max(0, requestDraft.units - securedUnits);

  function backToDashboard() {
    goTo('dashboard');
    navigate('/dashboard');
  }

  function continueToRequest() {
    raiseRequest();
    navigate('/request');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" />
          <EmergencyBadge tone="navy">e-RaktKosh Integration · Demo</EmergencyBadge>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency"><Droplet size={20} /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">Nearby Blood Availability</h1>
                <p className="text-sm text-slate-500">{user?.hospital.location} · Check stock before donor coordination</p>
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Blood Group
                <select
                  value={requestDraft.bloodGroup}
                  onChange={(event) => { clearBloodBankPlan(); updateRequestDraft({ bloodGroup: event.target.value as BloodGroup }); }}
                  className={`mt-1 w-full ${controlClass}`}
                >
                  {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Blood Component
                <select value={component} disabled className={`mt-1 w-full ${controlClass} disabled:bg-slate-50`}>
                  <option>{component}</option>
                </select>
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Units Required
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={requestDraft.units}
                  onChange={(event) => updateRequestDraft({ units: Number(event.target.value) || 1 })}
                  className={`mt-1 w-full ${controlClass}`}
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-xs text-slate-600">
              Stock visibility does not reserve blood. Select a plan, then explicitly confirm that the hospital has secured those units for this demo emergency.
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-6 text-sm text-slate-500">Checking deterministic demo availability…</div>
            ) : results.map((record) => (
              <AvailabilityCard
                key={record.id}
                record={record}
                units={plannedUnits[record.id] ?? 1}
                selected={bloodBankPlan?.recordId === record.id}
                onUnitsChange={(units) => setPlannedUnits((current) => ({ ...current, [record.id]: units }))}
                onSelect={() => selectBloodBankPlan(record, plannedUnits[record.id] ?? 1)}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Emergency Plan</div>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Total Required" value={`${requestDraft.units} units`} />
              <SummaryRow label="Blood Bank Secured" value={`${securedUnits} units`} />
              <SummaryRow label="Remaining Donor Requirement" value={`${remainingUnits} units`} strong />
            </div>

            {bloodBankPlan ? (
              <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                <div className="font-semibold text-sm text-navy-900">{bloodBankPlan.bloodBankName}</div>
                <div className="mt-1 text-xs text-slate-500">{bloodBankPlan.unitsPlanned} units selected · {bloodBankPlan.component}</div>
                <div className="mt-2">
                  <EmergencyBadge tone={bloodBankPlan.status === 'secured' ? 'green' : 'amber'} dot>
                    {bloodBankPlan.status === 'secured' ? 'Confirmed / Secured' : 'Selected / Planned'}
                  </EmergencyBadge>
                </div>
                {bloodBankPlan.status === 'selected' && (
                  <div className="mt-3"><PrimaryButton block size="sm" onClick={confirmBloodBankPlan}><ShieldCheck size={15} /> Confirm Secured</PrimaryButton></div>
                )}
              </div>
            ) : (
              <div className="mt-4 text-xs text-slate-500">No blood-bank units selected. Donor requirement currently equals the total requirement.</div>
            )}

            <div className="mt-4 space-y-2">
              <PrimaryButton block onClick={continueToRequest}>
                Continue to Emergency Request <ArrowRight size={16} />
              </PrimaryButton>
              <SecondaryButton block onClick={backToDashboard}><ArrowLeft size={15} /> Back to Dashboard</SecondaryButton>
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Integration Boundary</div>
            <p className="mt-2 text-sm text-white/85">This offline-safe prototype uses a service adapter with deterministic demo data. It does not claim a live government API response.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function AvailabilityCard({
  record,
  units,
  selected,
  onUnitsChange,
  onSelect,
}: {
  record: BloodAvailabilityRecord;
  units: number;
  selected: boolean;
  onUnitsChange: (units: number) => void;
  onSelect: () => void;
}) {
  const usable = record.unitsAvailable > 0;
  const tone = record.status === 'Available' ? 'green' : record.status === 'Low Stock' ? 'amber' : 'red';
  return (
    <div className={['rounded-2xl bg-white shadow-card ring-1 p-4 sm:p-5', selected ? 'ring-2 ring-navy-300' : 'ring-slate-100'].join(' ')}>
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-navy-50 text-navy-800"><Building2 size={19} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-navy-900">{record.bloodBankName}</div>
              <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-1"><MapPin size={12} /> {record.distanceKm} km from hospital</div>
            </div>
            <EmergencyBadge tone={tone} dot>{record.status}</EmergencyBadge>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            <Detail label="Blood" value={record.bloodGroup} />
            <Detail label="Component" value={record.component} />
            <Detail label="Units" value={String(record.unitsAvailable)} />
            <Detail label="Updated" value={record.lastUpdated} icon={<Clock size={11} />} />
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1"><Phone size={12} /> {record.phone}</div>

          {usable && (
            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
              <select
                value={units}
                onChange={(event) => onUnitsChange(Number(event.target.value))}
                className="h-9 rounded-xl px-3 ring-1 ring-slate-200 bg-white text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
                aria-label={`Units from ${record.bloodBankName}`}
              >
                {Array.from({ length: record.unitsAvailable }, (_, index) => index + 1).map((unit) => <option key={unit} value={unit}>{unit} unit{unit > 1 ? 's' : ''}</option>)}
              </select>
              <SecondaryButton size="sm" onClick={onSelect}>Use for Emergency Plan</SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 ring-1 ring-slate-100 p-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 font-semibold text-navy-900 text-xs flex items-center gap-1">{icon}{value}</div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? 'font-extrabold text-navy-900' : 'font-semibold text-navy-900'}>{value}</span>
    </div>
  );
}
