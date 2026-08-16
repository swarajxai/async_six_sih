import { Navigate, Route, Routes } from 'react-router-dom';
import DemoBanner from './components/DemoBanner';
import DonorAlertModal from './components/DonorAlertModal';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmergencyRequestPage from './pages/EmergencyRequestPage';
import MatchingPage from './pages/MatchingPage';
import AlertingPage from './pages/AlertingPage';
import CoordinationPage from './pages/CoordinationPage';
import SuccessPage from './pages/SuccessPage';
import { useDemo } from './context/DemoContext';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { stage } = useDemo();
  if (stage === 'login') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request"
            element={
              <ProtectedRoute>
                <EmergencyRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matching"
            element={
              <ProtectedRoute>
                <MatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerting"
            element={
              <ProtectedRoute>
                <AlertingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordination"
            element={
              <ProtectedRoute>
                <CoordinationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <SuccessPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      <DonorAlertModal />
    </div>
  );
}
