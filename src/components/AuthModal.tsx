import React, { useState } from 'react';
import { LogIn, UserPlus, X, Lock, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'staff'>('user');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = async (roleType: 'user' | 'staff' | 'admin') => {
    setLoading(true);
    try {
      await demoLogin(roleType);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo switch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </div>
            <h3 className="text-lg font-bold text-white">
              {isRegister ? 'Create Your Athlete Account' : 'Welcome to FitPulse AI'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Fast Demonstration Accounts */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick 1-Click Evaluation Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('user')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-800 text-[11px] font-semibold transition-colors"
            >
              Athlete
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('staff')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-blue-500/20 text-slate-200 hover:text-blue-300 border border-slate-800 text-[11px] font-semibold transition-colors"
            >
              Coach Staff
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin')}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-purple-500/20 text-slate-200 hover:text-purple-300 border border-slate-800 text-[11px] font-semibold transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'staff')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="user">Athlete (Track workouts & diet)</option>
                <option value="staff">Staff / Coach (Manage athletes)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Create one now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
