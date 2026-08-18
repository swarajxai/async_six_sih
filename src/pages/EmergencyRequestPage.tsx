import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, MapPin, Shield } from 'lucide-react';
import Brand from '../components/Brand';
import EmergencyBadge from '../components/EmergencyBadge';
import PrimaryButton from '../components/PrimaryButton';
import { useDemo } from '../context/DemoContext';
import type { BloodGroup, Urgency } from '../types';

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const URGENCIES: Urgency[] = ['Critical', 'High', 'Moderate'];
const controlClass = 'mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-slate-50 text-navy-900 text-sm font-semibold focus:ring-2 focus:ring-navy-500 focus:outline-none';

export default function EmergencyRequestPage() {
  const {
    user,
    requestDraft,
    bloodBankPlan,
    activeRequest,
    updateRequestDraft,
    startMatching,
    completeBloodBankCoverage,
  } = useDemo();
  const navigate = useNavigate();
  const securedUnits = activeRequest?.bloodBankUnitsSecured
    ?? (bloodBankPlan?.status === 'secured' ? Math.min(requestDraft.units, bloodBankPlan.unitsSecured) : 0);
  const remainingDonorUnits = Math.max(0, requestDraft.units - securedUnits);

  function onStart() {
    if (remainingDonorUnits === 0) {
      completeBloodBankCoverage();
      navigate('/success');
      return;
    }
    startMatching();
    navigate('/matching');
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
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency"><AlertCircle size={20} /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">Raise Verified Emergency Request</h1>
                <p className="text-sm text-slate-500">Hospital-created patient emergency · Red Cells / PRBC</p>
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <TextField label="Patient Name" value={requestDraft.patientName} onChange={(value) => updateRequestDraft({ patientName: value })} />
              <SelectField label="Patient Blood Group" value={requestDraft.bloodGroup} options={BLOOD_GROUPS} onChange={(value) => updateRequestDraft({ bloodGroup: value as BloodGroup })} accent />
              <NumberField label="Total Units Required" value={requestDraft.units} onChange={(value) => updateRequestDraft({ units: value })} />
              <SelectField label="Urgency" value={requestDraft.urgency} options={URGENCIES} onChange={(value) => updateRequestDraft({ urgency: value as Urgency })} accentRed />
              <NumberField label="Required Within (minutes)" value={requestDraft.requiredWithinMinutes} onChange={(value) => updateRequestDraft({ requiredWithinMinutes: value })} />
              <ReadOnlyField label="Hospital" value={user?.hospital.name ?? 'VSS Medical College & Hospital'} icon={<Building2 size={14} className="text-slate-400" />} />
              <div className="sm:col-span-2">
                <ReadOnlyField label="Location" value={user?.hospital.location ?? 'Burla, Sambalpur'} icon={<MapPin size={14} className="text-slate-400" />} />
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <Breakdown label="Total Required" value={`${requestDraft.units} units`} />
              <Breakdown label="Blood Bank Secured" value={`${securedUnits} units`} tone="green" />
              <Breakdown label="Remaining Donor Requirement" value={`${remainingDonorUnits} units`} tone={remainingDonorUnits === 0 ? 'green' : 'red'} />
            </div>

            {bloodBankPlan && (
              <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-navy-900">{bloodBankPlan.bloodBankName}</div>
                  <div className="text-xs text-slate-500">{bloodBankPlan.unitsPlanned} {bloodBankPlan.component} units in emergency plan</div>
                </div>
                <EmergencyBadge tone={bloodBankPlan.status === 'secured' ? 'green' : 'amber'} dot>
                  {bloodBankPlan.status === 'secured' ? 'Confirmed / Secured' : 'Selected / Not Secured'}
                </EmergencyBadge>
              </div>
            )}

            {remainingDonorUnits === 0 && (
              <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 flex items-start gap-3 text-emerald-900">
                <CheckCircle2 size={18} className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold">Blood requirement covered through confirmed blood-bank stock.</div>
                  <div className="text-xs mt-0.5">No donor matching or donor alerts are required.</div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-navy-800 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-navy-900">Hospital-issued request</div>
                  <div className="text-xs text-slate-600">Verified by LIFE-LINK · Clinical cross-matching remains mandatory</div>
                </div>
              </div>
              <EmergencyBadge tone="navy" dot>Auto-Verified</EmergencyBadge>
            </div>

            <div className="mt-6 flex justify-end">
              <PrimaryButton size="lg" onClick={onStart}>
                {remainingDonorUnits === 0 ? 'Complete Blood-Bank Coordination' : 'Start Emergency Matching'}
                <ArrowRight size={18} />
              </PrimaryButton>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Patient</div>
            <div className="mt-1 text-2xl font-extrabold text-navy-900">{requestDraft.patientName}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-10 min-w-10 px-3 rounded-lg bg-emergency text-white font-extrabold text-lg">{requestDraft.bloodGroup}</span>
              <EmergencyBadge tone="red" dot>{requestDraft.urgency} · {requestDraft.requiredWithinMinutes} min</EmergencyBadge>
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900 text-white shadow-card p-5">
            <div className="text-xs uppercase tracking-wider text-white/70 font-semibold">Coordination Rule</div>
            <div className="mt-1 text-base font-semibold">One donor contributes one demo unit</div>
            <p className="mt-3 text-sm text-white/85">LIFE-LINK will secure {remainingDonorUnits} distinct donor{remainingDonorUnits === 1 ? '' : 's'} for the remaining {remainingDonorUnits} unit{remainingDonorUnits === 1 ? '' : 's'}.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<input value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<input type="number" min={1} value={value} onChange={(event) => onChange(Number(event.target.value) || 1)} className={controlClass} /></label>;
}

function SelectField({ label, value, options, onChange, accent, accentRed }: { label: string; value: string; options: string[]; onChange: (value: string) => void; accent?: boolean; accentRed?: boolean }) {
  return <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={[controlClass, accent ? 'text-navy-900' : '', accentRed ? 'text-emergency' : ''].join(' ')}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function ReadOnlyField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className={`${controlClass} flex items-center gap-2`}>{icon}{value}</div></div>;
}

function Breakdown({ label, value, tone = 'navy' }: { label: string; value: string; tone?: 'navy' | 'green' | 'red' }) {
  const colors = tone === 'green' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : tone === 'red' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-navy-50 text-navy-900 ring-navy-100';
  return <div className={`rounded-xl ring-1 p-3 ${colors}`}><div className="text-[11px] uppercase tracking-wide opacity-70 font-semibold">{label}</div><div className="mt-1 text-xl font-extrabold">{value}</div></div>;
}
