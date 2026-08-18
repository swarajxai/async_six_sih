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
  BLOOD_BANKS,
  HOSPITAL,
  INITIAL_REQUEST,
  METRICS,
  RANKED_DONORS,
  RECENT_REQUESTS,
} from '../data/demoData';
import type {
  BloodBank,
  Donor,
  EmergencyRequest,
  Hospital,
  UserRole,
} from '../types';

type Stage =
  | 'login'
  | 'dashboard'
  | 'request'
  | 'matching'
  | 'alerting'
  | 'coordination'
  | 'success';

interface DemoState {
  stage: Stage;
  role: UserRole;
  user: { displayName: string; hospital: Hospital } | null;
  activeRequest: EmergencyRequest | null;
  donors: Donor[];
  bloodBanks: BloodBank[];
  metrics: typeof METRICS;
  recentRequests: EmergencyRequest[];
  // coordination
  primaryDonorId: string | null;
  backupDonorId: string | null;
  screeningFailed: boolean;
  coordinationStartTime: number | null;
  coordinationElapsedMs: number;
  etaSeconds: number;
  alertProgress: { sent: number; total: number; lockedAt: number | null };
  // ui
  donorModalDonorId: string | null;
}

interface DemoActions {
  loginAs: (role: UserRole) => void;
  logout: () => void;
  goTo: (stage: Stage) => void;
  raiseRequest: () => void;
  startMatching: () => void;
  startAlerting: () => void;
  finishAlerting: () => void;
  setDonorStatus: (id: string, status: Donor['status']) => void;
  lockPrimaryDonor: (id: string) => void;
  activateBackupDonor: (id: string) => void;
  simulateScreeningFailure: () => void;
  completeDonation: () => void;
  tickEta: () => void;
  tickCoordination: () => void;
  openDonorModal: (id: string) => void;
  closeDonorModal: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<(DemoState & DemoActions) | null>(null);

const DEFAULT_PRIMARY_ID = 'd-1'; // Rahul Das
const DEFAULT_BACKUP_ID = 'd-2'; // Priya Sharma

function buildFreshDonors(): Donor[] {
  return RANKED_DONORS.map((d) => ({ ...d, status: 'idle' }));
}

function buildInitialRequest(): EmergencyRequest {
  return {
    ...INITIAL_REQUEST,
    raisedAt: Date.now(),
    status: 'raised',
  };
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [stage, setStage] = useState<Stage>('login');
  const [role, setRole] = useState<UserRole>('hospital');
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  const [donors, setDonors] = useState<Donor[]>(() => buildFreshDonors());
  const [primaryDonorId, setPrimaryDonorId] = useState<string | null>(null);
  const [backupDonorId, setBackupDonorId] = useState<string | null>(null);
  const [screeningFailed, setScreeningFailed] = useState(false);
  const [coordinationStartTime, setCoordinationStartTime] = useState<number | null>(null);
  const [coordinationElapsedMs, setCoordinationElapsedMs] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);
  const [alertProgress, setAlertProgress] = useState({ sent: 0, total: 0, lockedAt: null as number | null });
  const [donorModalDonorId, setDonorModalDonorId] = useState<string | null>(null);

  const user = useMemo(
    () => (role ? { displayName: HOSPITAL.name, hospital: HOSPITAL } : null),
    [role]
  );

  const alertTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const backupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAlertTimers = useCallback(() => {
    alertTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    alertTimeoutsRef.current = [];
  }, []);

  const clearBackupTimer = useCallback(() => {
    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
      backupTimeoutRef.current = null;
    }
  }, []);

  const clearPendingTimers = useCallback(() => {
    clearAlertTimers();
    clearBackupTimer();
  }, [clearAlertTimers, clearBackupTimer]);

  useEffect(() => {
    if (location.pathname !== '/alerting') clearAlertTimers();
    if (location.pathname !== '/coordination') clearBackupTimer();
  }, [location.pathname, clearAlertTimers, clearBackupTimer]);

  useEffect(() => {
    return clearPendingTimers;
  }, [clearPendingTimers]);

  const resetEmergencyState = useCallback(() => {
    setActiveRequest(null);
    setDonors(buildFreshDonors());
    setPrimaryDonorId(null);
    setBackupDonorId(null);
    setScreeningFailed(false);
    setCoordinationStartTime(null);
    setCoordinationElapsedMs(0);
    setEtaSeconds(0);
    setAlertProgress({ sent: 0, total: 0, lockedAt: null });
    setDonorModalDonorId(null);
  }, []);

  const loginAs = useCallback((next: UserRole) => {
    clearPendingTimers();
    setRole(next);
    resetEmergencyState();
    setStage('dashboard');
  }, [clearPendingTimers, resetEmergencyState]);

  const logout = useCallback(() => {
    clearPendingTimers();
    setStage('login');
    resetEmergencyState();
  }, [clearPendingTimers, resetEmergencyState]);

  const goTo = useCallback((next: Stage) => setStage(next), []);

  const raiseRequest = useCallback(() => {
    clearPendingTimers();
    resetEmergencyState();
    setActiveRequest(buildInitialRequest());
    setStage('request');
  }, [clearPendingTimers, resetEmergencyState]);

  const startMatching = useCallback(() => {
    clearPendingTimers();
    setActiveRequest((prev) => ({ ...(prev ?? buildInitialRequest()), status: 'matching' }));
    setDonors(buildFreshDonors());
    setPrimaryDonorId(null);
    setBackupDonorId(null);
    setScreeningFailed(false);
    setCoordinationStartTime(null);
    setCoordinationElapsedMs(0);
    setEtaSeconds(0);
    setAlertProgress({ sent: 0, total: 0, lockedAt: null });
    setStage('matching');
  }, [clearPendingTimers]);

  const startAlerting = useCallback(() => {
    if (!activeRequest) return;
    clearAlertTimers();
    setActiveRequest({ ...activeRequest, status: 'alerting' });
    // Mark all donors as alert-sent; a few will flip to viewing/confirmed/unavailable
    setDonors((prev) => prev.map((d) => ({ ...d, status: 'alert-sent' as const })));
    setAlertProgress({ sent: 10, total: 10, lockedAt: null });
    setStage('alerting');

    // Deterministic choreography (matches the brief exactly):
    // t=0.4s  -> donors 2,3,5,6,7,8,9,10 -> 'viewing'
    // t=0.7s  -> donor 4 (Sneha)        -> 'unavailable'
    // t=1.6s  -> donor 1 (Rahul)        -> 'viewing'
    // t=2.4s  -> donor 1 (Rahul)        -> 'confirmed'  -> lock primary
    const t1 = setTimeout(() => {
      setDonors((prev) =>
        prev.map((d) =>
          ['d-2', 'd-3', 'd-5', 'd-6', 'd-7', 'd-8', 'd-9', 'd-10'].includes(d.id)
            ? { ...d, status: 'viewing' }
            : d
        )
      );
    }, 400);
    const t2 = setTimeout(() => {
      setDonors((prev) =>
        prev.map((d) => (d.id === 'd-4' ? { ...d, available: false, status: 'unavailable' } : d))
      );
    }, 700);
    const t3 = setTimeout(() => {
      setDonors((prev) =>
        prev.map((d) => (d.id === 'd-1' ? { ...d, status: 'viewing' } : d))
      );
    }, 1600);
    const t4 = setTimeout(() => {
      setDonors((prev) =>
        prev.map((d) => {
          if (d.id === 'd-1') return { ...d, status: 'confirmed' };
          // Pause all other donors except d-4 (already unavailable)
          if (d.id === 'd-4') return d;
          return { ...d, status: 'paused' };
        })
      );
      setPrimaryDonorId(DEFAULT_PRIMARY_ID);
      setActiveRequest((prev) => (prev ? { ...prev, status: 'secured' } : prev));
      setAlertProgress((p) => ({ ...p, lockedAt: Date.now() }));
    }, 2400);

    alertTimeoutsRef.current = [t1, t2, t3, t4];
  }, [activeRequest, clearAlertTimers]);

  const finishAlerting = useCallback(() => {
    if (!activeRequest) return;
    clearAlertTimers();
    setActiveRequest({ ...activeRequest, status: 'coordination' });
    setCoordinationStartTime(Date.now());
    setEtaSeconds(12 * 60);
    setStage('coordination');
  }, [activeRequest, clearAlertTimers]);

  const setDonorStatus = useCallback((id: string, status: Donor['status']) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  }, []);

  const lockPrimaryDonor = useCallback((id: string) => {
    setPrimaryDonorId(id);
    setDonors((prev) =>
      prev.map((d) => {
        if (d.id === id) return { ...d, status: 'confirmed' };
        if (d.id === 'd-4') return d;
        return { ...d, status: 'paused' };
      })
    );
    setAlertProgress((p) => ({ ...p, lockedAt: Date.now() }));
  }, []);

  const activateBackupDonor = useCallback((id: string) => {
    setBackupDonorId(id);
    setDonors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'confirmed' } : d))
    );
    setEtaSeconds(16 * 60);
  }, []);

  const simulateScreeningFailure = useCallback(() => {
    clearBackupTimer();
    setScreeningFailed(true);
    // After a short delay, activate Priya Sharma as backup.
    backupTimeoutRef.current = setTimeout(() => {
      backupTimeoutRef.current = null;
      activateBackupDonor(DEFAULT_BACKUP_ID);
    }, 1400);
  }, [activateBackupDonor, clearBackupTimer]);

  const completeDonation = useCallback(() => {
    clearPendingTimers();
    if (!activeRequest) return;
    setActiveRequest({ ...activeRequest, status: 'success' });
    setStage('success');
  }, [activeRequest, clearPendingTimers]);

  const tickEta = useCallback(() => {
    setEtaSeconds((s) => (s > 0 ? s - 1 : 0));
  }, []);

  const tickCoordination = useCallback(() => {
    setCoordinationElapsedMs((prev) => prev + 1000);
  }, []);

  const openDonorModal = useCallback((id: string) => setDonorModalDonorId(id), []);
  const closeDonorModal = useCallback(() => setDonorModalDonorId(null), []);

  const resetDemo = useCallback(() => {
    clearPendingTimers();
    resetEmergencyState();
    setStage((current) => (current === 'login' ? 'login' : 'dashboard'));
  }, [clearPendingTimers, resetEmergencyState]);

  const value: DemoState & DemoActions = {
    stage,
    role,
    user,
    activeRequest,
    donors,
    bloodBanks: BLOOD_BANKS,
    metrics: METRICS,
    recentRequests: RECENT_REQUESTS,
    primaryDonorId,
    backupDonorId,
    screeningFailed,
    coordinationStartTime,
    coordinationElapsedMs,
    etaSeconds,
    alertProgress,
    donorModalDonorId,
    loginAs,
    logout,
    goTo,
    raiseRequest,
    startMatching,
    startAlerting,
    finishAlerting,
    setDonorStatus,
    lockPrimaryDonor,
    activateBackupDonor,
    simulateScreeningFailure,
    completeDonation,
    tickEta,
    tickCoordination,
    openDonorModal,
    closeDonorModal,
    resetDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}
