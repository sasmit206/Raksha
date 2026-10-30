import { useState, useEffect } from 'react';
import { 
  Shield, Activity, Database, TriangleAlert, GitBranch, 
  BrainCircuit, ShieldCheck, Server, Target, FileText, Settings, FlaskConical, Bell, User, HelpCircle, FileDown, Sheet, Lock
} from 'lucide-react';
import Folder from '../components/Folder';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export function MainLayout({ children, activeTab, setActiveTab, onLogout }: MainLayoutProps) {
  const [dockerAvailable, setDockerAvailable] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data.dockerAvailable) setDockerAvailable(true);
      })
      .catch(() => {});
  }, []);

  const navigation = [
    {
      group: "MONITORING",
      items: [
        { name: 'Overview', icon: Shield },
        { name: 'Live Monitor', icon: Activity },
      ]
    },
    {
      group: "ANALYSIS",
      items: [
        { name: 'Telemetry Explorer', icon: Database },
        { name: 'Anomalies', icon: TriangleAlert },
        { name: 'Behavioral Patterns', icon: GitBranch },
        { name: 'ML Analysis', icon: BrainCircuit },
        { name: 'Security & Time Analysis', icon: Lock },
      ]
    },
    {
      group: "OPERATIONS",
      items: [
        { name: 'Experiments', icon: FlaskConical },
        { name: 'Recommendations', icon: ShieldCheck },
        { name: 'VM / Environment', icon: Server },
        { name: 'Deploy Honeytoken', icon: Target },
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { name: 'Session Integrity', icon: FileText },
        { name: 'Settings', icon: Settings },
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-[#0a0a0b] text-foreground flex font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-[#0a0a0b] flex flex-col flex-shrink-0 z-20">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 text-foreground font-bold tracking-tight text-lg">
            <Shield className="w-5 h-5 text-indigo-500" />
            RAKSHA
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 tracking-wider uppercase font-semibold">Adaptive Cyber Defense</p>
        </div>
        <nav className="flex-1 px-3 overflow-y-auto pb-4 custom-scrollbar">
          {navigation.map((section, sIdx) => (
            <div key={sIdx} className="mb-6">
              <h4 className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">
                {section.group}
              </h4>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-muted-foreground/70'}`} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-6 pb-6 pt-12 border-t border-border/40 text-[11px] text-muted-foreground flex items-end justify-between relative">
          <div>
            <div className="font-semibold text-foreground/80 mb-0.5">RAKSHA</div>
            <div>Version 1.0.0</div>
          </div>
          <div className="relative" style={{ zIndex: 50, marginBottom: '-10px', marginRight: '10px' }}>
            <Folder 
              size={0.85} 
              color="#4f46e5" 
              items={[
                <div 
                  key="1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob(['%PDF-1.4\n%EOF'], {type: 'application/pdf'}));
                    a.download = 'report.pdf';
                    a.click();
                  }}
                  className="flex flex-col items-center justify-center w-full h-full text-red-500 bg-white rounded shadow-sm border border-gray-200 cursor-pointer hover:bg-red-50"
                >
                  <FileDown className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">PDF</span>
                </div>,
                <div 
                  key="2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob(['id,status\n1,clean'], {type: 'text/csv'}));
                    a.download = 'report.csv';
                    a.click();
                  }}
                  className="flex flex-col items-center justify-center w-full h-full text-green-600 bg-white rounded shadow-sm border border-gray-200 cursor-pointer hover:bg-green-50"
                >
                  <Sheet className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">CSV</span>
                </div>,
                <div 
                  key="3" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob(['# Raksha Report'], {type: 'text/markdown'}));
                    a.download = 'report.md';
                    a.click();
                  }}
                  className="flex flex-col items-center justify-center w-full h-full text-blue-500 bg-white rounded shadow-sm border border-gray-200 cursor-pointer hover:bg-blue-50"
                >
                  <FileText className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">MD</span>
                </div>
              ]} 
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0e0e11]">
        {/* Topbar */}
        <header className="h-14 border-b border-border/40 bg-[#0a0a0b]/80 backdrop-blur flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[11px] font-bold tracking-wide border border-emerald-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              SYSTEM OPERATIONAL
            </div>
            
            {/* Micro Status */}
            <div className="hidden md:flex items-center gap-4 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                VM: <span className="text-foreground/80 font-medium">RAKSHA-01</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                Telemetry: <span className="text-foreground/80 font-medium">5/5 sources</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
                ML Engine: <span className="text-foreground/80 font-medium">READY</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {dockerAvailable && (
              <div title="Docker VM Engine Connected" className="flex items-center text-red-500 mr-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 14C4 14 5.5 15.5 8.5 15.5C11.5 15.5 13 14 13 14C13 14 14.5 15.5 17.5 15.5C20.5 15.5 22 14 22 14V17C22 17 20.5 18 17.5 18C14.5 18 13 17 13 17C13 17 11.5 18 8.5 18C5.5 18 4 17 4 17V14Z" opacity="0.3"/>
                  <path d="M22 11.5C22 11.5 19 8 13 8C12.5 8 12 8.1 11.5 8.3C10.5 6.5 8.5 5 6 5C5 5 4 6 4 7C4 9.5 5.5 11.5 7.7 12.5C7.3 12.8 6.7 13 6 13C4 13 2 11 2 11L2 14C2 14 3.5 15.5 6.5 15.5C9.5 15.5 11 14 11 14C11 14 12.5 15.5 15.5 15.5C18.5 15.5 20 14 20 14L22 11.5Z"/>
                  <circle cx="15" cy="11" r="1" fill="#111115"/>
                </svg>
              </div>
            )}
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-[#0a0a0b]"></span>
            </button>
            <div 
              onClick={onLogout}
              className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center border border-border/50 text-muted-foreground hover:text-foreground hover:border-red-500/50 hover:text-red-400 cursor-pointer transition-colors"
              title="Logout"
            >
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
