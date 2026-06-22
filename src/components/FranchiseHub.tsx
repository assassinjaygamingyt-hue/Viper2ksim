import React, { useState, useEffect } from 'react';
import { Team, Player, Proposal } from '../types';
import { renderLogo } from '../utils';
import { 
  Users, Sliders, ArrowLeftRight, CheckCircle, Clock, ShieldAlert, 
  Trash2, Send, Check, X, Sparkles, TrendingUp, HelpCircle, AlertTriangle,
  Camera, Upload, RefreshCw
} from 'lucide-react';

interface FranchiseHubProps {
  teams: Team[];
  currentUser: {
    id?: string;
    username: string;
    role: 'admin' | 'mod';
    teamId?: string;
    subRole?: string;
    permissions?: {
      editHistory: boolean;
      editDrafts: boolean;
      editRosters: boolean;
    };
  } | null;
  isAdminLoggedIn: boolean;
  onOpenLogin: () => void;
}

export default function FranchiseHub({
  teams,
  currentUser,
  isAdminLoggedIn,
  onOpenLogin
}: FranchiseHubProps) {
  // Global States
  const [players, setPlayers] = useState<Player[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'trade' | 'approvals'>('roster');
  
  // Status flags
  const [loading, setLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // AI Screenshot Roster Importer states
  const [showAIImporter, setShowAIImporter] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [ocrPlayers, setOcrPlayers] = useState<{ name: string; age: number; position: string; rating: number }[]>([]);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [applyOcrLoading, setApplyOcrLoading] = useState<boolean>(false);

  // Roster Office states
  const [simPriority, setSimPriority] = useState<'championship' | 'development' | 'tank' | 'neutral'>('neutral');
  const [localPlayers, setLocalPlayers] = useState<Player[]>([]); // Current team players we are editing
  
  // Trade Portal states
  const [opponentTeamId, setOpponentTeamId] = useState<string>('');
  const [selectedOutgoingIds, setSelectedOutgoingIds] = useState<string[]>([]);
  const [selectedIncomingIds, setSelectedIncomingIds] = useState<string[]>([]);
  const [tradeMessage, setTradeMessage] = useState<string>('');

  // Determine user identity
  const userTeamId = currentUser?.teamId;
  const isCommissioner = currentUser?.role === 'admin';
  const myTeam = teams.find(t => t.id === userTeamId);

  // Fetch roster players and proposals
  const fetchData = async () => {
    try {
      setLoading(true);
      const playersResp = await fetch('/api/players');
      if (playersResp.ok) {
        const playersData = await playersResp.json();
        setPlayers(playersData);
      }

      const propResp = await fetch('/api/proposals');
      if (propResp.ok) {
        const propData = await propResp.json();
        setProposals(propData);
      }
    } catch (err) {
      console.error('Failed to load Franchise Hub telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userTeamId]);

  // Sync localized players when data gets fetched or team ID shifts
  useEffect(() => {
    if (userTeamId && players.length > 0) {
      const filtered = players.filter(p => p.teamId === userTeamId);
      // Ensure local values exist
      const mapped = filtered.map(p => ({
        ...p,
        isOnTradeBlock: p.isOnTradeBlock ?? false,
        isStarter: p.isStarter ?? false,
        rotationMinutes: p.rotationMinutes ?? 0,
        rotationRole: p.rotationRole ?? 'Bench'
      }));
      setLocalPlayers(mapped);
    }
    
    // Sync active simulation priority
    if (myTeam) {
      setSimPriority(myTeam.simPriority ?? 'neutral');
    }
  }, [players, userTeamId, myTeam]);

  // Handle local rotation modifications
  const handleToggleStarter = (playerId: string) => {
    setLocalPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const nextStarter = !p.isStarter;
        return {
          ...p,
          isStarter: nextStarter,
          // Give basic minutes default when promoted
          rotationMinutes: nextStarter ? Math.max(p.rotationMinutes, 20) : Math.min(p.rotationMinutes, 15)
        };
      }
      return p;
    }));
  };

  const handleMinutesChange = (playerId: string, val: number) => {
    const minutes = Math.max(0, Math.min(48, val));
    setLocalPlayers(prev => prev.map(p => p.id === playerId ? { ...p, rotationMinutes: minutes } : p));
  };

  const handleRoleChange = (playerId: string, role: any) => {
    setLocalPlayers(prev => prev.map(p => p.id === playerId ? { ...p, rotationRole: role } : p));
  };

  const handleToggleTradeBlock = (playerId: string) => {
    setLocalPlayers(prev => prev.map(p => p.id === playerId ? { ...p, isOnTradeBlock: !p.isOnTradeBlock } : p));
  };

  // Submit roster update proposal
  const handleSaveRosterSettings = async () => {
    if (!isAdminLoggedIn || !currentUser || !userTeamId) return;
    setSavingSettings(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // Calculate changes relative to original state
      const origPlayers = players.filter(p => p.teamId === userTeamId);
      
      const tradeBlockChanges = localPlayers.map(p => {
        const orig = origPlayers.find(o => o.id === p.id);
        if (!orig || orig.isOnTradeBlock !== p.isOnTradeBlock) {
          return { playerId: p.id, isOnBlock: p.isOnTradeBlock };
        }
        return null;
      }).filter(Boolean) as any[];

      const lineupChanges = localPlayers.map(p => {
        const orig = origPlayers.find(o => o.id === p.id);
        if (!orig || orig.isStarter !== p.isStarter || orig.rotationMinutes !== p.rotationMinutes || orig.rotationRole !== p.rotationRole) {
          return {
            playerId: p.id,
            isStarter: p.isStarter,
            rotationMinutes: p.rotationMinutes,
            rotationRole: p.rotationRole
          };
        }
        return null;
      }).filter(Boolean) as any[];

      // Create Proposal payload
      const payload: Omit<Proposal, 'id' | 'createdAt'> = {
        type: 'roster_update',
        status: isCommissioner ? 'approved' : 'pending_commissioner', // Direct approval for Commissioner
        teamAId: userTeamId,
        simPriorityChange: simPriority !== myTeam?.simPriority ? simPriority : undefined,
        tradeBlockChanges: tradeBlockChanges.length > 0 ? tradeBlockChanges : undefined,
        lineupChanges: lineupChanges.length > 0 ? lineupChanges : undefined,
        submittedBy: currentUser.username
      };

      const resp = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Failed to lock alignment parameters.');

      const result = await resp.json();

      if (isCommissioner) {
        // Since commissioner created it, immediately apply the changes by approving them
        const approveResp = await fetch(`/api/proposals/${result.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        if (approveResp.ok) {
          setSuccessMsg('⚡ Roster calibration applied live instantly!');
        } else {
          throw new Error('Could not automatically execute commissioner adjustments.');
        }
      } else {
        setSuccessMsg('📨 Roster update proposal submitted to the Commissioner Office for clearance.');
      }

      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error processing settings updates.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Parsing individual contract strings into millions numerical values for calculation
  const parseContractToMillion = (contractStr: string | undefined): number => {
    if (!contractStr) return 0;
    // Strip spaces and attempt matching dec values
    const clean = contractStr.replace(/\s/g, '');
    const matches = clean.match(/\$(\d+(\.\d+)?)(M|m|K|k)?/);
    if (matches && matches.length > 0) {
      let val = parseFloat(matches[1]);
      if (matches[3]?.toLowerCase() === 'k') {
        val = val / 1000;
      }
      return Number.isNaN(val) ? 0 : val;
    }
    return 0;
  };

  // Calculate Salaries Outbound vs Inbound
  const myRoster = players.filter(p => p.teamId === userTeamId);
  const oppRoster = opponentTeamId ? players.filter(p => p.teamId === opponentTeamId) : [];

  const outgoingPlayersSelected = myRoster.filter(p => selectedOutgoingIds.includes(p.id));
  const incomingPlayersSelected = oppRoster.filter(p => selectedIncomingIds.includes(p.id));

  const totalOutgoingSalary = outgoingPlayersSelected.reduce((sum, p) => sum + parseContractToMillion(p.contract), 0);
  const totalIncomingSalary = incomingPlayersSelected.reduce((sum, p) => sum + parseContractToMillion(p.contract), 0);

  // Salary compliance checker:
  // Standard rule allows trade if salaries are within 125% of each other,
  // OR if the cash difference is less than $5M, or if both have 0.
  const isSalaryCompliant = () => {
    if (selectedOutgoingIds.length === 0 && selectedIncomingIds.length === 0) return true;
    if (totalOutgoingSalary === 0 && totalIncomingSalary === 0) return true;
    
    const diff = Math.abs(totalOutgoingSalary - totalIncomingSalary);
    if (diff <= 5.0) return true; // Under 5M margin is fine

    const ratio = totalOutgoingSalary > totalIncomingSalary 
      ? totalOutgoingSalary / Math.max(1, totalIncomingSalary)
      : totalIncomingSalary / Math.max(1, totalOutgoingSalary);

    return ratio <= 1.25; // 125% standard limit rule
  };

  // Initiate trade portal offer
  const handleProposeTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminLoggedIn || !currentUser || !userTeamId) return;
    if (!opponentTeamId) {
      setErrorMsg('Please select an opposing target franchise.');
      return;
    }
    if (selectedOutgoingIds.length === 0 && selectedIncomingIds.length === 0) {
      setErrorMsg('Please select at least one player to transfer.');
      return;
    }

    try {
      setSavingSettings(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      // Create proposal
      const payload: Omit<Proposal, 'id' | 'createdAt'> = {
        type: 'trade',
        status: isCommissioner ? 'approved' : 'pending_acceptance', // Team B has to accepts first unless commissioner override
        teamAId: userTeamId,
        teamBId: opponentTeamId,
        teamASendsPlayerIds: selectedOutgoingIds,
        teamBSendsPlayerIds: selectedIncomingIds,
        message: tradeMessage,
        submittedBy: currentUser.username
      };

      const resp = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Failed to create safe trade room entry.');

      const result = await resp.json();

      if (isCommissioner) {
        // Automatically approve if executed directly by commissioner override
        const approveResp = await fetch(`/api/proposals/${result.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        if (approveResp.ok) {
          setSuccessMsg('🔄 Blockbuster trade executed and written to the live ledger instantly!');
        } else {
          throw new Error('Commissioner trade override execution warning.');
        }
      } else {
        setSuccessMsg('🤝 Safe Trade Proposal issued! Pending acceptance verification from the counter franchise owner.');
      }

      // Reset
      setSelectedOutgoingIds([]);
      setSelectedIncomingIds([]);
      setTradeMessage('');
      setOpponentTeamId('');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error outlining transaction proposal.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Sign off and accepts incoming trade offers
  const handleAcceptTrade = async (id: string) => {
    try {
      setSuccessMsg(null);
      setErrorMsg(null);
      
      const resp = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_commissioner' }) // Transitions from pending_acceptance to commissioner
      });

      if (!resp.ok) throw new Error('Transaction sign-off failed.');

      setSuccessMsg('✅ Trade accepted! It has been advanced to the Commissioner approvals deck.');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error signing off offer.');
    }
  };

  // Reject / Decline trade offers or cancel own
  const handleRejectProposal = async (id: string) => {
    try {
      setSuccessMsg(null);
      setErrorMsg(null);

      const resp = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!resp.ok) throw new Error('Failed to decline the proposal.');

      setSuccessMsg('❌ Proposal formally rejected or cancelled.');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error rejecting proposal.');
    }
  };

  // Commissioner workflow approval
  const handleCommissionerApprove = async (id: string) => {
    try {
      setSuccessMsg(null);
      setErrorMsg(null);

      const resp = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }) // Will trigger server mutation
      });

      if (!resp.ok) throw new Error('Execution failed under server standards.');

      setSuccessMsg('🏆 Transaction APPROVED! State changes applied live and written to the wire feed.');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error approving transaction.');
    }
  };

  // AI Screenshot Roster Importer handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    let file: File | null = null;
    if ('dataTransfer' in e) {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        file = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files.length > 0) {
      file = e.target.files[0];
    }

    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload a valid image file representative of your roster screenshot.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotData(reader.result as string);
        setOcrPlayers([]); // Reset previous scans
        setSuccessMsg(null);
        setErrorMsg(null);
      };
      reader.onerror = () => {
        setErrorMsg('Error reading uploaded image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParseScreenshot = async () => {
    if (!screenshotData) return;
    setOcrLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const resp = await fetch('/api/ocr-roster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: screenshotData }),
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.error || 'Failed to analyze roster screenshot.');
      }

      const data = await resp.json();
      if (data && data.players) {
        setOcrPlayers(data.players);
        setSuccessMsg(`🚀 Successfully identified ${data.players.length} players from your 2K roster screenshot! Review details below, adjust if needed, and click Apply.`);
      } else {
        throw new Error('No valid players identified from the image.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Gemini image analysis timeout or invalid key configured.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApplyOcrRoster = async () => {
    if (!userTeamId || ocrPlayers.length === 0) return;
    if (!window.confirm(`Are you absolutely sure you want to completely clear your existing roster and overwrite it with these ${ocrPlayers.length} players to start the season? All stats and records return to zero. This action cannot be undone.`)) {
      return;
    }

    setApplyOcrLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const resp = await fetch(`/api/teams/${userTeamId}/overwrite-roster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players: ocrPlayers }),
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.error || 'Failed to overwrite roster.');
      }

      setSuccessMsg('🏆 Roster successfully overwritten and populated for the new season start! Ready for simulation adjustments.');
      setOcrPlayers([]);
      setScreenshotData(null);
      setShowAIImporter(false);
      fetchData(); // Reload live grid
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to overwrite team roster.');
    } finally {
      setApplyOcrLoading(false);
    }
  };

  const handleCustomOcrPlayerChange = (index: number, field: string, value: any) => {
    setOcrPlayers(prev => prev.map((p, idx) => {
      if (idx === index) {
        return {
          ...p,
          [field]: field === 'rating' || field === 'age' ? Number(value) : value
        };
      }
      return p;
    }));
  };

  const handleRemoveOcrPlayer = (index: number) => {
    setOcrPlayers(prev => prev.filter((_, idx) => idx !== index));
  };

  // Total calculated roster minutes
  const totalRotationMinutes = localPlayers.reduce((sum, p) => sum + (p.rotationMinutes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. FRONT OFFICE HEADER CARD */}
      <div className="bg-gradient-to-r from-gray-900 via-[#13110f] to-gray-900 border border-gray-850 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sliders className="w-48 h-48 text-amber-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">
                FRANCHISE FRONT OFFICE
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                <span className="text-gray-400">DECISION RELAY ONLINE</span>
              </div>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sliders className="w-8 h-8 text-amber-500" />
              Locker Team <span className="text-amber-400 font-serif font-light">Management Desk</span>
            </h1>
            <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
              Equip your franchise with smart tools to adjust active rotation grids, outline contract-certified trades, and submit structured proposals directly to the Commissioner's Approval desk.
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center bg-gray-950/80 p-4 border border-gray-800 rounded-2xl gap-3">
            {isAdminLoggedIn && myTeam ? (
              <>
                <div className="text-right">
                  <span className="block text-[8px] uppercase tracking-wider font-mono text-gray-500">MANAGING FRONT OFFICE:</span>
                  <span className="block font-bold text-sm text-amber-400 font-mono">{myTeam.name}</span>
                  <span className="block text-[10px] text-gray-400">Record: {myTeam.wins}W - {myTeam.losses}L</span>
                </div>
                {renderLogo(myTeam.logo, "w-10 h-10 object-contain")}
              </>
            ) : isCommissioner ? (
              <>
                <div className="text-right">
                  <span className="block text-[8px] uppercase tracking-wider font-mono text-gray-500 font-bold">MANAGING LEAGUE ROLE:</span>
                  <span className="block font-bold text-sm text-red-500 font-mono">👑 COMMISSIONER HUB</span>
                  <span className="block text-[10px] text-gray-400">All rights certified</span>
                </div>
                <div className="w-10 h-10 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center justify-center font-display text-lg">🛡️</div>
              </>
            ) : (
              <div className="text-center py-1 px-2">
                <span className="block text-[10px] font-mono text-gray-500">FAN INITIATIVE MODE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FEEDBACK PROMPTS */}
      {successMsg && (
        <div className="p-4 bg-green-950/40 border border-green-500/20 text-green-400 rounded-2xl flex items-center gap-3 text-xs font-mono font-bold mb-6">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-xs font-mono font-bold mb-6">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. SECURITY CHECK */}
      {!isAdminLoggedIn ? (
        <div className="bg-gray-900/40 border border-gray-850 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 my-12 select-none">
          <div className="w-12 h-12 bg-red-950/30 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mx-auto text-xl">🛡️</div>
          <h3 className="font-display font-extrabold text-base text-gray-200">RESTRICTED EXECUTIVE PANEL</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Only authenticated Franchise Team Owners, Executives, and Commissioner staff members have authorization to write lineup rotations, trade configurations, and state directives.
          </p>
          <button
            onClick={onOpenLogin}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-950 font-mono font-black text-xs uppercase rounded-xl transition cursor-pointer"
          >
            Authenticate Front Office
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 3. NAVIGATION SUBTABS */}
          <div className="flex border-b border-gray-850 gap-4 select-none">
            {myTeam && (
              <button
                onClick={() => { setActiveSubTab('roster'); setSuccessMsg(null); setErrorMsg(null); }}
                className={`pb-4 px-2 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeSubTab === 'roster' 
                    ? 'border-amber-500 text-amber-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Lineup & strat board
              </button>
            )}

            {myTeam && (
              <button
                onClick={() => { setActiveSubTab('trade'); setSuccessMsg(null); setErrorMsg(null); }}
                className={`pb-4 px-2 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
                  activeSubTab === 'trade' 
                    ? 'border-amber-500 text-amber-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Secure Trade safe room
              </button>
            )}

            <button
              onClick={() => { setActiveSubTab('approvals'); setSuccessMsg(null); setErrorMsg(null); }}
              className={`pb-4 px-2 font-mono font-bold text-xs uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'approvals' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Approvals Queue {proposals.filter(p => p.status === 'pending_commissioner').length > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {proposals.filter(p => p.status === 'pending_commissioner').length}
                </span>
              )}
            </button>
          </div>

          {/* 4. SUBTAB MAIN DIRECTORIES */}
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500 font-mono">
              Quarrying live franchise logs...
            </div>
          ) : (
            <>
              {/* TAB 1: ROSTER OFFICE */}
              {activeSubTab === 'roster' && myTeam && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Strategic Priorities */}
                  <div className="bg-gray-900/30 border border-gray-850 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="col-span-1 border-r border-gray-850 pr-4 space-y-1">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Simulation Setting</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        Setting priorities influences simulated strategy, player progression ratios, and tactical drafts.
                      </p>
                    </div>

                    <div className="col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-3 select-none">
                      {[
                        { id: 'championship', label: 'Push for Championship', icon: '🏆', color: 'border-amber-500/40 text-amber-400 bg-amber-500/5' },
                        { id: 'development', label: 'Focus on Development', icon: '⚡', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/5' },
                        { id: 'tank', label: 'Rebuild / Tanking Mode', icon: '📊', color: 'border-rose-500/40 text-rose-400 bg-rose-500/5' },
                        { id: 'neutral', label: 'Standard balanced', icon: '📅', color: 'border-gray-500/40 text-gray-400 bg-gray-500/5' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSimPriority(opt.id as any)}
                          className={`p-3 rounded-xl border text-left transition text-xs font-bold font-mono cursor-pointer flex flex-col justify-between gap-2 ${
                            simPriority === opt.id 
                              ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg' 
                              : 'bg-gray-950/40 border-gray-850 hover:bg-gray-900/60 text-gray-400'
                          }`}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <span className="block">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Screenshot Importer Trigger Panel */}
                  <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border border-gray-850 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wider">
                        NEW SEASON IMPORT UTILITY
                      </span>
                      <h3 className="font-display font-extrabold text-gray-100 text-sm flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-amber-500" />
                        AI 2K Screenshot Import Engine
                      </h3>
                      <p className="text-[11px] text-gray-400 leading-normal max-w-xl">
                        Starting a new simulation season? Upload/drop your team roster screenshot directly from NBA 2K. Gemini AI uses state-of-the-art vision processing to decode player names, ages, positions, and overall ratings instantly.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAIImporter(!showAIImporter);
                        setSuccessMsg(null);
                        setErrorMsg(null);
                      }}
                      className="flex-shrink-0 self-start sm:self-center bg-amber-500 hover:bg-amber-600 text-gray-950 font-mono font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition cursor-pointer flex items-center gap-2 shadow"
                    >
                      <Camera className="w-4.5 h-4.5" />
                      {showAIImporter ? 'Hide Importer' : 'Import from 2K Screenshot'}
                    </button>
                  </div>

                  {showAIImporter && (
                    <div className="bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn">
                      <div className="border-b border-gray-850 pb-3 flex items-center justify-between">
                        <h4 className="font-display font-extrabold text-amber-400 text-xs uppercase tracking-widest flex items-center gap-2">
                          <span>Screenshot Roster Scanner</span>
                          <span className="text-[9px] bg-amber-500/5 text-amber-400 px-2 py-0.5 rounded border border-amber-500/10 font-mono">VISION ANALYTICS</span>
                        </h4>
                      </div>

                      {/* Dropzone & Preview Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleFileChange}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center gap-3 cursor-pointer ${
                            dragOver ? 'border-amber-500 bg-amber-500/5 col-span-1' : 'border-gray-800 bg-gray-900/10 hover:border-gray-750 col-span-1'
                          }`}
                        >
                          <input
                            type="file"
                            id="ocr-file-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label htmlFor="ocr-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-center text-amber-500">
                              <Upload className="w-6 h-6" />
                            </div>
                            <span className="block font-mono text-xs font-bold text-gray-200">
                              Choose or Drag Screenshot
                            </span>
                            <span className="block text-[10px] text-gray-500 leading-normal max-w-xs">
                              Select a screenshot displaying your NBA 2K franchise roster page listing Name, Age, Pos, and OVR.
                            </span>
                          </label>
                        </div>

                        {/* Image Preview / Commands */}
                        <div className="bg-gray-900/20 border border-gray-800 rounded-2xl p-4 flex flex-col justify-between gap-4 h-[190px]">
                          <div className="space-y-1.5 flex-grow">
                            <span className="block font-mono text-[9px] uppercase tracking-wider text-gray-500 font-bold">Screenshot Preview</span>
                            {screenshotData ? (
                              <div className="relative rounded-lg overflow-hidden border border-gray-800 max-h-[100px] bg-black flex items-center justify-center select-none">
                                <img src={screenshotData} alt="Roster preview" className="object-cover h-[100px] w-full" referrerPolicy="no-referrer" />
                                <button
                                  type="button"
                                  onClick={() => setScreenshotData(null)}
                                  className="absolute top-1 right-1 p-1 bg-black/80 text-gray-400 hover:text-white rounded-full transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="border border-gray-850 rounded-lg p-4 text-center text-[10px] text-gray-500 font-mono flex items-center justify-center h-[100px]">
                                No screenshot loaded. Use the zone on the left.
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={ocrLoading || !screenshotData}
                            onClick={handleParseScreenshot}
                            className="w-full py-2.5 bg-amber-400 hover:bg-amber-450 text-gray-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
                          >
                            {ocrLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Reading Team Screen...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Analyze image with Gemini
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* OCR Parsed List output */}
                      {ocrPlayers.length > 0 && (
                        <div className="space-y-4 animate-scaleUp border-t border-gray-850 pt-5">
                          <div className="flex items-center justify-between">
                            <h5 className="font-display font-bold text-xs text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                              <span>Detected 2K Players</span>
                              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full">{ocrPlayers.length} Identified</span>
                            </h5>
                          </div>

                          <div className="overflow-x-auto border border-gray-800 rounded-2xl bg-gray-900/10">
                            <table className="w-full text-left text-xs font-mono">
                              <thead>
                                <tr className="bg-gray-900/40 uppercase text-[9px] text-gray-500 font-bold border-b border-gray-800">
                                  <th className="py-2.5 px-4 w-[4%]">#</th>
                                  <th className="py-2.5 px-4 w-[40%]">Player Name</th>
                                  <th className="py-2.5 px-4">Position</th>
                                  <th className="py-2.5 px-4">Age</th>
                                  <th className="py-2.5 px-4">OVR Rating</th>
                                  <th className="py-2.5 px-4 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-850/40">
                                {ocrPlayers.map((p, idx) => (
                                  <tr key={idx} className="hover:bg-gray-900/30">
                                    <td className="py-1.5 px-4 text-gray-500">{idx + 1}</td>
                                    
                                    <td className="py-1 px-4">
                                      <input
                                        type="text"
                                        value={p.name}
                                        onChange={(e) => handleCustomOcrPlayerChange(idx, 'name', e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 text-xs px-2.5 py-1 text-white rounded outline-none font-sans font-bold shadow-inner"
                                      />
                                    </td>

                                    <td className="py-1 px-4">
                                      <select
                                        value={p.position}
                                        onChange={(e) => handleCustomOcrPlayerChange(idx, 'position', e.target.value)}
                                        className="bg-gray-900 border border-gray-800 text-xs px-2 py-1 text-white rounded outline-none font-bold"
                                      >
                                        <option value="PG">PG</option>
                                        <option value="SG">SG</option>
                                        <option value="SF">SF</option>
                                        <option value="PF">PF</option>
                                        <option value="C">C</option>
                                      </select>
                                    </td>

                                    <td className="py-1 px-4">
                                      <input
                                        type="number"
                                        value={p.age}
                                        onChange={(e) => handleCustomOcrPlayerChange(idx, 'age', e.target.value)}
                                        className="w-16 bg-gray-900 border border-gray-800 px-2 py-1 text-white rounded outline-none font-bold text-center"
                                      />
                                    </td>

                                    <td className="py-1 px-4">
                                      <input
                                        type="number"
                                        value={p.rating}
                                        onChange={(e) => handleCustomOcrPlayerChange(idx, 'rating', e.target.value)}
                                        className="w-16 bg-gray-900 border border-gray-800 px-2 py-1 text-amber-400 rounded outline-none font-bold text-center"
                                      />
                                    </td>

                                    <td className="py-1 px-4 text-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOcrPlayer(idx)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end gap-3 pt-4 border-t border-gray-850">
                            <button
                              type="button"
                              onClick={() => { setOcrPlayers([]); setScreenshotData(null); }}
                              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-xs text-gray-400 hover:text-white rounded-xl transition cursor-pointer font-mono font-bold"
                            >
                              Reset Scanner
                            </button>
                            
                            <button
                              type="button"
                              disabled={applyOcrLoading || ocrPlayers.length === 0}
                              onClick={handleApplyOcrRoster}
                              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              {applyOcrLoading ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  Overwrite & Start Season
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Lineup Table */}
                  <div className="bg-gray-950/50 border border-gray-850 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-4 sm:px-6 border-b border-gray-850 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-500" />
                        <h3 className="font-display font-extrabold text-xs text-gray-200">
                          ACTIVE TEAM ROTATION SETTINGS
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 font-mono text-[10px]">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${totalRotationMinutes > 240 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                          Assigned rotation minutes: {totalRotationMinutes} / 240 minutes
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="bg-gray-900/40 text-gray-500 font-mono text-[9px] uppercase tracking-wider border-b border-gray-850">
                            <th className="py-3 px-6">Player</th>
                            <th className="py-3 px-4">OVR Rating</th>
                            <th className="py-3 px-4">Lineup role</th>
                            <th className="py-3 px-4">Target Min (Daily)</th>
                            <th className="py-3 px-4">Strategy role</th>
                            <th className="py-3 px-4 text-center">On trade block</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850/60">
                          {localPlayers.map(p => (
                            <tr key={p.id} className="hover:bg-gray-900/30 transition">
                              <td className="py-3 px-6">
                                <div className="space-y-0.5">
                                  <span className="block font-bold text-gray-200 font-mono">{p.name}</span>
                                  <span className="block text-[10px] text-gray-500 uppercase font-mono">{p.position} • {p.age} years old • {p.contract}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-mono font-black text-amber-400 bg-amber-500/5 px-2 py-0.5 border border-amber-500/20 rounded">
                                  {p.rating}
                                </span>
                              </td>

                              <td className="py-3 px-4 select-none">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStarter(p.id)}
                                  className={`px-3 py-1 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full border cursor-pointer transition ${
                                    p.isStarter 
                                      ? 'bg-amber-400 text-gray-950 border-amber-400' 
                                      : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'
                                  }`}
                                >
                                  {p.isStarter ? 'Starter 🏀' : 'Bench'}
                                </button>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 font-mono">
                                  <button
                                    type="button"
                                    onClick={() => handleMinutesChange(p.id, (p.rotationMinutes || 0) - 1)}
                                    className="w-6 h-6 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={p.rotationMinutes || 0}
                                    onChange={(e) => handleMinutesChange(p.id, parseInt(e.target.value) || 0)}
                                    className="w-10 text-center bg-gray-950 border border-gray-850 text-white rounded py-0.5 outline-none font-bold"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleMinutesChange(p.id, (p.rotationMinutes || 0) + 1)}
                                    className="w-6 h-6 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white transition flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <select
                                  value={p.rotationRole || 'Bench'}
                                  onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                  className="bg-gray-900 border border-gray-850 text-white rounded px-2.5 py-1 text-[10px] outline-none font-mono font-bold"
                                >
                                  <option value="Star">Star 🌟</option>
                                  <option value="Starter">Starter</option>
                                  <option value="6th Man">6th Man</option>
                                  <option value="Bench">Bench Depth</option>
                                  <option value="Prospect">Prospect</option>
                                </select>
                              </td>

                              <td className="py-3 px-4 text-center select-none">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTradeBlock(p.id)}
                                  className={`mx-auto w-8 h-5 rounded-full p-0.5 transition cursor-pointer flex items-center ${
                                    p.isOnTradeBlock ? 'bg-red-500 justify-end' : 'bg-gray-800 justify-start'
                                  }`}
                                >
                                  <span className="w-4 h-4 bg-white rounded-full block shadow"></span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* SAVE COMMAND PANEL */}
                    <div className="p-4 sm:px-6 border-t border-gray-850 bg-gray-900/20 text-right flex items-center justify-between gap-4">
                      <div className="text-left font-mono text-[10px] text-gray-500 max-w-lg">
                        {isCommissioner ? (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Commissioner Override Active: changes will edit the database live instantly!
                          </span>
                        ) : (
                          <span>Adjusting these settings registers a pending proposal. Roster shifts execute live on Commissioner verification.</span>
                        )}
                      </div>

                      <button
                        onClick={handleSaveRosterSettings}
                        disabled={savingSettings}
                        className="py-2.5 px-6 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-gray-950 font-mono font-black text-xs uppercase rounded-xl transition cursor-pointer flex items-center gap-2 shadow"
                      >
                        {savingSettings ? 'Transmitting...' : 'SAVE & SUBMIT ROSTER ADJUSTMENTS'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SECURE TRADE PORTAL */}
              {activeSubTab === 'trade' && myTeam && (
                <div className="space-y-6 animate-fadeIn">
                  <form onSubmit={handleProposeTrade} className="space-y-6">
                    {/* Opponent Selector */}
                    <div className="p-5 bg-gray-900/30 border border-gray-850 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                      <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex-shrink-0">
                        Counter-Franchise Partner:
                      </h4>
                      <select
                        required
                        value={opponentTeamId}
                        onChange={(e) => {
                          setOpponentTeamId(e.target.value);
                          setSelectedIncomingIds([]);
                        }}
                        className="flex-1 bg-gray-900 border border-gray-850 focus:border-amber-500 rounded-xl p-3 text-white text-xs outline-none font-mono font-bold"
                      >
                        <option value="">-- Choose Target NBA Seat --</option>
                        {teams.filter(t => t.id !== userTeamId).map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.abbrev})</option>
                        ))}
                      </select>
                    </div>

                    {/* Trade Builder grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 select-none">
                      {/* Outgoing players */}
                      <div className="bg-gray-950/45 border border-gray-850 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                          <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                            <span>OUTGOING ROSTER</span>
                            {renderLogo(myTeam.logo, "w-4 h-4 object-contain")}
                          </h4>
                          <span className="font-mono text-[9px] text-gray-400 block uppercase">
                            Total Outgoing Contract: <strong className="text-amber-400">${totalOutgoingSalary.toFixed(1)}M</strong>
                          </span>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {myRoster.map(p => {
                            const isSelected = selectedOutgoingIds.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedOutgoingIds(prev =>
                                  isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                )}
                                className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold' 
                                    : 'bg-gray-900/20 border-gray-850/65 text-gray-300 hover:bg-gray-900/50'
                                }`}
                              >
                                <div>
                                  <span className="block text-xs font-semibold font-mono">{p.name} ({p.position})</span>
                                  <span className="block text-[9px] text-gray-500 uppercase font-mono">{p.contract} • Rating {p.rating}</span>
                                </div>
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-xs ${isSelected ? 'bg-amber-500 border-amber-400 text-gray-950' : 'border-gray-700'}`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Incoming players */}
                      <div className="bg-gray-950/45 border border-gray-850 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                          <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                            <span>INCOMING ROSTER</span>
                            {opponentTeamId && renderLogo(teams.find(t => t.id === opponentTeamId)?.logo, "w-4 h-4 object-contain")}
                          </h4>
                          <span className="font-mono text-[9px] text-gray-400 block uppercase">
                            Total Incoming Contract: <strong className="text-indigo-400">${totalIncomingSalary.toFixed(1)}M</strong>
                          </span>
                        </div>

                        {!opponentTeamId ? (
                          <div className="py-20 text-center text-xs text-gray-500 font-mono">
                            Select counter franchise partners above to review roster pool.
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {oppRoster.map(p => {
                              const isSelected = selectedIncomingIds.includes(p.id);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setSelectedIncomingIds(prev =>
                                    isSelected ? prev.filter(id => id !== p.id) : [...prev, p.id]
                                  )}
                                  className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                                    isSelected 
                                      ? 'bg-indigo-505/10 border-indigo-500 text-indigo-400 font-bold' 
                                      : 'bg-gray-900/20 border-gray-850/65 text-gray-300 hover:bg-gray-900/50'
                                  }`}
                                >
                                  <div>
                                    <span className="block text-xs font-semibold font-mono">{p.name} ({p.position})</span>
                                    <span className="block text-[9px] text-gray-500 uppercase font-mono">{p.contract} • Rating {p.rating}</span>
                                  </div>
                                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-xs ${isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-gray-700'}`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SALARY BALANCE DIAGNOSTIC BAR */}
                    <div className={`p-4 rounded-2xl border ${isSalaryCompliant() ? 'bg-green-950/20 border-green-500/20 text-green-400' : 'bg-amber-950/20 border-amber-500/20 text-amber-400'} flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono`}>
                      <div className="flex items-center gap-2">
                        {isSalaryCompliant() ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        <div>
                          <span className="block font-bold">
                            {isSalaryCompliant() ? 'CONTRACT STRUCTURE COMPLIANT ✅' : 'SALARY BOUNDS DEFICIT ⚠️'}
                          </span>
                          <span className="block text-[10px] text-gray-500">
                            Maximum permitted bounds is 125% of opposing parameters, or a maximum variance under $5.0M. Currently: Var ${Math.abs(totalOutgoingSalary - totalIncomingSalary).toFixed(1)}M.
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400">Ratios:</span>
                        <strong className="block text-sm">
                          {totalOutgoingSalary > 0 && totalIncomingSalary > 0 
                            ? `${(totalOutgoingSalary / totalIncomingSalary).toFixed(2)}x` 
                            : 'N/A'}
                        </strong>
                      </div>
                    </div>

                    {/* Trade notes memo */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">
                        Secure transaction parameters (Notes)
                      </label>
                      <input
                        type="text"
                        placeholder="Provide details or options guidelines (e.g. Include 2027 2nd rounder)"
                        value={tradeMessage}
                        onChange={(e) => setTradeMessage(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-850 focus:border-amber-500 outline-none p-3.5 text-xs text-white rounded-xl"
                      />
                    </div>

                    {/* Submission button */}
                    <div className="text-right">
                      <button
                        type="submit"
                        disabled={savingSettings || !isSalaryCompliant() || (selectedOutgoingIds.length === 0 && selectedIncomingIds.length === 0)}
                        className="py-3 px-8 bg-amber-400 hover:bg-amber-500 disabled:opacity-55 text-gray-950 font-mono font-black text-xs uppercase rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        {savingSettings ? 'Transmitting trade parameters...' : 'Initiate Safe Trade Proposal'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: TRANSACTION APPROVALS QUEUE */}
              {activeSubTab === 'approvals' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* COMMISSIONER ADMIN SECTION */}
                  {isCommissioner && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                        <h3 className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                          👑 Commissioner Signature Desk (Approvals REQUIRED)
                        </h3>
                        <span className="text-[10px] bg-red-500/10 text-red-500 font-mono border border-red-500/20 px-2 rounded-full py-0.5">
                          Admin Priority Check
                        </span>
                      </div>

                      {proposals.filter(p => p.status === 'pending_commissioner').length === 0 ? (
                        <div className="p-8 text-center bg-gray-900/10 border border-gray-850/40 text-gray-500 text-xs font-mono rounded-3xl">
                          No active proposals requiring Commissioner verification at this time.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {proposals.filter(p => p.status === 'pending_commissioner').map(prop => {
                            const teamA = teams.find(t => t.id === prop.teamAId);
                            const teamB = prop.teamBId ? teams.find(t => t.id === prop.teamBId) : null;

                            return (
                              <div key={prop.id} className="p-6 bg-gray-900/35 border border-red-950/40 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                <div className="space-y-1.5 md:col-span-3">
                                  <div className="flex items-center gap-1.5 font-mono text-[9px]">
                                    <span className="text-amber-400 font-bold">ID: {prop.id}</span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-teal-400 uppercase font-black">{prop.type}</span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-400">Drafted by: {prop.submittedBy}</span>
                                  </div>

                                  <h4 className="text-sm font-bold text-gray-200">
                                    {prop.type === 'trade' ? (
                                      <span>Blockbuster Trade proposal: {teamA?.name} ({teamA?.abbrev}) ⇄ {teamB?.name} ({teamB?.abbrev})</span>
                                    ) : (
                                      <span>Roster Config Adjustments: {teamA?.name} ({teamA?.abbrev})</span>
                                    )}
                                  </h4>

                                  {/* Deep details */}
                                  {prop.type === 'trade' ? (
                                    <div className="p-3.5 bg-gray-950/60 rounded-2xl text-[11px] space-y-2 font-mono">
                                      <div>
                                        <span className="text-amber-400 font-bold">{teamA?.abbrev} Sends Out:</span>{' '}
                                        {prop.teamASendsPlayerIds?.map(pId => players.find(x => x.id === pId)?.name || pId).join(', ') || 'No players'}
                                      </div>
                                      <div>
                                        <span className="text-indigo-400 font-bold">{teamB?.abbrev} Sends Out:</span>{' '}
                                        {prop.teamBSendsPlayerIds?.map(pId => players.find(x => x.id === pId)?.name || pId).join(', ') || 'No players'}
                                      </div>
                                      {prop.message && (
                                        <div className="text-gray-400 italic pt-1 border-t border-gray-900">
                                          Memo: "{prop.message}"
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="p-3.5 bg-gray-950/60 rounded-2xl text-[11px] space-y-1.5 font-mono">
                                      {prop.simPriorityChange && (
                                        <div>
                                          Priority Calibration: <strong className="text-amber-400 uppercase">{prop.simPriorityChange}</strong>
                                        </div>
                                      )}
                                      {prop.tradeBlockChanges && (
                                        <div>
                                          Trade Block updates: {prop.tradeBlockChanges.length} player(s) updated
                                        </div>
                                      )}
                                      {prop.lineupChanges && (
                                        <div>
                                          Lineup alignments: {prop.lineupChanges.length} rotation shifts requested
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex sm:flex-col gap-2 select-none justify-end">
                                  <button
                                    onClick={() => handleCommissionerApprove(prop.id)}
                                    className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-gray-950 font-mono font-black text-[10px] uppercase rounded-xl transition cursor-pointer text-center"
                                  >
                                    APPROVE TRANSACTION
                                  </button>
                                  <button
                                    onClick={() => handleRejectProposal(prop.id)}
                                    className="w-full py-2.5 bg-gray-900 hover:bg-rose-950/60 hover:text-red-400 border border-transparent hover:border-red-900/30 text-gray-400 font-mono font-bold text-[10px] uppercase rounded-xl transition cursor-pointer text-center"
                                  >
                                    DECLINE
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MY ACTIVE TRANSACTION PORTALS */}
                  <div className="space-y-4">
                    <div className="border-b border-gray-850 pb-2">
                      <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                        My Franchise Active Proposals Feed
                      </h3>
                    </div>

                    {proposals.filter(p => p.teamAId === userTeamId || p.teamBId === userTeamId).length === 0 ? (
                      <div className="p-8 text-center bg-gray-900/10 border border-gray-850/40 text-gray-500 text-xs font-mono rounded-3xl">
                        No trade parameters or roster changes are currently registered for your franchise.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {proposals.filter(p => p.teamAId === userTeamId || p.teamBId === userTeamId).map(prop => {
                          const teamA = teams.find(t => t.id === prop.teamAId);
                          const teamB = prop.teamBId ? teams.find(t => t.id === prop.teamBId) : null;
                          
                          // Determine status color tags
                          const statusTags: { [key: string]: string } = {
                            pending_acceptance: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                            pending_commissioner: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                            approved: 'bg-green-500/10 border-green-500/20 text-green-400',
                            rejected: 'bg-red-500/10 border-red-500/20 text-red-400'
                          };

                          const isInitiator = prop.teamAId === userTeamId;
                          const requiresMyAcceptance = prop.type === 'trade' && !isInitiator && prop.status === 'pending_acceptance';

                          return (
                            <div key={prop.id} className="p-5 bg-gray-900/20 border border-gray-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full uppercase font-bold ${statusTags[prop.status]}`}>
                                    {prop.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-[9px] font-mono text-gray-600">ID: {prop.id} • {prop.type.toUpperCase()}</span>
                                </div>

                                <h4 className="text-xs font-bold text-gray-300">
                                  {prop.type === 'trade' ? (
                                    <span>{teamA?.name} ({teamA?.abbrev}) Sends Out to {teamB?.name} ({teamB?.abbrev})</span>
                                  ) : (
                                    <span>Roster strategy calibration details</span>
                                  )}
                                </h4>

                                {prop.type === 'trade' && (
                                  <p className="text-[10px] text-gray-500 truncate font-mono">
                                    Sends Out: {prop.teamASendsPlayerIds?.map(pId => players.find(x => x.id === pId)?.name || pId).join(', ') || 'Draft Assets'} | 
                                    Requires: {prop.teamBSendsPlayerIds?.map(pId => players.find(x => x.id === pId)?.name || pId).join(', ') || 'Draft Assets'}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 select-none flex-shrink-0 justify-end">
                                {requiresMyAcceptance && (
                                  <button
                                    onClick={() => handleAcceptTrade(prop.id)}
                                    className="py-1.5 px-4 bg-amber-400 hover:bg-amber-500 text-gray-950 font-mono font-bold text-[10px] uppercase rounded-lg transition cursor-pointer"
                                  >
                                    Accept trade
                                  </button>
                                )}

                                {(prop.status === 'pending_acceptance' || prop.status === 'pending_commissioner') && (
                                  <button
                                    onClick={() => handleRejectProposal(prop.id)}
                                    className="py-1.5 px-4 bg-gray-900 hover:bg-rose-950/40 text-gray-400 hover:text-red-400 border border-gray-850 rounded-lg transition cursor-pointer font-mono font-bold text-[10px] uppercase"
                                  >
                                    {isInitiator ? 'Cancel proposal' : 'Reject proposal'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
