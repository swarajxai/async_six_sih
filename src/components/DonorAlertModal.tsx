import { AlertTriangle, MapPin, XCircle, Check } from 'lucide-react';
import Modal from './Modal';
import { useDemo } from '../context/DemoContext';
import EmergencyBadge from './EmergencyBadge';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function DonorAlertModal() {
  const { donors, donorModalDonorId, closeDonorModal, openDonorModal } = useDemo();
  const donor = donors.find((d) => d.id === donorModalDonorId) ?? null;

  return (
    <Modal open={!!donor} onClose={closeDonorModal} title="Donor Phone Preview">
      {donor && (
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle size={16} /> EMERGENCY BLOOD REQUEST
            </div>
            <div className="mt-2 text-2xl font-extrabold text-navy-900">
              {donor.bloodGroup} needed
            </div>
            <div className="mt-1 text-sm text-slate-700">VSS Medical College &amp; Hospital</div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
              <MapPin size={12} /> {donor.distanceKm} km away
            </div>
            <div className="mt-2 flex items-center gap-2">
              <EmergencyBadge tone="red" dot>Critical</EmergencyBadge>
              <EmergencyBadge tone="navy">Within 60 min</EmergencyBadge>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            Preview only · Donor responses are simulated automatically during the judge demo.
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PrimaryButton onClick={closeDonorModal}>
              <Check size={16} /> ACCEPT
            </PrimaryButton>
            <SecondaryButton onClick={closeDonorModal}>
              <XCircle size={16} /> UNAVAILABLE
            </SecondaryButton>
          </div>

          <div className="text-[11px] text-slate-500 text-center">
            Tap another donor on the matching page to preview their alert.
            <button className="ml-1 underline" onClick={() => openDonorModal('d-2')}>Try Priya</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
