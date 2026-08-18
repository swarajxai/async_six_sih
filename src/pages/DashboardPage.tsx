import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Droplet, HeartPulse, Hospital, Plus, Search, Users } from 'lucide-react';
import Brand from '../components/Brand';
import MetricCard from '../components/MetricCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import EmergencyBadge from '../components/EmergencyBadge';
import { useDemo } from '../context/DemoContext';
import { formatElapsed } from '../utils/time';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
}

export default function DashboardPage() {
  const { metrics, recentRequests, user, raiseRequest, openBloodAvailability } = useDemo();
  const navigate = useNavigate();

  function onRaise() {
    raiseRequest();
    navigate('/request');
  }

  function onCheckAvailability() {
    openBloodAvailability();
    navigate('/blood-availability');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Brand size="md" showTagline />
          <div className="hidden sm:flex items-center gap-3 text-sm">
            <EmergencyBadge tone="green" dot>System Online</EmergencyBadge>
            <span className="text-slate-500">{user?.displayName ?? 'Hospital'}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Greeting */}
        <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              {greeting()},
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              VSS Medical College &amp; Hospital
            </h1>
            <p className="text-sm text-slate-500 mt-1">Burla, Sambalpur, Odisha</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <SecondaryButton size="lg" onClick={onCheckAvailability}>
              <Search size={18} /> Check Blood Availability
            </SecondaryButton>
            <PrimaryButton size="lg" onClick={onRaise}>
              <Plus size={18} /> Raise Emergency Request
            </PrimaryButton>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          <MetricCard
            icon={Activity}
            label="Active Emergencies"
            value={metrics.activeEmergencyRequests}
            hint="Across the network"
            tone="red"
          />
          <MetricCard
            icon={Users}
            label="Donors Nearby"
            value={metrics.donorsAvailableNearby}
            hint="Eligible and reachable"
            tone="navy"
          />
          <MetricCard
            icon={HeartPulse}
            label="Coordinations Today"
            value={metrics.successfulCoordinationsToday}
            hint="Successful matches"
            tone="green"
          />
        </section>

        <section className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-red-50 text-emergency"><Droplet size={20} /></div>
            <div>
              <h2 className="font-bold text-navy-900">Blood Bank Availability</h2>
              <p className="mt-1 text-sm text-slate-500">Check nearby PRBC stock first, then alert donors only for remaining units.</p>
            </div>
          </div>
          <SecondaryButton onClick={onCheckAvailability}>Check Availability <ArrowRight size={16} /></SecondaryButton>
        </section>

        {/* Recent Requests */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-navy-900">Recent Requests</h2>
            <div className="text-xs text-slate-500">Showing the last few hours</div>
          </div>
          <div className="rounded-2xl bg-white shadow-card ring-1 ring-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 sm:px-5 py-3">Patient</th>
                  <th className="text-left px-4 sm:px-5 py-3 hidden sm:table-cell">Blood</th>
                  <th className="text-left px-4 sm:px-5 py-3 hidden md:table-cell">Units</th>
                  <th className="text-left px-4 sm:px-5 py-3">Urgency</th>
                  <th className="text-left px-4 sm:px-5 py-3">Status</th>
                  <th className="text-right px-4 sm:px-5 py-3">Raised</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 sm:px-5 py-3 font-semibold text-navy-900">
                      <div className="flex items-center gap-2">
                        <Hospital size={14} className="text-slate-400" />
                        {r.patientName}
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-md bg-navy-900 text-white font-bold text-xs">
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 hidden md:table-cell text-slate-700">
                      {r.units}
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <EmergencyBadge
                        tone={
                          r.urgency === 'Critical'
                            ? 'red'
                            : r.urgency === 'High'
                              ? 'amber'
                              : 'navy'
                        }
                        dot
                      >
                        {r.urgency}
                      </EmergencyBadge>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <EmergencyBadge
                        tone={r.status === 'success' ? 'green' : r.status === 'coordination' ? 'navy' : 'slate'}
                      >
                        {r.status === 'success' ? 'Completed' : r.status === 'coordination' ? 'In Coordination' : r.status}
                      </EmergencyBadge>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-right text-slate-500 text-xs">
                      {timeAgo(r.raisedAt)} · {formatElapsed(Date.now() - r.raisedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
