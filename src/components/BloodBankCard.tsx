import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import type { BloodBank } from '../types';

export default function BloodBankCard({ bank }: { bank: BloodBank }) {
  const available = bank.stockUnits > 0;
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-9 w-9 rounded-lg bg-navy-50 text-navy-800">
          <Building2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-navy-900 text-sm truncate">{bank.name}</div>
          <div className="text-xs text-slate-500">{bank.city} · {bank.distanceKm} km away</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm">
          <div className="text-slate-500">O- stock</div>
          <div className={`font-bold ${available ? 'text-emerald-700' : 'text-red-600'}`}>
            {available ? `${bank.stockUnits} unit${bank.stockUnits > 1 ? 's' : ''}` : 'Unavailable'}
          </div>
        </div>
        <div
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            bank.transferAcceptance === 'Verified'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : bank.transferAcceptance === 'Pending'
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200',
          ].join(' ')}
        >
          {bank.transferAcceptance === 'Verified' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {bank.transferAcceptance === 'Verified' ? 'Transfer Verified' : bank.transferAcceptance}
        </div>
      </div>
    </div>
  );
}
