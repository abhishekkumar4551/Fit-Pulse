import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  MessageSquare,
  ClipboardList,
  Plus,
  Scale,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ClientOverview, TrainerNote } from '../types';
import { api } from '../services/api';

export const StaffPortal: React.FC = () => {
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Note Modal
  const [activeClient, setActiveClient] = useState<ClientOverview | null>(null);
  const [noteText, setNoteText] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.getStaffClients();
      setClients(res.clients);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !noteText) return;

    setSubmittingNote(true);
    try {
      await api.addTrainerNote({
        userId: activeClient.user.id,
        note: noteText,
        recommendation,
      });
      setActiveClient(null);
      setNoteText('');
      setRecommendation('');
      await fetchClients();
    } catch (err: any) {
      alert(err.message || 'Failed to submit trainer note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.user.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.profile?.fitnessGoal && c.profile.fitnessGoal.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-400" />
          <span>Staff & Trainer Coaching Portal</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review athlete records, inspect weight trends, and provide professional coaching advice and notes.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned athlete clients by name, email, or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading client roster...</div>
      ) : filteredClients.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
          No clients found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.user.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                      {client.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{client.user.name}</h3>
                      <p className="text-[11px] text-slate-400">{client.user.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Active Client
                  </span>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Goal</span>
                    <strong className="text-white text-xs">{client.profile?.fitnessGoal || 'General'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Weight</span>
                    <strong className="text-emerald-400 text-xs">
                      {client.latestWeight || client.profile?.weightKg || '70'} kg
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    Height: <strong className="text-slate-200">{client.profile?.heightCm || 175}cm</strong> • Age:{' '}
                    <strong className="text-slate-200">{client.profile?.age || 25}</strong>
                  </div>
                  <div>
                    Workouts Completed:{' '}
                    <strong className="text-emerald-400">{client.progressCount} sessions</strong>
                  </div>
                  <div>
                    Diet Preference:{' '}
                    <strong className="text-slate-200">{client.profile?.dietaryPreference || 'Non-Veg'}</strong>
                  </div>
                </div>

                {/* Latest Trainer Note if any */}
                {client.trainerNotes.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] space-y-1">
                    <div className="text-blue-300 font-semibold flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Latest Coach Feedback:</span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 italic">
                      "{client.trainerNotes[0].note}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveClient(client)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Coach Note & Advice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      {activeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>Coach Guidance for {activeClient.user.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Goal: {activeClient.profile?.fitnessGoal} • Weight: {activeClient.latestWeight} kg
              </p>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Coach Observations & Form Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Excellent progress on your squat depth this week. Keep elbows higher during front squats..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Recommendation (Nutrition / Load Overload)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Add 20g whey protein 30 minutes prior to leg day."
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveClient(null)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors disabled:opacity-50"
                >
                  {submittingNote ? 'Submitting...' : 'Save & Send to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
