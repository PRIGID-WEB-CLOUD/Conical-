import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/admin-auth-context';
import {
  Bell,
  ShieldCheck,
  Menu,
  X,
  MessageSquare,
  Users,
  FileEdit,
  CheckCheck,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';

interface AdminHeaderProps {
  breadcrumbs?: string;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'comment' | 'subscriber' | 'draft' | 'security';
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Reader Commentary',
    description: 'Marcus Vance commented on "The Architecture of Silence"',
    time: '8 mins ago',
    unread: true,
    type: 'comment',
    link: '/comments',
  },
  {
    id: 'notif-2',
    title: 'Circulation Milestone',
    description: '420 new subscribers enrolled in the weekly architectural dispatch',
    time: '2 hours ago',
    unread: true,
    type: 'subscriber',
    link: '/subscribers',
  },
  {
    id: 'notif-3',
    title: 'Editorial Auto-Save',
    description: 'Cloud draft synchronization completed for Issue 14',
    time: '4 hours ago',
    unread: true,
    type: 'draft',
    link: '/editor',
  },
  {
    id: 'notif-4',
    title: 'Staff Security Audit',
    description: 'Hardware 2FA authentication verified for current session',
    time: '1 day ago',
    unread: false,
    type: 'security',
    link: '/settings',
  },
];

export function AdminHeader({
  breadcrumbs = 'Workspace Overview',
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-indigo-600" />;
      case 'subscriber':
        return <Users className="h-4 w-4 text-emerald-600" />;
      case 'draft':
        return <FileEdit className="h-4 w-4 text-amber-600" />;
      case 'security':
        return <Shield className="h-4 w-4 text-purple-600" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3.5 sm:px-6 lg:px-8 backdrop-blur-sm">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer shrink-0 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-900" />
            ) : (
              <Menu className="h-5 w-5 text-slate-900" />
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0">
            Chronicle CMS
          </span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none">
            {breadcrumbs}
          </span>
        </div>
      </div>

      {/* Right: Security Pill, Notifications & Interactive Staff Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Staff Enclave</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
            className={`relative rounded-xl p-2 transition-colors cursor-pointer border ${
              notificationsOpen
                ? 'bg-slate-100 border-slate-300 text-slate-900'
                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-950 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification items list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No new editorial alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) {
                          setNotificationsOpen(false);
                          navigate(n.link);
                        }
                      }}
                      className={`flex items-start gap-3 p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                        n.unread ? 'bg-indigo-50/30' : 'bg-white'
                      }`}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900 truncate">
                            {n.title}
                          </span>
                          {n.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {n.description}
                        </p>
                        <span className="block text-[10px] text-slate-400">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 bg-slate-50/60 p-2.5 text-center">
                <Link
                  to="/comments"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  View all editorial activity &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger & Dropdown */}
        <div className="relative pl-1.5 sm:pl-2 border-l border-slate-200" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className={`flex items-center gap-2 rounded-xl p-1.5 transition-colors cursor-pointer border ${
              userMenuOpen
                ? 'bg-slate-100 border-slate-300'
                : 'border-transparent hover:bg-slate-100'
            }`}
            aria-label="User Account Menu"
            aria-expanded={userMenuOpen}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 ring-1 ring-slate-100"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-[110px] leading-tight">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px] leading-tight">
                {user?.role || 'Managing Editor'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden sm:inline" />
          </button>

          {/* User Account Popover */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user?.name || 'Staff Administrator'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {user?.email || 'admin@chronicle.press'}
                    </div>
                    <span className="inline-block mt-1 rounded-md bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {user?.role || 'Managing Editor'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-2 space-y-0.5 text-xs font-medium text-slate-700">
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors font-semibold text-indigo-950"
                >
                  <ShieldCheck className="h-4 w-4 text-indigo-700" />
                  <span>Admin Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Publication Settings</span>
                </Link>

                <Link
                  to="/editor"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <FileEdit className="h-4 w-4 text-slate-500" />
                  <span>Draft Composer</span>
                </Link>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                    <span>View Public Journal</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Live</span>
                </a>
              </div>

              {/* Footer / Sign Out */}
              <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
