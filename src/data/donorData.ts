import { HOSPITAL, INITIAL_REQUEST_DRAFT, RANKED_DONORS } from './demoData';
import type {
  BloodGroup,
  DonationHistoryItem,
  DonorIncomingEmergency,
  DonorProfile,
  EligibilityQuestion,
  RewardBadge,
} from '../types';

export const ALL_BLOOD_GROUPS: readonly BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const DEMO_DONOR_ID = 'd-1';
export const DEMO_OTP = '123456';
export const DONATION_BASE_POINTS = 100;
export const NIGHT_EMERGENCY_BONUS_POINTS = 50;

const sharedRahul = RANKED_DONORS.find((donor) => donor.id === DEMO_DONOR_ID);

if (!sharedRahul) throw new Error('The shared Rahul Das demo donor is missing.');

export const DONOR_DEMO_CREDENTIALS = {
  phone: sharedRahul.phone.replace(/\D/g, '').slice(-10),
  password: 'demo123',
};

export const DEMO_DONOR_ETA_MINUTES = sharedRahul.etaMinutes;

export const INITIAL_DONOR_PROFILE: DonorProfile = {
  donorId: sharedRahul.id,
  fullName: sharedRahul.name,
  bloodGroup: sharedRahul.bloodGroup,
  dateOfBirth: '1997-08-14',
  gender: 'Male',
  phone: DONOR_DEMO_CREDENTIALS.phone,
  email: 'rahul.das@lifelink.demo',
  address: 'Ward 8, Burla, Sambalpur',
  state: 'Odisha',
  district: 'Sambalpur',
  pinCode: '768017',
  maskedIdentity: 'XXXX XXXX 9012',
  identityStatus: 'Demo e-KYC Verified',
  availableForEmergency: true,
  nightEmergencyVolunteer: true,
};

export const INITIAL_DONOR_POINTS = 450;

export const INITIAL_DONATION_HISTORY: DonationHistoryItem[] = [
  { id: 'dh-1', date: '12 July 2026', facility: HOSPITAL.name, bloodGroup: sharedRahul.bloodGroup, units: 1, status: 'Completed', rewardPoints: 100 },
  { id: 'dh-2', date: '03 March 2026', facility: 'Sambalpur Blood Centre', bloodGroup: sharedRahul.bloodGroup, units: 1, status: 'Completed', rewardPoints: 100 },
  { id: 'dh-3', date: '18 October 2025', facility: 'District Headquarters Hospital, Sambalpur', bloodGroup: sharedRahul.bloodGroup, units: 1, status: 'Completed', rewardPoints: 100 },
  { id: 'dh-4', date: '22 May 2025', facility: HOSPITAL.name, bloodGroup: sharedRahul.bloodGroup, units: 1, status: 'Completed', rewardPoints: 100 },
];

export const INITIAL_REWARD_BADGES: RewardBadge[] = [
  { id: 'first-responder', name: 'First Responder', description: 'Completed the first LIFE-LINK donation', unlocked: true, tone: 'green' },
  { id: 'emergency-hero', name: 'Emergency Hero', description: 'Complete an emergency donation', unlocked: false, tone: 'red' },
  { id: 'regular-donor', name: 'Regular Donor', description: 'Complete five verified donations', unlocked: false, tone: 'navy' },
  { id: 'night-responder', name: 'Night Responder', description: 'Complete an eligible night emergency', unlocked: false, tone: 'amber' },
];

export const ELIGIBILITY_QUESTIONS: EligibilityQuestion[] = [
  { id: 'feeling-unwell', prompt: 'Are you currently feeling unwell or feverish?', safeDemoAnswer: false },
  { id: 'recent-donation', prompt: 'Have you donated blood recently?', safeDemoAnswer: false },
  { id: 'medication-review', prompt: 'Are you taking medication that a blood-bank doctor should review?', safeDemoAnswer: false },
  { id: 'recent-procedure', prompt: 'Have you undergone a recent surgery or significant medical procedure?', safeDemoAnswer: false },
  { id: 'tattoo-piercing', prompt: 'Have you had a recent tattoo or piercing?', safeDemoAnswer: false },
  { id: 'recent-infection', prompt: 'Have you recently had an infection or serious illness?', safeDemoAnswer: false },
  { id: 'doctor-advice', prompt: 'Has a doctor advised you not to donate blood?', safeDemoAnswer: false },
  { id: 'current-treatment', prompt: 'Are you under treatment for a condition that may affect donation?', safeDemoAnswer: false },
  { id: 'physically-fit', prompt: 'Are you currently feeling physically fit enough to donate?', safeDemoAnswer: true },
];

export const DONOR_INCOMING_EMERGENCY: DonorIncomingEmergency = {
  id: 'req-aarav-001',
  hospitalName: HOSPITAL.name,
  hospitalLocation: HOSPITAL.location,
  bloodGroup: INITIAL_REQUEST_DRAFT.bloodGroup,
  distanceKm: sharedRahul.distanceKm,
  urgency: INITIAL_REQUEST_DRAFT.urgency,
  requiredWithinMinutes: INITIAL_REQUEST_DRAFT.requiredWithinMinutes,
  verifiedHospital: true,
  isNightEmergency: false,
};

export const DONOR_CONSENT_CATEGORIES = [
  ['Emergency Notifications', 'Receive compatible emergency alerts while marked available.'],
  ['SMS / Phone Calls', 'Receive time-sensitive emergency communication.'],
  ['Location', 'Share location only when required for active emergency coordination.'],
  ['Eligibility Information', 'Use donor-provided pre-screening answers to prioritize requests.'],
  ['Data Use', 'Use demo account and coordination information within the LIFE-LINK prototype.'],
  ['Final Medical Screening', 'Digital eligibility is pre-screening only; trained hospital or blood-bank personnel make the final decision.'],
  ['Withdrawal', 'Availability can be switched off to leave active emergency matching.'],
] as const;

export const PARTNER_BENEFITS = [
  'Partner health check-up offers',
  'Eligible diagnostic partner discounts',
  'Digital recognition certificates',
  'Donor wellness programme benefits',
];
