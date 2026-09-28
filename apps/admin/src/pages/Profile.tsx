import React, { useState, useRef } from 'react';
import { useAdminAuth } from '../context/admin-auth-context';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Key, 
  Building2, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Lock,
  Loader2,
  Sparkles,
  Upload,
  Trash2
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser } = useAdminAuth();
  const [displayName, setDisplayName] = useState(user?.name || 'Staff Administrator');
  const [department, setDepartment] = useState(user?.department || 'Critical Theory & Spatial Arts');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [bio, setBio] = useState(
    'Leading architectural longforms, editorial commissions, spatial investigations, and AI editorial workflows across Chronicle Publishing Company.'
  );
  const [saving, setSaving] = useState(false);
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const [passkeyNotice, setPasskeyNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setSaving(true);
    setShowSavedAlert(false);

    try {
      updateUser({
        name: displayName.trim(),
        department: department.trim(),
        avatar: avatarUrl || undefined,
      });
      await new Promise((r) => setTimeout(r, 400));
      setShowSavedAlert(true);
      setTimeout(() => setShowSavedAlert(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-3.5 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-serif text-3xl font-black shadow-lg ring-4 ring-white/10">
                {displayName.charAt(0) || 'A'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900 text-[10px] text-white font-bold" title="Active Staff">
              ✓
            </span>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {displayName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Staff Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {user?.email || 'admin@chronicle.press'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {department}
              </span>
            </p>
          </div>
        </div>
      </div>

      {showSavedAlert && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-900 text-xs sm:text-sm font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Profile image and details updated &amp; synchronized across the CMS.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif text-lg font-bold text-slate-900">Staff Profile &amp; Local Image Upload</h2>
            <p className="text-xs text-slate-500">Upload a local photo from your device for your staff avatar</p>
          </div>

          {/* Profile Image Local Upload Section */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-indigo-900" />
              Upload Profile Image (Local File)
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Choose Image from Device</span>
              </button>

              {avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Photo</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">No custom photo uploaded (using default initial avatar)</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Elena Vance"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Staff Email (Login ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'admin@chronicle.press'}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Role &amp; Permissions
              </label>
              <input
                type="text"
                disabled
                value={user?.role || 'Managing Editor'}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                Editorial Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Spatial Architecture & Research"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 transition-all font-medium"
              />
            </div>

            <div className="col-span-full space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Editorial Biography
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief editorial background for attributions and author spotlighting..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 transition-all font-normal leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Security & Credentials Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-900" />
                <span>Security &amp; Passkey Credentials</span>
              </h2>
              <p className="text-xs text-slate-500">Chronicle CMS uses session-based passkey authentication</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active Session
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Passkey Status</div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-600" />
                <span>Passkey Protected</span>
              </div>
              <button
                type="button"
                onClick={() => setPasskeyNotice(!passkeyNotice)}
                className="text-[11px] text-indigo-900 font-semibold hover:underline cursor-pointer"
              >
                {passkeyNotice ? 'Hide Passkey Info' : 'Show Passkey Info'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Staff Invitation Code</div>
              <div className="text-xs font-mono font-bold text-indigo-950">
                CHRONICLE-STAFF-2025
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Session Status</div>
              <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Verified Staff Token</span>
              </div>
            </div>
          </div>

          {passkeyNotice && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-700" />
                <span>Default Passkey Access</span>
              </div>
              <p className="text-indigo-800">
                You can sign in using <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-200">admin@chronicle.press</code> with passkey <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-indigo-200">admin123</code>.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-950 hover:bg-indigo-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
