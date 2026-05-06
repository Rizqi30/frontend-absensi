"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  History as HistoryIcon, 
  Settings,
  X 
} from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Departemen', href: '/departments', icon: Settings },
  { name: 'Karyawan', href: '/employees', icon: HistoryIcon },
  { name: 'Absensi', href: '/attendances', icon: CheckSquare },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200/70 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-20 px-6 lg:px-8 border-b border-slate-100/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <CheckSquare size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Absensi.
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full lg:hidden text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-white shadow-sm text-blue-600' : 'bg-transparent text-slate-400 group-hover:text-slate-600'
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile summary (bottom section) */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                JD
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">John Doe</span>
              <span className="text-xs text-slate-500 truncate">Frontend Developer</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
