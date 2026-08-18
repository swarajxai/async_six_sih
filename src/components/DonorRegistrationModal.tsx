import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Moon, ShieldCheck, UserCheck } from 'lucide-react';
import { ALL_BLOOD_GROUPS, DEMO_OTP, DONOR_CONSENT_CATEGORIES, DONOR_DEMO_CREDENTIALS, INITIAL_DONOR_PROFILE } from '../data/donorData';
import { requestIdentityOtp, verifyDemoIdentity, type DemoIdentityDetails } from '../services/identityVerificationService';
import { useDonor } from '../context/DonorContext';
import type { BloodGroup } from '../types';
import EmergencyBadge from './EmergencyBadge';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const controlClass = 'mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none';

export default function DonorRegistrationModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (phone: string) => void }) {
  const { createDonorAccount } = useDonor();
  const [step, setStep] = useState(1);
  const [aadhaar, setAadhaar] = useState('123456789012');
  const [phone, setPhone] = useState(DONOR_DEMO_CREDENTIALS.phone);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [identity, setIdentity] = useState<DemoIdentityDetails | null>(null);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(INITIAL_DONOR_PROFILE.bloodGroup);
  const [lastDonationDate, setLastDonationDate] = useState('2026-07-12');
  const [email, setEmail] = useState(INITIAL_DONOR_PROFILE.email ?? '');
  const [nightVolunteer, setNightVolunteer] = useState(true);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [password, setPassword] = useState('demo123');
  const [confirmPassword, setConfirmPassword] = useState('demo123');
  const [finalConsent, setFinalConsent] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setOtpSent(false);
    setOtp('');
    setIdentity(null);
    setConsents({});
    setFinalConsent(false);
    setCreated(false);
    setError('');
  }, [open]);

  async function sendOtp() {
    try {
      await requestIdentityOtp(aadhaar, phone);
      setOtpSent(true);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start demo verification.');
    }
  }

  async function verifyIdentity() {
    try {
      setIdentity(await verifyDemoIdentity(otp));
      setError('');
      setStep(2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to verify demo identity.');
    }
  }

  function continueFromDetails() {
    if (!bloodGroup || phone.length !== 10) return setError('Complete the donor-specific details.');
    setError('');
    setStep(3);
  }

  function continueFromConsent() {
    const requiredIds: string[] = DONOR_CONSENT_CATEGORIES.map(([name]) => name);
    if (nightVolunteer) requiredIds.push('Night Emergency');
    if (!requiredIds.every((id) => consents[id])) return setError('Review and accept the required donor consents.');
    setError('');
    setStep(4);
  }

  function acceptAll() {
    setConsents(Object.fromEntries([
      ...DONOR_CONSENT_CATEGORIES.map(([name]) => [name, true]),
      ['Night Emergency', true],
    ]));
  }

  function createAccount() {
    if (!password || password !== confirmPassword || !finalConsent) return setError('Confirm the account consent and enter matching passwords.');
    createDonorAccount(phone, password, { bloodGroup, email, nightEmergencyVolunteer: nightVolunteer });
    setCreated(true);
    setError('');
  }

  function finish() {
    onCreated(phone);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Blood Donor Account">
      <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        {!created && <div className="flex justify-between text-xs text-slate-500"><span>Step {step} of 4</span><span>Frontend demo registration</span></div>}

        {step === 1 && !created && <>
          <Field label="Aadhaar Number / VID" value={aadhaar} onChange={(value) => setAadhaar(value.replace(/\D/g, '').slice(0, 16))} />
          <Field label="Aadhaar-linked Mobile Number" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))} />
          {!otpSent ? <PrimaryButton block onClick={sendOtp}>Send OTP</PrimaryButton> : <>
            <div className="rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-xs text-slate-600">No UIDAI or SMS service is connected. <span className="font-bold text-navy-900">Demo OTP: {DEMO_OTP}</span></div>
            <Field label="OTP" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} />
            <PrimaryButton block onClick={verifyIdentity}><ShieldCheck size={16} /> Verify Identity</PrimaryButton>
          </>}
        </>}

        {step === 2 && !created && identity && <>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 p-3 text-sm font-semibold"><UserCheck size={17} /> Identity Verified · Demo e-KYC</div>
          <div className="grid grid-cols-2 gap-2">
            <Verified label="Full Name" value={identity.fullName} />
            <Verified label="Date of Birth" value={identity.dateOfBirth} />
            <Verified label="Gender" value={identity.gender} />
            <Verified label="PIN Code" value={identity.pinCode} />
            <div className="col-span-2"><Verified label="Address" value={`${identity.address}, ${identity.district}, ${identity.state}`} /></div>
          </div>
          <SelectField label="Blood Group" value={bloodGroup} onChange={(value) => setBloodGroup(value as BloodGroup)} options={ALL_BLOOD_GROUPS} />
          <Field label="Last Blood Donation Date (optional)" value={lastDonationDate} onChange={setLastDonationDate} type="date" />
          <Field label="Primary Mobile Number" value={phone} onChange={setPhone} readOnly />
          <Field label="Optional Email" value={email} onChange={setEmail} type="email" />
          <PrimaryButton block onClick={continueFromDetails}>Continue <ArrowRight size={16} /></PrimaryButton>
        </>}

        {step === 3 && !created && <>
          <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available for Night Emergencies?</div><div className="mt-2 grid grid-cols-2 gap-2"><Choice active={nightVolunteer} label="YES" onClick={() => setNightVolunteer(true)} /><Choice active={!nightVolunteer} label="NO" onClick={() => setNightVolunteer(false)} /></div></div>
          {nightVolunteer && <div className="rounded-xl bg-navy-900 text-white p-4">
            <div className="flex items-center gap-2 font-semibold"><Moon size={16} className="text-amber-300" /> Night Emergency · 12:00 AM–6:00 AM</div>
            <p className="mt-2 text-xs text-white/80">I voluntarily agree to receive critical donation push notifications, SMS, and calls during these hours when I am available, apparently eligible, and near a compatible emergency.</p>
            <div className="mt-3 text-xs text-white/70">Possible prototype ecosystem recognition: Night Responder badge, bonus points, priority achievements, and eligible partner medical benefits. Benefits are not guaranteed.</div>
          </div>}
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
            <div className="flex items-center justify-between gap-2"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Required Donor Consents</div><button type="button" className="text-xs font-semibold text-navy-700 underline" onClick={acceptAll}>Accept required demo consents</button></div>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-2 pr-1">
              {DONOR_CONSENT_CATEGORIES.map(([name, description]) => <Consent key={name} name={name} description={description} checked={!!consents[name]} onChange={(checked) => setConsents((current) => ({ ...current, [name]: checked }))} />)}
              {nightVolunteer && <Consent name="Night Emergency" description="Receive voluntary emergency communication between 12:00 AM and 6:00 AM while available." checked={!!consents['Night Emergency']} onChange={(checked) => setConsents((current) => ({ ...current, 'Night Emergency': checked }))} />}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 text-xs text-amber-900"><strong>Medical notice:</strong> LIFE-LINK eligibility is a pre-screening aid only. Trained hospital or blood-bank personnel determine final donation eligibility.</div>
          <PrimaryButton block onClick={continueFromConsent}>Continue <ArrowRight size={16} /></PrimaryButton>
        </>}

        {step === 4 && !created && <>
          <Field label="Create Password" value={password} onChange={setPassword} type="password" />
          <Field label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
          <label className="flex items-start gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-600"><input type="checkbox" checked={finalConsent} onChange={(event) => setFinalConsent(event.target.checked)} className="mt-0.5" /><span>I confirm these donor details and understand that this frontend demonstrates a prototype account and consent workflow.</span></label>
          <PrimaryButton block onClick={createAccount}>Create Donor Account</PrimaryButton>
        </>}

        {created && <div className="space-y-4 text-center">
          <div className="mx-auto grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><CheckCircle2 size={24} /></div>
          <div><h3 className="text-xl font-extrabold text-navy-900">Donor Account Created</h3><p className="mt-1 text-sm text-slate-500">Your frontend demo account is ready.</p></div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-left text-sm"><div className="font-semibold text-navy-900">{identity?.fullName ?? INITIAL_DONOR_PROFILE.fullName}</div><div className="mt-1 flex gap-2"><EmergencyBadge tone="red">{bloodGroup}</EmergencyBadge><EmergencyBadge tone="navy">{phone}</EmergencyBadge></div></div>
          <PrimaryButton block onClick={finish}>Continue to Login</PrimaryButton>
        </div>}

        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
        {!created && step > 1 && <SecondaryButton size="sm" onClick={() => { setError(''); setStep((current) => current - 1); }}><ArrowLeft size={14} /> Back</SecondaryButton>}
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange, type = 'text', readOnly = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; readOnly?: boolean }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={`${controlClass} ${readOnly ? 'bg-slate-50' : ''}`} /></label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Verified({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-xs font-semibold text-navy-900">{value}</div></div>;
}

function Choice({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={['h-10 rounded-xl text-sm font-semibold ring-1 transition', active ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-900 ring-slate-200'].join(' ')}>{label}</button>;
}

function Consent({ name, description, checked, onChange }: { name: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5" /><span><strong className="text-navy-900">{name}:</strong> {description}</span></label>;
}
