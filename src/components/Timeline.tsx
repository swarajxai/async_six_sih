import { Check, Circle } from 'lucide-react';
import type { TimelineEntry } from '../types';

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="space-y-3">
      {entries.map((e, idx) => (
        <li key={e.stage} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={[
                'grid place-items-center h-7 w-7 rounded-full text-white',
                e.done ? 'bg-emerald-500' : e.active ? 'bg-navy-900' : 'bg-slate-300',
              ].join(' ')}
            >
              {e.done ? <Check size={14} /> : <Circle size={10} fill="currentColor" />}
            </div>
            {idx < entries.length - 1 && (
              <div className={['w-0.5 h-5 mt-1', e.done ? 'bg-emerald-400' : 'bg-slate-200'].join(' ')} />
            )}
          </div>
          <div className="pt-1">
            <div className={`text-sm font-semibold ${e.done || e.active ? 'text-navy-900' : 'text-slate-500'}`}>
              {e.label}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
