
import React, { useState } from 'react';
import { Lock, TrendingUp, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      
      if (!email || !password) {
        setError('Please enter credentials');
        return;
      }

      // MOCK AUTHENTICATION LOGIC
      if (email.toLowerCase().includes('admin')) {
        // Login as Admin (Alex)
        onLogin({
          id: 'admin-1',
          name: 'Alex Mbauni',
          email: 'alex@mbauniprotocol.com',
          role: 'admin',
          subscriptionTier: 'elite',
          progress: 100
        });
      } else {
        // Login as Student (Dan)
        onLogin({
          id: 'student-1',
          name: 'Dan',
          email: email,
          role: 'student',
          subscriptionTier: 'professional', // Defaulting to Pro for demo
          progress: 35
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-trade-neon/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-blue-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md bg-trade-dark border border-gray-800 rounded-3xl p-8 relative z-10 shadow-2xl shadow-black/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800 mb-6 border border-gray-700">
            <TrendingUp className="h-8 w-8 text-trade-neon" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-400">Access the Mbauni Protocol Terminal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:border-trade-neon focus:ring-1 focus:ring-trade-neon outline-none transition"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:border-trade-neon focus:ring-1 focus:ring-trade-neon outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-trade-neon hover:bg-green-400 text-black font-black py-4 rounded-xl text-lg transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-trade-neon/20"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>Login to Portal <ArrowRight className="h-5 w-5" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" /> Demo Credentials
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-black/30 rounded cursor-pointer hover:bg-black/50 transition" onClick={() => {setEmail('admin@mbauni.com'); setPassword('admin123');}}>
                <span className="text-white font-mono">admin@mbauni.com</span>
                <span className="text-purple-400 text-xs font-bold px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">ADMIN</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/30 rounded cursor-pointer hover:bg-black/50 transition" onClick={() => {setEmail('dan@student.com'); setPassword('student123');}}>
                <span className="text-white font-mono">dan@student.com</span>
                <span className="text-trade-neon text-xs font-bold px-2 py-0.5 bg-trade-neon/10 rounded border border-trade-neon/20">STUDENT</span>
              </div>
            </div>
          </div>
          
          <button onClick={onBack} className="w-full mt-4 text-gray-500 text-sm hover:text-white transition">
            &larr; Back to Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
