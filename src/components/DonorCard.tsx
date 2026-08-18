import { CheckCircle2, Clock, Eye, MapPin, PauseCircle, XCircle, Loader2 } from 'lucide-react';
import EmergencyBadge from './EmergencyBadge';
import type { Donor } from '../types';

interface DonorCardProps {
  donor: Donor;
  compact?: boolean;
  onClick?: () => void;
  highlight?: boolean;
}

function StatusRow({ donor }: { donor: Donor }) {
  if (donor.status === 'confirmed') {
    return (
      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
        <CheckCircle2 size={16} /> Confirmed Availability
      </div>
    );
  }
  if (donor.status === 'replacement-confirmed') {
    return (
      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
        <CheckCircle2 size={16} /> Backup Confirmed
      </div>
    );
  }
  if (donor.status === 'en-route') {
    return (
      <div className="flex items-center gap-2 text-navy-800 font-semibold text-sm">
        <Clock size={16} /> En Route
      </div>
    );
  }
  if (donor.status === 'screening') {
    return (
      <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
        <Clock size={16} /> Screening
      </div>
    );
  }
  if (donor.status === 'screening-failed') {
    return (
      <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
        <XCircle size={16} /> Screening Failed
      </div>
    );
  }
  if (donor.status === 'donated') {
    return (
      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
        <CheckCircle2 size={16} /> Donation Completed
      </div>
    );
  }
  if (donor.status === 'unavailable') {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <XCircle size={16} /> Unavailable
      </div>
    );
  }
  if (donor.status === 'paused') {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <PauseCircle size={16} /> Alert Paused
      </div>
    );
  }
  if (donor.status === 'standby') {
    return (
      <div className="flex items-center gap-2 text-navy-700 text-sm">
        <PauseCircle size={16} /> Standby
      </div>
    );
  }
  if (donor.status === 'viewing') {
    return (
      <div className="flex items-center gap-2 text-navy-800 text-sm">
        <Eye size={16} /> Viewing Request
      </div>
    );
  }
  if (donor.status === 'alert-sent') {
    return (
      <div className="flex items-center gap-2 text-navy-800 text-sm">
        <Loader2 size={16} className="animate-spin" /> Alert Delivered
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-slate-500 text-sm">
      <Clock size={16} /> Standby
    </div>
  );
}

export default function DonorCard({ donor, compact = false, onClick, highlight = false }: DonorCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-2xl bg-white p-4 shadow-card ring-1 transition',
        highlight ? 'ring-2 ring-emerald-300 shadow-pop' : 'ring-slate-100',
        onClick ? 'cursor-pointer hover:shadow-pop' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-11 w-11 rounded-full bg-navy-900 text-white font-bold">
          {donor.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold text-navy-900 truncate">{donor.name}</div>
            <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-md bg-emergency text-white font-bold text-sm">
              {donor.bloodGroup}
            </span>
          </div>
          {!compact && (
            <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {donor.distanceKm} km</span>
              <span>·</span>
              <span>Last donation: {donor.lastDonation}</span>
            </div>
          )}
          {compact && (
            <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {donor.distanceKm} km</span>
            </div>
          )}
          <div className="mt-2">
            <StatusRow donor={donor} />
          </div>
          {!compact && (
            <div className="mt-2 flex items-center gap-2">
              <EmergencyBadge tone="green" dot>Eligible</EmergencyBadge>
              <EmergencyBadge tone="navy">Reliability {donor.reliability}%</EmergencyBadge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
