import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Phone } from 'lucide-react';
import { DEMO_OTP, DONOR_DEMO_CREDENTIALS } from '../data/donorData';
import { useDonor } from '../context/DonorContext';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const inputClass = 'mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none';

export default function DonorForgotPasswordModal({ open, onClose, onUpdated }: { open: boolean; onClose: () => void; onUpdated: (phone: string) => void }) {
  const { updateDonorPassword } = useDonor();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(DONOR_DEMO_CREDENTIALS.phone);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  }, [open]);

  function sendOtp() {
    if (phone.replace(/\D/g, '').length !== 10) return setError('Enter a valid 10-digit phone number.');
    setError('');
    setStep(2);
  }

  function verifyOtp() {
    if (otp !== DEMO_OTP) return setError('Enter the demo OTP shown below.');
    setError('');
    setStep(3);
  }

  function updatePassword() {
    if (!password || password !== confirmPassword) return setError('Passwords must be non-empty and match.');
    updateDonorPassword(phone, password);
    setError('');
    setStep(4);
  }

  function finish() {
    onUpdated(phone.replace(/\D/g, '').slice(-10));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Donor Password Recovery">
      <div className="space-y-4">
        {step < 4 && <div className="flex justify-between text-xs text-slate-500"><span>Step {step} of 3</span><span>Frontend demo</span></div>}
        {step === 1 && <>
          <Field label="Phone Number" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))} icon={<Phone size={15} />} />
          <PrimaryButton block onClick={sendOtp}>Send OTP</PrimaryButton>
        </>}
        {step === 2 && <>
          <div className="rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-xs text-slate-600">No real SMS is sent. <span className="font-bold text-navy-900">Demo OTP: {DEMO_OTP}</span></div>
          <Field label="6-digit OTP" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} />
          <PrimaryButton block onClick={verifyOtp}>Verify OTP</PrimaryButton>
        </>}
        {step === 3 && <>
          <Field label="New Password" value={password} onChange={setPassword} type="password" />
          <Field label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
          <PrimaryButton block onClick={updatePassword}>Create New Password</PrimaryButton>
        </>}
        {step === 4 && <div className="text-center space-y-4">
          <div className="mx-auto grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><CheckCircle2 size={24} /></div>
          <div><h3 className="text-lg font-extrabold text-navy-900">Password Updated Successfully</h3><p className="mt-1 text-sm text-slate-500">Return to donor login with your updated demo password.</p></div>
          <PrimaryButton block onClick={finish}><KeyRound size={16} /> Return to Donor Login</PrimaryButton>
        </div>}
        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
        {step > 1 && step < 4 && <SecondaryButton size="sm" onClick={() => { setError(''); setStep((current) => current - 1); }}><ArrowLeft size={14} /> Back</SecondaryButton>}
      </div>
    </Modal>
  );
}

function Field({ label, value, onChange, type = 'text', icon }: { label: string; value: string; onChange: (value: string) => void; type?: string; icon?: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}<div className="relative">{icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${icon ? 'pl-9' : ''}`} /></div></label>;
}
