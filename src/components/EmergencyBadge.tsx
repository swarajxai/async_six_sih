import type { ReactNode } from 'react';

type Tone = 'red' | 'amber' | 'green' | 'navy' | 'slate';

const tones: Record<Tone, string> = {
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  navy: 'bg-navy-50 text-navy-800 ring-1 ring-navy-200',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export default function EmergencyBadge({
  tone = 'slate',
  children,
  dot = false,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
