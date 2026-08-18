import type { BloodAvailabilityRecord, BloodAvailabilityStatus, BloodGroup } from '../types';

const GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const BANKS = [
  {
    id: 'bb-vss',
    name: 'VSS Blood Bank',
    city: 'Burla',
    phone: '+91 663 2430768',
    distanceKm: 0.4,
    lastUpdated: '8 min ago',
    stock: { 'O-': 2, 'O+': 5, 'A-': 2, 'A+': 4, 'B-': 1, 'B+': 3, 'AB-': 1, 'AB+': 2 } as Record<BloodGroup, number>,
  },
  {
    id: 'bb-sambalpur',
    name: 'Sambalpur Blood Centre',
    city: 'Sambalpur',
    phone: '+91 663 2521100',
    distanceKm: 12.5,
    lastUpdated: '14 min ago',
    stock: { 'O-': 1, 'O+': 3, 'A-': 1, 'A+': 2, 'B-': 0, 'B+': 2, 'AB-': 0, 'AB+': 1 } as Record<BloodGroup, number>,
  },
  {
    id: 'bb-red-cross',
    name: 'Red Cross Blood Centre',
    city: 'Sambalpur',
    phone: '+91 663 2402412',
    distanceKm: 15.2,
    lastUpdated: '21 min ago',
    stock: { 'O-': 0, 'O+': 2, 'A-': 0, 'A+': 2, 'B-': 1, 'B+': 1, 'AB-': 0, 'AB+': 1 } as Record<BloodGroup, number>,
  },
];

function availabilityStatus(units: number): BloodAvailabilityStatus {
  if (units <= 0) return 'Unavailable';
  if (units === 1) return 'Low Stock';
  return 'Available';
}

export const DEMO_BLOOD_AVAILABILITY: BloodAvailabilityRecord[] = BANKS.flatMap((bank) =>
  GROUPS.map((bloodGroup) => {
    const unitsAvailable = bank.stock[bloodGroup];
    return {
      id: `${bank.id}-${bloodGroup.replace('+', 'pos').replace('-', 'neg')}`,
      bloodBankId: bank.id,
      bloodBankName: bank.name,
      city: bank.city,
      phone: bank.phone,
      bloodGroup,
      component: 'Red Cells / PRBC' as const,
      unitsAvailable,
      distanceKm: bank.distanceKm,
      lastUpdated: bank.lastUpdated,
      status: availabilityStatus(unitsAvailable),
    };
  })
);
