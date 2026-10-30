import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  BookOpen,
  Plus,
  Trash2,
  Dumbbell,
  Info,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { ExerciseRecord, UserRole } from '../types';
import { api } from '../services/api';

interface ExercisesViewProps {
  userRole?: UserRole;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({ userRole }) => {
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');

  // Exercise Detail Modal
  const [activeExercise, setActiveExercise] = useState<ExerciseRecord | null>(null);

  // Add Exercise Modal for Staff/Admin
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Chest');
  const [newExCategory, setNewExCategory] = useState('Strength');
  const [newExEquipment, setNewExEquipment] = useState('Barbell');
  const [newExDifficulty, setNewExDifficulty] = useState('Intermediate');
  const [newExPrimary, setNewExPrimary] = useState('');
  const [newExTips, setNewExTips] = useState('');
  const [newExInstructions, setNewExInstructions] = useState('');

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await api.getExercises({
        search: search || undefined,
        muscleGroup: selectedMuscle !== 'All' ? selectedMuscle : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        equipment: selectedEquipment !== 'All' ? selectedEquipment : undefined,
      });
      setExercises(res.exercises);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [search, selectedMuscle, selectedDifficulty, selectedEquipment]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName || !newExPrimary) return;

    try {
      await api.createExercise({
        name: newExName,
        muscleGroup: newExMuscle as any,
        category: newExCategory as any,
        equipment: newExEquipment as any,
        difficulty: newExDifficulty as any,
        primaryMuscle: newExPrimary,
        tips: newExTips,
        instructions: newExInstructions
          ? newExInstructions.split('\n').filter((l) => l.trim().length > 0)
          : ['Perform movement with controlled tempo.'],
        secondaryMuscles: [],
      });
      setShowAddModal(false);
      setNewExName('');
      setNewExPrimary('');
      setNewExTips('');
      setNewExInstructions('');
      fetchExercises();
    } catch (err: any) {
      alert(err.message || 'Failed to add exercise');
    }
  };

  const handleDeleteExercise = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the exercise database?`)) return;
    try {
      await api.deleteExercise(id);
      fetchExercises();
    } catch (err: any) {
      alert(err.message || 'Failed to delete exercise');
    }
  };

  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const equipments = ['All', 'Barbell', 'Dumbbells', 'Bodyweight', 'Cables', 'Machine'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span>Exercise Library & Technique Database</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search 30+ biomechanically vetted exercises with form cues, execution tips, and anatomical muscle mappings.
          </p>
        </div>

        {(userRole === 'staff' || userRole === 'admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Exercise</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exercises by name or anatomical muscle (e.g. Bench Press, Squats, Hamstrings)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 mr-2 text-[11px] font-semibold">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Muscle:</span>
          </div>
          {muscleGroups.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedMuscle === m
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Equipment
            </label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
            >
              {equipments.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No exercises matching criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ex.muscleGroup}
                    </span>
                    <h3 className="font-bold text-base text-white mt-1 group-hover:text-emerald-300 transition-colors">
                      {ex.name}
                    </h3>
                  </div>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleDeleteExercise(ex.id, ex.name)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {ex.equipment}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {ex.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {ex.category}
                  </span>
                </div>

                <div className="text-xs text-slate-300 line-clamp-2">
                  <strong className="text-slate-200">Target:</strong> {ex.primaryMuscle}
                  {ex.secondaryMuscles.length > 0 && ` (${ex.secondaryMuscles.join(', ')})`}
                </div>

                {ex.tips && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    "{ex.tips}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setActiveExercise(ex)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>View Step-by-Step Instructions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Detail Modal */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activeExercise.muscleGroup} • {activeExercise.difficulty}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{activeExercise.name}</h3>
                <p className="text-xs text-slate-400">
                  Equipment: {activeExercise.equipment} • Category: {activeExercise.category}
                </p>
              </div>
              <button
                onClick={() => setActiveExercise(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1.5">
                  Anatomical Muscle Targets
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div>
                    <strong className="text-emerald-400">Primary:</strong> {activeExercise.primaryMuscle}
                  </div>
                  {activeExercise.secondaryMuscles.length > 0 && (
                    <div className="text-slate-400">
                      <strong>Secondary:</strong> {activeExercise.secondaryMuscles.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-1.5">
                  Step-by-Step Technique Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {activeExercise.instructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {activeExercise.tips && (
                <div>
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] mb-1">
                    Coach Form Cue & Safety Tip
                  </h4>
                  <p className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 leading-relaxed">
                    💡 {activeExercise.tips}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveExercise(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal (Staff/Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add Exercise to Library</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExercise} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Hammer Curl"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Muscle Group</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {muscleGroups.filter((m) => m !== 'All').map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={newExDifficulty}
                    onChange={(e) => setNewExDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Equipment</label>
                  <select
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbells">Dumbbells</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Cables">Cables</option>
                    <option value="Machine">Machine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Muscle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brachialis"
                    value={newExPrimary}
                    onChange={(e) => setNewExPrimary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Instructions (One step per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Set bench to 45 degrees.&#10;Keep neutral grip throughout movement."
                  value={newExInstructions}
                  onChange={(e) => setNewExInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pro Tip / Safety Note</label>
                <input
                  type="text"
                  placeholder="e.g. Squeeze at the top of the contraction for 1 full second."
                  value={newExTips}
                  onChange={(e) => setNewExTips(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
