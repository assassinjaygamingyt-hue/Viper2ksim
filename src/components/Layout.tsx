/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { Menu, X, ShieldAlert, Cpu, Award as AwardIcon, Users, RefreshCw, BarChart2, Radio, CalendarDays, ArrowLeftRight, Trophy } from 'lucide-react';
import { Team } from '../types';
import { renderLogo } from '../utils';
// @ts-ignore
import viperProfile from '../assets/images/viper_profile_1781873598030.jpg';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  teams: Team[];
  onTeamClick: (teamId: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  teams,
  onTeamClick,
  isAdminLoggedIn,
  onLogout,
  onOpenLogin
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock formatter
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Radio },
    { id: 'standings', label: 'Standings', icon: BarChart2 },
    { id: 'power-rankings', label: 'Power Rankings', icon: Cpu },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'trades', label: 'Trade Tracker', icon: ArrowLeftRight },
    { id: 'draft', label: 'Draft History', icon: CalendarDays },
    { id: 'awards', label: 'Awards', icon: AwardIcon },
    { id: 'championships', label: 'Championships', icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 font-sans text-gray-100 selection:bg-red-500 selection:text-white">
      {/* ESPORTS LEAGUE SCORE TICKER */}
      <div className="bg-red-700 text-white font-mono text-xs py-1.5 px-4 overflow-hidden select-none border-b border-red-800">
        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center">
          <span className="inline-flex items-center gap-1.5 font-bold text-yellow-300">
             Viper2kSim League Feed:
          </span>
          {teams.map((t, idx) => (
            <span
              key={t.id}
              onClick={() => {
                onTeamClick(t.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-yellow-300 cursor-pointer transition flex items-center gap-1.5"
            >
              {renderLogo(t.logo, "w-4 h-4 object-contain inline-block")}
              <span className="font-semibold uppercase">{t.abbrev}</span>
              <span className="text-gray-200">({t.wins}-{t.losses})</span>
              <span className="text-xs px-1 bg-red-900 rounded font-normal text-yellow-400">{t.streak}</span>
              {idx < teams.length - 1 && <span className="text-red-400 px-3 font-normal">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* MASTER NAVBAR */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow-xl glow-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* LOGALS BRAND & DESIGN */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.location.hash = '#/';
                }}
                className="flex items-center gap-2.5 group focus:outline-none"
                id="header-brand-logo"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center font-display font-extrabold text-white shadow-lg ring-2 ring-red-500/25 group-hover:scale-105 transition duration-200 overflow-hidden">
                  <img src={viperProfile} alt="Viper Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-left">
                  <span className="block font-display text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-red-400 bg-clip-text text-transparent group-hover:text-red-400 transition">
                    Viper2k<span className="text-red-500">Sim</span>
                  </span>
                  <span className="block text-[10px] tracking-widest text-[#f59e0b] font-mono leading-none font-bold uppercase">
                    Virtual NBA Hub
                  </span>
                </div>
              </button>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex space-x-1.5">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      window.location.hash = `#/${item.id === 'home' ? '' : item.id}`;
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md shadow-red-700/20'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* DESKTOP STATUS & AUTH BUTTONS */}
            <div className="hidden lg:flex items-center gap-4">
              {/* REAL-TIME TIME CLOCK */}
              <div className="font-mono text-xs text-amber-500 bg-gray-950/70 py-1.5 px-3 rounded-md border border-gray-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span>{currentTime || 'LOADING...'}</span>
              </div>

              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      window.location.hash = '#/admin';
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border flex items-center gap-1 cursor-pointer transition ${
                      activeTab === 'admin'
                        ? 'bg-amber-500 border-amber-500 text-gray-950 shadow-lg'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-gray-950'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin Active
                  </button>
                  <button
                     onClick={onLogout}
                     className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 bg-gray-950 hover:bg-gray-900 rounded-md transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-xs font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-lg transition shadow-md shadow-amber-500/10 transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Room
                </button>
              )}
            </div>

            {/* MOBILE ACCORDION BUTTON */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className={`p-2 rounded-lg border text-amber-500 cursor-pointer ${
                  isAdminLoggedIn ? 'bg-amber-500/10 border-amber-500/30' : 'bg-gray-900 border-gray-800'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-gray-400 hover:text-white bg-gray-800 border border-gray-700 cursor-pointer active:scale-95 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-OUT DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-800 p-4 transition-all duration-300">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      window.location.hash = `#/${item.id === 'home' ? '' : item.id}`;
                    }}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg font-medium text-sm text-left transition ${
                      isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                    {item.label}
                  </button>
                );
              })}

              <div className="h-px bg-gray-800 my-3"></div>

              {/* CLOCK OR ADMIN IN MOBILE MENU */}
              {isAdminLoggedIn ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setMobileMenuOpen(false);
                      window.location.hash = '#/admin';
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-amber-500 text-gray-950 font-bold rounded-lg text-sm transition"
                  >
                    <ShieldAlert className="w-4.5 h-4.5" />
                    Open Admin Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-950 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-sm transition"
                  >
                    Logout Admin Session
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold rounded-lg text-sm transition"
                >
                  <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
                  Admin Portal Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CORE WRAPPED CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* FOOTER BRIDGES */}
      <footer className="bg-gray-950 border-t border-gray-900 py-10 text-center text-xs text-gray-500 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐍</span>
            <span>Viper2kSim © 2026. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
