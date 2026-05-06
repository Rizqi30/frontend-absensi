import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

export interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex items-center flex-1 gap-4 lg:gap-8">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl lg:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>

        {/* Search Input */}
        <div className="hidden sm:flex max-w-md w-full relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full py-2.5 pl-10 pr-4 text-sm transition-all duration-300 bg-slate-100/70 border border-transparent rounded-2xl focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 focus:outline-none placeholder:text-slate-400 text-slate-900 shadow-sm hover:bg-slate-100/90"
            placeholder="Search for employees, attendance..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-4">
        {/* Mobile search toggle */}
        <button className="p-2 sm:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
          <Search size={20} />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Bell size={20} />
          <span className="absolute top-2 right-2 block w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white shadow-sm"></span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200/80 hidden sm:block mx-1"></div>

        {/* User Profile Dropdown Toggle */}
        <button className="flex items-center gap-2.5 p-1.5 pl-2 sm:pr-3 rounded-full hover:bg-slate-50 transition-colors border border-slate-200/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-inner">
            <User size={16} strokeWidth={2.5} />
          </div>
          <span className="hidden md:block text-sm font-semibold text-slate-700 mr-1">
            My Account
          </span>
        </button>
      </div>
    </header>
  );
};
