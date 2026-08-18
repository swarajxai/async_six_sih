import type { BloodGroup, Donor } from '../types';

export const RED_CELL_DONOR_GROUPS: Record<BloodGroup, readonly BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export function getCompatibleRedCellDonorGroups(recipient: BloodGroup): readonly BloodGroup[] {
  return RED_CELL_DONOR_GROUPS[recipient];
}

export function isRedCellCompatible(recipient: BloodGroup, donor: BloodGroup): boolean {
  return RED_CELL_DONOR_GROUPS[recipient].includes(donor);
}

export function rankCompatibleRedCellDonors(donors: Donor[], recipient: BloodGroup): Donor[] {
  return donors
    .filter((donor) => isRedCellCompatible(recipient, donor.bloodGroup))
    .filter((donor) => donor.eligible && donor.available)
    .sort((a, b) => a.distanceKm - b.distanceKm || b.reliability - a.reliability);
}
