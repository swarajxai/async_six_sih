import type { HospitalType } from '../types';

export const MANUAL_OPTION = '__manual__';

export const LOCATION_DIRECTORY: Record<string, Record<string, string[]>> = {
  Odisha: {
    Sambalpur: ['Burla', 'Dhankauda', 'Rengali'],
    Khordha: ['Bhubaneswar', 'Jatni'],
    Cuttack: ['Cuttack Sadar', 'Banki'],
  },
  Jharkhand: {
    Ranchi: ['Ranchi Sadar', 'Kanke'],
  },
};

export interface HospitalDirectoryEntry {
  state: string;
  district: string;
  block: string;
  type: HospitalType;
  name: string;
}

export const HOSPITAL_DIRECTORY: HospitalDirectoryEntry[] = [
  {
    state: 'Odisha',
    district: 'Sambalpur',
    block: 'Burla',
    type: 'Government',
    name: 'VSS Medical College & Hospital',
  },
  {
    state: 'Odisha',
    district: 'Sambalpur',
    block: 'Dhankauda',
    type: 'Private',
    name: 'Sambalpur City Hospital',
  },
  {
    state: 'Odisha',
    district: 'Khordha',
    block: 'Bhubaneswar',
    type: 'Government',
    name: 'Capital Hospital Bhubaneswar',
  },
];

export function getDistricts(state: string): string[] {
  return Object.keys(LOCATION_DIRECTORY[state] ?? {});
}

export function getBlocks(state: string, district: string): string[] {
  return LOCATION_DIRECTORY[state]?.[district] ?? [];
}

export function getHospitalNames(
  state: string,
  district: string,
  block: string,
  type: HospitalType,
): string[] {
  return HOSPITAL_DIRECTORY
    .filter((hospital) =>
      hospital.state === state
      && hospital.district === district
      && hospital.block === block
      && hospital.type === type
    )
    .map((hospital) => hospital.name);
}
