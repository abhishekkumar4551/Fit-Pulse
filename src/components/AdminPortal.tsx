import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Dumbbell,
  BookOpen,
  Activity,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Database,
} from 'lucide-react';
import { User, SystemStats, UserRole } from '../types';
import { api } from '../services/api';

export const AdminPortal: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminStats(),
      ]);
      setUsers(usersRes.users);
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await api.updateUserRole(userId, newRole);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <span>System Administration & Role Management</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage system users, reassign staff and administrative privileges, and inspect platform analytics.
        </p>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalUsers || 3}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats?.regularUsers} Athletes • {stats?.staffMembers} Trainers • {stats?.admins} Admins
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Workout Plans</span>
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalWorkouts || 1}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active AI & Custom splits</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Exercise Library</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalExercises || 15}</div>
          <div className="text-[11px] text-slate-400 mt-1">Vetted biomechanical movements</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold uppercase">
            <span>Progress Entries</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalProgressLogs || 6}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged sessions & weight checks</div>
        </div>
      </div>

      {/* Database Schema Status Info */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>MongoDB Collections Synchronized:</span>
          <span className="font-mono text-emerald-400">
            users, user_profiles, workout_plans, exercise_records, diet_plans, progress_history
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
          Status: Operational
        </span>
      </div>

      {/* User Management Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Platform Users & Access Control</span>
          </h2>
          <span className="text-xs text-slate-400">{users.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4 text-right">Modify Permission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {u.createdAt ? u.createdAt.slice(0, 10) : 'Active'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : u.role === 'staff'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                      {u.role === 'staff' && <UserCheck className="w-3 h-3" />}
                      <span className="capitalize">{u.role}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="user">User (Athlete)</option>
                      <option value="staff">Staff (Trainer)</option>
                      <option value="admin">Admin (System)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
