import { DEMO_BLOOD_AVAILABILITY } from '../data/bloodAvailabilityData';
import type { BloodAvailabilityRecord, BloodComponent, BloodGroup } from '../types';

export interface BloodAvailabilityQuery {
  hospitalId: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
}

export async function getBloodAvailability(
  query: BloodAvailabilityQuery,
): Promise<BloodAvailabilityRecord[]> {
  void query.hospitalId;

  return DEMO_BLOOD_AVAILABILITY
    .filter((record) => record.bloodGroup === query.bloodGroup)
    .filter((record) => record.component === query.component)
    .sort((a, b) => {
      const usableDifference = Number(b.unitsAvailable > 0) - Number(a.unitsAvailable > 0);
      return usableDifference || a.distanceKm - b.distanceKm;
    });
}
