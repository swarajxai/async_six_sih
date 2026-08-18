import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  HOSPITAL,
  INITIAL_REQUEST_DRAFT,
  METRICS,
  RANKED_DONORS,
  RECENT_REQUESTS,
} from '../data/demoData';
import { rankCompatibleRedCellDonors } from '../utils/bloodCompatibility';
import type {
  BloodAvailabilityRecord,
  BloodBankPlan,
  Donor,
  DonorCoordination,
  EmergencyRequest,
  EmergencyRequestDraft,
  Hospital,
  UserRole,
} from '../types';

export type Stage =
  | 'login'
  | 'dashboard'
  | 'blood-availability'
  | 'request'
  | 'matching'
  | 'alerting'
  | 'coordination'
  | 'success';

interface DemoState {
  stage: Stage;
  role: UserRole;
  user: { displayName: string; hospital: Hospital } | null;
  requestDraft: EmergencyRequestDraft;
  bloodBankPlan: BloodBankPlan | null;
  activeRequest: EmergencyRequest | null;
  donors: Donor[];
  matchedDonors: Donor[];
  alertedDonorIds: string[];
  confirmedDonorIds: string[];
  standbyDonorIds: string[];
  failedDonorIds: string[];
  donorCoordination: Record<string, DonorCoordination>;
  replacementCount: number;
  replacementPending: boolean;
  coordinationStartTime: number | null;
  coordinationElapsedMs: number;
  alertProgress: { sent: number; total: number; lockedAt: number | null };
  donorModalDonorId: string | null;
  metrics: typeof METRICS;
  recentRequests: EmergencyRequest[];
}

interface DemoActions {
  loginAs: (role: UserRole) => void;
  logout: () => void;
  goTo: (stage: Stage) => void;
  updateRequestDraft: (patch: Partial<EmergencyRequestDraft>) => void;
  selectBloodBankPlan: (record: BloodAvailabilityRecord, units: number) => void;
  confirmBloodBankPlan: () => void;
  clearBloodBankPlan: () => void;
  openBloodAvailability: () => void;
  raiseRequest: () => void;
  startMatching: () => void;
  startAlerting: () => void;
  finishAlerting: () => void;
  simulateScreeningFailure: () => void;
  completeDonation: () => void;
  completeBloodBankCoverage: () => void;
  tickDonorEtas: () => void;
  tickCoordination: () => void;
  openDonorModal: (id: string) => void;
  closeDonorModal: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<(DemoState & DemoActions) | null>(null);

function buildFreshDonors(): Donor[] {
  return RANKED_DONORS.map((donor) => ({ ...donor, status: 'idle' }));
}

function getSecuredUnits(draft: EmergencyRequestDraft, plan: BloodBankPlan | null): number {
  if (!plan || plan.status !== 'secured' || plan.bloodGroup !== draft.bloodGroup) return 0;
  return Math.max(0, Math.min(draft.units, plan.unitsSecured));
}

function buildRequest(
  draft: EmergencyRequestDraft,
  plan: BloodBankPlan | null,
  status: EmergencyRequest['status'] = 'raised',
  raisedAt = Date.now(),
): EmergencyRequest {
  const units = Math.max(1, draft.units);
  const bloodBankUnitsSecured = getSecuredUnits({ ...draft, units }, plan);
  return {
    id: 'req-aarav-001',
    ...draft,
    units,
    hospitalId: HOSPITAL.id,
    hospitalName: HOSPITAL.name,
    location: HOSPITAL.location,
    bloodBankUnitsSecured,
    donorUnitsRequired: Math.max(0, units - bloodBankUnitsSecured),
    raisedAt,
    status,
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [stage, setStage] = useState<Stage>('login');
  const [role, setRole] = useState<UserRole>('hospital');
  const [requestDraft, setRequestDraft] = useState<EmergencyRequestDraft>({ ...INITIAL_REQUEST_DRAFT });
  const [bloodBankPlan, setBloodBankPlan] = useState<BloodBankPlan | null>(null);
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  const [donors, setDonors] = useState<Donor[]>(() => buildFreshDonors());
  const [matchedDonors, setMatchedDonors] = useState<Donor[]>([]);
  const [alertedDonorIds, setAlertedDonorIds] = useState<string[]>([]);
  const [confirmedDonorIds, setConfirmedDonorIds] = useState<string[]>([]);
  const [standbyDonorIds, setStandbyDonorIds] = useState<string[]>([]);
  const [failedDonorIds, setFailedDonorIds] = useState<string[]>([]);
  const [donorCoordination, setDonorCoordination] = useState<Record<string, DonorCoordination>>({});
  const [replacementCount, setReplacementCount] = useState(0);
  const [replacementPending, setReplacementPending] = useState(false);
  const [coordinationStartTime, setCoordinationStartTime] = useState<number | null>(null);
  const [coordinationElapsedMs, setCoordinationElapsedMs] = useState(0);
  const [alertProgress, setAlertProgress] = useState({ sent: 0, total: 0, lockedAt: null as number | null });
  const [donorModalDonorId, setDonorModalDonorId] = useState<string | null>(null);
  const [recentRequests, setRecentRequests] = useState<EmergencyRequest[]>(RECENT_REQUESTS);

  const alertTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const replacementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coordinationElapsedRef = useRef(0);

  const user = useMemo(
    () => (role === 'hospital' ? { displayName: HOSPITAL.name, hospital: HOSPITAL } : null),
    [role],
  );

  const clearAlertTimers = useCallback(() => {
    alertTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    alertTimeoutsRef.current = [];
  }, []);

  const clearReplacementTimer = useCallback(() => {
    if (replacementTimeoutRef.current) {
      clearTimeout(replacementTimeoutRef.current);
      replacementTimeoutRef.current = null;
    }
  }, []);

  const clearPendingTimers = useCallback(() => {
    clearAlertTimers();
    clearReplacementTimer();
  }, [clearAlertTimers, clearReplacementTimer]);

  useEffect(() => {
    if (location.pathname !== '/alerting') clearAlertTimers();
    if (location.pathname !== '/coordination') clearReplacementTimer();
  }, [location.pathname, clearAlertTimers, clearReplacementTimer]);

  useEffect(() => clearPendingTimers, [clearPendingTimers]);

  const resetDonorFlow = useCallback(() => {
    setDonors(buildFreshDonors());
    setMatchedDonors([]);
    setAlertedDonorIds([]);
    setConfirmedDonorIds([]);
    setStandbyDonorIds([]);
    setFailedDonorIds([]);
    setDonorCoordination({});
    setReplacementCount(0);
    setReplacementPending(false);
    setCoordinationStartTime(null);
    coordinationElapsedRef.current = 0;
    setCoordinationElapsedMs(0);
    setAlertProgress({ sent: 0, total: 0, lockedAt: null });
    setDonorModalDonorId(null);
  }, []);

  const resetEmergencyState = useCallback(() => {
    resetDonorFlow();
    setRequestDraft({ ...INITIAL_REQUEST_DRAFT });
    setBloodBankPlan(null);
    setActiveRequest(null);
  }, [resetDonorFlow]);

  const loginAs = useCallback((nextRole: UserRole) => {
    clearPendingTimers();
    setRole(nextRole);
    resetEmergencyState();
    setRecentRequests(RECENT_REQUESTS);
    setStage(nextRole === 'hospital' ? 'dashboard' : 'login');
  }, [clearPendingTimers, resetEmergencyState]);

  const logout = useCallback(() => {
    clearPendingTimers();
    resetEmergencyState();
    setStage('login');
  }, [clearPendingTimers, resetEmergencyState]);

  const goTo = useCallback((nextStage: Stage) => setStage(nextStage), []);

  const updateRequestDraft = useCallback((patch: Partial<EmergencyRequestDraft>) => {
    const nextDraft = {
      ...requestDraft,
      ...patch,
      units: Math.max(1, Number(patch.units ?? requestDraft.units)),
    };
    const nextPlan = bloodBankPlan?.bloodGroup === nextDraft.bloodGroup
      ? {
          ...bloodBankPlan,
          unitsPlanned: Math.min(nextDraft.units, bloodBankPlan.unitsPlanned),
          unitsSecured: Math.min(nextDraft.units, bloodBankPlan.unitsSecured),
        }
      : null;
    setRequestDraft(nextDraft);
    setBloodBankPlan(nextPlan);
    setActiveRequest((current) =>
      current ? buildRequest(nextDraft, nextPlan, current.status, current.raisedAt) : current
    );
  }, [requestDraft, bloodBankPlan]);

  const selectBloodBankPlan = useCallback((record: BloodAvailabilityRecord, units: number) => {
    const unitsPlanned = Math.max(1, Math.min(record.unitsAvailable, requestDraft.units, units));
    setBloodBankPlan({
      recordId: record.id,
      bloodBankId: record.bloodBankId,
      bloodBankName: record.bloodBankName,
      bloodGroup: record.bloodGroup,
      component: record.component,
      unitsPlanned,
      unitsSecured: 0,
      status: 'selected',
    });
  }, [requestDraft.units]);

  const confirmBloodBankPlan = useCallback(() => {
    setBloodBankPlan((current) =>
      current ? { ...current, unitsSecured: current.unitsPlanned, status: 'secured' } : current
    );
  }, []);

  const clearBloodBankPlan = useCallback(() => setBloodBankPlan(null), []);

  const openBloodAvailability = useCallback(() => {
    clearPendingTimers();
    setStage('blood-availability');
  }, [clearPendingTimers]);

  const raiseRequest = useCallback(() => {
    clearPendingTimers();
    resetDonorFlow();
    setActiveRequest(buildRequest(requestDraft, bloodBankPlan));
    setStage('request');
  }, [clearPendingTimers, resetDonorFlow, requestDraft, bloodBankPlan]);

  const startMatching = useCallback(() => {
    clearPendingTimers();
    resetDonorFlow();
    const request = activeRequest ?? buildRequest(requestDraft, bloodBankPlan);
    const ranked = rankCompatibleRedCellDonors(buildFreshDonors(), request.bloodGroup);
    setActiveRequest({ ...request, status: 'matching' });
    setMatchedDonors(ranked);
    setStage('matching');
  }, [clearPendingTimers, resetDonorFlow, activeRequest, requestDraft, bloodBankPlan]);

  const startAlerting = useCallback(() => {
    if (!activeRequest || activeRequest.donorUnitsRequired <= 0) return;
    clearAlertTimers();
    const candidates = matchedDonors.slice(0, 10);
    const candidateIds = candidates.map((donor) => donor.id);
    const confirmationIds = candidateIds.slice(0, activeRequest.donorUnitsRequired);
    const standbyIds = candidateIds.slice(activeRequest.donorUnitsRequired);

    setActiveRequest({ ...activeRequest, status: 'alerting' });
    setAlertedDonorIds(candidateIds);
    setDonors((current) =>
      current.map((donor) =>
        candidateIds.includes(donor.id) ? { ...donor, status: 'alert-sent' } : donor
      )
    );
    setAlertProgress({ sent: candidateIds.length, total: candidateIds.length, lockedAt: null });
    setStage('alerting');

    const viewingTimer = setTimeout(() => {
      setDonors((current) =>
        current.map((donor) =>
          candidateIds.includes(donor.id) ? { ...donor, status: 'viewing' } : donor
        )
      );
    }, 350);

    const confirmationTimers = confirmationIds.map((donorId, index) =>
      setTimeout(() => {
        setDonors((current) =>
          current.map((donor) => donor.id === donorId ? { ...donor, status: 'confirmed' } : donor)
        );
        setConfirmedDonorIds((current) => current.includes(donorId) ? current : [...current, donorId]);

        if (index === confirmationIds.length - 1) {
          setStandbyDonorIds(standbyIds);
          setDonors((current) =>
            current.map((donor) =>
              standbyIds.includes(donor.id) ? { ...donor, status: 'standby' } : donor
            )
          );
          setActiveRequest((current) => current ? { ...current, status: 'secured' } : current);
          setAlertProgress((current) => ({ ...current, lockedAt: Date.now() }));
        }
      }, (index + 1) * 800)
    );

    alertTimeoutsRef.current = [viewingTimer, ...confirmationTimers];
  }, [activeRequest, matchedDonors, clearAlertTimers]);

  const finishAlerting = useCallback(() => {
    if (!activeRequest || confirmedDonorIds.length < activeRequest.donorUnitsRequired) return;
    clearAlertTimers();
    const nextCoordination = Object.fromEntries(
      confirmedDonorIds.map((donorId) => {
        const donor = donors.find((item) => item.id === donorId)!;
        return [donorId, {
          donorId,
          etaSeconds: donor.etaMinutes * 60,
          travelMode: donor.travelMode,
          status: 'en-route' as const,
          isReplacement: false,
        }];
      })
    );
    setDonorCoordination(nextCoordination);
    setDonors((current) =>
      current.map((donor) => confirmedDonorIds.includes(donor.id) ? { ...donor, status: 'en-route' } : donor)
    );
    setActiveRequest({ ...activeRequest, status: 'coordination' });
    setCoordinationStartTime(Date.now());
    coordinationElapsedRef.current = 0;
    setCoordinationElapsedMs(0);
    setStage('coordination');
  }, [activeRequest, confirmedDonorIds, donors, clearAlertTimers]);

  const simulateScreeningFailure = useCallback(() => {
    if (replacementPending) return;
    const failedId = confirmedDonorIds[1] ?? confirmedDonorIds[0];
    const replacementId = standbyDonorIds[0];
    if (!failedId || !replacementId) return;

    clearReplacementTimer();
    setReplacementPending(true);
    setFailedDonorIds((current) => current.includes(failedId) ? current : [...current, failedId]);
    setConfirmedDonorIds((current) => current.filter((id) => id !== failedId));
    setDonors((current) =>
      current.map((donor) => donor.id === failedId ? { ...donor, status: 'screening-failed' } : donor)
    );
    setDonorCoordination((current) => ({
      ...current,
      [failedId]: { ...current[failedId], status: 'screening-failed' },
    }));

    replacementTimeoutRef.current = setTimeout(() => {
      replacementTimeoutRef.current = null;
      const replacement = donors.find((donor) => donor.id === replacementId);
      if (!replacement) return;
      setConfirmedDonorIds((current) => [...current, replacementId]);
      setStandbyDonorIds((current) => current.filter((id) => id !== replacementId));
      setDonors((current) =>
        current.map((donor) => donor.id === replacementId ? { ...donor, status: 'replacement-confirmed' } : donor)
      );
      setDonorCoordination((current) => ({
        ...current,
        [replacementId]: {
          donorId: replacementId,
          etaSeconds: replacement.etaMinutes * 60,
          travelMode: replacement.travelMode,
          status: 'en-route',
          isReplacement: true,
        },
      }));
      setReplacementCount((current) => current + 1);
      setReplacementPending(false);
    }, 1400);
  }, [replacementPending, confirmedDonorIds, standbyDonorIds, donors, clearReplacementTimer]);

  const tickDonorEtas = useCallback(() => {
    setDonorCoordination((current) => Object.fromEntries(
      Object.entries(current).map(([donorId, coordination]) => [
        donorId,
        coordination.status === 'screening-failed' || coordination.status === 'donated'
          ? coordination
          : { ...coordination, etaSeconds: Math.max(0, coordination.etaSeconds - 1) },
      ])
    ));
  }, []);

  const tickCoordination = useCallback(() => {
    coordinationElapsedRef.current += 1000;
    const elapsed = coordinationElapsedRef.current;
    setCoordinationElapsedMs(elapsed);
    setDonorCoordination((current) => Object.fromEntries(
      Object.entries(current).map(([donorId, coordination], index) => {
        if (coordination.status === 'screening-failed' || coordination.status === 'donated') {
          return [donorId, coordination];
        }
        const screeningAt = 2500 + index * 400;
        const readyAt = 4500 + index * 400;
        const status = elapsed >= readyAt ? 'ready' : elapsed >= screeningAt ? 'screening' : 'en-route';
        return [donorId, { ...coordination, status }];
      })
    ));
  }, []);

  const addCompletedRequest = useCallback((request: EmergencyRequest) => {
    setRecentRequests((current) => [request, ...current.filter((item) => item.id !== request.id)].slice(0, 4));
  }, []);

  const completeDonation = useCallback(() => {
    if (!activeRequest) return;
    clearPendingTimers();
    const completedRequest = { ...activeRequest, status: 'success' as const };
    setActiveRequest(completedRequest);
    setDonorCoordination((current) => Object.fromEntries(
      Object.entries(current).map(([donorId, coordination]) => [
        donorId,
        coordination.status === 'screening-failed' ? coordination : { ...coordination, status: 'donated' as const },
      ])
    ));
    setDonors((current) =>
      current.map((donor) => confirmedDonorIds.includes(donor.id) ? { ...donor, status: 'donated' } : donor)
    );
    addCompletedRequest(completedRequest);
    setStage('success');
  }, [activeRequest, confirmedDonorIds, clearPendingTimers, addCompletedRequest]);

  const completeBloodBankCoverage = useCallback(() => {
    clearPendingTimers();
    const request = activeRequest ?? buildRequest(requestDraft, bloodBankPlan);
    const completedRequest = { ...request, donorUnitsRequired: 0, status: 'success' as const };
    setActiveRequest(completedRequest);
    addCompletedRequest(completedRequest);
    setStage('success');
  }, [activeRequest, requestDraft, bloodBankPlan, clearPendingTimers, addCompletedRequest]);

  const openDonorModal = useCallback((id: string) => setDonorModalDonorId(id), []);
  const closeDonorModal = useCallback(() => setDonorModalDonorId(null), []);

  const resetDemo = useCallback(() => {
    clearPendingTimers();
    resetEmergencyState();
    setStage((current) => current === 'login' ? 'login' : 'dashboard');
  }, [clearPendingTimers, resetEmergencyState]);

  const value: DemoState & DemoActions = {
    stage,
    role,
    user,
    requestDraft,
    bloodBankPlan,
    activeRequest,
    donors,
    matchedDonors,
    alertedDonorIds,
    confirmedDonorIds,
    standbyDonorIds,
    failedDonorIds,
    donorCoordination,
    replacementCount,
    replacementPending,
    coordinationStartTime,
    coordinationElapsedMs,
    alertProgress,
    donorModalDonorId,
    metrics: METRICS,
    recentRequests,
    loginAs,
    logout,
    goTo,
    updateRequestDraft,
    selectBloodBankPlan,
    confirmBloodBankPlan,
    clearBloodBankPlan,
    openBloodAvailability,
    raiseRequest,
    startMatching,
    startAlerting,
    finishAlerting,
    simulateScreeningFailure,
    completeDonation,
    completeBloodBankCoverage,
    tickDonorEtas,
    tickCoordination,
    openDonorModal,
    closeDonorModal,
    resetDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside <DemoProvider>');
  return context;
}
