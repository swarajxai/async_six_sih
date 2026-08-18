import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import Brand from '../components/Brand';
import EmergencyBadge from '../components/EmergencyBadge';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { ELIGIBILITY_QUESTIONS } from '../data/donorData';
import { useDonor } from '../context/DonorContext';

export default function DonorEligibilityPage() {
  const {
    profile,
    eligibilityAnswers,
    eligibilityResult,
    answerEligibilityQuestion,
    useDemoEligibleAnswers,
    submitEligibility,
  } = useDonor();
  const navigate = useNavigate();
  const allAnswered = ELIGIBILITY_QUESTIONS.every((question) => question.id in eligibilityAnswers);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100"><div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between"><Brand size="md" /><EmergencyBadge tone="navy">Donor Pre-Screening</EmergencyBadge></div></header>
      <main className="mx-auto max-w-4xl w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-navy-50 text-navy-800"><ShieldCheck size={20} /></div>
            <div><h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">Quick Donation Eligibility Check</h1><p className="mt-1 text-sm text-slate-500">Welcome, {profile.fullName}. This is a basic pre-screening aid, not a medical diagnosis.</p></div>
          </div>

          {eligibilityResult === 'pending' ? <>
            <div className="mt-5 flex justify-end"><SecondaryButton size="sm" onClick={useDemoEligibleAnswers}><Sparkles size={15} /> Use Demo Eligible Answers</SecondaryButton></div>
            <div className="mt-4 space-y-3">
              {ELIGIBILITY_QUESTIONS.map((question, index) => (
                <div key={question.id} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 sm:flex sm:items-center sm:justify-between gap-3">
                  <div className="text-sm font-medium text-navy-900"><span className="mr-2 text-xs text-slate-400">{index + 1}.</span>{question.prompt}</div>
                  <div className="mt-2 sm:mt-0 grid grid-cols-2 gap-2 min-w-40">
                    {[true, false].map((answer) => <button key={String(answer)} onClick={() => answerEligibilityQuestion(question.id, answer)} className={['h-9 rounded-xl text-xs font-semibold ring-1 transition', eligibilityAnswers[question.id] === answer ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-900 ring-slate-200'].join(' ')}>{answer ? 'YES' : 'NO'}</button>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end"><PrimaryButton size="lg" disabled={!allAnswered} onClick={submitEligibility}>Check Pre-Screening <ArrowRight size={17} /></PrimaryButton></div>
          </> : eligibilityResult === 'likely-eligible' ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-5 text-center">
              <CheckCircle2 size={28} className="mx-auto text-emerald-700" />
              <h2 className="mt-2 text-xl font-extrabold text-emerald-900">Pre-Screening Passed</h2>
              <div className="mt-2"><EmergencyBadge tone="green" dot>Likely Eligible</EmergencyBadge></div>
              <p className="mt-3 text-sm text-emerald-900/75">Final eligibility will be determined by medical screening at the hospital or blood bank.</p>
              <div className="mt-4"><PrimaryButton onClick={() => navigate('/donor/dashboard')}>Continue to Dashboard <ArrowRight size={16} /></PrimaryButton></div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-5 text-center">
              <AlertTriangle size={28} className="mx-auto text-amber-700" />
              <h2 className="mt-2 text-xl font-extrabold text-amber-900">Medical Review Required</h2>
              <div className="mt-2"><EmergencyBadge tone="amber">Temporarily Unavailable for Matching</EmergencyBadge></div>
              <p className="mt-3 text-sm text-amber-900/75">This is not a diagnosis. Please discuss the flagged answer with trained medical personnel before donation.</p>
              <div className="mt-4"><SecondaryButton onClick={useDemoEligibleAnswers}>Use Demo Eligible Answers</SecondaryButton></div>
            </div>
          )}

          <div className="mt-5 rounded-xl bg-slate-100 ring-1 ring-slate-200 p-3 text-xs text-slate-600">LIFE-LINK uses donor-provided answers only to prioritize emergency matching. Medical personnel always make the final eligibility decision.</div>
        </div>
      </main>
    </div>
  );
}
