import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const DEMO_OTP = '123456';
const inputClass = 'mt-1 w-full h-11 px-3 rounded-xl ring-1 ring-slate-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-500 focus:outline-none';

export default function ForgotPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('admin@vsshospital.demo');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  }, [open]);

  function sendOtp() {
    if (!email.includes('@')) {
      setError('Enter a valid official hospital email.');
      return;
    }
    setError('');
    setStep(2);
  }

  function verifyOtp() {
    if (otp !== DEMO_OTP) {
      setError('Enter the demo OTP shown below.');
      return;
    }
    setError('');
    setStep(3);
  }

  function updatePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords must be non-empty and match.');
      return;
    }
    setError('');
    setStep(4);
  }

  return (
    <Modal open={open} onClose={onClose} title="Hospital Password Recovery">
      <div className="space-y-4">
        {step < 4 && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Step {step} of 3</span>
            <span>Frontend demo</span>
          </div>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Official Hospital Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>
            <PrimaryButton block onClick={sendOtp}>Send OTP</PrimaryButton>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-xl bg-navy-50 ring-1 ring-navy-100 p-3 text-xs text-slate-600">
              No real email is sent in this prototype. <span className="font-bold text-navy-900">Demo OTP: 123456</span>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">6-digit OTP</label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                className={inputClass}
                placeholder="123456"
              />
            </div>
            <PrimaryButton block onClick={verifyOtp}>Verify OTP</PrimaryButton>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">New Password</label>
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
            </div>
            <PrimaryButton block onClick={updatePassword}>Update Password</PrimaryButton>
          </>
        )}

        {step === 4 && (
          <div className="text-center space-y-4">
            <div className="mx-auto grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-navy-900">Password Updated Successfully</h3>
              <p className="mt-1 text-sm text-slate-500">Use the updated password for your hospital account.</p>
            </div>
            <PrimaryButton block onClick={onClose}>
              <KeyRound size={16} /> Return to Hospital Login
            </PrimaryButton>
          </div>
        )}

        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

        {step > 1 && step < 4 && (
          <SecondaryButton size="sm" onClick={() => { setError(''); setStep((current) => current - 1); }}>
            <ArrowLeft size={14} /> Back
          </SecondaryButton>
        )}
      </div>
    </Modal>
  );
}
