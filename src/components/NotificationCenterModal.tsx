import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Play,
  RotateCw,
  ExternalLink,
  Settings,
  Flame,
  Check,
} from 'lucide-react';
import { NotificationItem, NotificationSettings } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  settings: NotificationSettings | null;
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onUpdateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  onTriggerJob: () => Promise<void>;
  isTriggering: boolean;
  onStartWorkout: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  settings,
  onMarkRead,
  onMarkAllRead,
  onUpdateSettings,
  onTriggerJob,
  isTriggering,
  onStartWorkout,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<NotificationItem | null>(null);

  // Settings form state
  const [pushEnabled, setPushEnabled] = useState(settings?.pushEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(settings?.emailEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(settings?.reminderTime || '08:00');
  const [reminderDays, setReminderDays] = useState<string[]>(
    settings?.reminderDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      // If browser push was requested, request browser permission if supported
      if (pushEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }

      await onUpdateSettings({
        pushEnabled,
        emailEnabled,
        reminderTime,
        reminderDays,
        includeMotivationalQuote: true,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Daily Workout Reminders</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Automated background job sends push alerts & simulated email reminders for scheduled workouts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alerts & History ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Reminder Settings</span>
            </button>
          </div>

          {activeTab === 'notifications' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onTriggerJob}
                disabled={isTriggering}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all disabled:opacity-50"
                title="Runs the backend background job immediately"
              >
                {isTriggering ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Run Background Job Now</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'notifications' ? (
            notifications.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <Bell className="w-10 h-10 mx-auto text-slate-600" />
                <h4 className="text-sm font-bold text-white">No Workout Reminders Sent Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The backend background job checks daily at your scheduled reminder time (08:00 AM). You can trigger an instant test reminder right now!
                </p>
                <button
                  onClick={onTriggerJob}
                  disabled={isTriggering}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dispatch Test Workout Reminder</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => {
                  const isUnread = notif.status !== 'read';
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isUnread
                          ? 'bg-slate-950 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                              notif.channel === 'email'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {notif.channel === 'email' ? (
                              <Mail className="w-4 h-4" />
                            ) : (
                              <Smartphone className="w-4 h-4" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-white">{notif.title}</h4>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              )}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span>•</span>
                              <span className="capitalize text-emerald-400 font-semibold">
                                Channel: {notif.channel}
                              </span>
                              {notif.workoutDayName && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-300 font-medium">
                                    {notif.workoutDayName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {notif.emailDetails && (
                            <button
                              onClick={() => setSelectedEmailPreview(notif)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center gap-1"
                              title="Preview delivered HTML email"
                            >
                              <Mail className="w-3 h-3" />
                              <span>View Email</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onClose();
                              onStartWorkout();
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-slate-950" />
                            <span>Train</span>
                          </button>
                          {isUnread && (
                            <button
                              onClick={() => onMarkRead(notif.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Settings Tab */
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {settingsSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reminder preferences saved successfully!</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                  Notification Delivery Channels
                </h4>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">Browser Push Notifications</div>
                      <div className="text-[11px] text-slate-400">
                        Receive desktop & mobile push reminders when background worker triggers.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-bold text-white">Email Workout Reminders</div>
                      <div className="text-[11px] text-slate-400">
                        Dispatch formatted daily workout overview emails with exercises & calories.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
                  />
                </label>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                  Scheduled Reminder Time
                </h4>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400 text-[11px]">
                    Daily workout reminder dispatch time
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                  Active Reminder Days
                </h4>

                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => {
                    const isSelected = reminderDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Reminder Preferences'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Email Preview Drawer / Modal */}
        {selectedEmailPreview && selectedEmailPreview.emailDetails && (
          <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col p-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Delivered Email Preview
                </span>
                <h4 className="font-bold text-sm text-white mt-1">
                  {selectedEmailPreview.emailDetails.subject}
                </h4>
                <p className="text-[11px] text-slate-400">
                  To: {selectedEmailPreview.emailDetails.to} • Sent: {new Date(selectedEmailPreview.emailDetails.sentAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmailPreview(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Close Preview
              </button>
            </div>
            <div className="flex-1 bg-white rounded-xl overflow-y-auto p-4 border border-slate-700">
              <iframe
                title="Email Preview"
                srcDoc={selectedEmailPreview.emailDetails.htmlBody}
                className="w-full h-full border-0 min-h-[450px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
