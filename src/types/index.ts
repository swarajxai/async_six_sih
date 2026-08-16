export type UserRole = 'hospital' | 'patient' | 'donor';

export type BloodGroup =
  | 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type Urgency = 'Critical' | 'High' | 'Moderate';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospitalId: string;
  hospitalName: string;
  location: string;
  urgency: Urgency;
  requiredWithinMinutes: number;
  raisedAt: number; // epoch ms
  status: 'raised' | 'matching' | 'alerting' | 'coordination' | 'success';
}

export type DonorStatus =
  | 'idle'
  | 'alert-sent'
  | 'viewing'
  | 'confirmed'
  | 'unavailable'
  | 'paused';

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  lastDonation: string; // human-readable
  eligible: boolean;
  available: boolean;
  reliability: number; // 0..100
  etaMinutes: number;
  status: DonorStatus;
  phone: string;
}

export interface BloodBank {
  id: string;
  name: string;
  city: string;
  stockUnits: number; // -1 means unavailable
  transferAcceptance: 'Verified' | 'Pending' | 'Rejected';
  distanceKm: number;
}

export type CoordinationStage =
  | 'request-raised'
  | 'donors-matched'
  | 'donor-confirmed'
  | 'en-route'
  | 'screening'
  | 'donation';

export interface TimelineEntry {
  stage: CoordinationStage;
  label: string;
  done: boolean;
  active: boolean;
}
