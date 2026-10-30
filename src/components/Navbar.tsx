import React, { useState } from 'react';
import {
  Flame,
  Dumbbell,
  Apple,
  TrendingUp,
  User,
  ShieldCheck,
  UserCheck,
  Moon,
  Sun,
  LogOut,
  LogIn,
  BookOpen,
  Menu,
  X,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  isDark,
  onToggleTheme,
  onOpenAuthModal,
  onOpenNotifications,
  unreadNotificationCount,
}) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Flame },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'exercises', label: 'Exercises', icon: BookOpen },
    { id: 'diet', label: 'Nutrition', icon: Apple },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (user?.role === 'staff' || user?.role === 'admin') {
    navItems.push({ id: 'staff', label: 'Staff Portal', icon: UserCheck });
  }

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  const handleRoleSwitch = async (role: UserRole) => {
    setRoleMenuOpen(false);
    await demoLogin(role);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950">
              <Flame className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  FitPulse
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Personalized Fitness Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  data-tab={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Quick Fast Role Switcher (For CSE college project evaluation & testing) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700/80 text-slate-200 hover:border-emerald-500/50 transition-colors shadow-sm"
                title="Switch role for demonstration"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    user?.role === 'admin'
                      ? 'bg-purple-400'
                      : user?.role === 'staff'
                      ? 'bg-blue-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="capitalize">{user?.role || 'Guest'}</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
                  Switch
                </span>
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-800 mb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Demo Role Switcher
                    </p>
                    <p className="text-[10px] text-slate-400">Instant login for project grading</p>
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('user')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold">User (Alex Mercer)</div>
                        <div className="text-[10px] text-slate-400">Regular athlete profile</div>
                      </div>
                    </div>
                    {user?.role === 'user' && <span className="text-emerald-400 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <div className="font-semibold">Staff (Coach Sarah)</div>
                        <div className="text-[10px] text-slate-400">Client trainer & assignments</div>
                      </div>
                    </div>
                    {user?.role === 'staff' && <span className="text-blue-400 text-xs">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <div className="font-semibold">Admin (System Admin)</div>
                        <div className="text-[10px] text-slate-400">Role manager & system stats</div>
                      </div>
                    </div>
                    {user?.role === 'admin' && <span className="text-purple-400 text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
              title="Daily Workout Reminders"
              aria-label="Workout Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-slate-950 ring-2 ring-slate-950 animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <button
                  onClick={() => onTabChange('profile')}
                  className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-200 hover:text-emerald-400 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[110px] truncate font-semibold">{user.name}</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm shadow-emerald-500/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
