export type UserRole = 'hospital' | 'donor';

export type BloodGroup =
  | 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type Urgency = 'Critical' | 'High' | 'Moderate';
export type BloodComponent = 'Red Cells / PRBC';
export type HospitalType = 'Government' | 'Private' | 'Semi-Government';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  district: string;
  block: string;
}

export interface EmergencyRequestDraft {
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  urgency: Urgency;
  requiredWithinMinutes: number;
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
  status: 'raised' | 'matching' | 'alerting' | 'secured' | 'coordination' | 'success';
}

export type DonorStatus =
  | 'idle'
  | 'alert-sent'
  | 'viewing'
  | 'confirmed'
  | 'unavailable'
  | 'paused'
  | 'standby'
  | 'en-route'
  | 'screening'
  | 'screening-failed'
  | 'replacement-confirmed'
  | 'donated';

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
  travelMode: 'Self Travel' | 'Pickup';
  status: DonorStatus;
  phone: string;
}

export type BloodAvailabilityStatus = 'Available' | 'Low Stock' | 'Unavailable';

export interface BloodAvailabilityRecord {
  id: string;
  bloodBankId: string;
  bloodBankName: string;
  city: string;
  phone: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  distanceKm: number;
  lastUpdated: string;
  status: BloodAvailabilityStatus;
}

export interface BloodBankPlan {
  recordId: string;
  bloodBankId: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsPlanned: number;
  status: 'selected';
}

export type DonorTravelStatus =
  | 'en-route'
  | 'screening'
  | 'ready'
  | 'screening-failed'
  | 'donated';

export interface DonorCoordination {
  donorId: string;
  etaSeconds: number;
  travelMode: Donor['travelMode'];
  status: DonorTravelStatus;
  isReplacement: boolean;
}

export type DonorGender = 'Male' | 'Female' | 'Other';
export type DonorEligibilityResult = 'pending' | 'likely-eligible' | 'review-required';
export type DonorEmergencyResponse = 'pending' | 'accepted' | 'unavailable';
export type DonorJourneyStatus =
  | 'idle'
  | 'en-route'
  | 'arrived'
  | 'screening'
  | 'screening-cleared'
  | 'completed';
export type DonorTravelMode = Donor['travelMode'];

export interface DonorProfile {
  donorId: string;
  fullName: string;
  bloodGroup: BloodGroup;
  dateOfBirth: string;
  gender: DonorGender;
  phone: string;
  email?: string;
  address: string;
  state: string;
  district: string;
  pinCode: string;
  maskedIdentity: string;
  identityStatus: 'Demo e-KYC Verified';
  availableForEmergency: boolean;
  nightEmergencyVolunteer: boolean;
}

export interface DonationHistoryItem {
  id: string;
  date: string;
  facility: string;
  bloodGroup: BloodGroup;
  units: number;
  status: 'Completed';
  rewardPoints: number;
}

export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  tone: 'navy' | 'red' | 'green' | 'amber';
}

export interface EligibilityQuestion {
  id: string;
  prompt: string;
  safeDemoAnswer: boolean;
}

export interface DonorIncomingEmergency {
  id: string;
  hospitalName: string;
  hospitalLocation: string;
  bloodGroup: BloodGroup;
  distanceKm: number;
  urgency: Urgency;
  requiredWithinMinutes: number;
  verifiedHospital: boolean;
  isNightEmergency: boolean;
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
