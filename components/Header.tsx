
import React from 'react';
import { SparklesIcon, UserIcon, LogoutIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';
import type { User } from '../types';

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-slate-900/70 dark:border-b dark:border-slate-800 shadow-sm backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-indigo-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Quick Cards
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
                <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">{user.username}</span>
            </div>
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Logout"
            >
              <LogoutIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};
