import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import {
  LOCATION_DIRECTORY,
  MANUAL_OPTION,
  getBlocks,
  getDistricts,
  getHospitalNames,
} from '../data/hospitalDirectory';
import type { HospitalType } from '../types';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const DEMO_OTP = '123456';
const controlClass = 'mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none';

export default function HospitalRegistrationModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (userId: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState('Odisha');
  const [district, setDistrict] = useState('Sambalpur');
  const [block, setBlock] = useState('Burla');
  const [manualState, setManualState] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');
  const [manualBlock, setManualBlock] = useState('');
  const [hospitalType, setHospitalType] = useState<HospitalType>('Government');
  const [hospitalName, setHospitalName] = useState('VSS Medical College & Hospital');
  const [manualHospitalName, setManualHospitalName] = useState('');
  const [licenceNumber, setLicenceNumber] = useState('VSS-OD-1948');
  const [email, setEmail] = useState('admin@vsshospital.demo');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [userId, setUserId] = useState('VSS-HOSP-001');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setOtp('');
    setOtpVerified(false);
    setPassword('');
    setConfirmPassword('');
    setCreated(false);
    setError('');
  }, [open]);

  const states = Object.keys(LOCATION_DIRECTORY);
  const districts = state === MANUAL_OPTION ? [] : getDistricts(state);
  const blocks = state === MANUAL_OPTION || district === MANUAL_OPTION ? [] : getBlocks(state, district);
  const resolvedState = state === MANUAL_OPTION ? manualState : state;
  const resolvedDistrict = district === MANUAL_OPTION ? manualDistrict : district;
  const resolvedBlock = block === MANUAL_OPTION ? manualBlock : block;
  const hospitalNames = useMemo(
    () => getHospitalNames(resolvedState, resolvedDistrict, resolvedBlock, hospitalType),
    [resolvedState, resolvedDistrict, resolvedBlock, hospitalType],
  );
  const resolvedHospitalName = hospitalName === MANUAL_OPTION ? manualHospitalName : hospitalName;

  useEffect(() => {
    if (hospitalNames.includes(hospitalName)) return;
    setHospitalName(hospitalNames[0] ?? MANUAL_OPTION);
  }, [hospitalNames, hospitalName]);

  function validateLocation() {
    if (!resolvedState || !resolvedDistrict || !resolvedBlock) {
      setError('Complete the hospital location before continuing.');
      return;
    }
    setError('');
    setStep(2);
  }

  function sendVerificationOtp() {
    if (!resolvedHospitalName || !licenceNumber || !email.includes('@')) {
      setError('Complete all hospital details and enter a valid official email.');
      return;
    }
    setError('');
    setStep(3);
  }

  function verifyOtp() {
    if (otp !== DEMO_OTP) {
      setError('Enter the demo OTP shown below.');
      return;
    }
    setError('');
    setOtpVerified(true);
  }

  function createAccount() {
    if (!userId || !password || password !== confirmPassword) {
      setError('Enter a Hospital User ID and matching passwords.');
      return;
    }
    setError('');
    setCreated(true);
  }

  function continueToLogin() {
    onCreated(userId);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Hospital Account">
      <div className="space-y-4">
        {!created && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Step {step} of 3</span>
            <span>Frontend demo registration</span>
          </div>
        )}

        {step === 1 && !created && (
          <>
            <SelectField label="State" value={state} onChange={(value) => {
              setState(value);
              const nextDistrict = value === MANUAL_OPTION ? MANUAL_OPTION : getDistricts(value)[0] ?? MANUAL_OPTION;
              setDistrict(nextDistrict);
              setBlock(value === MANUAL_OPTION ? MANUAL_OPTION : getBlocks(value, nextDistrict)[0] ?? MANUAL_OPTION);
            }} options={states} manualLabel="Other / Enter Manually" />
            {state === MANUAL_OPTION && <TextField label="Enter State" value={manualState} onChange={setManualState} />}

            <SelectField label="District" value={district} onChange={(value) => {
              setDistrict(value);
              setBlock(value === MANUAL_OPTION ? MANUAL_OPTION : getBlocks(state, value)[0] ?? MANUAL_OPTION);
            }} options={districts} manualLabel="Other / Enter Manually" />
            {district === MANUAL_OPTION && <TextField label="Enter District" value={manualDistrict} onChange={setManualDistrict} />}

            <SelectField label="Block / Local Administrative Area" value={block} onChange={setBlock} options={blocks} manualLabel="Other / Enter Manually" />
            {block === MANUAL_OPTION && <TextField label="Enter Block / Area" value={manualBlock} onChange={setManualBlock} />}

            <PrimaryButton block onClick={validateLocation}>Continue <ArrowRight size={16} /></PrimaryButton>
          </>
        )}

        {step === 2 && !created && (
          <>
            <SelectField
              label="Hospital Type"
              value={hospitalType}
              onChange={(value) => setHospitalType(value as HospitalType)}
              options={['Government', 'Private', 'Semi-Government']}
            />
            <SelectField
              label="Hospital Name"
              value={hospitalName}
              onChange={setHospitalName}
              options={hospitalNames}
              manualLabel="Other Hospital / Enter Manually"
            />
            {hospitalName === MANUAL_OPTION && <TextField label="Enter Hospital Name" value={manualHospitalName} onChange={setManualHospitalName} />}
            <TextField label="Hospital Licence / Registration Number" value={licenceNumber} onChange={setLicenceNumber} />
            <TextField label="Official Hospital Email" value={email} onChange={setEmail} type="email" />
            <PrimaryButton block onClick={sendVerificationOtp}>Send Verification OTP</PrimaryButton>
          </>
        )}

        {step === 3 && !created && (
          <>
            {!otpVerified ? (
              <>
                <div className="rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-xs text-slate-600">
                  No real email is sent. <span className="font-bold text-navy-900">Demo OTP: 123456</span>
                </div>
                <TextField label="Verification OTP" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} />
                <PrimaryButton block onClick={verifyOtp}>Verify OTP</PrimaryButton>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 p-3 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Official email verified
                </div>
                <TextField label="Create Hospital User ID" value={userId} onChange={setUserId} />
                <TextField label="Create Password" value={password} onChange={setPassword} type="password" />
                <TextField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
                <PrimaryButton block onClick={createAccount}>Create Hospital Account</PrimaryButton>
              </>
            )}
          </>
        )}

        {created && (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-navy-900">Hospital Account Created</h3>
              <p className="mt-1 text-sm text-slate-500">Your demo hospital account is ready.</p>
            </div>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-left text-sm">
              <div className="text-xs text-slate-500">Hospital Name</div>
              <div className="font-semibold text-navy-900">{resolvedHospitalName}</div>
              <div className="mt-2 text-xs text-slate-500">Hospital User ID</div>
              <div className="font-semibold text-navy-900">{userId}</div>
            </div>
            <PrimaryButton block onClick={continueToLogin}>Continue to Login</PrimaryButton>
          </div>
        )}

        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

        {!created && step > 1 && (
          <SecondaryButton size="sm" onClick={() => { setError(''); setStep((current) => current - 1); }}>
            <ArrowLeft size={14} /> Back
          </SecondaryButton>
        )}
      </div>
    </Modal>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  manualLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  manualLabel?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
        {manualLabel && <option value={MANUAL_OPTION}>{manualLabel}</option>}
      </select>
    </div>
  );
}
