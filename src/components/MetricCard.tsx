import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'navy' | 'red' | 'green' | 'amber';
}

const toneStyles: Record<NonNullable<MetricCardProps['tone']>, string> = {
  navy: 'bg-navy-50 text-navy-800',
  red: 'bg-red-50 text-red-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
};

export default function MetricCard({ icon: Icon, label, value, hint, tone = 'navy' }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-card ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className={`grid place-items-center h-10 w-10 rounded-xl ${toneStyles[tone]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</div>
          <div className="text-2xl font-extrabold text-navy-900 leading-tight">{value}</div>
        </div>
      </div>
      {hint && <div className="mt-2 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
