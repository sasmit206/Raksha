import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import CodeSlots from '../components/CodeSlots';
import PixelCard from '../components/PixelCard';
import LogoPaths from '../components/LogoPaths';

export function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      setStatus('error');
      setError('Please enter a complete 6-digit secure PIN.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setTimeout(() => onLogin(data.access_token), 800); // Wait for success animation
        } else {
          setStatus('error');
          setError(data.detail || 'Login failed');
        }
      } else {
        const res = await fetch('http://localhost:8000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setTimeout(() => onLogin(data.access_token), 800); // Wait for success animation
        } else {
          setStatus('error');
          setError(data.detail || 'Registration failed');
        }
      }
    } catch (err) {
      setStatus('error');
      setError('Network error connecting to the server');
    }
    setLoading(false);
  };

  return (
    <PixelCard 
      className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 font-['Chakra_Petch'] overflow-hidden p-6 lg:p-12"
      gap={12} 
      speed={45} 
      colors="#4f46e5,#6366f1,#818cf8,#312e81,#4338ca,#1e1b4b"
    >
      
      {/* Left Column - Form Card */}
      <div className="w-full max-w-md lg:max-w-lg h-fit flex flex-col justify-between p-8 lg:p-12 relative z-10 bg-[#050505]/70 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-widest font-['Wallpoet']">RAKSHA</span>
          </div>
          <div className="hidden md:flex gap-4">
            <button className="px-4 py-1.5 border border-white/20 rounded-md text-xs font-bold tracking-wide hover:bg-white/10 transition-colors uppercase">Documentation</button>
            <button className="px-4 py-1.5 bg-white text-black rounded-md text-xs font-bold tracking-wide hover:bg-gray-200 transition-colors uppercase">Get Started</button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto mt-16 mb-auto">
          <div className="text-indigo-400/80 text-[11px] font-bold tracking-widest uppercase mb-6 flex items-center gap-3">
            01 / Authentication
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-normal mb-4 font-['Wallpoet'] font-normal opacity-90 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-white">
            {isLogin ? 'Authenticate' : 'Create account'}
          </h1>
          <p className="text-white/50 text-sm mb-12 leading-relaxed">
            Enter your operator ID and your 6-digit secure PIN to access the RAKSHA adaptive defense platform.
          </p>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold tracking-wide text-white/70 mb-2 uppercase">
                Operator ID
              </label>
              <input
                required
                type="text"
                value={username}
                placeholder="e.g. admin"
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors text-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wide text-white/70 mb-4 uppercase">
                Secure PIN
              </label>
              <div className="flex justify-start">
                <CodeSlots
                  length={6}
                  status={status}
                  mask={true}
                  onChange={(code: string) => {
                    setPassword(code);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  onComplete={async (code: string) => {
                    // Handled by form submission
                  }}
                  accentColor="#4f46e5"
                  inkColor="#ffffff"
                  slotColor="#111"
                  digitColor="#ffffff"
                  dangerColor="#ef4444"
                />
              </div>
            </div>

            {error && <div className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded border border-red-500/20">{error}</div>}

            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-lg shadow-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#050505] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Register Operator'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setStatus('idle');
                  setUsername('');
                  setPassword('');
                }}
                className="text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                {isLogin ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>
            
            <p className="text-[11px] text-white/40 mt-8 flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5" />
              Secure 256-bit encrypted connection.
            </p>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-[10px] text-white/30 font-medium tracking-wide uppercase">
          &copy; 2026 RAKSHA Cyber Defense.
        </div>
      </div>

      {/* Right Column - Logo Animation */}
      <div className="hidden lg:flex flex-1 max-w-3xl flex-col justify-center items-center px-8 relative">
          
          <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center">
            
            {/* Logo Reveal Container */}
            <div className="relative w-full max-w-xl aspect-square">
              {/* Layer 1: Hand-traced SVG Paths drawing themselves in white */}
              <LogoPaths />
            </div>
          </div>

          <style>{`
          `}</style>
        </div>

    </PixelCard>
  );
}
