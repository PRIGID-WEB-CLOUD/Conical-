import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileEdit,
  Settings,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Users,
  LogOut,
  ShieldCheck,
  X,
  Share2,
} from 'lucide-react';
import { useAdminAuth } from '../context/admin-auth-context';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

export function AdminSidebar({ onCloseMobile, isMobile }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Write Post', path: '/editor', icon: FileEdit },
    { label: 'Articles', path: '/articles', icon: FileText },
    { label: 'Media Library', path: '/media', icon: ImageIcon },
    { label: 'Comments', path: '/comments', icon: MessageSquare },
    { label: 'Subscribers', path: '/subscribers', icon: Users },
    { label: 'Channels & APIs', path: '/channels', icon: Share2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full max-h-screen border-r border-slate-200 bg-[#f8fafc] flex flex-col justify-between p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header & Mobile Close */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 px-2 py-1.5 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e1b4b] text-white font-serif font-bold text-lg shadow-xs">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base text-slate-900 leading-none">
                Chronicle
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-indigo-700 mt-0.5">
                Publishing CMS
              </span>
            </div>
          </Link>

          {isMobile && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors lg:hidden cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1e1b4b] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Authenticated Staff Card & Logout */}
      <div className="pt-4 mt-6 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Staff Seat
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        </div>

        {/* Interactive User Profile Link */}
        <Link
          to="/profile"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group"
          title="Account profile and settings"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-indigo-900/20 transition-all"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-950 transition-colors">
              {user?.name || 'Staff Administrator'}
            </div>
            <div className="text-[10px] text-slate-500 font-medium truncate">
              {user?.role || 'Managing Editor'}
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 py-2 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
