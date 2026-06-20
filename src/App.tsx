/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AdminPanel from './components/AdminPanel';
import { Team, Player, NewsArticle, PowerRankingEntry, Trade, DraftResult, Award, ChampionshipRecord, TeamHistory, ModUser } from './types';
import { renderLogo } from './utils';
import {
  TrendingUp, Award as AwardIcon, Users, CalendarDays, ArrowLeftRight, Check, AlertTriangle,
  Flame, Mail, Lock, Sparkles, ChevronRight, BarChart2, Radio, MapPin, Trophy, Shield, Info, Landmark, Globe, Activity
} from 'lucide-react';
import { championshipsData } from './data/championships';
import { getTeamHistory } from './data/teamHistories';

export default function App() {
  // Database States
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [powerRankings, setPowerRankings] = useState<PowerRankingEntry[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [draftResults, setDraftResults] = useState<DraftResult[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [championships, setChampionships] = useState<ChampionshipRecord[]>([]);
  const [teamHistories, setTeamHistories] = useState<{ [key: string]: TeamHistory }>({});
  const [users, setUsers] = useState<ModUser[]>([]);

  // Navigation and Interactive State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedDraftYear, setSelectedDraftYear] = useState<number>(2003);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState<Player | null>(null);
  const [teamSubTab, setTeamSubTab] = useState<'roster' | 'history' | 'news'>('roster');

  // Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    username: string;
    role: 'admin' | 'mod';
    permissions: {
      editHistory: boolean;
      editDrafts: boolean;
      editRosters: boolean;
    };
  } | null>(null);

  // Standings filter state & Standings sort order
  const [standingsTab, setStandingsTab] = useState<'all' | 'East' | 'West'>('East');
  const [standingsSort, setStandingsSort] = useState<'pct' | 'wins' | 'ptsFor' | 'ptsAgainst'>('pct');

  // Helper to format team banner styles safely
  const getBannerStyle = (banner: string | undefined): string => {
    if (!banner) return 'linear-gradient(to right, #111827, #1f2937)';
    if (banner.startsWith('url(') || banner.includes('gradient')) return banner;
    return `url("${banner}")`;
  };

  // State for branding modal edit
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [brandingForm, setBrandingForm] = useState({
    id: '',
    name: '',
    abbrev: '',
    logo: '',
    banner: '',
    gmInstagram: '',
    retiredJerseys: ''
  });
  const [brandingError, setBrandingError] = useState('');
  const [brandingSuccess, setBrandingSuccess] = useState('');

  const openBrandingModal = (team: Team) => {
    setBrandingForm({
      id: team.id,
      name: team.name,
      abbrev: team.abbrev,
      logo: team.logo || '',
      banner: team.banner || '',
      gmInstagram: team.gmInstagram || '',
      retiredJerseys: team.retiredJerseys || ''
    });
    setBrandingError('');
    setBrandingSuccess('');
    setIsBrandingModalOpen(true);
  };

  const handleBrandingLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandingForm(prev => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandingForm(prev => ({ ...prev, banner: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandingForm.id) return;
    try {
      setBrandingError('');
      setBrandingSuccess('');
      const resp = await fetch(`/api/teams/${brandingForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brandingForm.name,
          abbrev: brandingForm.abbrev,
          logo: brandingForm.logo,
          banner: brandingForm.banner,
          gmInstagram: brandingForm.gmInstagram,
          retiredJerseys: brandingForm.retiredJerseys
        })
      });
      if (!resp.ok) throw new Error('Failed to update team visual branding.');
      setBrandingSuccess('Branding updated successfully! Syncing...');
      fetchDB();
      setTimeout(() => {
        setIsBrandingModalOpen(false);
      }, 800);
    } catch (err: any) {
      setBrandingError(err.message || 'Error occurred while saving.');
    }
  };

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // 1. Fetch entire database state from server
  const fetchDB = async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/db');
      if (!resp.ok) throw new Error('Failed to retrieve league database.');
      const data = await resp.json();

      setTeams(data.teams || []);
      setPlayers(data.players || []);
      setNews(data.news || []);
      setPowerRankings(data.powerRankings || []);
      setTrades(data.trades || []);
      setDraftResults(data.draftResults || []);
      setAwards(data.awards || []);
      setChampionships(data.championships || []);
      setTeamHistories(data.teamHistories || {});
      setUsers(data.users || []);

      if (data.draftResults && data.draftResults.length > 0) {
        const years = data.draftResults.map((dr: any) => dr.year);
        const maxYear = Math.max(...years);
        setSelectedDraftYear((curr) => {
          return years.includes(curr) ? curr : maxYear;
        });
      }
    } catch (err) {
      console.error('Database connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDB();

    // Recover login session
    const token = localStorage.getItem('viper_admin_token');
    const savedUser = localStorage.getItem('viper_current_user');
    if (token && savedUser) {
      setIsAdminLoggedIn(true);
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        setCurrentUser({
          username: 'admin',
          role: 'admin',
          permissions: { editHistory: true, editDrafts: true, editRosters: true }
        });
      }
    } else if (token === 'viper-session-super-token-99824') {
      setIsAdminLoggedIn(true);
      setCurrentUser({
        username: 'admin',
        role: 'admin',
        permissions: { editHistory: true, editDrafts: true, editRosters: true }
      });
    }
  }, []);

  // 2. Hash Routing Integration (supports back-button & deep linkages safely)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/team/')) {
        const teamId = hash.replace('#/team/', '');
        setSelectedTeamId(teamId);
        setActiveTab('team-page');
      } else if (hash === '#/standings') {
        setActiveTab('standings');
      } else if (hash === '#/power-rankings') {
        setActiveTab('power-rankings');
      } else if (hash === '#/teams') {
        setActiveTab('teams');
      } else if (hash === '#/trades') {
        setActiveTab('trades');
      } else if (hash === '#/draft') {
        setActiveTab('draft');
      } else if (hash === '#/awards') {
        setActiveTab('awards');
      } else if (hash === '#/admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial call
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. Login Flow
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: adminPassword })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Access denied.');
      }

      localStorage.setItem('viper_admin_token', data.token);
      localStorage.setItem('viper_current_user', JSON.stringify(data.user));
      setIsAdminLoggedIn(true);
      setCurrentUser(data.user);
      setLoginModalOpen(false);
      setAdminPassword('');
      setLoginUsername('');
      setActiveTab('admin');
      window.location.hash = '#/admin';
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('viper_admin_token');
    localStorage.removeItem('viper_current_user');
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setActiveTab('home');
    window.location.hash = '#/';
  };

  // Helper: Click specific team logo -> jump to Team Page
  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setTeamSubTab('roster');
    setActiveTab('team-page');
    window.location.hash = `#/team/${teamId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayerClick = (playerName: string, teamIdHint?: string) => {
    // 1. Try to find player in registered team rosters
    let found = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    // 2. Fall back to deep historical simulation metadata for legacy award recipients
    if (!found) {
      const normalizedName = playerName.toLowerCase();
      let position: 'PG' | 'SG' | 'SF' | 'PF' | 'C' = 'SF';
      let age = 36;
      let rating = 96;
      let awardsList = ["Historical NBA Legend", "All-Star Veteran Member", "Multi-Time Champion"];
      let teamId = teamIdHint || "historical";
      
      if (normalizedName.includes("garnett")) {
        position = "PF"; age = 28; rating = 97; teamId = "minnesota-timberwolves";
        awardsList = ["2003-04 NBA MVP", "2003-04 All-Defensive First Team", "NBA All-Star Selection", "Minnesota Franchise Anchor"];
      } else if (normalizedName.includes("billups")) {
        position = "PG"; age = 27; rating = 89; teamId = "detroit-pistons";
        awardsList = ["2003-04 Finals MVP", "NBA Champion (2004)", "All-Defensive Second Team"];
      } else if (normalizedName.includes("artest")) {
        position = "SF"; age = 24; rating = 90; teamId = "indiana-pacers";
        awardsList = ["2003-04 Defensive Player of the Year (DPOY)", "NBA Champion", "Perimeter Stopper Elite"];
      } else if (normalizedName.includes("lebron") || normalizedName.includes("james")) {
        position = "SF"; age = 19; rating = 86; teamId = "cleveland-cavaliers";
        awardsList = ["2003-04 Rookie of the Year (ROTY)", "NBA All-Rookie First Team", "Future Franchise King"];
      } else if (normalizedName.includes("oneal") || normalizedName.includes("o'neal")) {
        position = "C"; age = 32; rating = 96; teamId = "los-angeles-lakers";
        awardsList = ["3x NBA Finals MVP", "3x NBA Champion (2000, 2001, 2002)", "1999-00 NBA MVP", "NBA Scoring Champion"];
      } else if (normalizedName.includes("duncan")) {
        position = "PF"; age = 28; rating = 98; teamId = "san-antonio-spurs";
        awardsList = ["2x NBA MVP (2002, 2003)", "2x NBA Finals MVP (1999, 2003)", "2x NBA Champion", "All-Defensive First Team"];
      } else if (normalizedName.includes("jordan")) {
        position = "SG"; age = 41; rating = 99; teamId = "chicago-bulls";
        awardsList = ["6x NBA Champion", "6x Finals MVP (FMVP)", "5x NBA MVP", "10x Scoring Champion", "Chicago Bulls All-Time Great"];
      } else if (normalizedName.includes("olajuwon")) {
        position = "C"; age = 41; rating = 98; teamId = "houston-rockets";
        awardsList = ["2x NBA Champion (1994, 1995)", "2x Finals MVP (FMVP)", "1993-94 NBA MVP", "2x Defensive Player of the Year"];
      } else if (normalizedName.includes("thomas") && normalizedName.includes("isiah")) {
        position = "PG"; age = 43; rating = 94; teamId = "detroit-pistons";
        awardsList = ["2x NBA Champion (1989, 1990)", "1989-90 Finals MVP (FMVP)", "12x NBA All-Star"];
      } else if (normalizedName.includes("miller") && normalizedName.includes("reggie")) {
        position = "SG"; age = 38; rating = 88; teamId = "indiana-pacers";
        awardsList = ["Indiana Pacers Franchise Icon", "5x NBA All-Star Selection", "Clutch Shooter Legend", "All-Time Three-Points Leader"];
      } else if (normalizedName.includes("iverson")) {
        position = "SG"; age = 29; rating = 93; teamId = "philadelphia-76ers";
        awardsList = ["2000-01 NBA MVP", "4x Scoring Champion", "Philadelphia Icon", "6x All-Star"];
      } else if (normalizedName.includes("bryant") || normalizedName.includes("kobe")) {
        position = "SG"; age = 25; rating = 97; teamId = "los-angeles-lakers";
        awardsList = ["3x NBA Champion (2000, 2001, 2002)", "8x All-Star Selection", "All-Defensive First Team", "All-NBA First Team"];
      } else if (normalizedName.includes("nash")) {
        position = "PG"; age = 30; rating = 91; teamId = "dallas-mavericks";
        awardsList = ["NBA All-Star", "Dallas Mavericks Twin-Engine Engine", "Elite Passer"];
      } else if (normalizedName.includes("nowitzki") || normalizedName.includes("dirk")) {
        position = "PF"; age = 25; rating = 92; teamId = "dallas-mavericks";
        awardsList = ["3x NBA All-Star", "Dallas Mavericks Franchise Cornerstone", "All-NBA Second Team"];
      } else if (normalizedName.includes("wade")) {
        position = "SG"; age = 22; rating = 83; teamId = "miami-heat";
        awardsList = ["2003-04 NBA All-Rookie First Team", "Miami Rising Star"];
      } else if (normalizedName.includes("malone") && normalizedName.includes("karl")) {
        position = "PF"; age = 40; rating = 89; teamId = "los-angeles-lakers";
        awardsList = ["2x NBA MVP (1997, 1999)", "14x All-Star Selection", "All-Time Elite Scorer"];
      } else if (normalizedName.includes("stockton")) {
        position = "PG"; age = 42; rating = 90; teamId = "utah-jazz";
        awardsList = ["All-Time Assists Leader", "All-Time Steals Leader", "10x All-Star Selection", "Utah Jazz Icon"];
      }
      
      found = {
        id: 'hist-' + playerName.replace(/\s+/g, '-').toLowerCase(),
        name: playerName,
        teamId,
        position,
        age,
        rating,
        contract: 'Historical Legend / Legacy Contract',
        isHOF: false,
        isRetired: true,
        careerAwards: awardsList
      };
    }
    
    setSelectedPlayerModal(found);
  };

  // Helper calculations for standings
  const getSortedTeams = () => {
    let filtered = [...teams];
    if (standingsTab !== 'all') {
      filtered = filtered.filter(t => t.conference === standingsTab);
    }

    return filtered.sort((a, b) => {
      const pctA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
      const pctB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;

      if (standingsSort === 'pct') {
        if (pctB !== pctA) return pctB - pctA;
        return b.wins - a.wins; // tiebreaker
      }
      if (standingsSort === 'wins') {
        return b.wins - a.wins;
      }
      if (standingsSort === 'ptsFor') {
        return b.ptsFor - a.ptsFor;
      }
      if (standingsSort === 'ptsAgainst') {
        return a.ptsAgainst - b.ptsAgainst; // lower is better
      }
      return 0;
    });
  };

  // Division leadership calculations
  const getDivisionLeader = (divisionName: string) => {
    const divTeams = teams.filter(t => t.division.toLowerCase() === divisionName.toLowerCase());
    if (divTeams.length === 0) return null;
    return divTeams.sort((a, b) => {
      const pctA = a.wins / (a.wins + a.losses || 1);
      const pctB = b.wins / (b.wins + b.losses || 1);
      return pctB - pctA;
    })[0];
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab === 'home') window.location.hash = '#/';
        else window.location.hash = `#/${tab}`;
      }}
      teams={teams}
      onTeamClick={handleTeamClick}
      isAdminLoggedIn={isAdminLoggedIn}
      onLogout={handleLogout}
      onOpenLogin={() => setLoginModalOpen(true)}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent animate-spin rounded-full"></div>
          <p className="mt-4 font-mono text-xs text-gray-400 uppercase tracking-widest animate-pulse">
            Connecting To Simulator Core...
          </p>
        </div>
      ) : (
        <>
          {/* =================================================================== */}
          {/* 1. PUBLIC HOME VIEW */}
          {/* =================================================================== */}
          {activeTab === 'home' && (
            <div className="space-y-12 animate-fade-in-slow">
              {/* BRAND HERO HIGHLIGHT */}
              <section className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-amber-500/5 to-transparent z-0"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 p-8 sm:p-12 items-center gap-8">
                  <div className="lg:col-span-7 space-y-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 rounded-full">
                      <Flame className="w-3.5 h-3.5" /> Live Simulation Season State
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight leading-none text-white">
                      The Simulation League <br />
                      Built For <span className="text-red-500 bg-red-500/10 px-2 rounded">Vipers</span>
                    </h1>
                    <p className="text-base text-gray-300 leading-relaxed max-w-xl">
                      Experience professional basketball in the virtual realm. Track custom franchises, player rosters, trades, and college draft history. Powered by the Viper2k Simulator.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => { setActiveTab('standings'); window.location.hash = '#/standings'; }}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 font-bold rounded-lg text-sm transition transform active:scale-95 cursor-pointer shadow-lg shadow-red-600/20"
                      >
                        Explore Standings
                      </button>
                      <button
                        onClick={() => { setActiveTab('power-rankings'); window.location.hash = '#/power-rankings'; }}
                        className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 font-semibold rounded-lg text-sm transition text-gray-200 cursor-pointer"
                      >
                        Power Rankings
                      </button>
                    </div>
                  </div>

                  {/* MINI DIVISION STANDINGS SUMMARY */}
                  <div className="lg:col-span-5 bg-gray-950/80 p-6 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-850 pb-2.5">
                      <span className="font-display font-bold text-sm text-gray-200 tracking-tight">DIVISION LEADERS</span>
                      <span className="font-mono text-[10px] text-amber-500 font-bold uppercase tracking-widest">Live Form</span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { div: 'Central Division', icon: '🛡️' },
                        { div: 'Pacific Division', icon: '🔥' },
                        { div: 'Atlantic Division', icon: '⚔️' },
                        { div: 'Midwest Division', icon: '🏔️' }
                      ].map(item => {
                        const leader = getDivisionLeader(item.div);
                        return (
                          <div
                            key={item.div}
                            onClick={() => leader && handleTeamClick(leader.id)}
                            className="flex justify-between items-center p-2.5 rounded-lg bg-gray-900/50 hover:bg-gray-900 border border-transparent hover:border-gray-800 cursor-pointer transition"
                          >
                            <div className="flex items-center gap-2">
                              {leader ? renderLogo(leader.logo, "w-6 h-6 object-contain rounded") : <span className="text-lg">{item.icon}</span>}
                              <div>
                                <span className="block font-bold text-xs text-gray-200 leading-tight">
                                  {leader?.name || 'Unclaimed'}
                                </span>
                                <span className="block text-[9px] text-gray-400 font-mono font-medium uppercase mt-0.5">
                                  {item.div}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-xs text-amber-500 leading-none">
                                {leader ? `${leader.wins}-${leader.losses}` : '0-0'}
                              </span>
                              <span className="block text-[9px] text-green-400 font-semibold font-mono leading-none mt-0.5 uppercase">
                                {leader?.streak || 'None'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* RECENT NEWS CAROUSEL CARDS */}
              <section className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-display font-black tracking-tight text-white">BREAKING LEAGUE NEWS</h2>
                    <p className="text-xs text-gray-400 font-mono">Live updates, injuries, roster trades, and simulation recaps</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {news.slice(0, 3).map((article) => {
                    const assocTeam = teams.find(t => t.id === article.teamId);
                    return (
                      <article
                        key={article.id}
                        className="bg-gray-900 border border-gray-850 hover:border-gray-700/80 rounded-2xl overflow-hidden flex flex-col transition h-full shadow-lg"
                      >
                        <div className="h-44 relative overflow-hidden group">
                          <img
                            src={article.image}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-red-600 text-white rounded">
                              {article.category}
                            </span>
                            {assocTeam && (
                              <span
                                onClick={(e) => { e.stopPropagation(); handleTeamClick(assocTeam.id); }}
                                className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-gray-950 text-amber-500 hover:text-white rounded flex items-center gap-1 cursor-pointer"
                              >
                                {renderLogo(assocTeam.logo, "w-3 h-3 object-contain rounded-sm inline")} {assocTeam.abbrev}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-400 font-mono font-semibold block">{article.date}</span>
                            <h3 className="font-display font-bold text-base text-gray-100 line-clamp-2 leading-tight hover:text-red-500 transition">
                              {article.title}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                            {article.content}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* LATEST TRANSACTIONS AND AWARDS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LATEST AWARDS ACCLAIMS */}
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="font-display font-black text-base text-gray-100 flex items-center gap-2">
                      <AwardIcon className="w-5 h-5 text-amber-500" />
                      REIGNING LEAGUE CHAMPIONS & HONORS
                    </h3>
                    <button
                      onClick={() => { setActiveTab('awards'); window.location.hash = '#/awards'; }}
                      className="text-xs text-amber-500 hover:text-white font-mono"
                    >
                      See All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {awards.slice(0, 3).map(aw => {
                      const awardTeam = teams.find(t => t.id === aw.teamId);
                      return (
                        <div key={aw.id} className="flex items-center justify-between bg-gray-950/40 p-3.5 rounded-xl border border-gray-850">
                          <div className="flex items-center gap-3">
                            <span
                              onClick={() => awardTeam && handleTeamClick(awardTeam.id)}
                              className="w-12 h-12 flex items-center justify-center bg-gray-900 rounded-lg filter grayscale hover:grayscale-0 transition cursor-pointer border border-gray-800"
                            >
                              {awardTeam ? renderLogo(awardTeam.logo, "w-8 h-8 object-contain") : <span className="text-2xl">🏆</span>}
                            </span>
                            <div>
                              <span className="block font-bold text-xs text-gray-200 leading-tight">
                                {aw.playerName}
                              </span>
                              <span className="block font-mono text-[9px] text-[#f59e0b] font-bold uppercase mt-0.5">
                                {aw.category} • {aw.year}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-[10px] font-mono font-bold text-gray-400 max-w-xs truncate">
                            {aw.statsLine}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RECENT TRADES SUMMARY */}
                <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="font-display font-black text-base text-gray-100 flex items-center gap-2">
                      <ArrowLeftRight className="w-5 h-5 text-red-500" />
                      RECENT TRADES DECLARED
                    </h3>
                    <button
                      onClick={() => { setActiveTab('trades'); window.location.hash = '#/trades'; }}
                      className="text-xs text-amber-500 hover:text-white font-mono"
                    >
                      Tracker Board
                    </button>
                  </div>

                  <div className="space-y-4">
                    {trades.slice(0, 3).map(tr => {
                      const teamA = teams.find(t => t.id === tr.teamAId);
                      const teamB = teams.find(t => t.id === tr.teamBId);
                      return (
                        <div key={tr.id} className="bg-gray-950/40 p-3.5 rounded-xl border border-gray-850 space-y-2">
                          <div className="flex justify-between items-center bg-gray-900 p-2 rounded">
                            <div className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer text-xs font-bold text-gray-200" onClick={() => teamA && handleTeamClick(teamA.id)}>
                              {renderLogo(teamA?.logo, "w-4 h-4 object-contain inline-block rounded-sm")}
                              <span>{teamA?.name}</span>
                            </div>
                            <span className="font-mono font-black text-gray-500 text-xs">⇔</span>
                            <div className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer text-xs font-bold text-gray-200" onClick={() => teamB && handleTeamClick(teamB.id)}>
                              {renderLogo(teamB?.logo, "w-4 h-4 object-contain inline-block rounded-sm")}
                              <span>{teamB?.name}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-sans pl-1">
                            {tr.details}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 2. PUBLIC STANDINGS VIEW */}
          {/* =================================================================== */}
          {activeTab === 'standings' && (
            <div className="space-y-8 animate-fade-in-slow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase">LEAGUE STANDINGS</h1>
                  <p className="text-xs text-gray-400 font-mono">Real-time simulation wins, losses, streaks, and win percentages.</p>
                </div>

                {/* FILTERS */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <button
                      onClick={() => setStandingsTab('all')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase rounded ${
                        standingsTab === 'all' ? 'bg-red-650 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setStandingsTab('East')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase rounded ${
                        standingsTab === 'East' ? 'bg-red-650 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      EAST
                    </button>
                    <button
                      onClick={() => setStandingsTab('West')}
                      className={`px-3 py-1.5 text-xs font-bold uppercase rounded ${
                        standingsTab === 'West' ? 'bg-red-650 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      WEST
                    </button>
                  </div>

                  <select
                    value={standingsSort}
                    onChange={(e) => setStandingsSort(e.target.value as any)}
                    className="bg-gray-900 border border-gray-800 hover:border-gray-700 font-mono text-xs text-gray-300 p-2 rounded-lg cursor-pointer"
                  >
                    <option value="pct">Sort By: Win Ratio %</option>
                    <option value="wins">Sort By: Wins</option>
                    <option value="ptsFor">Sort By: PPG Scored</option>
                    <option value="ptsAgainst">Sort By: PPG Allowed</option>
                  </select>
                </div>
              </div>

              {/* STANDINGS CORE TABLE */}
              <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 overflow-x-auto shadow-xl">
                <table className="w-full text-left font-sans text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase font-black tracking-wider text-xs">
                      <th className="py-4 pl-2">Rank & Franchise</th>
                      <th>Conf / Div</th>
                      <th className="text-center">W</th>
                      <th className="text-center">L</th>
                      <th className="text-center">PCT</th>
                      <th className="text-center">STREAK</th>
                      <th className="text-center">PPG</th>
                      <th className="text-center">OPP PPG</th>
                      <th className="text-center">DIFF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedTeams().map((t, idx) => {
                      const pct = t.wins + t.losses > 0 ? (t.wins / (t.wins + t.losses)).toFixed(3) : '.000';
                      const diff = (t.ptsFor - t.ptsAgainst).toFixed(1);
                      return (
                        <tr key={t.id} className="border-b border-gray-850 hover:bg-gray-950/50 transition">
                          <td className="py-4.5 pl-2 font-bold text-gray-100 flex items-center gap-3.5">
                            <span className="font-mono font-black text-gray-500 text-base">#{idx + 1}</span>
                            <span
                              onClick={() => handleTeamClick(t.id)}
                              className="w-12 h-12 flex items-center justify-center bg-gray-950 hover:scale-105 border border-gray-800 rounded-xl shadow-md cursor-pointer flex-shrink-0 transition-transform duration-200"
                            >
                              {renderLogo(t.logo, "w-8 h-8 object-contain")}
                            </span>
                            <span
                              onClick={() => handleTeamClick(t.id)}
                              className="hover:text-amber-500 cursor-pointer leading-tight transition text-sm font-extrabold"
                            >
                              {t.name}
                              <span className="text-[11px] font-mono text-gray-500 block uppercase font-bold mt-0.5">Code: {t.abbrev}</span>
                            </span>
                          </td>
                          <td className="font-semibold text-gray-300 text-xs">
                            {t.conference} Conference <br />
                            <span className="text-gray-550 block font-normal text-[11px] mt-0.5">{t.division} Division</span>
                          </td>
                          <td className="text-center font-black text-base text-gray-100 font-mono">{t.wins}</td>
                          <td className="text-center font-black text-base text-gray-400 font-mono">{t.losses}</td>
                          <td className="text-center font-bold font-mono text-gray-200 text-sm">{pct}</td>
                          <td className="text-center">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                              t.streak.startsWith('W') ? 'bg-green-950 text-green-400' : 'bg-red-950/40 text-red-400'
                            }`}>
                              {t.streak}
                            </span>
                          </td>
                          <td className="text-center font-mono text-gray-400 font-semibold text-xs">{t.ptsFor.toFixed(1)}</td>
                          <td className="text-center font-mono text-gray-400 font-semibold text-xs">{t.ptsAgainst.toFixed(1)}</td>
                          <td className={`text-center font-mono font-bold text-sm ${Number(diff) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                            {Number(diff) > 0 ? `+${diff}` : diff}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 3. PUBLIC POWER RANKINGS VIEW */}
          {/* =================================================================== */}
          {activeTab === 'power-rankings' && (
            <div className="space-y-8 animate-fade-in-slow">
              <div className="border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase">POWER RANKINGS SLATE</h1>
                <p className="text-xs text-gray-400 font-mono">Expert power standings and detailed analysis.</p>
              </div>

              <div className="space-y-5">
                {powerRankings
                  .sort((a, b) => a.rank - b.rank)
                  .map((item, idx) => {
                    const teamObj = teams.find(t => t.id === item.teamId);
                    if (!teamObj) return null;

                    return (
                      <div
                        key={item.teamId}
                        className="bg-gray-900 border border-gray-850 hover:border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-display font-black text-3xl text-amber-500">#{idx + 1}</span>
                          <span
                            onClick={() => handleTeamClick(teamObj.id)}
                            className="w-12 h-12 flex items-center justify-center bg-gray-950 hover:scale-105 border border-gray-850 rounded-lg shadow-md cursor-pointer flex-shrink-0"
                          >
                            {renderLogo(teamObj.logo, "w-8 h-8 object-contain")}
                          </span>
                          <div>
                            <span
                              onClick={() => handleTeamClick(teamObj.id)}
                              className="font-display font-black text-lg text-gray-100 hover:text-amber-500 cursor-pointer block leading-none transition"
                            >
                              {teamObj.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                              RECORD: {teamObj.wins}-{teamObj.losses} • DIV: {teamObj.division}
                            </span>
                          </div>
                        </div>

                        {/* EXPLANATORY NOTES */}
                        <div className="flex-grow max-w-xl text-xs text-gray-300 leading-relaxed font-sans pr-4 pl-1">
                          {item.notes || 'This franchise continues to execute solid simulation protocols to climb the rankings.'}
                        </div>

                        {/* MOVEMENT TRACKER BADGES */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">PREV: #{item.prevRank}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            item.movement === 'up'
                              ? 'bg-green-950 text-green-400'
                              : item.movement === 'down'
                              ? 'bg-red-950/40 text-red-400'
                              : 'bg-gray-850 text-gray-400'
                          }`}>
                            {item.movement === 'up' ? '▲ Climbed' : item.movement === 'down' ? '▼ Slipped' : '■ Steady'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 4. PUBLIC TEAMS VIEW */}
          {/* =================================================================== */}
          {activeTab === 'teams' && (
            <div className="space-y-12 animate-fade-in-slow">
              <div className="border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase">LEAGUE FRANCHISES</h1>
                <p className="text-xs text-gray-400 font-mono">Select a team directory below to explore active rosters, filtered news, and records.</p>
              </div>

              {/* CONFERENCES CONTAINER */}
              {['East', 'West'].map((conf) => (
                <section key={conf} className="space-y-6">
                  <div className="border-l-4 border-red-500 pl-3">
                    <h2 className="text-2xl font-display font-black tracking-tight text-white uppercase">
                      {conf}ERN CONFERENCE DIRECTORY
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teams
                      .filter(t => t.conference === conf)
                      .map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleTeamClick(t.id)}
                          className="bg-gray-900 border border-gray-850 hover:border-gray-750/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transform cursor-pointer transition duration-300 flex flex-col justify-between"
                        >
                          {/* GRADIENT PANEL BANNER */}
                          <div
                            className="h-16 flex items-end justify-between px-4 pb-2 relative"
                            style={{ backgroundImage: getBannerStyle(t.banner) }}
                          >
                            <span className="absolute inset-0 bg-black/10"></span>
                            <span className="font-mono text-[10px] font-black text-white/80 z-10 bg-black/30 px-1.5 py-0.5 rounded font-bold">
                              {t.abbrev}
                            </span>
                            <span className="text-white font-mono text-xs font-black bg-black/30 px-2 py-0.5 rounded z-10 leading-none">
                              {t.wins} - {t.losses}
                            </span>
                          </div>

                          {/* CORE METADATA */}
                          <div className="p-5 flex items-center gap-3">
                            <span className="w-12 h-12 flex items-center justify-center bg-gray-950 border border-gray-850 rounded-lg shadow-md flex-shrink-0">
                              {renderLogo(t.logo, "w-8 h-8 object-contain")}
                            </span>
                            <div>
                              <h3 className="font-display font-extrabold text-sm text-gray-100 group-hover:text-amber-500 transition leading-tight">
                                {t.name}
                              </h3>
                              <span className="text-[10px] text-gray-500 font-mono block uppercase mt-0.5">{t.division} Division</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* =================================================================== */}
          {/* 5. INDIVIDUAL TEAM PAGE VIEW */}
          {/* =================================================================== */}
          {activeTab === 'team-page' && (() => {
            const activeTeam = teams.find(t => t.id === selectedTeamId);
            if (!activeTeam) {
              return (
                <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-100 mt-4">Selected Franchise Directory Non-existent</h3>
                  <p className="text-xs text-gray-400 mt-2">Check details or reload from navigation above.</p>
                </div>
              );
            }

            const activeRoster = players.filter(p => p.teamId === activeTeam.id);
            const teamNews = news.filter(n => n.teamId === activeTeam.id);

            return (
              <div className="space-y-8 animate-fade-in-slow">
                {/* BACK NAVIGATION */}
                <button
                  onClick={() => { setActiveTab('teams'); window.location.hash = '#/teams'; }}
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-500 hover:text-white border border-gray-850 hover:border-gray-700 bg-gray-900 px-3.5 py-2 rounded-lg transition"
                >
                  ← Return to League Directory
                </button>

                {/* TEAM PROFILE HERO BANNER */}
                <section
                  onClick={() => isAdminLoggedIn && openBrandingModal(activeTeam)}
                  className={`rounded-3xl border border-gray-800 overflow-hidden relative shadow-2xl group transition-all duration-300 ${
                    isAdminLoggedIn ? 'cursor-pointer hover:border-amber-500/55' : ''
                  }`}
                  style={{ backgroundImage: getBannerStyle(activeTeam.banner) }}
                >
                  {isAdminLoggedIn ? (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 backdrop-brightness-[0.85] transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-950/90 text-amber-400 border border-amber-500/30 text-xs font-mono py-1.5 px-3 rounded-lg shadow-2xl font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        Click outer banner to edit top image
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/30 backdrop-brightness-[0.85]"></div>
                  )}
                  
                  {/* ADMIN BRANDING FLOATING CONTROLS */}
                  {isAdminLoggedIn && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openBrandingModal(activeTeam); }}
                      className="absolute top-4 right-4 bg-gray-950/90 hover:bg-gray-900 text-white hover:text-amber-400 font-mono text-xs font-black border border-white/10 rounded-xl px-4 py-2 shadow-2xl transition-all duration-300 z-20 flex items-center gap-1.5 cursor-pointer hover:scale-105"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      Customize Branding & Logos
                    </button>
                  )}

                  <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span
                        onClick={() => isAdminLoggedIn && openBrandingModal(activeTeam)}
                        className={`w-[200px] h-[200px] flex items-center justify-center bg-gray-950 border-2 border-white/10 rounded-3xl shadow-2xl transition hover:scale-105 duration-300 relative group flex-shrink-0 ${
                          isAdminLoggedIn ? 'cursor-pointer border-amber-500/40 hover:border-amber-500' : ''
                        }`}
                      >
                        {activeTeam.logo && (activeTeam.logo.startsWith('http') || activeTeam.logo.startsWith('data:')) ? (
                          renderLogo(activeTeam.logo, "w-[180px] h-[180px] object-contain rounded-2xl")
                        ) : (
                          <span className="text-7xl">{activeTeam.logo || '🏀'}</span>
                        )}
                        {isAdminLoggedIn && (
                          <div className="absolute inset-0 bg-black/75 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <span className="text-[10px] uppercase font-mono font-black text-amber-500 tracking-wider">Edit Logo</span>
                          </div>
                        )}
                      </span>
                      <div>
                        <span className="block font-mono text-[10px] tracking-widest text-[#f59e0b] leading-none uppercase font-bold">
                          {activeTeam.conference}ern Conference • {activeTeam.division} division
                        </span>
                        <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight mt-1.5 leading-none">
                          {activeTeam.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-gray-300 font-mono">
                          <span>
                            ABBREV: <span className="font-bold text-white uppercase">{activeTeam.abbrev}</span>
                          </span>
                          {activeTeam.gmInstagram && (
                            <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                              📸 GM: <span className="text-amber-400 font-bold">{activeTeam.gmInstagram}</span>
                            </span>
                          )}
                          {activeTeam.retiredJerseys && (
                            <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                              👕 Retired: <span className="text-red-400 font-bold">{activeTeam.retiredJerseys}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* HERO SCORE METRICS */}
                    <div className="bg-gray-950/80 p-5 rounded-2xl border border-white/5 text-right flex gap-6 items-center flex-shrink-0 self-stretch md:self-auto justify-between md:justify-end">
                      <div className="text-left font-sans">
                        <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest">W/L Record</span>
                        <span className="block text-2xl sm:text-3xl font-display font-black text-white mt-1 leading-none">
                          {activeTeam.wins}<span className="text-gray-500 font-normal"> - </span>{activeTeam.losses}
                        </span>
                      </div>
                      <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>
                      <div>
                        <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest leading-none">Streak</span>
                        <span className="inline-block mt-2 px-2.5 py-1 rounded bg-red-650 font-mono text-xs font-bold font-black text-white">
                          {activeTeam.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SUB TAB CONTROLS */}
                <div className="flex border-b border-gray-850 pb-px gap-2">
                  <button
                    onClick={() => setTeamSubTab('roster')}
                    className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-wider relative transition cursor-pointer ${
                      teamSubTab === 'roster' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Active Registered Roster
                  </button>
                  <button
                    onClick={() => setTeamSubTab('history')}
                    className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-wider relative transition cursor-pointer ${
                      teamSubTab === 'history' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Franchise History & Legacy
                  </button>
                  <button
                    onClick={() => setTeamSubTab('news')}
                    className={`pb-3 px-4 font-display font-black text-xs uppercase tracking-wider relative transition cursor-pointer ${
                      teamSubTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Franchise Broadcasts
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {teamSubTab === 'roster' && (
                    <>
                      {/* ACTIVE ROSTER PORTAL */}
                      <div className="lg:col-span-8 bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-4 overflow-x-auto">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                          <h2 className="font-display font-black text-lg text-gray-100 flex items-center gap-2">
                            <Users className="w-5 h-5 text-red-500" />
                            ACTIVE FRANCHISE ROSTER
                          </h2>
                          <span className="font-mono text-[10px] text-gray-400 font-bold uppercase">{activeRoster.length} Athletes Signed</span>
                        </div>

                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="border-b border-gray-850 text-gray-400 font-bold uppercase">
                              <th className="py-2.5">Player Name</th>
                              <th>Age / Position</th>
                              <th className="text-center">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeRoster.map(p => (
                              <tr key={p.id} onClick={() => handlePlayerClick(p.name, activeTeam.id)} className="border-b border-gray-850 hover:bg-gray-950/40 transition cursor-pointer">
                                <td className="py-3 font-bold text-gray-200 text-sm hover:text-amber-500 transition">
                                  <span className="border-b border-dotted border-gray-700 hover:border-amber-500">
                                    {p.name}
                                  </span>
                                  {p.isRetired && <span className="ml-1 text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded font-mono font-bold leading-none inline-block">RET</span>}
                                </td>
                                <td>
                                  <span className="px-1.5 py-0.5 rounded bg-gray-950 font-mono text-[10px] font-semibold text-amber-500">
                                    {p.position}
                                  </span>
                                  <span className="text-gray-400 text-[11px] ml-2 inline">Age {p.age}</span>
                                </td>
                                <td className="text-center">
                                  <span className={`font-mono font-black text-sm px-2 py-0.5 rounded bg-gray-950/40 border border-gray-850 ${
                                    p.rating >= 90 ? 'text-red-500 shadow-sm' : p.rating >= 80 ? 'text-amber-500' : 'text-gray-400'
                                  }`}>
                                    {p.rating}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* SIDE PANEL: RECENT FORM */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-4">
                          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                            <h3 className="font-display font-black text-sm text-gray-100 uppercase">RECENT TEAM FORM</h3>
                            <span className="font-mono text-[9px] text-[#f59e0b] font-bold uppercase tracking-wider">League Stats</span>
                          </div>
                          <div className="space-y-3 font-mono text-[11px] text-gray-300">
                            <div className="flex justify-between items-center py-2 bg-gray-950/50 px-3 rounded border border-gray-850">
                              <span>Avg Points PPG Scored:</span>
                              <span className="font-black text-white">{activeTeam?.ptsFor.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-950/50 px-3 rounded border border-gray-850">
                              <span>Avg Points Allowed:</span>
                              <span className="font-black text-white">{activeTeam?.ptsAgainst.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-950/50 px-3 rounded border border-gray-850">
                              <span>Calculated Diff Margin:</span>
                              <span className={`font-black ${(activeTeam?.ptsFor ?? 0) - (activeTeam?.ptsAgainst ?? 0) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                {((activeTeam?.ptsFor ?? 0) - (activeTeam?.ptsAgainst ?? 0)).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {teamSubTab === 'history' && (() => {
                    const history = teamHistories[activeTeam.id] || getTeamHistory(activeTeam.id, activeTeam.name, activeTeam.abbrev);
                    return (
                      <>
                        {/* HISTORY LOGS */}
                        <div className="lg:col-span-8 bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-6">
                          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                            <Landmark className="w-5 h-5 text-amber-500" />
                            <h2 className="font-display font-black text-lg text-gray-100 uppercase">Franchise History & Biographical Heritage</h2>
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line bg-gray-950/45 p-4 sm:p-5 rounded-xl border border-gray-850/65 font-sans leading-relaxed">
                            {history.historicalBio}
                          </p>

                          {/* STATS & HIGHLIGHTS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-950 p-4 rounded-xl border border-gray-850">
                              <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold">Inaugural Season</span>
                              <span className="block text-lg font-bold text-gray-200 mt-1 font-mono">{history.established}</span>
                            </div>
                            <div className="bg-gray-950 p-4 rounded-xl border border-gray-850">
                              <span className="block text-[9px] font-mono text-gray-400 uppercase tracking-widest font-bold">Championship Rings</span>
                              <span className="block text-lg font-bold text-amber-500 mt-1 font-mono flex items-center gap-1.5">
                                🏆 {history.championships.length > 0 ? history.championships.length : '0'} Titles
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* TROPHY & LEGEND SIDEBAR */}
                        <div className="lg:col-span-4 space-y-6">
                          <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                              <Trophy className="w-5 h-5 text-amber-500" />
                              <h3 className="font-display font-black text-xs sm:text-sm text-gray-100 uppercase">Championship Years</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {history.championships.map(year => (
                                <span key={year} className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                                  🏆 {year}
                                </span>
                              ))}
                              {history.championships.length === 0 && (
                                <span className="text-gray-550 text-xs font-mono">No playoff championships recorded yet.</span>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                              <Users className="w-5 h-5 text-red-500" />
                              <h3 className="font-display font-black text-xs sm:text-sm text-gray-100 uppercase">Legendary Franchise Icons</h3>
                            </div>
                            <div className="space-y-2">
                              {history.legendaryPlayers.map(name => (
                                <div
                                  key={name}
                                  onClick={() => handlePlayerClick(name, activeTeam.id)}
                                  className="flex items-center justify-between p-2.5 bg-gray-950/40 hover:bg-gray-950 text-xs font-bold rounded-lg border border-gray-850 hover:border-amber-500/35 transition cursor-pointer"
                                >
                                  <span className="text-gray-200 hover:text-amber-400 transition">{name}</span>
                                  <span className="text-[9px] bg-amber-500/10 text-amber-500 font-mono px-1 rounded uppercase font-bold">Franchise Icon</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {teamSubTab === 'news' && (
                    <>
                      {/* DETAILED BROADCASTS */}
                      <div className="lg:col-span-8 bg-gray-900 border border-gray-850 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                          <h2 className="font-display font-black text-lg text-gray-100 flex items-center gap-2 uppercase">
                            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                            FRANCHISE BROADCAST LOGS
                          </h2>
                          <span className="font-mono text-[10px] text-[#f59e0b] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                            {teamNews.length} Reports
                          </span>
                        </div>

                        <div className="space-y-4">
                          {teamNews.map(item => (
                            <div key={item.id} className="bg-gray-950/40 p-4 rounded-xl border border-gray-850 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-red-950/40 text-red-400 px-2 py-0.5 rounded border border-red-500/5">
                                  {item.category}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-gray-100 mt-1">{item.title}</h4>
                              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                                {item.content}
                              </p>
                            </div>
                          ))}
                          {teamNews.length === 0 && (
                            <div className="text-center py-12 bg-gray-950/20 text-xs text-gray-500 font-mono rounded-xl border border-dashed border-gray-850">
                              No team news publications logged in this system.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SIDE PANEL: RECENT FORM */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-900 border border-gray-850 rounded-16 p-6 shadow-xl space-y-4">
                          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                            <h3 className="font-display font-black text-sm text-gray-100 uppercase">RECENT TEAM FORM</h3>
                            <span className="font-mono text-[9px] text-[#f59e0b] font-bold uppercase tracking-wider">League Stats</span>
                          </div>
                          <div className="space-y-3 font-mono text-[11px] text-gray-300">
                            <div className="flex justify-between items-center py-2 bg-gray-950/50 px-3 rounded border border-gray-850">
                              <span>Avg Points PPG Scored:</span>
                              <span className="font-black text-white">{activeTeam?.ptsFor.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-950/50 px-3 rounded border border-gray-850">
                              <span>Avg Points Allowed:</span>
                              <span className="font-black text-white">{activeTeam?.ptsAgainst.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* =================================================================== */}
          {/* 6. TRADE TRACKER SCREEN */}
          {/* =================================================================== */}
          {activeTab === 'trades' && (
            <div className="space-y-8 animate-fade-in-slow">
              <div className="border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <ArrowLeftRight className="w-8 h-8 text-amber-500" />
                  LEAGUE TRADE TRACKER
                </h1>
                <p className="text-xs text-gray-400 font-mono">Completed transactions, trade acquisitions, and roster updates logged by administrators.</p>
              </div>

              {trades.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-3xl py-20 text-center text-xs text-gray-500 font-mono">
                  No active trade ledger entries found.
                </div>
              ) : (
                <div className="space-y-6">
                  {trades.map(t => {
                    const teamA = teams.find(x => x.id === t.teamAId);
                    const teamB = teams.find(x => x.id === t.teamBId);
                    return (
                      <div key={t.id} className="bg-gray-900 border border-gray-850 rounded-2xl overflow-hidden shadow-lg p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-855 pb-3 gap-2">
                          <span className="font-mono text-xs text-amber-500 font-bold">{t.date}</span>
                          <span className="px-2 py-0.5 text-[9px] bg-red-950/40 text-red-400 font-mono font-bold uppercase tracking-wide">
                            TRANSACTION AUTHORIZED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                          {/* TEAMA CARDS */}
                          <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-850 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-100 hover:text-red-500 cursor-pointer" onClick={() => teamA && handleTeamClick(teamA.id)}>
                              {renderLogo(teamA?.logo, "w-5 h-5 object-contain inline-block rounded-sm")}
                              <span>{teamA?.name} Receives:</span>
                            </div>
                            <ul className="space-y-1 font-mono text-[11px] text-gray-300">
                              {t.teamAReceives.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="text-green-400">⚡</span> {item}
                                </li>
                              ))}
                              {t.teamAReceives.length === 0 && <li className="text-gray-500">No assets.</li>}
                            </ul>
                          </div>

                          {/* TEAMB CARDS */}
                          <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-850 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-100 hover:text-red-500 cursor-pointer" onClick={() => teamB && handleTeamClick(teamB.id)}>
                              {renderLogo(teamB?.logo, "w-5 h-5 object-contain inline-block rounded-sm")}
                              <span>{teamB?.name} Receives:</span>
                            </div>
                            <ul className="space-y-1 font-mono text-[11px] text-gray-300">
                              {t.teamBReceives.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-1.5">
                                  <span className="text-green-400">⚡</span> {item}
                                </li>
                              ))}
                              {t.teamBReceives.length === 0 && <li className="text-gray-500">No assets.</li>}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-gray-950 p-4 rounded-xl text-xs text-gray-300 leading-relaxed font-sans">
                          {t.details}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* 7. DRAFT HISTORY SCREEN */}
          {/* =================================================================== */}
          {activeTab === 'draft' && (
            <div className="space-y-8 animate-fade-in-slow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-2">
                    <CalendarDays className="w-8 h-8 text-amber-500" />
                    DRAFT HISTORY ARCHIVE
                  </h1>
                  <p className="text-xs text-gray-400 font-mono">College prospect selections listed by year round, and pick sequence order.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-500 uppercase font-black mr-1">Select Year:</span>
                  <select
                    value={selectedDraftYear}
                    onChange={(e) => setSelectedDraftYear(Number(e.target.value))}
                    className="bg-gray-950 border border-gray-800 hover:border-gray-700 text-amber-500 hover:text-amber-400 p-2 px-4 text-xs font-mono font-bold rounded-lg outline-none cursor-pointer tracking-wider"
                  >
                    {Array.from(new Set(draftResults.map(d => Number(d.year))))
                      .sort((a: number, b: number) => b - a)
                      .map(y => (
                        <option key={y} value={y} className="bg-gray-950 text-gray-300 font-mono">
                          {y} Class
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>

              {draftResults.filter(d => d.year === selectedDraftYear).length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-3xl py-20 text-center text-xs text-gray-500 font-mono">
                  No draft selections logged for the Class of {selectedDraftYear} yet.
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-850 rounded-2xl overflow-hidden shadow-lg p-6">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="py-2.5">Pick #</th>
                        <th>Drafting Franchise</th>
                        <th>Athlete Name</th>
                        <th className="text-center">Pos</th>
                        <th className="text-right">College/Origin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftResults
                        .filter(d => d.year === selectedDraftYear)
                        .map(d => {
                          const draftTeam = teams.find(x => x.id === d.teamId);
                          return (
                            <tr key={d.id} className="border-b border-gray-850 hover:bg-gray-950/40 transition">
                              <td className="py-3 font-mono font-black text-[#f59e0b] text-sm">
                                Rd {d.round}, Pick {d.pick}
                              </td>
                              <td className="font-bold flex items-center gap-2 text-gray-200">
                                <span className="hover:scale-105 cursor-pointer" onClick={() => draftTeam && handleTeamClick(draftTeam.id)}>
                                  {renderLogo(draftTeam?.logo, "w-5 h-5 object-contain")}
                                </span>
                                <span className="hover:text-red-500 cursor-pointer" onClick={() => draftTeam && handleTeamClick(draftTeam.id)}>
                                  {draftTeam?.name} ({draftTeam?.abbrev})
                                </span>
                              </td>
                              <td className="font-bold text-gray-100">
                                <span
                                  onClick={() => handlePlayerClick(d.playerName, d.teamId)}
                                  className="hover:text-amber-500 cursor-pointer border-b border-dotted border-gray-750 transition"
                                >
                                  {d.playerName}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="px-1.5 py-0.5 rounded bg-gray-950 text-gray-400 font-mono text-[10px] uppercase font-bold">
                                  {d.position}
                                </span>
                              </td>
                              <td className="text-right font-mono text-gray-450">{d.college}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* 8. AWARDS SCREEN */}
          {/* =================================================================== */}
          {activeTab === 'awards' && (
            <div className="space-y-8 animate-fade-in-slow">
              <div className="border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <AwardIcon className="w-8 h-8 text-amber-500" />
                  LEAGUE AWARDS
                </h1>
                <p className="text-xs text-gray-400 font-mono">Recognitions and honors conferred to elite athletes based on outstanding performance and achievements.</p>
              </div>

              {awards.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-3xl py-20 text-center text-xs text-gray-500 font-mono">
                  No honors catalogues exists in the databases yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {awards.map(aw => {
                    const awardTeam = teams.find(t => t.id === aw.teamId);
                    return (
                      <div
                        key={aw.id}
                        className="bg-gray-900 border border-gray-850 hover:border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition"
                      >
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 text-[9px] bg-amber-500/10 text-amber-500 font-mono font-bold uppercase rounded">
                            {aw.year} Honor Season
                          </span>
                          <h3 className="font-display font-black text-base text-gray-200 uppercase leading-tight">
                            {aw.category}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-950 p-3 rounded-xl border border-gray-855">
                          <span
                            onClick={() => awardTeam && handleTeamClick(awardTeam.id)}
                            className="w-12 h-12 flex items-center justify-center bg-gray-900 rounded border border-gray-800 filter grayscale hover:grayscale-0 transition cursor-pointer flex-shrink-0"
                          >
                            {awardTeam ? renderLogo(awardTeam.logo, "w-8 h-8 object-contain") : <span className="text-2xl">🏆</span>}
                          </span>
                          <div>
                            <span
                              onClick={() => handlePlayerClick(aw.playerName, aw.teamId)}
                              className="block font-bold text-sm text-gray-100 hover:text-amber-400 cursor-pointer transition"
                            >
                              {aw.playerName}
                            </span>
                            <span className="block text-[10px] text-gray-400 font-mono uppercase mt-0.5">
                              {awardTeam?.name || 'Viper League'}
                            </span>
                          </div>
                        </div>

                        <div className="font-mono text-[11px] text-[#f59e0b] pt-1 pl-1 line-clamp-2 leading-relaxed font-bold">
                          {aw.statsLine}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* 8.5 CHAMPIONSHIP HISTORY SCREEN */}
          {/* =================================================================== */}
          {activeTab === 'championships' && (
            <div className="space-y-8 animate-fade-in-slow">
              <div className="border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-display font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <Trophy className="w-8 h-8 text-amber-500" />
                  CHAMPIONSHIP HISTORY & LEGACY (1990 - 2004)
                </h1>
                <p className="text-xs text-gray-400 font-mono">
                  Official Finals records of the virtual federation, logging Champions, Finals MVPs, and historic highlights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(championships && championships.length > 0 ? championships : championshipsData).map((champ) => {
                  const winnerTeam = teams.find(t => t.id === champ.championKey || t.abbrev === champ.championKey);
                  const runnerUpTeam = teams.find(t => t.id === champ.runnerUpKey || t.abbrev === champ.runnerUpKey);

                  return (
                    <div
                      key={champ.id || champ.year}
                      className="bg-gray-905 border border-gray-850 hover:border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition hover:-translate-y-0.5 duration-200"
                    >
                      <div className="flex justify-between items-center bg-gray-950/60 p-3 rounded-2xl border border-gray-850">
                        <span className="font-mono text-xs font-black text-amber-500 flex items-center gap-1.5">
                          🏆 {champ.year} CHAMPION
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-0.5 rounded-lg">
                          Result: {champ.result}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 my-2">
                        {/* CHAMPION */}
                        <div className="flex flex-col items-center p-3.5 bg-gray-950/20 rounded-2xl border border-gray-850 justify-center text-center">
                          <span
                            onClick={() => winnerTeam && handleTeamClick(winnerTeam.id)}
                            className="w-14 h-14 flex items-center justify-center bg-gray-950 hover:bg-gray-905 rounded-2xl border border-gray-800 shadow-md cursor-pointer transition mb-2"
                          >
                            {winnerTeam ? renderLogo(winnerTeam.logo, "w-10 h-10 object-contain") : <span className="text-2xl">🏆</span>}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">CHAMPION</span>
                          <span className="font-bold text-xs text-gray-100 max-w-xs truncate leading-snug">{champ.champion}</span>
                        </div>

                        {/* RUNNER UP */}
                        <div className="flex flex-col items-center p-3.5 bg-gray-950/20 rounded-2xl border border-gray-850 justify-center text-center">
                          <span
                            onClick={() => runnerUpTeam && handleTeamClick(runnerUpTeam.id)}
                            className="w-14 h-14 flex items-center justify-center bg-gray-950 hover:bg-gray-955 rounded-2xl border border-gray-800 shadow-md cursor-pointer transition mb-2"
                          >
                            {runnerUpTeam ? renderLogo(runnerUpTeam.logo, "w-10 h-10 object-contain") : <span className="text-2xl">🥈</span>}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-[#94a3b8] uppercase tracking-wider mb-1">RUNNER-UP</span>
                          <span className="font-bold text-xs text-gray-100 max-w-xs truncate leading-snug">{champ.runnerUp}</span>
                        </div>
                      </div>

                      {/* FINALS MVP SECTION */}
                      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#f59e0b] font-mono uppercase tracking-wider font-bold">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span>Finals MVP (FMVP)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span
                            onClick={() => handlePlayerClick(champ.fmvpName, champ.championKey)}
                            className="font-bold text-sm text-gray-200 border-b border-dotted border-amber-500/40 hover:text-amber-400 transition cursor-pointer"
                          >
                            {champ.fmvpName}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 font-bold uppercase">{champ.fmvpStats}</span>
                        </div>
                      </div>

                      {/* MOMENT HIGHLIGHT */}
                      <p className="text-[11px] text-gray-400 leading-relaxed font-sans bg-gray-950/35 p-3.5 rounded-xl border border-gray-850">
                        <span className="text-gray-350 font-bold block mb-1">Historical Recap:</span>
                        {champ.highlight}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ATHLETE CAREER INTERACTIVE PORTRAIT & STATISTICS CARD */}
          {/* =================================================================== */}
          {selectedPlayerModal && (() => {
            const p = selectedPlayerModal;
            const playerTeam = teams.find(t => t.id === p.teamId);
            
            return (
              <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-gray-900 border border-gray-850 rounded-3xl w-full max-w-md relative shadow-2xl overflow-hidden animate-fade-in-quick my-auto font-sans">
                  
                  {/* GRADIENT ACCENT HEADER WITH OVERALL AND PROFILE BADGES */}
                  <div
                    className="h-32 p-6 flex flex-col justify-end relative"
                    style={{ backgroundImage: playerTeam?.banner || 'radial-gradient(circle at top right, #1e1b4b, #030712)' }}
                  >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <button
                      onClick={() => setSelectedPlayerModal(null)}
                      className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/5 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm transition cursor-pointer z-20"
                    >
                      ✕
                    </button>

                    {/* OVERALL FLOATING BADGE */}
                    <div className="absolute right-6 bottom-4 text-right">
                      <span className="block text-[8px] font-mono tracking-widest text-amber-500 font-bold uppercase leading-none">Viper Rating</span>
                      <span className={`block text-3xl font-display font-black leading-none mt-1 ${
                        p.rating >= 90 ? 'text-red-500' : p.rating >= 80 ? 'text-amber-500' : 'text-gray-300'
                      }`}>
                        {p.rating}
                      </span>
                      <span className="text-[10px] text-gray-300/85 font-mono mt-0.5 block">{p.position}</span>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gray-950 border border-white/15 flex items-center justify-center shadow-xl">
                        {playerTeam ? renderLogo(playerTeam.logo, "w-8 h-8 object-contain") : <span className="text-xl">🏆</span>}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-amber-450 font-bold tracking-wider uppercase leading-none block shadow-sm">
                          {playerTeam?.name || 'Federation Icon'}
                        </span>
                        <h2 className="text-xl font-display font-black text-white mt-1 leading-snug">
                          {p.name}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* ATHLETE VITAL LEDGER */}
                  <div className="p-6 space-y-5">
                    
                    {/* CAREER STATUS BADGES */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wider flex items-center gap-1.5 border uppercase leading-none ${
                        p.isRetired 
                          ? 'bg-red-500/10 text-red-400 border-red-500/15' 
                          : 'bg-green-500/10 text-green-450 border-green-500/15'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isRetired ? 'bg-red-500' : 'bg-green-450 animate-pulse'}`}></span>
                        {p.isRetired ? 'RETIRED LEGEND' : 'ACTIVE ROSTER'}
                      </span>
                    </div>

                    {/* DETAILS PROFILE INDEX */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-2.5 border-b border-gray-850 font-mono">
                        <span className="text-gray-400">Athlete Age</span>
                        <span className="text-gray-200 font-bold">{p.age} Years Old</span>
                      </div>
                    </div>

                    {/* CAREER HONORS & AWARDS */}
                    <div className="space-y-2.5 pt-1">
                      <h3 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-800 pb-2">
                        <AwardIcon className="w-4 h-4 text-amber-500" />
                        Career Accolades & Trophies
                      </h3>
                      
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {p.careerAwards && p.careerAwards.length > 0 ? (
                          p.careerAwards.map((accolade, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-950 p-2.5 rounded-xl border border-gray-850">
                              <span className="text-amber-500 text-[10px]">★</span>
                              <span className="text-xs text-gray-300 font-medium">{accolade}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 bg-gray-950/20 text-[10px] text-gray-500 font-mono rounded-xl border border-dashed border-gray-850">
                            No individual accolades log recorded for this athlete.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* FOOTER ACTION */}
                  <div className="p-4 bg-gray-950/80 border-t border-gray-850 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedPlayerModal(null)}
                      className="w-full py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Dismiss Career Profile
                    </button>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* =================================================================== */}
          {/* 9. ADMIN PANEL (LOCKED VIEW) */}
          {/* =================================================================== */}
          {activeTab === 'admin' && (
            isAdminLoggedIn ? (
              <AdminPanel
                teams={teams}
                players={players}
                news={news}
                powerRankings={powerRankings}
                trades={trades}
                draftResults={draftResults}
                awards={awards}
                championships={championships}
                teamHistories={teamHistories}
                users={users}
                currentUser={currentUser}
                onRefreshDB={fetchDB}
              />
            ) : (
              <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl my-10 animate-fade-in-slow">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-gray-100">Access Restricted</h3>
                <p className="text-xs text-gray-400">Please authenticate with the portal key in the Admin Portal Login dialog box first.</p>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold rounded-lg text-xs tracking-wider uppercase shadow-md hover:from-amber-500 transition cursor-pointer"
                >
                  Prompt Login Overlay
                </button>
              </div>
            )
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* 10. AUTHENTICATING MODAL PANEL */}
      {/* =================================================================== */}
      {loginModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm relative shadow-2xl animate-fade-in-quick">
            <h3 className="text-xl font-display font-black text-gray-100 flex items-center gap-2 mb-2 text-amber-500">
              <Lock className="w-5 h-5 text-red-500" />
              Administrative Unlock
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-mono leading-relaxed">
              Authenticate via the default simulation access key below to release write controls.
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1.5 font-bold font-mono">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Optional for Administrator..."
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 pl-10 text-white placeholder-gray-600 outline-none transition"
                  />
                  <Users className="w-4 h-4 text-gray-600 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1.5 font-bold font-mono">Access Key / Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Enter admin password or mod password..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 pl-10 text-white placeholder-gray-600 outline-none transition"
                  />
                  <Lock className="w-4 h-4 text-gray-600 absolute left-3.5 top-3" />
                </div>
                <div className="mt-2.5 bg-amber-500/5 text-[#f59e0b] border border-amber-500/10 p-2 rounded text-[10px] leading-tight flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                  <span>
                     Admin password is <span className="font-black text-yellow-300 select-all underline">viper2ksimadmin</span> or <span className="font-black text-yellow-300 font-sans">admin</span>. Mods use their registered username and account password.
                  </span>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-400 text-[11px] rounded flex items-center gap-1.5 leading-tight">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setLoginModalOpen(false); setLoginError(''); setAdminPassword(''); setLoginUsername(''); }}
                  className="px-4 py-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 hover:from-amber-500 font-bold rounded-lg transition text-xs uppercase shadow-md cursor-pointer"
                >
                  Confirm Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FRANCHISE IDENTITY & LOGO CUSTOMIZER PORTAL (MODAL) */}
      {/* =================================================================== */}
      {isBrandingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-xl relative shadow-2xl overflow-hidden animate-fade-in-quick my-auto flex flex-col max-h-[92vh]">
            
            {/* COMPOSITE BRAND HEADER PREVIEW */}
            <div
              className="h-32 p-6 flex flex-col justify-end relative transition-all duration-300"
              style={{ backgroundImage: getBannerStyle(brandingForm.banner) }}
            >
              <div className="absolute inset-0 bg-black/45"></div>
              <button
                onClick={() => setIsBrandingModalOpen(false)}
                className="absolute right-5 top-5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center font-bold text-sm transition cursor-pointer z-30"
              >
                ✕
              </button>

              <div className="relative z-10 flex items-center gap-4">
                <span className="w-16 h-16 flex items-center justify-center bg-gray-950 border-2 border-white/10 rounded-2xl shadow-xl flex-shrink-0 overflow-hidden">
                  {renderLogo(brandingForm.logo, "w-12 h-12 object-contain")}
                </span>
                <div>
                  <span className="block font-mono text-[9px] tracking-widest text-[#f59e0b] uppercase font-bold leading-none">
                    Real-time Visual Preview
                  </span>
                  <h3 className="font-display font-black text-xl text-white tracking-tight leading-none mt-1">
                    {brandingForm.name || 'Your Team Name'}
                  </h3>
                  <span className="mt-1 inline-block font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-gray-400">
                    CODE: {brandingForm.abbrev || 'CODE'}
                  </span>
                </div>
              </div>
            </div>

            {/* INTERIOR SCROLL FORM */}
            <form onSubmit={handleSaveBranding} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="border-b border-gray-850 pb-3">
                <h4 className="text-sm font-display font-black text-gray-100 uppercase tracking-wide">
                  Customize Visual Identity
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  Updating this team's logos, colors, or header images saves changes directly to the league database.
                </p>
              </div>

              {/* DUAL TEXT FIELD FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Franchise Name</label>
                  <input
                    type="text"
                    required
                    value={brandingForm.name}
                    onChange={(e) => setBrandingForm({ ...brandingForm, name: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-850 hover:border-gray-750 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none"
                    placeholder="e.g. Phoenix Suns"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Uniform Code (Abbreviation)</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={brandingForm.abbrev}
                    onChange={(e) => setBrandingForm({ ...brandingForm, abbrev: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-950 border border-gray-850 hover:border-gray-750 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-mono"
                    placeholder="e.g. PHX"
                  />
                </div>
              </div>

              {/* LOGO INPUT SECTOR */}
              <div className="border-t border-gray-850/50 pt-3">
                <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase block">
                  1. Corporate Team Logo
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <input
                    type="text"
                    value={brandingForm.logo.startsWith('data:') ? '[Device File Processed]' : brandingForm.logo}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logo: e.target.value })}
                    className="flex-1 bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-white outline-none"
                    placeholder="Paste a custom logo Image URL (or upload below)"
                  />
                  <label className="bg-gray-800 hover:bg-gray-750 border border-gray-700 text-white hover:text-amber-400 font-mono text-center flex items-center justify-center px-4 py-2.5 rounded-lg font-bold cursor-pointer transition whitespace-nowrap">
                    Upload File...
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandingLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal font-mono">
                  Transparent PNG or vector assets look best. Maximum size is ~5MB.
                </p>
              </div>

              {/* HERO BANNER EDIT SECTOR */}
              <div className="border-t border-gray-850/50 pt-3">
                <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase block">
                  2. Hero Background Banner Image / CSS
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <input
                    type="text"
                    value={brandingForm.banner.startsWith('data:') || brandingForm.banner.startsWith('url("data:') ? '[Device File Processed]' : brandingForm.banner}
                    onChange={(e) => setBrandingForm({ ...brandingForm, banner: e.target.value })}
                    className="flex-1 bg-gray-950 border border-gray-850 rounded-lg p-2.5 text-white outline-none"
                    placeholder="Paste background Image URL, or gradient string (e.g. linear-gradient(...))"
                  />
                  <label className="bg-gray-800 hover:bg-gray-750 border border-gray-700 text-white hover:text-amber-400 font-mono text-center flex items-center justify-center px-4 py-2.5 rounded-lg font-bold cursor-pointer transition whitespace-nowrap">
                    Upload Banner...
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandingBannerChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal font-mono">
                  Supports remote URLs, file uploads, or linear-gradient style strings.
                </p>
              </div>

              {/* AUX METRICS SECTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-850/50 pt-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">
                    GM INSTAGRAM HANDLE
                  </label>
                  <input
                    type="text"
                    value={brandingForm.gmInstagram}
                    onChange={(e) => setBrandingForm({ ...brandingForm, gmInstagram: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-850 hover:border-gray-750 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-mono"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">
                    RETIRED JERSEY NUMBERS
                  </label>
                  <input
                    type="text"
                    value={brandingForm.retiredJerseys}
                    onChange={(e) => setBrandingForm({ ...brandingForm, retiredJerseys: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-850 hover:border-gray-750 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-mono"
                    placeholder="e.g. 34 (Barkley), 13 (Nash)"
                  />
                </div>
              </div>

              {/* ALERTS SECTION */}
              {brandingError && (
                <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-400 rounded flex items-center gap-1.5 leading-tight">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{brandingError}</span>
                </div>
              )}

              {brandingSuccess && (
                <div className="p-3 bg-green-950/40 border border-green-800/40 text-green-400 rounded flex items-center gap-1.5 leading-tight">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{brandingSuccess}</span>
                </div>
              )}

              {/* DIALOG CONTROLS */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setIsBrandingModalOpen(false)}
                  className="px-4 py-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition font-semibold cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-gray-950 font-black rounded-lg transition uppercase shadow-md cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Save Visual Branding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
