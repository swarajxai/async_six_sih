import { Car, Clock, Droplet, MapPin } from 'lucide-react';
import type { Donor, DonorCoordination } from '../types';
import EmergencyBadge from './EmergencyBadge';

export default function CoordinationDonorCard({
  donor,
  coordination,
}: {
  donor: Donor;
  coordination: DonorCoordination;
}) {
  const statusLabel = coordination.status === 'screening-failed'
    ? 'Screening Failed'
    : coordination.status === 'screening'
      ? 'Screening'
      : coordination.status === 'ready'
        ? 'Ready to Donate'
        : coordination.status === 'donated'
          ? 'Donation Completed'
          : coordination.isReplacement
            ? 'Backup Confirmed'
            : 'En Route';
  const tone = coordination.status === 'screening-failed'
    ? 'red'
    : coordination.status === 'screening'
      ? 'amber'
      : 'green';

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-full bg-navy-900 text-white font-bold text-sm">
          {donor.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-navy-900">{donor.name}</div>
              <div className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-flex items-center gap-1"><Droplet size={11} /> {donor.bloodGroup}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={11} /> {donor.distanceKm} km</span>
              </div>
            </div>
            <EmergencyBadge tone={tone} dot>{statusLabel}</EmergencyBadge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-100 p-2">
              <div className="text-slate-500 flex items-center gap-1"><Car size={11} /> Travel Mode</div>
              <div className="mt-0.5 font-semibold text-navy-900">{coordination.travelMode}</div>
            </div>
            <div className="rounded-lg bg-slate-50 ring-1 ring-slate-100 p-2">
              <div className="text-slate-500 flex items-center gap-1"><Clock size={11} /> ETA</div>
              <div className="mt-0.5 font-semibold text-navy-900">
                {Math.floor(coordination.etaSeconds / 60)}m {String(coordination.etaSeconds % 60).padStart(2, '0')}s
              </div>
            </div>
          </div>
          {coordination.isReplacement && <div className="mt-2"><EmergencyBadge tone="navy">Standby Replacement</EmergencyBadge></div>}
        </div>
      </div>
    </div>
  );
}
