import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getBreadcrumbs = (pathname: string) => {
    if (pathname === '/') return 'Workspace Overview';
    if (pathname.startsWith('/editor')) return 'Rich Post Composer';
    if (pathname.startsWith('/articles')) return 'Article Repository';
    if (pathname.startsWith('/media')) return 'Media & Imagery Repository';
    if (pathname.startsWith('/comments')) return 'Discussions & Moderation';
    if (pathname.startsWith('/subscribers')) return 'Readership Circulation';
    if (pathname.startsWith('/settings')) return 'Publication Settings';
    return 'Editorial CMS';
  };

  return (
    <div className="flex min-h-screen bg-[#fafbfc] text-slate-900">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Slider */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform bg-[#f8fafc] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} isMobile />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          breadcrumbs={getBreadcrumbs(location.pathname)}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          isMobileMenuOpen={mobileMenuOpen}
        />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
