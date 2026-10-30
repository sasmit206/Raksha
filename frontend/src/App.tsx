import { useState } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Telemetry } from './pages/Telemetry'
import { Anomalies } from './pages/Anomalies'
import { Patterns } from './pages/Patterns'
import { VMEnvironment } from './pages/VMEnvironment'
import { LiveMonitor } from './pages/LiveMonitor'
import { MLAnalysis } from './pages/MLAnalysis'
import { Experiments } from './pages/Experiments'
import { Recommendations } from './pages/Recommendations'
import { Reports } from './pages/Reports'
import { Honeytoken } from './pages/Honeytoken'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { SecurityAnalysis } from './pages/SecurityAnalysis'

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'Overview' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'Live Monitor' && <LiveMonitor />}
      {activeTab === 'Telemetry Explorer' && <Telemetry />}
      {activeTab === 'Anomalies' && <Anomalies />}
      {activeTab === 'Behavioral Patterns' && <Patterns />}
      {activeTab === 'ML Analysis' && <MLAnalysis />}
      {activeTab === 'Security & Time Analysis' && <SecurityAnalysis />}
      {activeTab === 'Experiments' && <Experiments setActiveTab={setActiveTab} />}
      {activeTab === 'Recommendations' && <Recommendations />}
      {activeTab === 'VM / Environment' && <VMEnvironment />}
      {activeTab === 'Session Integrity' && <Reports />}
      {activeTab === 'Deploy Honeytoken' && <Honeytoken />}
      {activeTab === 'Settings' && <Settings />}
    </MainLayout>
  )

}

export default App
