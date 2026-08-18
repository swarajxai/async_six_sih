import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Moon, PhoneCall } from 'lucide-react';
import { useDonor } from '../context/DonorContext';
import { ALL_BLOOD_GROUPS, DEMO_OTP, DONOR_CONSENT_CATEGORIES, DONOR_DEMO_CREDENTIALS, INITIAL_DONOR_PROFILE } from '../data/donorData';
import { LOCATION_DIRECTORY, getDistricts } from '../data/hospitalDirectory';
import type { BloodGroup, DonorGender } from '../types';
import EmergencyBadge from './EmergencyBadge';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const controlClass = 'mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none';
const GENDERS: readonly DonorGender[] = ['Male', 'Female', 'Other / Prefer not to say'];

export default function DonorRegistrationModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (phone: string) => void }) {
  const { createDonorAccount } = useDonor();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(INITIAL_DONOR_PROFILE.fullName);
  const [dateOfBirth, setDateOfBirth] = useState(INITIAL_DONOR_PROFILE.dateOfBirth);
  const [gender, setGender] = useState<DonorGender>(INITIAL_DONOR_PROFILE.gender);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(INITIAL_DONOR_PROFILE.bloodGroup);
  const [phone, setPhone] = useState(DONOR_DEMO_CREDENTIALS.phone);
  const [state, setState] = useState(INITIAL_DONOR_PROFILE.state);
  const [district, setDistrict] = useState(INITIAL_DONOR_PROFILE.district);
  const [address, setAddress] = useState(INITIAL_DONOR_PROFILE.address);
  const [pinCode, setPinCode] = useState(INITIAL_DONOR_PROFILE.pinCode);
  const [email, setEmail] = useState(INITIAL_DONOR_PROFILE.email ?? '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [neverDonated, setNeverDonated] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState(INITIAL_DONOR_PROFILE.lastDonationDate ?? '');
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
    setMobileVerified(false);
    setConsents({});
    setFinalConsent(false);
    setCreated(false);
    setError('');
  }, [open]);

  const states = useMemo(() => Object.keys(LOCATION_DIRECTORY), []);
  const districts = useMemo(() => getDistricts(state), [state]);

  function continueFromPersonalDetails() {
    if (!fullName.trim() || !dateOfBirth || !gender || !bloodGroup) return setError('Complete all personal details before continuing.');
    setError('');
    setStep(2);
  }

  function validateContactDetails(): boolean {
    if (phone.length !== 10 || !state || !district || !address.trim() || pinCode.length !== 6) {
      setError('Complete the address and enter valid 10-digit mobile and 6-digit PIN values.');
      return false;
    }
    if (email && !email.includes('@')) {
      setError('Enter a valid optional email address.');
      return false;
    }
    return true;
  }

  function sendOtp() {
    if (!validateContactDetails()) return;
    setOtpSent(true);
    setOtp('');
    setMobileVerified(false);
    setError('');
  }

  function verifyMobile() {
    if (otp !== DEMO_OTP) return setError('Enter the demo OTP shown below.');
    setMobileVerified(true);
    setError('');
  }

  function continueFromContact() {
    if (!mobileVerified || !validateContactDetails()) return setError('Verify the donor mobile number before continuing.');
    setError('');
    setStep(3);
  }

  function continueFromSettings() {
    if (!neverDonated && !lastDonationDate) return setError('Enter the last donation date or select Never Donated.');
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
    const requiredIds: string[] = DONOR_CONSENT_CATEGORIES.map(([name]) => name);
    if (nightVolunteer) requiredIds.push('Night Emergency');
    if (!requiredIds.every((id) => consents[id])) return setError('Review and accept the required donor consents.');
    if (!password || password !== confirmPassword || !finalConsent) return setError('Confirm the account statement and enter matching passwords.');
    createDonorAccount(phone, password, {
      fullName: fullName.trim(),
      dateOfBirth,
      gender,
      bloodGroup,
      email,
      address: address.trim(),
      state,
      district,
      pinCode,
      lastDonationDate: neverDonated ? null : lastDonationDate,
      nightEmergencyVolunteer: nightVolunteer,
    });
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
        {!created && <div className="flex justify-between text-xs text-slate-500"><span>Step {step} of 4</span><span>Manual donor registration · Demo</span></div>}

        {step === 1 && !created && <>
          <div><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Personal Details</div><p className="mt-1 text-xs text-slate-500">Enter the donor's details manually.</p></div>
          <Field label="Full Name" value={fullName} onChange={setFullName} />
          <Field label="Date of Birth" value={dateOfBirth} onChange={setDateOfBirth} type="date" />
          <SelectField label="Gender" value={gender} onChange={(value) => setGender(value as DonorGender)} options={GENDERS} />
          <SelectField label="Blood Group" value={bloodGroup} onChange={(value) => setBloodGroup(value as BloodGroup)} options={ALL_BLOOD_GROUPS} />
          <PrimaryButton block onClick={continueFromPersonalDetails}>Continue <ArrowRight size={16} /></PrimaryButton>
        </>}

        {step === 2 && !created && <>
          <div><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Contact &amp; Address</div><p className="mt-1 text-xs text-slate-500">The verified mobile number becomes the donor login number.</p></div>
          <Field label="Mobile Number" value={phone} onChange={(value) => { setPhone(value.replace(/\D/g, '').slice(0, 10)); setOtpSent(false); setMobileVerified(false); }} />
          <SelectField label="State" value={state} onChange={(value) => { setState(value); setDistrict(getDistricts(value)[0] ?? ''); }} options={states} />
          <SelectField label="District" value={district} onChange={setDistrict} options={districts} />
          <Field label="Address / Locality" value={address} onChange={setAddress} />
          <Field label="PIN Code" value={pinCode} onChange={(value) => setPinCode(value.replace(/\D/g, '').slice(0, 6))} />
          <Field label="Optional Email" value={email} onChange={setEmail} type="email" />
          {!otpSent ? <PrimaryButton block onClick={sendOtp}><PhoneCall size={16} /> Send OTP</PrimaryButton> : <>
            <div className="rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-xs text-slate-600">No real SMS is sent in this frontend prototype. <span className="font-bold text-navy-900">Demo OTP: {DEMO_OTP}</span></div>
            <Field label="Enter OTP" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} />
            {!mobileVerified ? <PrimaryButton block onClick={verifyMobile}>Verify Mobile Number</PrimaryButton> : <div className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 p-3 text-sm font-semibold"><CheckCircle2 size={17} /> Mobile Number Verified</div>}
          </>}
          {mobileVerified && <PrimaryButton block onClick={continueFromContact}>Continue <ArrowRight size={16} /></PrimaryButton>}
        </>}

        {step === 3 && !created && <>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Donor Settings</div>
          <label className="flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-sm text-navy-900"><input type="checkbox" checked={neverDonated} onChange={(event) => setNeverDonated(event.target.checked)} /> Never Donated</label>
          {!neverDonated && <Field label="Last Blood Donation Date" value={lastDonationDate} onChange={setLastDonationDate} type="date" />}
          <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available for Night Emergencies?</div><div className="mt-2 grid grid-cols-2 gap-2"><Choice active={nightVolunteer} label="YES" onClick={() => setNightVolunteer(true)} /><Choice active={!nightVolunteer} label="NO" onClick={() => setNightVolunteer(false)} /></div></div>
          {nightVolunteer && <div className="rounded-xl bg-navy-900 text-white p-4">
            <div className="flex items-center gap-2 font-semibold"><Moon size={16} className="text-amber-300" /> Night Emergency · 12:00 AM–6:00 AM</div>
            <p className="mt-2 text-xs text-white/80">I voluntarily agree to receive critical donation push notifications, SMS, and calls during these hours when I am available, apparently eligible, and near a compatible emergency.</p>
            <div className="mt-3 text-xs text-white/70">Possible prototype ecosystem recognition: Night Responder badge, bonus points, priority achievements, and eligible partner medical benefits. Benefits are not guaranteed.</div>
          </div>}
          <PrimaryButton block onClick={continueFromSettings}>Continue <ArrowRight size={16} /></PrimaryButton>
        </>}

        {step === 4 && !created && <>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
            <div className="flex items-center justify-between gap-2"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Consent &amp; Policies</div><button type="button" className="text-xs font-semibold text-navy-700 underline" onClick={acceptAll}>Accept required demo consents</button></div>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-2 pr-1">
              {DONOR_CONSENT_CATEGORIES.map(([name, description]) => <Consent key={name} name={name} description={description} checked={!!consents[name]} onChange={(checked) => setConsents((current) => ({ ...current, [name]: checked }))} />)}
              {nightVolunteer && <Consent name="Night Emergency" description="Receive voluntary emergency communication between 12:00 AM and 6:00 AM while available." checked={!!consents['Night Emergency']} onChange={(checked) => setConsents((current) => ({ ...current, 'Night Emergency': checked }))} />}
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 text-xs text-amber-900"><strong>Medical notice:</strong> LIFE-LINK eligibility is a pre-screening aid only. Trained hospital or blood-bank personnel determine final donation eligibility.</div>
          <Field label="Create Password" value={password} onChange={setPassword} type="password" />
          <Field label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
          <label className="flex items-start gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-600"><input type="checkbox" checked={finalConsent} onChange={(event) => setFinalConsent(event.target.checked)} className="mt-0.5" /><span>I confirm these manually entered donor details and understand this is a frontend prototype account workflow.</span></label>
          <PrimaryButton block onClick={createAccount}>Create Donor Account</PrimaryButton>
        </>}

        {created && <div className="space-y-4 text-center">
          <div className="mx-auto grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><CheckCircle2 size={24} /></div>
          <div><h3 className="text-xl font-extrabold text-navy-900">Donor Account Created Successfully</h3><p className="mt-1 text-sm text-slate-500">Your frontend demo account is ready.</p></div>
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-left text-sm"><div className="font-semibold text-navy-900">{fullName}</div><div className="mt-2 flex flex-wrap gap-2"><EmergencyBadge tone="red">{bloodGroup}</EmergencyBadge><EmergencyBadge tone="green" dot>{phone} · Verified</EmergencyBadge></div></div>
          <PrimaryButton block onClick={finish}>Continue to Login</PrimaryButton>
        </div>}

        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
        {!created && step > 1 && <SecondaryButton size="sm" onClick={() => { setError(''); setStep((current) => current - 1); }}><ArrowLeft size={14} /> Back</SecondaryButton>}
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} /></label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function Choice({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={['h-10 rounded-xl text-sm font-semibold ring-1 transition', active ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-900 ring-slate-200'].join(' ')}>{label}</button>;
}

function Consent({ name, description, checked, onChange }: { name: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-start gap-2 text-xs text-slate-600"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5" /><span><strong className="text-navy-900">{name}:</strong> {description}</span></label>;
}
