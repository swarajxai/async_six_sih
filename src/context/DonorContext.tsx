import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DONATION_BASE_POINTS,
  DONOR_DEMO_CREDENTIALS,
  DONOR_INCOMING_EMERGENCY,
  ELIGIBILITY_QUESTIONS,
  INITIAL_DONATION_HISTORY,
  INITIAL_DONOR_POINTS,
  INITIAL_DONOR_PROFILE,
  INITIAL_REWARD_BADGES,
  NIGHT_EMERGENCY_BONUS_POINTS,
} from '../data/donorData';
import type {
  DonationHistoryItem,
  DonorEligibilityResult,
  DonorEmergencyResponse,
  DonorJourneyStatus,
  DonorProfile,
  DonorTravelMode,
  RewardBadge,
} from '../types';

interface DonorState {
  isAuthenticated: boolean;
  profile: DonorProfile;
  eligibilityAnswers: Record<string, boolean>;
  eligibilityResult: DonorEligibilityResult;
  emergencyResponse: DonorEmergencyResponse;
  travelMode: DonorTravelMode | null;
  journeyStatus: DonorJourneyStatus;
  rewardPoints: number;
  donationHistory: DonationHistoryItem[];
  badges: RewardBadge[];
  pointsAwarded: number;
  newlyUnlockedBadgeNames: string[];
}

interface DonorActions {
  loginDonor: (phone: string, password: string) => boolean;
  logoutDonor: () => void;
  resetDonorDemo: () => void;
  updateDonorPassword: (phone: string, password: string) => void;
  createDonorAccount: (
    phone: string,
    password: string,
    profilePatch: Pick<DonorProfile, 'bloodGroup' | 'email' | 'nightEmergencyVolunteer'>,
  ) => void;
  answerEligibilityQuestion: (id: string, answer: boolean) => void;
  useDemoEligibleAnswers: () => void;
  submitEligibility: () => void;
  toggleEmergencyAvailability: () => void;
  toggleNightEmergency: () => void;
  respondToEmergency: (response: Exclude<DonorEmergencyResponse, 'pending'>) => void;
  resetEmergencyResponse: () => void;
  chooseTravelMode: (mode: DonorTravelMode) => void;
  markArrived: () => void;
  beginScreening: () => void;
  clearScreening: () => void;
  completeDonorDonation: () => void;
}

const DonorContext = createContext<(DonorState & DonorActions) | null>(null);

function freshProfile(): DonorProfile {
  return { ...INITIAL_DONOR_PROFILE };
}

function freshHistory(): DonationHistoryItem[] {
  return INITIAL_DONATION_HISTORY.map((item) => ({ ...item }));
}

function freshBadges(): RewardBadge[] {
  return INITIAL_REWARD_BADGES.map((badge) => ({ ...badge }));
}

export function DonorProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<DonorProfile>(() => freshProfile());
  const [credentials, setCredentials] = useState({ ...DONOR_DEMO_CREDENTIALS });
  const [eligibilityAnswers, setEligibilityAnswers] = useState<Record<string, boolean>>({});
  const [eligibilityResult, setEligibilityResult] = useState<DonorEligibilityResult>('pending');
  const [emergencyResponse, setEmergencyResponse] = useState<DonorEmergencyResponse>('pending');
  const [travelMode, setTravelMode] = useState<DonorTravelMode | null>(null);
  const [journeyStatus, setJourneyStatus] = useState<DonorJourneyStatus>('idle');
  const [rewardPoints, setRewardPoints] = useState(INITIAL_DONOR_POINTS);
  const [donationHistory, setDonationHistory] = useState<DonationHistoryItem[]>(() => freshHistory());
  const [badges, setBadges] = useState<RewardBadge[]>(() => freshBadges());
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [newlyUnlockedBadgeNames, setNewlyUnlockedBadgeNames] = useState<string[]>([]);

  const resetJourney = useCallback(() => {
    setEmergencyResponse('pending');
    setTravelMode(null);
    setJourneyStatus('idle');
    setRewardPoints(INITIAL_DONOR_POINTS);
    setDonationHistory(freshHistory());
    setBadges(freshBadges());
    setPointsAwarded(0);
    setNewlyUnlockedBadgeNames([]);
  }, []);

  const loginDonor = useCallback((phone: string, password: string) => {
    const valid = phone.replace(/\D/g, '').slice(-10) === credentials.phone && password === credentials.password;
    if (!valid) return false;
    resetJourney();
    setEligibilityAnswers({});
    setEligibilityResult('pending');
    setIsAuthenticated(true);
    return true;
  }, [credentials, resetJourney]);

  const logoutDonor = useCallback(() => {
    resetJourney();
    setEligibilityAnswers({});
    setEligibilityResult('pending');
    setIsAuthenticated(false);
  }, [resetJourney]);

  const resetDonorDemo = useCallback(() => {
    resetJourney();
    setEligibilityAnswers(Object.fromEntries(ELIGIBILITY_QUESTIONS.map((question) => [question.id, question.safeDemoAnswer])));
    setEligibilityResult(isAuthenticated ? 'likely-eligible' : 'pending');
  }, [isAuthenticated, resetJourney]);

  const updateDonorPassword = useCallback((phone: string, password: string) => {
    setCredentials({ phone: phone.replace(/\D/g, '').slice(-10), password });
  }, []);

  const createDonorAccount = useCallback((
    phone: string,
    password: string,
    profilePatch: Pick<DonorProfile, 'bloodGroup' | 'email' | 'nightEmergencyVolunteer'>,
  ) => {
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    setCredentials({ phone: normalizedPhone, password });
    setProfile((current) => ({ ...current, ...profilePatch, phone: normalizedPhone }));
  }, []);

  const answerEligibilityQuestion = useCallback((id: string, answer: boolean) => {
    setEligibilityAnswers((current) => ({ ...current, [id]: answer }));
    setEligibilityResult('pending');
  }, []);

  const useDemoEligibleAnswers = useCallback(() => {
    setEligibilityAnswers(Object.fromEntries(ELIGIBILITY_QUESTIONS.map((question) => [question.id, question.safeDemoAnswer])));
    setEligibilityResult('likely-eligible');
  }, []);

  const submitEligibility = useCallback(() => {
    const allAnswered = ELIGIBILITY_QUESTIONS.every((question) => question.id in eligibilityAnswers);
    if (!allAnswered) return;
    const hasConcern = ELIGIBILITY_QUESTIONS.some(
      (question) => eligibilityAnswers[question.id] !== question.safeDemoAnswer,
    );
    setEligibilityResult(hasConcern ? 'review-required' : 'likely-eligible');
  }, [eligibilityAnswers]);

  const toggleEmergencyAvailability = useCallback(() => {
    setProfile((current) => ({ ...current, availableForEmergency: !current.availableForEmergency }));
  }, []);

  const toggleNightEmergency = useCallback(() => {
    setProfile((current) => ({ ...current, nightEmergencyVolunteer: !current.nightEmergencyVolunteer }));
  }, []);

  const respondToEmergency = useCallback((response: Exclude<DonorEmergencyResponse, 'pending'>) => {
    setEmergencyResponse(response);
    if (response === 'unavailable') {
      setTravelMode(null);
      setJourneyStatus('idle');
    }
  }, []);

  const resetEmergencyResponse = useCallback(() => {
    setEmergencyResponse('pending');
    setTravelMode(null);
    setJourneyStatus('idle');
  }, []);

  const chooseTravelMode = useCallback((mode: DonorTravelMode) => {
    setTravelMode(mode);
    setJourneyStatus('en-route');
  }, []);

  const markArrived = useCallback(() => setJourneyStatus('arrived'), []);
  const beginScreening = useCallback(() => setJourneyStatus('screening'), []);
  const clearScreening = useCallback(() => setJourneyStatus('screening-cleared'), []);

  const completeDonorDonation = useCallback(() => {
    if (journeyStatus !== 'screening-cleared') return;
    const nightBonus = DONOR_INCOMING_EMERGENCY.isNightEmergency && profile.nightEmergencyVolunteer
      ? NIGHT_EMERGENCY_BONUS_POINTS
      : 0;
    const earnedPoints = DONATION_BASE_POINTS + nightBonus;
    const historyItem: DonationHistoryItem = {
      id: 'dh-emergency-demo',
      date: '19 August 2026',
      facility: DONOR_INCOMING_EMERGENCY.hospitalName,
      bloodGroup: profile.bloodGroup,
      units: 1,
      status: 'Completed',
      rewardPoints: earnedPoints,
    };
    setRewardPoints((current) => current + earnedPoints);
    setDonationHistory((current) => [historyItem, ...current.filter((item) => item.id !== historyItem.id)]);
    setBadges((current) => current.map((badge) => {
      if (badge.id === 'emergency-hero' || badge.id === 'regular-donor') return { ...badge, unlocked: true };
      if (badge.id === 'night-responder' && nightBonus > 0) return { ...badge, unlocked: true };
      return badge;
    }));
    setNewlyUnlockedBadgeNames([
      'Emergency Hero',
      'Regular Donor',
      ...(nightBonus > 0 ? ['Night Responder'] : []),
    ]);
    setPointsAwarded(earnedPoints);
    setJourneyStatus('completed');
  }, [journeyStatus, profile.bloodGroup, profile.nightEmergencyVolunteer]);

  const value = useMemo<DonorState & DonorActions>(() => ({
    isAuthenticated,
    profile,
    eligibilityAnswers,
    eligibilityResult,
    emergencyResponse,
    travelMode,
    journeyStatus,
    rewardPoints,
    donationHistory,
    badges,
    pointsAwarded,
    newlyUnlockedBadgeNames,
    loginDonor,
    logoutDonor,
    resetDonorDemo,
    updateDonorPassword,
    createDonorAccount,
    answerEligibilityQuestion,
    useDemoEligibleAnswers,
    submitEligibility,
    toggleEmergencyAvailability,
    toggleNightEmergency,
    respondToEmergency,
    resetEmergencyResponse,
    chooseTravelMode,
    markArrived,
    beginScreening,
    clearScreening,
    completeDonorDonation,
  }), [
    isAuthenticated,
    profile,
    eligibilityAnswers,
    eligibilityResult,
    emergencyResponse,
    travelMode,
    journeyStatus,
    rewardPoints,
    donationHistory,
    badges,
    pointsAwarded,
    newlyUnlockedBadgeNames,
    loginDonor,
    logoutDonor,
    resetDonorDemo,
    updateDonorPassword,
    createDonorAccount,
    answerEligibilityQuestion,
    useDemoEligibleAnswers,
    submitEligibility,
    toggleEmergencyAvailability,
    toggleNightEmergency,
    respondToEmergency,
    resetEmergencyResponse,
    chooseTravelMode,
    markArrived,
    beginScreening,
    clearScreening,
    completeDonorDonation,
  ]);

  return <DonorContext.Provider value={value}>{children}</DonorContext.Provider>;
}

export function useDonor() {
  const context = useContext(DonorContext);
  if (!context) throw new Error('useDonor must be used inside <DonorProvider>');
  return context;
}
