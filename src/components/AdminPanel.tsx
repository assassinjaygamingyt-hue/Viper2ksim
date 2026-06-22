/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Team, Player, NewsArticle, PowerRankingEntry, Trade, DraftResult, Award, ChampionshipRecord, TeamHistory, ModUser } from '../types';
import { renderLogo } from '../utils';
import { Plus, Trash2, Edit2, ShieldAlert, Users, Award as AwardIcon, ArrowLeftRight, Check, AlertTriangle, ListFilter, Sliders, Trophy, Landmark } from 'lucide-react';

interface AdminPanelProps {
  teams: Team[];
  players: Player[];
  news: NewsArticle[];
  powerRankings: PowerRankingEntry[];
  trades: Trade[];
  draftResults: DraftResult[];
  awards: Award[];
  championships: ChampionshipRecord[];
  teamHistories: { [key: string]: TeamHistory };
  users: ModUser[];
  currentUser: {
    id?: string;
    username: string;
    role: 'admin' | 'mod';
    subRole?: string;
    permissions: {
      editHistory: boolean;
      editDrafts: boolean;
      editRosters: boolean;
    };
  } | null;
  onRefreshDB: () => void;
}

export default function AdminPanel({
  teams,
  players,
  news,
  powerRankings,
  trades,
  draftResults,
  awards,
  championships,
  teamHistories,
  users,
  currentUser,
  onRefreshDB
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'teams' | 'rosters' | 'standings' | 'news' | 'transactions' | 'championships' | 'teamHistories' | 'users'>('teams');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper trigger
  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlertMessage({ text, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  // Helper checks for mod permissions
  const isESPNAdmin = currentUser?.subRole === 'ESPN/News Outlet';
  const canEditRosters = (currentUser?.role === 'admin' && !isESPNAdmin) || currentUser?.permissions?.editRosters === true;
  const canEditDrafts = currentUser?.role === 'admin' || currentUser?.permissions?.editDrafts === true;
  const canEditHistory = currentUser?.role === 'admin' || currentUser?.permissions?.editHistory === true;

  // Edit in-place/overlay states:
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftEditForm, setDraftEditForm] = useState({
    year: 2003,
    round: 1,
    pick: 1,
    teamId: '',
    playerName: '',
    position: '',
    college: ''
  });

  const [editingAwardId, setEditingAwardId] = useState<string | null>(null);
  const [awardEditForm, setAwardEditForm] = useState({
    year: '',
    category: '',
    playerName: '',
    teamId: '',
    statsLine: ''
  });

  // Championships form state
  const [editingChampId, setEditingChampId] = useState<string | null>(null);
  const [champForm, setChampForm] = useState({
    year: '',
    champion: '',
    championKey: '',
    runnerUp: '',
    runnerUpKey: '',
    result: '',
    fmvpName: '',
    fmvpStats: '',
    highlight: ''
  });

  // Team History editing states
  const [selectedHistoryTeamId, setSelectedHistoryTeamId] = useState<string>('');
  const [historyForm, setHistoryForm] = useState({
    established: '',
    championships: '',
    legendaryPlayers: '',
    historicalBio: ''
  });

  // Synchronize historyForm when selectedHistoryTeamId or teamHistories prop updates reactively from the server
  React.useEffect(() => {
    if (selectedHistoryTeamId) {
      const existing = teamHistories[selectedHistoryTeamId];
      if (existing) {
        setHistoryForm({
          established: existing.established || '',
          championships: Array.isArray(existing.championships) ? existing.championships.join(', ') : '',
          legendaryPlayers: Array.isArray(existing.legendaryPlayers) ? existing.legendaryPlayers.join(', ') : '',
          historicalBio: existing.historicalBio || ''
        });
      } else {
        setHistoryForm({
          established: '1980',
          championships: '',
          legendaryPlayers: '',
          historicalBio: ''
        });
      }
    }
  }, [selectedHistoryTeamId, teamHistories]);

  // Mod User creation states
  const [editingModId, setEditingModId] = useState<string | null>(null);
  const [modForm, setModForm] = useState({
    username: '',
    password: '',
    role: 'Team Owner',
    teamId: '',
    editHistory: false,
    editDrafts: false,
    editRosters: false
  });

  // League registration control states
  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Sync settings whenever users list updates
  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setRegistrationDisabled(!!data.registrationDisabled);
        setUserCount(data.userCount || 0);
      })
      .catch(err => console.error('Error syncing user controls:', err));
  }, [users]);

  const handleToggleRegistration = async () => {
    try {
      const resp = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationDisabled: !registrationDisabled })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to update settings');
      setRegistrationDisabled(!!data.registrationDisabled);
      setUserCount(data.userCount || 0);
      showAlert(`League guest account self-registration ${data.registrationDisabled ? 'DISABLED' : 'ENABLED'} successfully!`, 'success');
    } catch (err: any) {
      showAlert(err.message || 'Error updating settings', 'error');
    }
  };


  // ---------------------------------------------------------------------------
  // TEAMS HANDLERS
  // ---------------------------------------------------------------------------
  const [newTeam, setNewTeam] = useState({
    id: '',
    name: '',
    abbrev: '',
    conference: 'East' as 'East' | 'West',
    division: 'Atlantic',
    logo: '🏀',
    banner: 'linear-gradient(135deg, #111827 0%, #172554 50%, #1e3a8a 100%)',
    wins: 0,
    losses: 0,
    streak: 'None',
    ptsFor: 110.0,
    ptsAgainst: 110.0,
    retiredJerseys: '',
    gmInstagram: ''
  });

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.abbrev) {
      return showAlert('Please enter Team Name and Abbreviation!', 'error');
    }
    const slug = newTeam.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const teamData = { ...newTeam, id: slug };

    try {
      const resp = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to add team.');
      }
      showAlert(`Team "${teamData.name}" successfully created and automated elements initialized.`);
      // Reset team state
      setNewTeam({
        id: '',
        name: '',
        abbrev: '',
        conference: 'East',
        division: 'Atlantic',
        logo: '🏀',
        banner: 'linear-gradient(135deg, #111827 0%, #172554 50%, #1e3a8a 100%)',
        wins: 0,
        losses: 0,
        streak: 'None',
        ptsFor: 110.0,
        ptsAgainst: 110.0,
        retiredJerseys: '',
        gmInstagram: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const [selectedEditingTeamId, setSelectedEditingTeamId] = useState('');
  const [editTeamData, setEditTeamData] = useState({
    name: '',
    abbrev: '',
    logo: '',
    banner: '',
    retiredJerseys: '',
    gmInstagram: ''
  });

  const handleSelectEditTeam = (teamId: string) => {
    const teamObj = teams.find(t => t.id === teamId);
    if (teamObj) {
      setSelectedEditingTeamId(teamId);
      setEditTeamData({
        name: teamObj.name,
        abbrev: teamObj.abbrev,
        logo: teamObj.logo,
        banner: teamObj.banner,
        retiredJerseys: teamObj.retiredJerseys || '',
        gmInstagram: teamObj.gmInstagram || ''
      });
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditingTeamId) return;
    try {
      const resp = await fetch(`/api/teams/${selectedEditingTeamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTeamData)
      });
      if (!resp.ok) throw new Error('Failed to update team.');
      showAlert(`Franchise identity updated successfully.`);
      setSelectedEditingTeamId('');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    const teamObj = teams.find(t => t.id === teamId);
    if (!teamObj) return;
    if (!window.confirm(`⚠️ WARNING: Are you sure you want to delete "${teamObj.name}"?\nThis will automatically remove all associated players, news articles, and stats!`)) {
      return;
    }

    try {
      const resp = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Failed to delete team.');
      showAlert(`Franchise "${teamObj.name}" completely decommissioned and all automated directories cleaned.`);
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // Helper to convert device files directly to base64 images for logos / banners
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEdit) {
        setEditTeamData((prev) => ({ ...prev, logo: base64String }));
      } else {
        setNewTeam((prev) => ({ ...prev, logo: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const bannerValue = `url("${base64String}")`;
      if (isEdit) {
        setEditTeamData((prev) => ({ ...prev, banner: bannerValue }));
      } else {
        setNewTeam((prev) => ({ ...prev, banner: bannerValue }));
      }
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------------------------
  // ROSTER HANDLERS (Selected Team)
  // ---------------------------------------------------------------------------
  const [selectedRosterTeamId, setSelectedRosterTeamId] = useState(teams[0]?.id || '');

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'PG' as 'PG' | 'SG' | 'SF' | 'PF' | 'C',
    age: 22,
    rating: 80,
    ppg: 10.0,
    rpg: 4.0,
    apg: 3.0,
    spg: 1.0,
    bpg: 0.5,
    contract: '$5.0M / 2 Yrs',
    isHOF: false,
    isRetired: false,
    careerAwardsText: ''
  });

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRosterTeamId) {
      return showAlert('Please select a Team to add the player to.', 'error');
    }

    // Validate 15 players per team limit client-side
    const currentRosterSize = players.filter(p => p.teamId === selectedRosterTeamId).length;
    if (currentRosterSize >= 15) {
      return showAlert('Franchise roster is full. A team can have at most 15 players.', 'error');
    }

    if (!newPlayer.name) {
      return showAlert('Player name is required!', 'error');
    }

    const { careerAwardsText, ...playerBase } = newPlayer;
    const awardsArray = careerAwardsText
      ? careerAwardsText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const playerData = {
      ...playerBase,
      careerAwards: awardsArray,
      id: 'player-' + Date.now(),
      teamId: selectedRosterTeamId
    };

    try {
      const resp = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData)
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add player.');
      }
      showAlert(`Player "${newPlayer.name}" signed to franchise.`);
      setNewPlayer({
        name: '',
        position: 'PG',
        age: 22,
        rating: 80,
        ppg: 10.0,
        rpg: 4.0,
        apg: 3.0,
        spg: 1.0,
        bpg: 0.5,
        contract: '$5.0M / 2 Yrs',
        isHOF: false,
        isRetired: false,
        careerAwardsText: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPlayerData, setEditingPlayerData] = useState<any>({});

  const startEditPlayer = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditingPlayerData({ ...p });
  };

  const saveEditedPlayer = async (pId: string) => {
    const oldPlayer = players.find(p => p.id === pId);
    if (oldPlayer && editingPlayerData.teamId !== oldPlayer.teamId) {
      const targetRosterSize = players.filter(p => p.teamId === editingPlayerData.teamId).length;
      if (targetRosterSize >= 15) {
        return showAlert('Target franchise roster is full. A team can have at most 15 players.', 'error');
      }
    }

    try {
      const resp = await fetch(`/api/players/${pId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlayerData)
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update player stats.');
      }
      showAlert(`Roster statistics updated successfully for ${editingPlayerData.name}.`);
      setEditingPlayerId(null);
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeletePlayer = async (pId: string) => {
    if (!window.confirm('Release this player into free agency?')) return;
    try {
      const resp = await fetch(`/api/players/${pId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Release failed.');
      showAlert('Player released from team contract.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // STANDINGS & POWER RANKINGS
  // ---------------------------------------------------------------------------
  const [standingEdits, setStandingEdits] = useState<{ [key: string]: { wins: number; losses: number; streak: string } }>(
    teams.reduce((acc, t) => {
      acc[t.id] = { wins: t.wins, losses: t.losses, streak: t.streak };
      return acc;
    }, {} as any)
  );

  const handleStandingChange = (teamId: string, field: 'wins' | 'losses' | 'streak', value: any) => {
    setStandingEdits(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId] || { wins: 0, losses: 0, streak: 'None' },
        [field]: field === 'streak' ? value : Number(value)
      }
    }));
  };

  const handleSaveAllStandings = async () => {
    const dataToSend = Object.keys(standingEdits).map(tId => ({
      id: tId,
      wins: standingEdits[tId].wins,
      losses: standingEdits[tId].losses,
      streak: standingEdits[tId].streak
    }));

    try {
      const resp = await fetch('/api/standings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      if (!resp.ok) throw new Error('Failed to save standings.');
      showAlert('Standings table and team records updated successfully.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const moveRanking = async (index: number, direction: 'up' | 'down') => {
    const listCopy = [...powerRankings];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= listCopy.length) return;

    // Swap
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIdx];
    listCopy[targetIdx] = temp;

    // Re-assign ranks
    const updatedRankings = listCopy.map((item, idx) => {
      let movement: 'up' | 'down' | 'same' = 'same';
      const actualRank = idx + 1;
      if (actualRank < item.prevRank) movement = 'up';
      else if (actualRank > item.prevRank) movement = 'down';

      return {
        ...item,
        rank: actualRank,
        movement
      };
    });

    try {
      const resp = await fetch('/api/power_rankings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRankings)
      });
      if (!resp.ok) throw new Error('Failed to save power rankings order.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleRankingNotesChange = async (teamId: string, notes: string) => {
    const rankingsCopy = powerRankings.map(r => r.teamId === teamId ? { ...r, notes } : r);
    try {
      const resp = await fetch('/api/power_rankings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankingsCopy)
      });
      if (!resp.ok) throw new Error('Failed to update comments.');
      // Quiet success, only re-pull locally
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // NEWS MANAGER
  // ---------------------------------------------------------------------------
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    category: 'League News' as any,
    teamId: '',
    image: ''
  });

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.content) {
      return showAlert('Article Title and Body Content are required!', 'error');
    }

    const newsData = {
      ...newNews,
      teamId: newNews.teamId === '' ? null : newNews.teamId
    };

    try {
      const resp = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData)
      });
      if (!resp.ok) throw new Error('Failed to publish news.');
      showAlert(`News article "${newsData.title}" published successfully.`);
      setNewNews({
        title: '',
        content: '',
        category: 'League News',
        teamId: '',
        image: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteNews = async (nId: string) => {
    if (!window.confirm('Delete this article completely?')) return;
    try {
      const resp = await fetch(`/api/news/${nId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Failed to delete.');
      showAlert('Article removed from feed database.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleNewsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewNews((prev) => ({ ...prev, image: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------------------------
  // TRADES, DRAFTS, AWARDS
  // ---------------------------------------------------------------------------
  const [newTrade, setNewTrade] = useState({
    teamAId: teams[0]?.id || '',
    teamBId: teams[1]?.id || '',
    receivesA: '',
    receivesB: '',
    details: ''
  });

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrade.teamAId === newTrade.teamBId) {
      return showAlert('A trade cannot be held with the same team!', 'error');
    }

    const tradePayload = {
      teamAId: newTrade.teamAId,
      teamBId: newTrade.teamBId,
      teamAReceives: newTrade.receivesA.split(',').map(s => s.trim()).filter(Boolean),
      teamBReceives: newTrade.receivesB.split(',').map(s => s.trim()).filter(Boolean),
      details: newTrade.details,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const resp = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradePayload)
      });
      if (!resp.ok) throw new Error('Trade execution failed on server.');
      showAlert('Trade completely executed. Blockbuster logged in Trade Tracker!');
      setNewTrade({
        teamAId: teams[0]?.id || '',
        teamBId: teams[1]?.id || '',
        receivesA: '',
        receivesB: '',
        details: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteTrade = async (tId: string) => {
    if (!window.confirm('Revoke this trade record?')) return;
    try {
      const resp = await fetch(`/api/trades/${tId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Delete failed.');
      showAlert('Trade ledger item removed safely.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const [newDraft, setNewDraft] = useState({
    year: 2004,
    round: 1,
    pick: 1,
    teamId: teams[0]?.id || '',
    playerName: '',
    position: 'PG',
    college: ''
  });

  const handleAddDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraft.playerName) return showAlert('Please enter player name.', 'error');

    try {
      const resp = await fetch('/api/draft_results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft)
      });
      if (!resp.ok) throw new Error('Failed to record draft selection.');
      showAlert(`Drafted player "${newDraft.playerName}" recorded.`);
      setNewDraft(prev => ({ ...prev, pick: prev.pick + 1, playerName: '', college: '' }));
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteDraft = async (dId: string) => {
    if (!window.confirm('Delete draft history entry?')) return;
    try {
      const resp = await fetch(`/api/draft_results/${dId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Revoke failed.');
      showAlert('Draft entry removed.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const [newAward, setNewAward] = useState({
    year: '2025-26',
    category: 'Most Valuable Player' as any,
    playerName: '',
    teamId: teams[0]?.id || '',
    statsLine: ''
  });

  const handleAddAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAward.playerName) return showAlert('Accomplished athlete name is required.', 'error');

    try {
      const resp = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAward)
      });
      if (!resp.ok) throw new Error('Add award failed.');
      showAlert(`Award catalog successfully modified. Brand new "${newAward.category}" logged.`);
      setNewAward({
        year: '2025-26',
        category: 'Most Valuable Player',
        playerName: '',
        teamId: teams[0]?.id || '',
        statsLine: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteAward = async (aId: string) => {
    if (!window.confirm('Purge this award record from league archives?')) return;
    try {
      const resp = await fetch(`/api/awards/${aId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Revoke failed.');
      showAlert('Award record permanently removed.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // DRAFT & AWARD EDIT AND UPDATE HANDLERS
  // ---------------------------------------------------------------------------
  const handleEditDraft = (pick: DraftResult) => {
    setEditingDraftId(pick.id);
    setDraftEditForm({
      year: pick.year,
      round: pick.round,
      pick: pick.pick,
      teamId: pick.teamId,
      playerName: pick.playerName,
      position: pick.position,
      college: pick.college || ''
    });
  };

  const handleUpdateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraftId) return;
    try {
      const resp = await fetch(`/api/draft_results/${editingDraftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftEditForm)
      });
      if (!resp.ok) throw new Error('Failed to update draft pick.');
      showAlert('Draft pick updated successfully!');
      setEditingDraftId(null);
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditAward = (aw: Award) => {
    setEditingAwardId(aw.id);
    setAwardEditForm({
      year: aw.year || '',
      category: aw.category,
      playerName: aw.playerName,
      teamId: aw.teamId,
      statsLine: aw.statsLine || ''
    });
  };

  const handleUpdateAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAwardId) return;
    try {
      const resp = await fetch(`/api/awards/${editingAwardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(awardEditForm)
      });
      if (!resp.ok) throw new Error('Failed to update award.');
      showAlert('Award log updated successfully!');
      setEditingAwardId(null);
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // CHAMPIONSHIPS HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/championships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(champForm)
      });
      if (!resp.ok) throw new Error('Failed to create championship record.');
      showAlert(`Championship of ${champForm.year} added successfully!`);
      setChampForm({
        year: '', champion: '', championKey: '',
        runnerUp: '', runnerUpKey: '', result: '',
        fmvpName: '', fmvpStats: '', highlight: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditChampionship = (c: ChampionshipRecord) => {
    setEditingChampId(c.id || null);
    setChampForm({
      year: c.year,
      champion: c.champion,
      championKey: c.championKey || '',
      runnerUp: c.runnerUp || '',
      runnerUpKey: c.runnerUpKey || '',
      result: c.result || '',
      fmvpName: c.fmvpName || '',
      fmvpStats: c.fmvpStats || '',
      highlight: c.highlight || ''
    });
  };

  const handleUpdateChampionship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChampId) return;
    try {
      const resp = await fetch(`/api/championships/${editingChampId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(champForm)
      });
      if (!resp.ok) throw new Error('Failed to update championship record.');
      showAlert('Championship record updated successfully!');
      setEditingChampId(null);
      setChampForm({
        year: '', champion: '', championKey: '',
        runnerUp: '', runnerUpKey: '', result: '',
        fmvpName: '', fmvpStats: '', highlight: ''
      });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteChampionship = async (idOrYear: string) => {
    if (!window.confirm('Are you sure you want to delete this championship record?')) return;
    try {
      const resp = await fetch(`/api/championships/${encodeURIComponent(idOrYear)}`, { method: 'DELETE' });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete championship record.');
      }
      showAlert('Championship record deleted successfully.');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // TEAM HISTORY HANDLERS
  // ---------------------------------------------------------------------------
  const handleSelectHistoryTeam = (teamId: string) => {
    setSelectedHistoryTeamId(teamId);
    const existing = teamHistories[teamId];
    if (existing) {
      setHistoryForm({
        established: existing.established || '',
        championships: Array.isArray(existing.championships) ? existing.championships.join(', ') : '',
        legendaryPlayers: Array.isArray(existing.legendaryPlayers) ? existing.legendaryPlayers.join(', ') : '',
        historicalBio: existing.historicalBio || ''
      });
    } else {
      setHistoryForm({
        established: '1980',
        championships: '',
        legendaryPlayers: '',
        historicalBio: ''
      });
    }
  };

  const handleSaveTeamHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHistoryTeamId) return showAlert('Please select a franchise first!', 'error');
    try {
      const payload = {
        established: historyForm.established,
        championships: historyForm.championships.split(',').map(s => s.trim()).filter(Boolean),
        legendaryPlayers: historyForm.legendaryPlayers.split(',').map(s => s.trim()).filter(Boolean),
        historicalBio: historyForm.historicalBio
      };
      const resp = await fetch(`/api/team_histories/${selectedHistoryTeamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Failed to update team history.');
      showAlert('Franchise legacy history updated successfully!');
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // MOD USER HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddModUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modForm.role !== 'Team Owner' && !modForm.username) {
      return showAlert('Username is required for non-owner roles.', 'error');
    }
    if (!modForm.password) return showAlert('Missing password!', 'error');
    try {
      const payload = {
        username: modForm.username,
        password: modForm.password,
        role: modForm.role,
        teamId: modForm.role === 'Team Owner' ? modForm.teamId : '',
        permissions: {
          editHistory: modForm.editHistory,
          editDrafts: modForm.editDrafts,
          editRosters: modForm.editRosters
        }
      };
      const resp = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to register moderator.');
      }
      showAlert(`Moderator seating saved successfully!`);
      setModForm({ username: '', password: '', role: 'Team Owner', teamId: '', editHistory: false, editDrafts: false, editRosters: false });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleEditModUser = (u: ModUser) => {
    setEditingModId(u.id || null);
    setModForm({
      username: u.username,
      password: u.password || '',
      role: u.role || 'Team Owner',
      teamId: u.teamId || '',
      editHistory: u.permissions?.editHistory || false,
      editDrafts: u.permissions?.editDrafts || false,
      editRosters: u.permissions?.editRosters || false
    });
  };

  const handleUpdateModUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModId) return;
    if (modForm.role !== 'Team Owner' && !modForm.username) {
      return showAlert('Username is required for non-owner roles.', 'error');
    }
    if (!modForm.password) return showAlert('Missing password!', 'error');
    try {
      const payload = {
        username: modForm.username,
        password: modForm.password,
        role: modForm.role,
        teamId: modForm.role === 'Team Owner' ? modForm.teamId : '',
        permissions: {
          editHistory: modForm.editHistory,
          editDrafts: modForm.editDrafts,
          editRosters: modForm.editRosters
        }
      };
      const resp = await fetch(`/api/users/${editingModId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to update moderator account.');
      }
      showAlert(`Moderator configuration updated successfully!`);
      setEditingModId(null);
      setModForm({ username: '', password: '', role: 'Team Owner', teamId: '', editHistory: false, editDrafts: false, editRosters: false });
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  const handleDeleteModUser = async (id: string) => {
    if (!window.confirm('Delete this moderator account?')) return;
    try {
      const resp = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Failed to delete moderator.');
      showAlert('Moderator user deleted.');
      if (editingModId === id) {
        setEditingModId(null);
        setModForm({ username: '', password: '', role: 'Team Owner', teamId: '', editHistory: false, editDrafts: false, editRosters: false });
      }
      onRefreshDB();
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };


  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
      {/* HEADER PANEL */}
      <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-transparent py-6 px-6 sm:px-8 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight flex items-center gap-2 text-amber-500">
            <ShieldAlert className="w-6 h-6 animate-pulse text-red-500" />
            League Administrators Room
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
            Control Station • Live Action Synchronization Enabled
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefreshDB}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg transition"
          >
            ↻ Reload Database
          </button>
        </div>
      </div>

      {/* FLOATING SYSTEM ALERTS */}
      {alertMessage && (
        <div className={`m-6 p-4 rounded-xl flex items-center gap-3 border ${
          alertMessage.type === 'success'
            ? 'bg-green-950/40 border-green-800/40 text-green-400'
            : 'bg-red-950/40 border-red-800/40 text-red-400'
        }`}>
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{alertMessage.text}</span>
        </div>
      )}

      {/* DASHBOARD TABS */}
      <div className="flex border-b border-gray-800 overflow-x-auto bg-gray-950/40 scrollbar-none">
        {[
          { id: 'teams', label: 'Franchise Identity', count: teams.length },
          { id: 'rosters', label: 'Rosters & Athletes', count: players.length },
          { id: 'standings', label: 'Standings & Rank', count: powerRankings.length },
          { id: 'news', label: 'News Publications', count: news.length },
          { id: 'transactions', label: 'Trades, Draft & Cups', count: trades.length + draftResults.length + awards.length },
          { id: 'championships', label: 'Finals Champions', count: championships.length },
          { id: 'teamHistories', label: 'Franchise History', count: Object.keys(teamHistories).length },
          ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'Mod Panel', count: users.length }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-4 text-xs font-semibold tracking-wide border-b-2 whitespace-nowrap transition-all uppercase cursor-pointer ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/25'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 font-mono px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* PANEL BODY CONTENT */}
      <div className="p-6 sm:p-8">

        {/* ======================= FRANCHISE LOGICS ======================= */}
        {activeTab === 'teams' && (
          <div className="space-y-10">
            {/* ADD TEAM FORM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-gray-950/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  Expand League: Add Franchise
                </h3>

                <form onSubmit={handleAddTeam} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Team Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phoenix Solars"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white placeholder-gray-500 outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Acronym</label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        placeholder="e.g. PHX"
                        value={newTeam.abbrev}
                        onChange={(e) => setNewTeam({ ...newTeam, abbrev: e.target.value.toUpperCase() })}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-center text-white placeholder-gray-500 uppercase outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Logo Icon / Upload</label>
                      <input
                        type="text"
                        placeholder="e.g. ☀️"
                        value={newTeam.logo.startsWith('data:') ? '[Device Photo Uploaded]' : newTeam.logo}
                        onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-center text-white outline-none transition text-xs"
                      />
                      <div className="mt-1.5 flex justify-center">
                        <label className="cursor-pointer text-[10px] text-amber-500 hover:text-white font-mono bg-gray-905 border border-gray-800 hover:border-amber-500 rounded-lg px-2.5 py-1 flex items-center justify-center gap-1 active:scale-95 transition">
                          <span>📸 Photo Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoFileChange(e, false)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Conference</label>
                      <select
                        value={newTeam.conference}
                        onChange={(e) => setNewTeam({ ...newTeam, conference: e.target.value as any })}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none cursor-pointer"
                      >
                        <option value="East">East</option>
                        <option value="West">West</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Division</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pacific"
                        value={newTeam.division}
                        onChange={(e) => setNewTeam({ ...newTeam, division: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">CSS Banner Gradient / Image</label>
                    <input
                      type="text"
                      placeholder="linear-gradient(...) or url"
                      value={newTeam.banner.startsWith('url("data:') ? '[Device Photo Uploaded]' : newTeam.banner}
                      onChange={(e) => setNewTeam({ ...newTeam, banner: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2 text-xs font-mono text-gray-300 outline-none transition"
                    />
                    <div className="mt-1.5">
                      <label className="cursor-pointer inline-flex text-[10px] text-amber-500 hover:text-white font-mono bg-gray-905 border border-gray-800 hover:border-amber-500 rounded-lg px-2.5 py-1 items-center gap-1 active:scale-95 transition">
                        <span>📸 Upload Phone Banner</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleBannerFileChange(e, false)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Retired Jerseys</label>
                      <input
                        type="text"
                        placeholder="e.g. 8, 24, 32"
                        value={newTeam.retiredJerseys}
                        onChange={(e) => setNewTeam({ ...newTeam, retiredJerseys: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none transition text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">GM IG Handle</label>
                      <input
                        type="text"
                        placeholder="e.g. @lakers_gm"
                        value={newTeam.gmInstagram}
                        onChange={(e) => setNewTeam({ ...newTeam, gmInstagram: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none transition text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold rounded-lg text-sm transition tracking-wider uppercase cursor-pointer mt-4"
                  >
                    Deploy Franchise
                  </button>
                </form>
              </div>

              {/* LIST / EDIT REMOVE DIRECTORIES */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-950/20 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-500" />
                    League Franchises Directory Management
                  </h3>

                  {selectedEditingTeamId && (
                    <form onSubmit={handleUpdateTeam} className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg mb-4 space-y-4">
                      <div className="flex justify-between items-center decoration-none">
                        <span className="text-xs font-mono font-bold text-amber-500">RENAME & DESIGN: EDITING "{selectedEditingTeamId}"</span>
                        <button
                          type="button"
                          onClick={() => setSelectedEditingTeamId('')}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-semibold">RENAME TEAM</label>
                          <input
                            type="text"
                            required
                            value={editTeamData.name}
                            onChange={(e) => setEditTeamData({ ...editTeamData, name: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 focus:border-amber-500 outline-none text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-semibold">ABBREVIATION</label>
                          <input
                            type="text"
                            required
                            maxLength={3}
                            value={editTeamData.abbrev}
                            onChange={(e) => setEditTeamData({ ...editTeamData, abbrev: e.target.value.toUpperCase() })}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 focus:border-amber-500 outline-none text-white text-xs uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-semibold">UPDATE LOGO EMOJI/URL</label>
                          <input
                            type="text"
                            value={editTeamData.logo.startsWith('data:') ? '[Device Photo Uploaded]' : editTeamData.logo}
                            onChange={(e) => setEditTeamData({ ...editTeamData, logo: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 focus:border-amber-500 outline-none text-white text-xs"
                          />
                          <div className="mt-1">
                            <label className="cursor-pointer inline-flex text-[9px] text-amber-500 hover:text-white font-mono bg-gray-905 border border-gray-800 hover:border-amber-500 rounded px-2 py-0.5 items-center gap-1 active:scale-95 transition">
                              <span>📸 Upload Logo File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleLogoFileChange(e, true)}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-semibold">BANNER CSS STYLE / IMAGE</label>
                          <input
                            type="text"
                            value={editTeamData.banner.startsWith('url("data:') ? '[Device Photo Uploaded]' : editTeamData.banner}
                            onChange={(e) => setEditTeamData({ ...editTeamData, banner: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 focus:border-amber-500 outline-none text-xs font-mono text-gray-300"
                          />
                          <div className="mt-1">
                            <label className="cursor-pointer inline-flex text-[9px] text-amber-500 hover:text-white font-mono bg-gray-905 border border-gray-800 hover:border-amber-500 rounded px-2 py-0.5 items-center gap-1 active:scale-95 transition">
                              <span>📸 Upload Banner File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleBannerFileChange(e, true)}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-semibold">RETIRED JERSEYS</label>
                          <input
                            type="text"
                            placeholder="e.g. 8, 24, 32"
                            value={editTeamData.retiredJerseys}
                            onChange={(e) => setEditTeamData({ ...editTeamData, retiredJerseys: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 focus:border-amber-500 outline-none text-white text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-semibold">GM INSTAGRAM HANDLE</label>
                          <input
                            type="text"
                            placeholder="e.g. @lakers_gm"
                            value={editTeamData.gmInstagram}
                            onChange={(e) => setEditTeamData({ ...editTeamData, gmInstagram: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5 focus:border-amber-500 outline-none text-white text-xs font-mono"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded text-xs transition uppercase float-right"
                      >
                        Commit Changes
                      </button>
                      <div className="clear-both"></div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teams.map((t) => (
                      <div
                        key={t.id}
                        className="bg-gray-900/40 hover:bg-gray-900 border border-gray-800 hover:border-gray-700/80 rounded-lg p-3 flex justify-between items-center transition"
                      >
                        <div className="flex items-center gap-2">
                          {renderLogo(t.logo, "w-6 h-6 object-contain inline-block rounded-sm")}
                          <div>
                            <span className="font-bold text-sm text-gray-100">{t.name}</span>
                            <span className="block text-[10px] text-gray-400 font-mono">
                              {t.abbrev} • {t.conference} Conference
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSelectEditTeam(t.id)}
                            className="p-1 px-2 text-xs font-semibold bg-gray-800 text-gray-300 hover:text-amber-500 hover:bg-gray-700 rounded transition"
                            title="Edit Identity/Logo"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(t.id)}
                            className="p-1 text-red-500 hover:text-white hover:bg-red-900/30 rounded transition"
                            title="Delete Franchise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= ROSTERS LOGICS ======================= */}
        {activeTab === 'rosters' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <label className="block text-xs text-amber-500 uppercase font-bold tracking-wider mb-1 font-mono">Selected Franchise Dynamic Roster</label>
                <select
                  value={selectedRosterTeamId}
                  onChange={(e) => setSelectedRosterTeamId(e.target.value)}
                  className="bg-gray-950 border border-gray-800 hover:border-gray-700 p-2 text-sm font-semibold text-white rounded-lg outline-none cursor-pointer"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.abbrev})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* NEW SIGNING SIGN */}
              <div className="lg:col-span-1 bg-gray-950/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4">✍️ Contract Room: Sign Player</h3>
                <form onSubmit={handleAddPlayer} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Player Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shaquille O'Neil"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded p-2 text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <select
                        value={newPlayer.position}
                        onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value as any })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      >
                        <option value="PG">PG (Point Guard)</option>
                        <option value="SG">SG (Shooting Guard)</option>
                        <option value="SF">SF (Small Forward)</option>
                        <option value="PF">PF (Power Forward)</option>
                        <option value="C">C (Center)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Age</label>
                      <input
                        type="number"
                        min={18}
                        max={45}
                        value={newPlayer.age}
                        onChange={(e) => setNewPlayer({ ...newPlayer, age: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Overall OVR (50-99)</label>
                    <input
                      type="number"
                      min={50}
                      max={99}
                      value={newPlayer.rating}
                      onChange={(e) => setNewPlayer({ ...newPlayer, rating: Number(e.target.value) })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                    />
                  </div>

                  <div className="bg-gray-950 p-3 rounded-lg border border-gray-855 space-y-3">
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-2 text-gray-300 font-bold select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlayer.isRetired}
                          onChange={(e) => setNewPlayer({ ...newPlayer, isRetired: e.target.checked })}
                          className="rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500"
                        />
                        Retired Legend?
                      </label>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1 font-mono uppercase tracking-wider">Career Honors & Awards (Comma-Separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. 2004 NBA Rookie of the Year, 3x Champion, 4x All-Star"
                        value={newPlayer.careerAwardsText}
                        onChange={(e) => setNewPlayer({ ...newPlayer, careerAwardsText: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-1.5 text-white outline-none text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition uppercase cursor-pointer"
                  >
                    Execute Roster Signup
                  </button>
                </form>
              </div>

              {/* CURRENT SIGNED ROSTER */}
              <div className="lg:col-span-2 bg-gray-950/20 rounded-xl border border-gray-800 p-6 overflow-x-auto">
                <h3 className="text-base font-bold text-gray-200 mb-4 font-display">Active Registered Athletes</h3>

                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase">
                      <th className="py-2.5">Athlete</th>
                      <th>Rating</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .filter(p => p.teamId === selectedRosterTeamId)
                      .map((p) => {
                        const isEditing = editingPlayerId === p.id;
                        return (
                          <tr key={p.id} className="border-b border-gray-800/60 hover:bg-gray-900/40">
                            <td className="py-3 font-sans">
                              {isEditing ? (
                                <div className="space-y-1.5 p-1.5 bg-gray-950 rounded border border-gray-800 my-1 max-w-xs">
                                  <div>
                                    <input
                                      type="text"
                                      value={editingPlayerData.name}
                                      onChange={(e) => setEditingPlayerData({ ...editingPlayerData, name: e.target.value })}
                                      className="bg-gray-900 border border-gray-700 text-white px-1 py-0.5 rounded text-xs w-full"
                                    />
                                  </div>
                                  <div className="flex gap-2 items-center justify-between text-[10px]">
                                    <label className="flex items-center gap-1 text-gray-300 font-semibold select-none cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={!!editingPlayerData.isRetired}
                                        onChange={(e) => setEditingPlayerData({ ...editingPlayerData, isRetired: e.target.checked })}
                                        className="rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500"
                                      />
                                      Ret?
                                    </label>
                                    <select
                                      value={editingPlayerData.position}
                                      onChange={(e) => setEditingPlayerData({ ...editingPlayerData, position: e.target.value })}
                                      className="bg-gray-900 border border-gray-700 text-white text-[9px] rounded p-0.5 cursor-pointer"
                                    >
                                      <option value="PG">PG</option>
                                      <option value="SG">SG</option>
                                      <option value="SF">SF</option>
                                      <option value="PF">PF</option>
                                      <option value="C">C</option>
                                    </select>
                                  </div>
                                  <div className="space-y-0.5 text-left">
                                    <span className="text-[9px] text-gray-400 block font-mono">CAREER AWARDS:</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. 2004 MVP, 3x Champ"
                                      value={Array.isArray(editingPlayerData.careerAwards) ? editingPlayerData.careerAwards.join(', ') : (editingPlayerData.careerAwards || '')}
                                      onChange={(e) => setEditingPlayerData({ ...editingPlayerData, careerAwards: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                                      className="bg-gray-900 border border-gray-700 text-white px-1 py-0.5 rounded text-[10px] w-full outline-none"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-gray-200 block">{p.name}</span>
                                    {p.isRetired && <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded font-mono font-bold leading-tight font-sans">RETIRED</span>}
                                  </div>
                                  <span className="text-[10px] px-1 bg-gray-800 text-gray-400 font-mono rounded">
                                    {p.position} • Age {p.age}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editingPlayerData.rating}
                                  onChange={(e) => setEditingPlayerData({ ...editingPlayerData, rating: Number(e.target.value) })}
                                  className="w-12 bg-gray-900 border border-gray-700 text-white p-0.5 text-center text-xs"
                                />
                              ) : (
                                <span className={`font-mono font-bold text-sm ${
                                  p.rating >= 90 ? 'text-red-500' : p.rating >= 80 ? 'text-amber-500' : 'text-gray-400'
                                }`}>
                                  {p.rating} OVR
                                </span>
                              )}
                            </td>

                            <td className="text-center">
                              {isEditing ? (
                                <div className="flex gap-1 justify-center">
                                  <button
                                    onClick={() => saveEditedPlayer(p.id)}
                                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Apply
                                  </button>
                                  <button
                                    onClick={() => setEditingPlayerId(null)}
                                    className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px]"
                                  >
                                    Close
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 justify-center">
                                  <button
                                    onClick={() => startEditPlayer(p)}
                                    className="text-gray-400 hover:text-amber-500 font-bold"
                                    title="Edit Stats"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlayer(p.id)}
                                    className="text-gray-500 hover:text-red-500"
                                    title="Release Player"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= STANDINGS & POWER LOCKS ======================= */}
        {activeTab === 'standings' && (
          <div className="space-y-10">
            {/* STANDINGS GRID EDIT */}
            <div className="bg-gray-950/40 p-6 rounded-xl border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-200">📊 Quick Standings Editor (Eastern & Western)</h3>
                <button
                  onClick={handleSaveAllStandings}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-950 font-bold rounded-lg text-xs transition uppercase cursor-pointer shadow-md"
                >
                  Apply Standing Updates
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300 min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-2">Team Identity</th>
                      <th>Conf</th>
                      <th className="text-center">Wins</th>
                      <th className="text-center">Losses</th>
                      <th className="text-center">Streak Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t) => {
                      const temp = standingEdits[t.id] || { wins: t.wins, losses: t.losses, streak: t.streak };
                      return (
                        <tr key={t.id} className="border-b border-gray-800/60 hover:bg-gray-900/20">
                          <td className="py-3 font-semibold text-gray-100 flex items-center gap-2">
                            {renderLogo(t.logo, "w-5 h-5 object-contain inline-block rounded-sm")}
                            <span>{t.name}</span>
                          </td>
                          <td className="font-semibold text-gray-400">{t.conference}</td>
                          <td className="text-center">
                            <input
                              type="number"
                              min={0}
                              value={temp.wins}
                              onChange={(e) => handleStandingChange(t.id, 'wins', e.target.value)}
                              className="w-16 bg-gray-900 border border-gray-700 text-center p-1 rounded font-mono text-xs focus:border-amber-500 text-white outline-none"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              min={0}
                              value={temp.losses}
                              onChange={(e) => handleStandingChange(t.id, 'losses', e.target.value)}
                              className="w-16 bg-gray-900 border border-gray-700 text-center p-1 rounded font-mono text-xs focus:border-amber-500 text-white outline-none"
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="W1"
                              value={temp.streak}
                              onChange={(e) => handleStandingChange(t.id, 'streak', e.target.value)}
                              className="w-16 bg-gray-900 border border-gray-700 text-center p-1 rounded text-xs uppercase text-amber-500 outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* POWER RANKINGS SLIDER */}
            <div className="bg-gray-950/40 p-6 rounded-xl border border-gray-800">
              <h3 className="text-base font-bold text-gray-200 mb-2">⭐ Dynamic Power Rankings Hierarchy</h3>
              <p className="text-xs text-gray-400 mb-6">Manage hierarchy positionings directly and write editorial write-ups describing recent team states.</p>

              <div className="space-y-4">
                {powerRankings
                  .sort((a,b) => a.rank - b.rank)
                  .map((item, idx) => {
                    const teamObj = teams.find(t => t.id === item.teamId);
                    if (!teamObj) return null;
                    return (
                      <div
                        key={item.teamId}
                        className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-black text-xl text-amber-500">#{idx + 1}</span>
                          {renderLogo(teamObj.logo, "w-8 h-8 object-contain inline-block rounded-sm")}
                          <div>
                            <span className="font-bold text-sm block">{teamObj.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              PREV: #{item.prevRank} • {item.movement.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* DESCRIPTIVE WRITE-UPS */}
                        <div className="flex-grow max-w-lg w-full">
                          <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1 font-mono">Editorial Rankings Notes</label>
                          <textarea
                            rows={1}
                            placeholder="Write ranking context..."
                            defaultValue={item.notes}
                            onBlur={(e) => handleRankingNotesChange(item.teamId, e.target.value)}
                            className="w-full bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded p-1.5 text-xs text-gray-300 outline-none transition"
                          />
                        </div>

                        {/* SHUFFLERS */}
                        <div className="flex gap-1.5 justify-self-end">
                          <button
                            onClick={() => moveRanking(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 px-2 text-xs font-bold bg-gray-800 hover:bg-gray-700 disabled:opacity-20 text-gray-300 rounded cursor-pointer"
                          >
                            ▲ Move Up
                          </button>
                          <button
                            onClick={() => moveRanking(idx, 'down')}
                            disabled={idx === powerRankings.length - 1}
                            className="p-1 px-2 text-xs font-bold bg-gray-800 hover:bg-gray-700 disabled:opacity-20 text-gray-300 rounded cursor-pointer"
                          >
                            ▼ Move Down
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ======================= NEWS CENTER LOGICS ======================= */}
        {activeTab === 'news' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* PUBLISH ARTICLES Form */}
              <div className="lg:col-span-1 bg-gray-950/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4">✍️ New Broadcast: Publish Article</h3>

                <form onSubmit={handleAddNews} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Article Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Brooks Sets Record!"
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded p-2.5 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Category / Tag</label>
                    <select
                      value={newNews.category}
                      onChange={(e) => setNewNews({ ...newNews, category: e.target.value as any })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                    >
                      <option value="League News">League News</option>
                      <option value="Trade Alert">Trade Alert</option>
                      <option value="Game Recap">Game Recap</option>
                      <option value="Injuries">Injuries</option>
                      <option value="Offseason">Offseason</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Associated Franchise</label>
                    <select
                      value={newNews.teamId}
                      onChange={(e) => setNewNews({ ...newNews, teamId: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                    >
                      <option value="">-- General League Wide --</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Banner Image URL / Device Photo</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or file"
                      value={newNews.image.startsWith('data:') ? '[Device Photo Uploaded]' : newNews.image}
                      onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded p-2 text-white outline-none font-mono text-xs"
                    />
                    <div className="mt-1.5">
                      <label className="cursor-pointer inline-flex text-[10px] text-amber-500 hover:text-white font-mono bg-gray-905 border border-gray-800 hover:border-amber-500 rounded-lg px-2.5 py-1 items-center gap-1 active:scale-95 transition">
                        <span>📸 Upload Phone Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleNewsFileChange}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Article Content Body (HTML or Markdown)</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="State full broadcast details..."
                      value={newNews.content}
                      onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded p-2.5 text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-lg text-xs tracking-wide transition uppercase cursor-pointer"
                  >
                    Publish Broadcast
                  </button>
                </form>
              </div>

              {/* REGISTERED ARTICLES BOARD */}
              <div className="lg:col-span-2 bg-gray-950/20 rounded-xl border border-gray-800 p-6">
                <h3 className="text-base font-bold text-gray-200 mb-4 font-display">Archived Publications</h3>

                <div className="space-y-4">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-900/40 hover:bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center transition"
                    >
                      <div>
                        <span className="text-[10px] px-1.5 py-0.5 font-mono font-bold bg-amber-500/10 text-amber-500 rounded">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-sm text-gray-100 mt-1.5">{item.title}</h4>
                        <span className="block text-[10px] text-gray-400 mt-0.5 font-mono">{item.date}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteNews(item.id)}
                        className="p-1.5 text-red-500 hover:text-white hover:bg-red-900/40 rounded transition cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TRANSACTIONS BOARD (Trades, Draft, Awards) ======================= */}
        {activeTab === 'transactions' && (
          <div className="space-y-12">
            {/* TRADES HANDLER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-950/45 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-5 h-5 text-amber-500" />
                  Issue Blockbuster Trade Agreement
                </h3>

                <form onSubmit={handleAddTrade} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Franchise A</label>
                      <select
                        value={newTrade.teamAId}
                        onChange={(e) => setNewTrade({ ...newTrade, teamAId: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Franchise B</label>
                      <select
                        value={newTrade.teamBId}
                        onChange={(e) => setNewTrade({ ...newTrade, teamBId: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Franchise A Receives (comma-separated)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shaquille O'Neil, 2027 1st Round Pick"
                      value={newTrade.receivesA}
                      onChange={(e) => setNewTrade({ ...newTrade, receivesA: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Franchise B Receives (comma-separated)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Yao Ming (C), 2028 2nd Round Pick"
                      value={newTrade.receivesB}
                      onChange={(e) => setNewTrade({ ...newTrade, receivesB: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Trade Details Context</label>
                    <textarea
                      required
                      placeholder="Reviewing physical fitness standards, contract implications, and future capabilities..."
                      rows={2}
                      value={newTrade.details}
                      onChange={(e) => setNewTrade({ ...newTrade, details: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded text-xs transition uppercase cursor-pointer"
                  >
                    Execute Trade Ledger
                  </button>
                </form>
              </div>

              {/* LOGS BOARD FOR ACTIVE RECENT TRADES */}
              <div className="bg-gray-950/20 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4">Trade Ledger Archives</h3>
                <div className="space-y-4 max-h-[350px] overflow-y-auto">
                  {trades.map(t => {
                    const teamA = teams.find(x => x.id === t.teamAId);
                    const teamB = teams.find(x => x.id === t.teamBId);
                    return (
                      <div key={t.id} className="bg-gray-900/60 p-3 rounded border border-gray-800 text-xs flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-amber-500 font-bold">{t.date}</span>
                          <h4 className="font-bold text-gray-200">
                            {teamA?.abbrev} ⇋ {teamB?.abbrev} Swap
                          </h4>
                          <span className="block text-gray-400 leading-relaxed text-[11px]">{t.details}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTrade(t.id)}
                          className="text-red-500 hover:text-white p-1 hover:bg-red-900/20 rounded transition"
                        >
                          Revoke
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-800"></div>

            {/* DRAFT HISTORY & AWARDS DUAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* DRAFT FORM */}
              <div className="bg-gray-950/45 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4">🎓 Record College Draft Selection</h3>

                <form onSubmit={handleAddDraft} className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Draft Year</label>
                      <input
                        type="number"
                        required
                        value={newDraft.year}
                        onChange={(e) => setNewDraft({ ...newDraft, year: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Round</label>
                      <select
                        value={newDraft.round}
                        onChange={(e) => setNewDraft({ ...newDraft, round: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      >
                        <option value={1}>Round 1</option>
                        <option value={2}>Round 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pick #</label>
                      <input
                        type="number"
                        required
                        value={newDraft.pick}
                        onChange={(e) => setNewDraft({ ...newDraft, pick: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Drafting Franchise</label>
                      <select
                        value={newDraft.teamId}
                        onChange={(e) => setNewDraft({ ...newDraft, teamId: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Athlete Named</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Austin Reaves Jr."
                        value={newDraft.playerName}
                        onChange={(e) => setNewDraft({ ...newDraft, playerName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Position</label>
                      <input
                        type="text"
                        placeholder="e.g. SG"
                        value={newDraft.position}
                        onChange={(e) => setNewDraft({ ...newDraft, position: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pre-Draft College/Country</label>
                      <input
                        type="text"
                        placeholder="e.g. Kentucky"
                        value={newDraft.college}
                        onChange={(e) => setNewDraft({ ...newDraft, college: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs transition uppercase cursor-pointer"
                  >
                    Draft Selected Athlete
                  </button>
                </form>
              </div>

              {/* AWARDS RECORD FORM */}
              <div className="bg-gray-950/45 p-6 rounded-xl border border-gray-800">
                <h3 className="text-base font-bold text-gray-200 mb-4 flex items-center gap-1.5 font-display">
                  <AwardIcon className="w-5 h-5 text-amber-500" />
                  Confer League Honor & Accolade
                </h3>

                <form onSubmit={handleAddAward} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Season Year</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2025-26"
                        value={newAward.year}
                        onChange={(e) => setNewAward({ ...newAward, year: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Honor Type</label>
                      <select
                        value={newAward.category}
                        onChange={(e) => setNewAward({ ...newAward, category: e.target.value as any })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                      >
                        <option value="Most Valuable Player">Most Valuable Player (MVP)</option>
                        <option value="Defensive Player of the Year">Defensive Player of the Year (DPOY)</option>
                        <option value="Rookie of the Year">Rookie of the Year (ROTY)</option>
                        <option value="Sixth Man of the Year">Sixth Man of the Year (6MOTY)</option>
                        <option value="Most Improved Player">Most Improved Player (MIP)</option>
                        <option value="Coach of the Year">Coach of the Year</option>
                        <option value="Finals MVP">Finals MVP</option>
                        <option value="General Manager of the Year">General Manager of the Year (GMOTY)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Carmelo Davis"
                        value={newAward.playerName}
                        onChange={(e) => setNewAward({ ...newAward, playerName: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Recipient Franchise</label>
                      <select
                        value={newAward.teamId}
                        onChange={(e) => setNewAward({ ...newAward, teamId: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none cursor-pointer"
                      >
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Season Summary Stat Line</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 30.1 PPG, 5.4 RPG, 8.2 APG"
                      value={newAward.statsLine}
                      onChange={(e) => setNewAward({ ...newAward, statsLine: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold rounded text-xs transition uppercase cursor-pointer"
                  >
                    Deploy Accolade Award
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* FINALS CHAMPIONS TAB (CHAMPIONSHIPS) */}
        {/* =================================================================== */}
        {activeTab === 'championships' && (
          <div className="space-y-10 font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Log/Edit Form */}
              <div className="lg:col-span-5 bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
                    {editingChampId ? 'Edit Finals Ledger' : 'Configure New Championship'}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {editingChampId 
                      ? 'Updating an entry reflects instantly on Champions list and Team Legacy history modules.'
                      : 'Record the victor, runner-up, series score, and Finals MVP highlights for a season.'}
                  </p>
                </div>

                {!canEditHistory && (
                  <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/40 text-amber-300 rounded-lg text-xs leading-normal">
                    ⚠️ <strong>View-Only:</strong> You do not possess <em>editHistory</em> permissions. Only Administrators or designated History Moderators can save changes.
                  </div>
                )}

                <form onSubmit={editingChampId ? handleUpdateChampionship : handleAddChampionship} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Season / Year</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024 or 2023-24"
                      value={champForm.year}
                      onChange={(e) => setChampForm({ ...champForm, year: e.target.value })}
                      disabled={!canEditHistory}
                      className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Champion Franchise</label>
                      <select
                        required
                        value={champForm.championKey}
                        onChange={(e) => {
                          const teamId = e.target.value;
                          const teamObj = teams.find(t => t.id === teamId);
                          setChampForm(prev => ({
                            ...prev,
                            championKey: teamId,
                            champion: teamObj ? teamObj.name : ''
                          }));
                        }}
                        disabled={!canEditHistory}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">-- Choose Champion --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.abbrev})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Runner-up Franchise</label>
                      <select
                        required
                        value={champForm.runnerUpKey}
                        onChange={(e) => {
                          const teamId = e.target.value;
                          const teamObj = teams.find(t => t.id === teamId);
                          setChampForm(prev => ({
                            ...prev,
                            runnerUpKey: teamId,
                            runnerUp: teamObj ? teamObj.name : ''
                          }));
                        }}
                        disabled={!canEditHistory}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white outline-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="">-- Choose Runner-up --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.abbrev})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Series score result</label>
                      <input
                        type="text"
                        placeholder="e.g. 4-2 or 4-3"
                        value={champForm.result}
                        onChange={(e) => setChampForm({ ...champForm, result: e.target.value })}
                        disabled={!canEditHistory}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Finals MVP Named</label>
                      <input
                        type="text"
                        placeholder="e.g. Carmelo Davis"
                        value={champForm.fmvpName}
                        onChange={(e) => setChampForm({ ...champForm, fmvpName: e.target.value })}
                        disabled={!canEditHistory}
                        className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Finals MVP Stat Line</label>
                    <input
                      type="text"
                      placeholder="e.g. 34.5 PPG, 8.2 RPG, 11.0 APG"
                      value={champForm.fmvpStats}
                      onChange={(e) => setChampForm({ ...champForm, fmvpStats: e.target.value })}
                      disabled={!canEditHistory}
                      className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Finals Series Highlights Narrative</label>
                    <textarea
                      rows={3}
                      placeholder="Record unforgettable buzzer-beaters, defensive stands, or historical performance descriptions..."
                      value={champForm.highlight}
                      onChange={(e) => setChampForm({ ...champForm, highlight: e.target.value })}
                      disabled={!canEditHistory}
                      className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none resize-none disabled:opacity-50"
                    />
                  </div>

                  {canEditHistory && (
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black rounded-lg text-xs transition uppercase shadow-md cursor-pointer text-center"
                      >
                        {editingChampId ? 'Save Changes' : 'Log Championship'}
                      </button>
                      
                      {editingChampId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChampId(null);
                            setChampForm({
                              year: '', champion: '', championKey: '',
                              runnerUp: '', runnerUpKey: '', result: '',
                              fmvpName: '', fmvpStats: '', highlight: ''
                            });
                          }}
                          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-750 text-gray-300 font-bold rounded-lg text-xs transition uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: List and Ledger */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                  <h3 className="text-sm font-bold text-gray-200">Chronological Championship Ledger ({championships.length})</h3>
                  <span className="text-[10px] font-mono text-gray-400 font-bold bg-gray-950 px-2 py-0.5 rounded border border-gray-850">
                    HISTORIC LEDGER
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-[75vh] overflow-y-auto pr-1">
                  {championships.length === 0 ? (
                    <div className="text-center py-12 bg-gray-950/25 border border-gray-850 rounded-2xl text-gray-500 font-mono text-xs">
                      No championship records found in the league database. Log the first above!
                    </div>
                  ) : (
                    championships.map(c => {
                      const champTeam = teams.find(t => t.id === c.championKey || t.abbrev === c.championKey);
                      const runnerTeam = teams.find(t => t.id === c.runnerUpKey || t.abbrev === c.runnerUpKey);

                      return (
                        <div key={c.id || c.year} className="bg-gray-950/30 border border-gray-850 hover:border-gray-800 rounded-2xl p-5 relative transition-all duration-300">
                          
                          {/* TOP FLOATING RIGHT CONTROLS */}
                          {canEditHistory && (
                            <div className="absolute top-4 right-4 flex items-center gap-1">
                              <button
                                onClick={() => handleEditChampionship(c)}
                                className="p-1 px-2.5 text-[10px] font-mono font-bold uppercase rounded bg-gray-900 border border-gray-800 text-amber-500 hover:text-amber-400 hover:bg-gray-800 transition cursor-pointer flex items-center gap-1"
                                title="Edit Record"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteChampionship(c.id || c.year)}
                                className="p-1 px-2.5 text-[10px] font-mono font-bold uppercase rounded bg-red-950/40 border border-red-500/35 text-red-500 hover:text-red-400 hover:bg-red-900/50 transition cursor-pointer flex items-center gap-1"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}

                          {/* YEAR BADGE */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-display font-black text-2xl text-amber-400 leading-none">
                              {c.year}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">
                              Finals Record
                            </span>
                          </div>

                          {/* MATCHUP ROW */}
                          <div className="grid grid-cols-5 gap-2 items-center bg-gray-950/70 p-3 rounded-xl border border-gray-900 mb-3">
                            <div className="col-span-2 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center border border-white/5 flex-shrink-0">
                                {champTeam ? renderLogo(champTeam.logo, "w-6 h-6 object-contain") : <span className="text-xs">🏆</span>}
                              </div>
                              <div className="overflow-hidden">
                                <span className="block font-sans font-black text-white text-xs truncate leading-tight">
                                  {c.champion}
                                </span>
                                <span className="font-mono text-[9px] text-amber-400 font-bold uppercase block mt-0.5">
                                  CHAMPION ({c.championKey})
                                </span>
                              </div>
                            </div>

                            <div className="col-span-1 text-center flex flex-col justify-center">
                              <span className="block font-mono text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                SCORE
                              </span>
                              <span className="inline-block px-2 py-0.5 mt-0.5 bg-gray-900 text-gray-100 font-mono text-xs font-black border border-gray-850 rounded">
                                {c.result || 'N/A'}
                              </span>
                            </div>

                            <div className="col-span-2 flex items-center justify-end gap-2.5 text-right">
                              <div className="overflow-hidden">
                                <span className="block font-sans font-semibold text-gray-200 text-xs truncate leading-tight">
                                  {c.runnerUp || 'Runner-Up'}
                                </span>
                                <span className="font-mono text-[9px] text-gray-400 font-bold uppercase block mt-0.5">
                                  Runner-up ({c.runnerUpKey || 'N/A'})
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center border border-white/5 flex-shrink-0">
                                {runnerTeam ? renderLogo(runnerTeam.logo, "w-6 h-6 object-contain") : <span className="text-xs">🥈</span>}
                              </div>
                            </div>
                          </div>

                          {/* MVP & NOTES INFORMATION */}
                          <div className="space-y-2 text-[11px] leading-relaxed">
                            {c.fmvpName && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 bg-gray-900/40 p-2.5 border border-gray-900 rounded-lg">
                                <span className="font-mono text-[9px] text-amber-400 font-bold uppercase tracking-wider whitespace-nowrap">
                                  🏆 Finals MVP:
                                </span>
                                <span className="text-gray-100 font-bold font-sans">
                                  {c.fmvpName}
                                </span>
                                <span className="text-gray-400 font-mono text-[10px] sm:ml-1.5 sm:border-l sm:border-gray-800 sm:pl-2">
                                  {c.fmvpStats}
                                </span>
                              </div>
                            )}

                            {c.highlight && (
                              <div className="text-gray-400 border-l border-gray-800 pl-2.5 py-0.5 text-xs italic">
                                "{c.highlight}"
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* FRANCHISE LEGACY HISTORY TAB (TEAM HISTORIES) */}
        {/* =================================================================== */}
        {activeTab === 'teamHistories' && (
          <div className="space-y-8 font-sans">
            <div className="bg-gray-950/45 p-6 rounded-2xl border border-gray-800 text-center max-w-2xl mx-auto">
              <Landmark className="w-8 h-8 text-amber-500 mx-auto mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-gray-100 uppercase tracking-wide">
                Update Franchise Legacy Histories
              </h3>
              <p className="text-xs text-gray-400 mt-2 max-w-lg mx-auto">
                Updating history files details the inaugural establishment year, championship trophies registry, legendary players lists, and legacy bios displayed in team profile views.
              </p>

              {!canEditHistory && (
                <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/40 text-amber-300 rounded-lg text-xs leading-normal text-left max-w-lg mx-auto">
                  ⚠️ <strong>View-Only Notice:</strong> You do not possess <em>editHistory</em> core permissions. You may inspect settings but changing database records is locked.
                </div>
              )}

              {/* SELECT ACTIVE FRANCHISE DROPDOWN */}
              <div className="mt-5 max-w-md mx-auto">
                <label className="block text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider mb-2">
                  Select Franchise to Modify:
                </label>
                <select
                  value={selectedHistoryTeamId}
                  onChange={(e) => handleSelectHistoryTeam(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white outline-none cursor-pointer font-bold text-xs hover:border-gray-700 transition"
                >
                  <option value="">-- Click to choose franchise --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.abbrev})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedHistoryTeamId ? (() => {
              const teamObj = teams.find(t => t.id === selectedHistoryTeamId);
              if (!teamObj) return null;

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* EDIT PANEL */}
                  <div className="lg:col-span-6 bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 border-b border-gray-850 pb-3 mb-5">
                      <span className="w-8 h-8 bg-gray-900 border border-gray-800 rounded flex items-center justify-center">
                        {renderLogo(teamObj.logo, "w-6 h-6 object-contain")}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-100">{teamObj.name} History Ledger</h4>
                        <span className="block text-[9px] font-mono text-gray-500 font-bold leading-none uppercase">ID: {teamObj.id}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveTeamHistory} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Established Year</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1968"
                          value={historyForm.established}
                          onChange={(e) => setHistoryForm({ ...historyForm, established: e.target.value })}
                          disabled={!canEditHistory}
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-mono disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Championship Years (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. 1993, 2005, 2021 (leave blank if none)"
                          value={historyForm.championships}
                          onChange={(e) => setHistoryForm({ ...historyForm, championships: e.target.value })}
                          disabled={!canEditHistory}
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none disabled:opacity-50"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">Format list as simple comma values (e.g. 1976, 2004).</p>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Legendary Franchise Players (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Steve Nash, Amar'e Stoudemire, Charles Barkley"
                          value={historyForm.legendaryPlayers}
                          onChange={(e) => setHistoryForm({ ...historyForm, legendaryPlayers: e.target.value })}
                          disabled={!canEditHistory}
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none disabled:opacity-50"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">Format players as standard commas list.</p>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">Historical Franchise Bio/Narrative</label>
                        <textarea
                          rows={6}
                          required
                          placeholder="Write about the legacy, historical finals matchups, arena transitions, or key GM eras..."
                          value={historyForm.historicalBio}
                          onChange={(e) => setHistoryForm({ ...historyForm, historicalBio: e.target.value })}
                          disabled={!canEditHistory}
                          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none resize-none disabled:opacity-50 leading-relaxed"
                        />
                      </div>

                      {canEditHistory && (
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 text-gray-950 font-black rounded-lg text-xs transition uppercase shadow-md cursor-pointer text-center"
                        >
                          Save Franchise Legacy History
                        </button>
                      )}
                    </form>
                  </div>

                  {/* PREVIEW PANEL */}
                  <div className="lg:col-span-6 bg-gray-950/20 border border-gray-850 p-6 rounded-2xl flex flex-col justify-start">
                    <div className="flex items-center justify-between border-b border-gray-850 pb-2 mb-4">
                      <span className="text-[10px] font-mono text-gray-400 uppercase font-black tracking-widest block">
                        👁️ Live Portal Preview
                      </span>
                      <span className="text-[9px] font-mono text-[#f59e0b] font-bold bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-1.5 py-0.5 rounded">
                        FRANCHISE IDENTITY
                      </span>
                    </div>

                    {/* PREVIEW BOARD */}
                    <div className="bg-gray-950/80 border border-gray-900 rounded-2xl p-6 space-y-5">
                      <div className="flex items-center gap-4">
                        <span className="w-16 h-16 bg-gray-900 border border-gray-850 rounded-xl flex items-center justify-center p-2">
                          {renderLogo(teamObj.logo, "w-12 h-12 object-contain")}
                        </span>
                        <div>
                          <h4 className="font-display font-black text-lg text-white leading-tight">{teamObj.name} Legacy</h4>
                          <span className="text-[10px] text-gray-400 font-mono">FRANCHISE FOUNDED: <strong>{historyForm.established || '1980'}</strong></span>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-2 text-xs">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-amber-500 uppercase block mb-1">
                            🏆 League Championships ({historyForm.championships.split(',').map(s => s.trim()).filter(Boolean).length}):
                          </span>
                          {historyForm.championships.split(',').map(s => s.trim()).filter(Boolean).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {historyForm.championships.split(',').map(s => s.trim()).filter(Boolean).map(y => (
                                <span key={y} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                                  🏆 {y}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 font-mono italic">No championships recorded yet.</span>
                          )}
                        </div>

                        <div>
                          <span className="font-mono text-[10px] font-bold text-amber-500 uppercase block mb-1">
                            🎖️ Legendary Icons:
                          </span>
                          {historyForm.legendaryPlayers.split(',').map(s => s.trim()).filter(Boolean).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {historyForm.legendaryPlayers.split(',').map(s => s.trim()).filter(Boolean).map(player => (
                                <span key={player} className="bg-gray-900 text-gray-200 border border-gray-800 px-2 py-0.5 rounded text-[10px]">
                                  {player}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 font-mono italic">None recorded.</span>
                          )}
                        </div>

                        <div className="border-t border-gray-900 pt-3">
                          <span className="font-mono text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                            Franchise Narrative Bio:
                          </span>
                          <p className="text-gray-300 leading-relaxed text-xs italic">
                            {historyForm.historicalBio ? `"${historyForm.historicalBio}"` : 'Write a custom bio to render in the system panels...'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-20 bg-gray-950/20 border border-dashed border-gray-850 rounded-2xl text-gray-500 font-mono text-xs">
                🚨 No franchise selected. Please pick a team from the select box above to modify their historical legacy file.
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* MODERATOR CONTROL BOARD TAB (USERS) */}
        {/* =================================================================== */}
        {activeTab === 'users' && currentUser?.role === 'admin' && (
          <div className="space-y-10 font-sans">
            
            {/* COMMISSIONER REGISTRATION SETTINGS BOARD */}
            <div className="bg-gray-950/45 border border-gray-800/80 p-6 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-500 animate-pulse" />
                    League Attendance & Registration Control Panel
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Set policy for guest self-registration. When locked or full, guest self-registration forms are closed instantly. Hard limit of 40 users maximum.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-wider border uppercase ${
                    registrationDisabled 
                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                      : userCount >= 40 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse'
                        : 'bg-emerald-500/10 text-[#10b981] border-emerald-500/20'
                  }`}>
                    {registrationDisabled 
                      ? '🔴 Disabled' 
                      : userCount >= 40 
                        ? '🚫 Locked (Roster Cap)' 
                        : '🟢 Open For Signups'}
                  </span>
                  
                  <button
                    onClick={handleToggleRegistration}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-md cursor-pointer text-center ${
                      registrationDisabled
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-gray-950'
                        : 'bg-red-500 hover:bg-red-650 text-white'
                    }`}
                  >
                    {registrationDisabled ? 'Enable Guest Signups' : 'Disable Guest Signups'}
                  </button>
                </div>
              </div>

              {/* PROGRESS BAR FOR 40 LEAGUE ACCOUNTS */}
              <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-850 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase">
                  <span className="text-gray-400">Roster Capacity Index ({userCount} / 40 Users Allowed)</span>
                  <span className={userCount >= 40 ? 'text-red-400 animate-pulse font-bold' : 'text-emerald-400'}>
                    {userCount >= 40 ? 'CAPACITY DETECTED' : `${40 - userCount} Seats Remaining`}
                  </span>
                </div>
                <div className="w-full bg-gray-950 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      userCount >= 40 
                        ? 'bg-red-500' 
                        : userCount >= 32 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (userCount / 40) * 100)}%` }}
                  ></div>
                </div>
                {userCount >= 40 && (
                  <p className="text-[10px] text-red-400 font-mono leading-tight pt-1">
                    ⚠️ The league is at maximum capacity. Handshakes and registration queries are locked automatically. Remove users or reset capacities to onboard new managers.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Create Mod User */}
              <div className="lg:col-span-5 bg-gray-950/50 p-6 rounded-2xl border border-gray-800">
                <div className="mb-5">
                  <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    {editingModId ? 'Edit Moderator Account' : 'Register Moderator Account'}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {editingModId ? 'Modify active moderator privileges and credentials below.' : 'Provision localized mod credentials. Specify roles and select granted operational parameters.'}
                  </p>
                </div>

                <form onSubmit={editingModId ? handleUpdateModUser : handleAddModUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">LEAGUE USER ROLE</label>
                    <select
                      value={modForm.role}
                      onChange={(e) => {
                        const newRole = e.target.value;
                        const isSovereign = newRole === 'Commissioner' || newRole === 'Co-Commissioner';
                        setModForm({
                          ...modForm,
                          role: newRole,
                          // Clear teamId if not Team Owner
                          teamId: newRole === 'Team Owner' ? modForm.teamId : '',
                          username: newRole === 'Team Owner' && modForm.teamId ? (teams.find(t => t.id === modForm.teamId)?.name.toLowerCase().replace(/\s+/g, '') || modForm.username) : modForm.username,
                          editHistory: isSovereign,
                          editDrafts: isSovereign,
                          editRosters: isSovereign
                        });
                      }}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-sans cursor-pointer"
                    >
                      <option value="Commissioner">Commissioner (Full Access)</option>
                      <option value="Co-Commissioner">Co-Commissioner (Manage League Content)</option>
                      <option value="Moderator">Moderator (Manage Chat & News)</option>
                      <option value="Team Owner">Team Owner (Access Own Team)</option>
                      <option value="Viewer">Viewer (Read Only Access)</option>
                    </select>
                  </div>

                  {modForm.role === 'Team Owner' && (
                    <div className="bg-amber-950/20 border border-amber-500/15 p-3 rounded-lg space-y-2">
                      <label className="block text-amber-400 font-bold font-mono text-[10px] uppercase">
                        ASSIGNED FRANCHISE TEAM
                      </label>
                      <select
                        value={modForm.teamId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const matchedTeam = teams.find(t => t.id === val);
                          setModForm({
                            ...modForm,
                            teamId: val,
                            username: matchedTeam ? matchedTeam.name.toLowerCase().replace(/\s+/g, '') : ''
                          });
                        }}
                        required={modForm.role === 'Team Owner'}
                        className="w-full bg-gray-900 border border-amber-500/30 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-sans cursor-pointer"
                      >
                        <option value="">-- Choose Franchise Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.abbrev})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-400 leading-normal font-mono">
                        💡 Once assigned, their username automatically changes to the team's full name, and they chat representing that franchise!
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">
                      USERNAME {modForm.role === 'Team Owner' && modForm.teamId && ' (SET TO TEAM NAME)'}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={modForm.role === 'Team Owner' && !!modForm.teamId}
                      placeholder={modForm.role === 'Team Owner' && modForm.teamId ? 'Auto-assigned to team name' : 'e.g. suns_moderator'}
                      value={modForm.username}
                      onChange={(e) => setModForm({ ...modForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      className={`w-full bg-gray-900 border ${modForm.role === 'Team Owner' && modForm.teamId ? 'border-amber-500/25 text-amber-400 font-bold bg-amber-500/5' : 'border-gray-800 focus:border-amber-500'} rounded-lg p-2.5 outline-none font-mono`}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 font-bold font-mono text-[10px] uppercase">PASSWORD</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter safe password"
                      value={modForm.password}
                      onChange={(e) => setModForm({ ...modForm, password: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-lg p-2.5 text-white outline-none font-mono"
                    />
                  </div>

                  {/* Permissions Selection */}
                  <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-900 space-y-3">
                    <span className="block font-mono text-[9px] text-[#f59e0b] font-black uppercase tracking-wider">
                      Granted Moderation Capabilities:
                    </span>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={modForm.editHistory}
                        onChange={(e) => setModForm({ ...modForm, editHistory: e.target.checked })}
                        className="mt-0.5 accent-amber-500 rounded cursor-pointer h-4 w-4"
                      />
                      <div>
                        <span className="block font-bold text-gray-200">History & Champions Registry (`editHistory`)</span>
                        <span className="block text-[10px] text-gray-500 leading-tight">Authorize adding/updating Finals history or Franchise narratives.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={modForm.editDrafts}
                        onChange={(e) => setModForm({ ...modForm, editDrafts: e.target.checked })}
                        className="mt-0.5 accent-amber-500 rounded cursor-pointer h-4 w-4"
                      />
                      <div>
                        <span className="block font-bold text-gray-200">Draft ledger & Awards (`editDrafts`)</span>
                        <span className="block text-[10px] text-gray-500 leading-tight">Authorize logging/editing rookie drafts or season awards.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={modForm.editRosters}
                        onChange={(e) => setModForm({ ...modForm, editRosters: e.target.checked })}
                        className="mt-0.5 accent-amber-500 rounded cursor-pointer h-4 w-4"
                      />
                      <div>
                        <span className="block font-bold text-gray-200">Rosters, Teams & Athletes (`editRosters`)</span>
                        <span className="block text-[10px] text-gray-500 leading-tight">Authorize changing player ratings, trades, and roster listings.</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black rounded-lg text-xs transition uppercase shadow-md cursor-pointer text-center"
                    >
                      {editingModId ? 'Update Account Summary' : 'Save & Create Account'}
                    </button>
                    {editingModId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingModId(null);
                          setModForm({ username: '', password: '', role: 'Team Owner', editHistory: false, editDrafts: false, editRosters: false });
                        }}
                        className="px-4 py-2.5 bg-gray-800 hover:bg-gray-750 text-gray-300 font-bold rounded-lg text-xs transition uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: List of Mod Accounts */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                  <h3 className="text-sm font-bold text-gray-200">Active Authorized Moderators ({users.length})</h3>
                  <span className="text-[10px] font-mono text-gray-400 font-bold bg-gray-950 px-2 py-0.5 rounded border border-gray-850">
                    SYSTEM ROLES
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[75vh] overflow-y-auto pr-1">
                  {users.map(u => {
                    const isCurrentUser = currentUser?.username === u.username;
                    const assignedTeam = u.teamId ? teams.find(t => t.id === u.teamId) : null;

                    return (
                      <div key={u.id || u.username} className="bg-gray-950/30 border border-gray-850 rounded-2xl p-5 flex items-center justify-between transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-gray-100 font-mono">
                              {u.username}
                            </span>
                            
                            {assignedTeam && (
                              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
                                {assignedTeam.logo && (
                                  <img src={assignedTeam.logo} alt="" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
                                )}
                                <span>{assignedTeam.abbrev} REPRESENTATIVE</span>
                              </div>
                            )}

                            <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase" title="Moderator Custom Role">
                              {u.role || 'Team Owner'}
                            </span>

                            {isCurrentUser && (
                              <span className="text-[9px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded uppercase">
                                You
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[10px]">
                            <span className="font-mono text-gray-500">Rights:</span>
                            
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${u.permissions?.editHistory ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-900 text-gray-600'}`}>
                                History {u.permissions?.editHistory ? '✓' : '✗'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${u.permissions?.editDrafts ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-900 text-gray-600'}`}>
                                Drafts {u.permissions?.editDrafts ? '✓' : '✗'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${u.permissions?.editRosters ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-900 text-gray-600'}`}>
                                Rosters {u.permissions?.editRosters ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* EDIT & DELETE ACTIONS */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditModUser(u)}
                            className="p-1 px-2.5 text-[10px] font-mono font-bold uppercase rounded bg-gray-900 border border-gray-850 text-amber-500 hover:text-amber-400 hover:bg-gray-850 transition cursor-pointer flex items-center gap-1"
                            title="Edit Moderator account"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>

                          {!isCurrentUser && (
                            <button
                              onClick={() => u.id && handleDeleteModUser(u.id)}
                              className="p-2 text-red-500 hover:text-red-400 hover:bg-red-950/20 rounded bg-gray-900 border border-gray-850 hover:border-red-900 transition cursor-pointer"
                              title="Revoke Moderator Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
