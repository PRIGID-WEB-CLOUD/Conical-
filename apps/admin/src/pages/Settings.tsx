import React, { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { PublicationSettings } from '@chronicle/shared';
import { INITIAL_SETTINGS } from '@chronicle/shared';
import { Save, Check, Loader2 } from 'lucide-react';

export function SettingsPage() {
  const [settings, setSettings] = useState<PublicationSettings>(INITIAL_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      if (res.settings) setSettings(res.settings);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await adminApi.updateSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            System Settings &amp; Defaults
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Configure publication metadata, editorial preferences, and deployment environment.
          </p>
        </div>

        {saved && (
          <span className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Check className="h-3.5 w-3.5" />
            <span>Settings updated</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Metadata */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
            Publication Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Journal Name
              </label>
              <input
                type="text"
                value={settings.publicationName}
                onChange={(e) => setSettings({ ...settings, publicationName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Editorial Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
            Editorial Dispatches &amp; Notifications
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={settings.notifications.emailOnComment}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnComment: e.target.checked },
                  })
                }
                className="rounded text-indigo-900 focus:ring-0 mt-0.5"
              />
              <span>Email editorial board when a new reader comment is posted</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyDigest}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, weeklyDigest: e.target.checked },
                  })
                }
                className="rounded text-indigo-900 focus:ring-0 mt-0.5"
              />
              <span>Compile automated circulation metrics every Sunday</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#1e1b4b] hover:bg-indigo-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </main>
  );
}
