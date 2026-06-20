/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import { DBState, Team, Player, NewsArticle, PowerRankingEntry, Trade, DraftResult, Award, ChampionshipRecord, TeamHistory, ModUser } from './src/types.js';
import { championshipsData } from './src/data/championships.js';
import { detailedTeamHistories } from './src/data/teamHistories.js';
import { initPlayersPool } from './src/data/initPlayers.js';


// Bulletproof path resolution using process.cwd() for both Dev and Production
const DB_PATH = path.resolve(process.cwd(), './src/db.json');

// Authentic 2003-2004 historical NBA logo URLs from Wikimedia/Wikipedia
const HISTORICAL_LOGOS_2003_2004: { [key: string]: string } = {
  IND: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Indiana_Pacers_logo_%281990-2005%29.svg/1200px-Indiana_Pacers_logo_%281990-2005%29.svg.png',
  DET: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Detroit_Pistons_logo_%282001-2005%29.svg/1200px-Detroit_Pistons_logo_%282001-2005%29.svg.png',
  NJN: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/New_Jersey_Nets_logo_%281997-2012%29.svg/1200px-New_Jersey_Nets_logo_%281997-2012%29.svg.png',
  MIA: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Miami_Heat_logo.svg/1200px-Miami_Heat_logo.svg.png',
  PHI: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Philadelphia_76ers_logo_%281997-2009%29.svg/1200px-Philadelphia_76ers_logo_%281997-2009%29.svg.png',
  BOS: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/1200px-Boston_Celtics.svg.png',
  NYK: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Knicks_logo.svg/1200px-New_York_Knicks_logo.svg.png',
  WAS: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Washington_Wizards_logo_%281997-2011%29.svg/1200px-Washington_Wizards_logo_%281997-2011%29.svg.png',
  ORL: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Orlando_Magic_logo_%282000-2010%29.svg/1200px-Orlando_Magic_logo_%282000-2010%29.svg.png',
  NOH: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/New_Orleans_Hornets_logo.svg/1200px-New_Orleans_Hornets_logo.svg.png',
  MIL: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Milwaukee_Bucks_logo_%281993-2006%29.svg/1200px-Milwaukee_Bucks_logo_%281993-2006%29.svg.png',
  CLE: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Cleveland_Cavaliers_2003_Logo.svg/1200px-Cleveland_Cavaliers_2003_Logo.svg.png',
  TOR: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Toronto_Raptors_logo_%281995-2008%29.svg/1200px-Toronto_Raptors_logo_%281995-2008%29.svg.png',
  ATL: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Atlanta_Hawks_logo_%281995-2007%29.svg/1200px-Atlanta_Hawks_logo_%281995-2007%29.svg.png',
  CHI: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Chicago_Bulls_logo.svg/1200px-Chicago_Bulls_logo.svg.png',
  MIN: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Minnesota_Timberwolves_logo_%281996-2017%29.svg/1200px-Minnesota_Timberwolves_logo_%281996-2017%29.svg.png',
  SAS: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/San_Antonio_Spurs_logo.svg/1200px-San_Antonio_Spurs_logo.svg.png',
  LAL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png',
  SAC: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Sacramento_Kings_logo_%281994-2016%29.svg/1200px-Sacramento_Kings_logo_%281994-2016%29.svg.png',
  DAL: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Dallas_Mavericks_logo.svg/1200px-Dallas_Mavericks_logo.svg.png',
  MEM: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Memphis_Grizzlies_logo_%281995-2004%29.svg/1200px-Memphis_Grizzlies_logo_%281995-2004%29.svg.png',
  HOU: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Rockets_logo.svg/1200px-Houston_Rockets_logo.svg.png',
  DEN: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Denver_Nuggets_logo_%282003-2018%29.svg/1200px-Denver_Nuggets_logo_%282003-2018%29.svg.png',
  UTA: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Utah_Jazz_logo_%281996-2004%29.svg/1200px-Utah_Jazz_logo_%281996-2004%29.svg.png',
  POR: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Portland_Trail_Blazers_logo_%282002-2017%29.svg/1200px-Portland_Trail_Blazers_logo_%282002-2017%29.svg.png',
  SEA: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Seattle_SuperSonics_logo.svg/1200px-Seattle_SuperSonics_logo.svg.png',
  GSW: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo_%281997-2010%29.svg/1200px-Golden_State_Warriors_logo_%281997-2010%29.svg.png',
  PHX: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/dc/Phoenix_Suns_Logo_%282000-2013%29.svg/1200px-Phoenix_Suns_Logo_%282000-2013%29.svg.png',
  LAC: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Los_Angeles_Clippers_logo_%281984-2015%29.svg/1200px-Los_Angeles_Clippers_logo_%281984-2015%29.svg.png'
};

// Memory DB cache
let dbState: DBState = {
  teams: [],
  players: [],
  news: [],
  powerRankings: [],
  trades: [],
  draftResults: [],
  awards: [],
  championships: [],
  teamHistories: {},
  users: []
};

// Ensure DB is loaded on startup
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileData = fs.readFileSync(DB_PATH, 'utf-8');
      dbState = JSON.parse(fileData);
      console.log('Database loaded successfully from', DB_PATH);
    } else {
      console.warn('DB file not found, initializing empty draft structure at', DB_PATH);
    }

    // Populate initial static data for championships if not present
    let modified = false;
    if (!dbState.championships || dbState.championships.length === 0) {
      // Map static data with unique ids so they can be edited and deleted easily
      dbState.championships = championshipsData.map((c, i) => ({
        id: `champ-${1000 + i}`,
        ...c
      }));
      modified = true;
    } else {
      // Ensure all championships have a unique ID for editing/deleting in admin panel
      dbState.championships.forEach((c: any, i: number) => {
        if (!c.id) {
          c.id = `champ-init-${1000 + i}-${Date.now()}`;
          modified = true;
        }
      });
    }

    // Populate initial static data for detailed team histories if not present
    if (!dbState.teamHistories || Object.keys(dbState.teamHistories).length === 0) {
      dbState.teamHistories = detailedTeamHistories;
      modified = true;
    }

    // Populate empty users if not present
    if (!dbState.users) {
      dbState.users = [];
      modified = true;
    } else {
      // Ensure all moderator users have a unique ID for editing/deleting in admin panel
      dbState.users.forEach((u: any, i: number) => {
        if (!u.id) {
          u.id = `mod-init-${1000 + i}-${Date.now()}`;
          modified = true;
        }
      });
    }

    // Populate empty chat arrays if not present
    if (!dbState.chatRooms) {
      dbState.chatRooms = [
        {
          id: 'room-general',
          name: 'General Federation Lobby',
          type: 'general',
          memberIds: ['admin', 'commissioner', 'espn'],
          createdById: 'system',
          createdAt: new Date().toISOString()
        }
      ];
      modified = true;
    }

    if (!dbState.chatMessages) {
      dbState.chatMessages = [];
      modified = true;
    }

    // Auto-assign high-res official NBA logo URLs if current logo is blank or an emoji
    if (dbState.teams && dbState.teams.length > 0) {
      dbState.teams.forEach(t => {
        const standardLogo = HISTORICAL_LOGOS_2003_2004[t.abbrev];
        if (standardLogo) {
          const isEmoji = !t.logo || t.logo.length <= 4 || (!t.logo.startsWith('http') && !t.logo.startsWith('data:'));
          if (isEmoji) {
            t.logo = standardLogo;
            modified = true;
          }
        }
      });
    }

    // Ensure all teams have exactly 15 players from our 2003-2004 roster pool
    if (dbState.teams && dbState.teams.length > 0) {
      dbState.teams.forEach(t => {
        let teamPlayers = dbState.players.filter(p => p.teamId === t.id);
        if (teamPlayers.length < 15) {
          const pool = initPlayersPool[t.id] || [];
          for (const candidate of pool) {
            if (teamPlayers.length >= 15) break;

            // Check if player with this name already exists in this team's roster (matching case-insensitive)
            const exists = teamPlayers.some(p => p.name.trim().toLowerCase() === candidate.name.trim().toLowerCase());
            if (!exists) {
              const safeNameId = candidate.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
              const newPlayer: Player = {
                id: `player-${t.abbrev.toLowerCase()}-${safeNameId}`,
                teamId: t.id,
                name: candidate.name,
                position: candidate.position,
                age: candidate.age,
                rating: candidate.rating,
                contract: candidate.contract,
                ppg: 0,
                rpg: 0,
                apg: 0,
                spg: 0,
                bpg: 0
              };
              dbState.players.push(newPlayer);
              modified = true;
              teamPlayers = dbState.players.filter(p => p.teamId === t.id);
            }
          }
        }
      });
    }

    if (modified) {
      saveDB();
    }
  } catch (error) {
    console.error('Failed to load database. Using blank template.', error);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
    console.log('Database saved successfully to', DB_PATH);
  } catch (err) {
    console.error('Failed to save database state:', err);
  }
}

loadDB();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Authenticate Admin Session
app.post('/api/login', (req, res) => {
  const { username, password, requestedRole } = req.body;

  // Check if super administrator
  if (password === 'viper2ksimadmin' || password === 'admin') {
    if (!username || username === 'admin' || username === 'Administrator') {
      const isESPN = requestedRole === 'ESPN/News Outlet';
      return res.json({
        success: true,
        token: 'viper-session-super-token-99824',
        user: {
          username: username || 'admin',
          role: 'admin',
          subRole: isESPN ? 'ESPN/News Outlet' : 'Commissioner',
          permissions: {
            editHistory: true,
            editDrafts: true,
            editRosters: !isESPN
          }
        }
      });
    }
  }

  // Check registered mod users from dbState
  const mods = dbState.users || [];
  const foundMod = mods.find(
    m => m.username.toLowerCase() === (username || '').toLowerCase() && m.password === password
  );

  if (foundMod) {
    return res.json({
      success: true,
      token: `viper-session-mod-token-${foundMod.id}`,
      user: {
        id: foundMod.id,
        username: foundMod.username,
        role: 'mod',
        subRole: foundMod.role || 'Team Owner',
        teamId: foundMod.teamId,
        permissions: foundMod.permissions
      }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid login credentials or insufficient privileges.' });
});

// 2. Clear / Reset DB to default state (Helper)
app.get('/api/db', (req, res) => {
  res.json(dbState);
});

// 3. Teams API
app.post('/api/teams', (req, res) => {
  const newTeam: Team = req.body;
  if (!newTeam.id || !newTeam.name || !newTeam.abbrev) {
    return res.status(400).json({ error: 'Missing team data.' });
  }

  // Check if team already exists
  if (dbState.teams.some(t => t.id === newTeam.id)) {
    return res.status(400).json({ error: 'Team ID already exists.' });
  }

  // Default record values if missing
  newTeam.wins = Number(newTeam.wins) || 0;
  newTeam.losses = Number(newTeam.losses) || 0;
  newTeam.streak = newTeam.streak || 'None';
  newTeam.ptsFor = Number(newTeam.ptsFor) || 110.0;
  newTeam.ptsAgainst = Number(newTeam.ptsAgainst) || 110.0;
  newTeam.retiredJerseys = newTeam.retiredJerseys || '';
  newTeam.gmInstagram = newTeam.gmInstagram || '';

  dbState.teams.push(newTeam);

  // Automation: Append team to power rankings at the end
  const maxRank = dbState.powerRankings.reduce((max, r) => r.rank > max ? r.rank : max, 0);
  dbState.powerRankings.push({
    teamId: newTeam.id,
    rank: maxRank + 1,
    prevRank: maxRank + 1,
    movement: 'same',
    notes: `The newly created ${newTeam.name} franchise seeks to build their roster and compete.`
  });

  saveDB();
  res.status(201).json(newTeam);
});

app.put('/api/teams/:id', (req, res) => {
  const teamId = req.params.id;
  const index = dbState.teams.findIndex(t => t.id === teamId);
  if (index === -1) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const updatedTeam = { ...dbState.teams[index], ...req.body };
  dbState.teams[index] = updatedTeam;
  saveDB();
  res.json(updatedTeam);
});

// Auto Assign Logos to Official 2003-2004 NBA Logos
app.post('/api/teams/auto-assign-logos', (req, res) => {
  let count = 0;
  dbState.teams.forEach(t => {
    const standardLogo = HISTORICAL_LOGOS_2003_2004[t.abbrev];
    if (standardLogo) {
      t.logo = standardLogo;
      count++;
    }
  });

  saveDB();
  res.json({ success: true, message: `Auto-assigned historical 2003-2004 NBA logos to ${count} teams.` });
});

app.delete('/api/teams/:id', (req, res) => {
  const teamId = req.params.id;
  const originalCount = dbState.teams.length;
  
  dbState.teams = dbState.teams.filter(t => t.id !== teamId);
  if (dbState.teams.length === originalCount) {
    return res.status(404).json({ error: 'Team not found' });
  }

  // Automation cleanups:
  // 1. Remove from Power Rankings and squeeze list
  dbState.powerRankings = dbState.powerRankings
    .filter(r => r.teamId !== teamId)
    .sort((a,b) => a.rank - b.rank)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

  // 2. Remove / orphan draft results or associated players (let's delete players so database stays clean)
  dbState.players = dbState.players.filter(p => p.teamId !== teamId);
  dbState.news = dbState.news.filter(n => n.teamId !== teamId);

  saveDB();
  res.json({ success: true, message: `Team ${teamId} and associated players successfully deleted.` });
});

// 4. Players Roster API
app.post('/api/players', (req, res) => {
  const newPlayer: Player = req.body;
  if (!newPlayer.id || !newPlayer.name || !newPlayer.teamId) {
    return res.status(400).json({ error: 'Missing essential player data.' });
  }

  // Validate roster limit of exactly 15 players max per team
  const currentRosterSize = dbState.players.filter(p => p.teamId === newPlayer.teamId).length;
  if (currentRosterSize >= 15) {
    return res.status(400).json({ error: 'Franchise roster is full. A team can have at most 15 players.' });
  }

  newPlayer.age = Number(newPlayer.age) || 20;
  newPlayer.rating = Number(newPlayer.rating) || 75;
  newPlayer.ppg = Number(newPlayer.ppg) || 0.0;
  newPlayer.rpg = Number(newPlayer.rpg) || 0.0;
  newPlayer.apg = Number(newPlayer.apg) || 0.0;
  newPlayer.spg = Number(newPlayer.spg) || 0.0;
  newPlayer.bpg = Number(newPlayer.bpg) || 0.0;
  newPlayer.contract = newPlayer.contract || '$2.0M / 1 Yr';

  dbState.players.push(newPlayer);
  saveDB();
  res.status(201).json(newPlayer);
});

app.put('/api/players/:id', (req, res) => {
  const playerId = req.params.id;
  const index = dbState.players.findIndex(p => p.id === playerId);
  if (index === -1) {
    return res.status(404).json({ error: 'Player not found.' });
  }

  const oldPlayer = dbState.players[index];
  const targetTeamId = req.body.teamId;

  // If player is traded or moved to a different team, validate that team is not full
  if (targetTeamId && targetTeamId !== oldPlayer.teamId) {
    const targetRosterSize = dbState.players.filter(p => p.teamId === targetTeamId).length;
    if (targetRosterSize >= 15) {
      return res.status(400).json({ error: 'Target franchise roster is full. A team can have at most 15 players.' });
    }
  }

  const updatedPlayer = { ...dbState.players[index], ...req.body };
  // Ensure types are converted cleanly
  updatedPlayer.age = Number(updatedPlayer.age ?? 20);
  updatedPlayer.rating = Number(updatedPlayer.rating ?? 75);
  updatedPlayer.ppg = Number(updatedPlayer.ppg ?? 0.0);
  updatedPlayer.rpg = Number(updatedPlayer.rpg ?? 0.0);
  updatedPlayer.apg = Number(updatedPlayer.apg ?? 0.0);
  updatedPlayer.spg = Number(updatedPlayer.spg ?? 0.0);
  updatedPlayer.bpg = Number(updatedPlayer.bpg ?? 0.0);

  dbState.players[index] = updatedPlayer;
  saveDB();
  res.json(updatedPlayer);
});

app.delete('/api/players/:id', (req, res) => {
  const playerId = req.params.id;
  const originalLength = dbState.players.length;
  dbState.players = dbState.players.filter(p => p.id !== playerId);
  if (dbState.players.length === originalLength) {
    return res.status(404).json({ error: 'Player not found' });
  }
  saveDB();
  res.json({ success: true });
});

// 5. News Articles API
app.post('/api/news', (req, res) => {
  const newArticle: NewsArticle = req.body;
  if (!newArticle.title || !newArticle.content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  newArticle.id = 'news-' + Date.now();
  newArticle.date = newArticle.date || new Date().toISOString().split('T')[0];
  newArticle.image = newArticle.image || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80';
  newArticle.category = newArticle.category || 'League News';
  newArticle.teamId = newArticle.teamId || null;

  dbState.news.unshift(newArticle); // Newest news at the top
  saveDB();
  res.status(201).json(newArticle);
});

app.put('/api/news/:id', (req, res) => {
  const articleId = req.params.id;
  const index = dbState.news.findIndex(n => n.id === articleId);
  if (index === -1) {
    return res.status(404).json({ error: 'News article not found.' });
  }

  const updatedArticle = { ...dbState.news[index], ...req.body };
  dbState.news[index] = updatedArticle;
  saveDB();
  res.json(updatedArticle);
});

app.delete('/api/news/:id', (req, res) => {
  const articleId = req.params.id;
  const originalLength = dbState.news.length;
  dbState.news = dbState.news.filter(n => n.id !== articleId);
  if (dbState.news.length === originalLength) {
    return res.status(404).json({ error: 'News article not found.' });
  }
  saveDB();
  res.json({ success: true });
});

// 6. Standings API
app.put('/api/standings', (req, res) => {
  const standingsData: { id: string; wins: number; losses: number; streak: string }[] = req.body;
  if (!Array.isArray(standingsData)) {
    return res.status(400).json({ error: 'Body must be an array of standings data.' });
  }

  standingsData.forEach(item => {
    const team = dbState.teams.find(t => t.id === item.id);
    if (team) {
      team.wins = Number(item.wins);
      team.losses = Number(item.losses);
      team.streak = item.streak;
    }
  });

  saveDB();
  res.json({ success: true, message: 'Standings updated successfully.' });
});

// 7. Power Rankings API
app.put('/api/power_rankings', (req, res) => {
  const newRankings: PowerRankingEntry[] = req.body;
  if (!Array.isArray(newRankings)) {
    return res.status(400).json({ error: 'Body must be an array of power rankings.' });
  }

  dbState.powerRankings = newRankings;
  saveDB();
  res.json({ success: true, message: 'Power rankings updated successfully.' });
});

// 8. Trades API
app.post('/api/trades', (req, res) => {
  const newTrade: Trade = req.body;
  if (!newTrade.teamAId || !newTrade.teamBId) {
    return res.status(400).json({ error: 'Teams involved are required.' });
  }

  newTrade.id = 'trade-' + Date.now();
  newTrade.date = newTrade.date || new Date().toISOString().split('T')[0];
  newTrade.teamAReceives = Array.isArray(newTrade.teamAReceives) ? newTrade.teamAReceives : [];
  newTrade.teamBReceives = Array.isArray(newTrade.teamBReceives) ? newTrade.teamBReceives : [];
  newTrade.details = newTrade.details || 'No trade description provided.';

  dbState.trades.unshift(newTrade);
  saveDB();
  res.status(201).json(newTrade);
});

app.delete('/api/trades/:id', (req, res) => {
  const tradeId = req.params.id;
  const originalLength = dbState.trades.length;
  dbState.trades = dbState.trades.filter(t => t.id !== tradeId);
  if (dbState.trades.length === originalLength) {
    return res.status(404).json({ error: 'Trade not found.' });
  }
  saveDB();
  res.json({ success: true });
});

// 9. Draft Results API
app.post('/api/draft_results', (req, res) => {
  const newDraftResult: DraftResult = req.body;
  if (!newDraftResult.teamId || !newDraftResult.playerName) {
    return res.status(400).json({ error: 'Draft pick requires teamId and player name.' });
  }

  newDraftResult.id = 'draft-' + Date.now();
  newDraftResult.year = Number(newDraftResult.year) || new Date().getFullYear();
  newDraftResult.round = Number(newDraftResult.round) || 1;
  newDraftResult.pick = Number(newDraftResult.pick) || 1;
  newDraftResult.position = newDraftResult.position || 'SG';
  newDraftResult.college = newDraftResult.college || 'Prospect';

  dbState.draftResults.push(newDraftResult);
  // Sort draft results by year descending, then round ascending, then pick ascending
  dbState.draftResults.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (a.round !== b.round) return a.round - b.round;
    return a.pick - b.pick;
  });

  saveDB();
  res.status(201).json(newDraftResult);
});

app.delete('/api/draft_results/:id', (req, res) => {
  const pickId = req.params.id;
  const originalLength = dbState.draftResults.length;
  dbState.draftResults = dbState.draftResults.filter(d => d.id !== pickId);
  if (dbState.draftResults.length === originalLength) {
    return res.status(404).json({ error: 'Draft pick not found.' });
  }
  saveDB();
  res.json({ success: true });
});

// 10. Awards API
app.post('/api/awards', (req, res) => {
  const award: Award = req.body;
  if (!award.category || !award.playerName || !award.teamId) {
    return res.status(400).json({ error: 'Award requires category, player name, and team.' });
  }

  award.id = 'award-' + Date.now();
  award.year = award.year || '2025-26';
  award.statsLine = award.statsLine || '-';

  dbState.awards.unshift(award);
  saveDB();
  res.status(201).json(award);
});

app.delete('/api/awards/:id', (req, res) => {
  const awardId = req.params.id;
  const originalLength = dbState.awards.length;
  dbState.awards = dbState.awards.filter(a => a.id !== awardId);
  if (dbState.awards.length === originalLength) {
    return res.status(404).json({ error: 'Award not found' });
  }
  saveDB();
  res.json({ success: true });
});


// 11. Custom PUT update APIs for editable tables:
// PUT Awards
app.put('/api/awards/:id', (req, res) => {
  const awardId = req.params.id;
  const updated = req.body;
  const awardIdx = dbState.awards.findIndex(a => a.id === awardId);
  if (awardIdx === -1) {
    return res.status(404).json({ error: 'Award not found.' });
  }
  dbState.awards[awardIdx] = { ...dbState.awards[awardIdx], ...updated };
  saveDB();
  res.json(dbState.awards[awardIdx]);
});

// PUT Draft Results
app.put('/api/draft_results/:id', (req, res) => {
  const pickId = req.params.id;
  const updated = req.body;
  const pickIdx = dbState.draftResults.findIndex(d => d.id === pickId);
  if (pickIdx === -1) {
    return res.status(404).json({ error: 'Draft pick not found.' });
  }
  dbState.draftResults[pickIdx] = { ...dbState.draftResults[pickIdx], ...updated };
  saveDB();
  res.json(dbState.draftResults[pickIdx]);
});

// PUT Trades
app.put('/api/trades/:id', (req, res) => {
  const tradeId = req.params.id;
  const updated = req.body;
  const tradeIdx = dbState.trades.findIndex(t => t.id === tradeId);
  if (tradeIdx === -1) {
    return res.status(404).json({ error: 'Trade record not found.' });
  }
  dbState.trades[tradeIdx] = { ...dbState.trades[tradeIdx], ...updated };
  saveDB();
  res.json(dbState.trades[tradeIdx]);
});

// 12. Championships API
app.post('/api/championships', (req, res) => {
  const newChamp: ChampionshipRecord = req.body;
  if (!newChamp.year || !newChamp.champion) {
    return res.status(400).json({ error: 'Championship record requires a year and champion.' });
  }
  newChamp.id = `champ-${Date.now()}`;
  if (!dbState.championships) dbState.championships = [];
  dbState.championships.unshift(newChamp);
  saveDB();
  res.status(201).json(newChamp);
});

app.put('/api/championships/:id', (req, res) => {
  const champId = req.params.id;
  const updated = req.body;
  if (!dbState.championships) dbState.championships = [];
  const champIdx = dbState.championships.findIndex(c => c.id === champId);
  if (champIdx === -1) {
    return res.status(404).json({ error: 'Championship record not found.' });
  }
  dbState.championships[champIdx] = { ...dbState.championships[champIdx], ...updated };
  saveDB();
  res.json(dbState.championships[champIdx]);
});

app.delete('/api/championships/:id', (req, res) => {
  const champId = req.params.id;
  if (!dbState.championships) dbState.championships = [];
  const originalLength = dbState.championships.length;
  dbState.championships = dbState.championships.filter(c => c.id !== champId && String(c.year) !== champId);
  if (dbState.championships.length === originalLength) {
    return res.status(404).json({ error: 'Championship record not found.' });
  }
  saveDB();
  res.json({ success: true });
});

// 13. Team History API
app.put('/api/team_histories/:teamId', (req, res) => {
  const teamId = req.params.teamId;
  const updated: TeamHistory = req.body;
  if (!dbState.teamHistories) dbState.teamHistories = {};

  dbState.teamHistories[teamId] = {
    established: updated.established || '1980',
    championships: Array.isArray(updated.championships) ? updated.championships : [],
    legendaryPlayers: Array.isArray(updated.legendaryPlayers) ? updated.legendaryPlayers : [],
    historicalBio: updated.historicalBio || ''
  };

  saveDB();
  res.json(dbState.teamHistories[teamId]);
});

// 14. Mod Users API
app.post('/api/users', (req, res) => {
  const newUser: ModUser = req.body;
  if (!newUser.password) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  newUser.id = `mod-${Date.now()}`;
  newUser.role = newUser.role || 'Team Owner';
  newUser.permissions = newUser.permissions || { editHistory: false, editDrafts: false, editRosters: false };
  newUser.teamId = newUser.teamId || '';

  if (!dbState.users) dbState.users = [];

  // Auto override username to Team Name if they are a Team Owner and team is selected
  if (newUser.role === 'Team Owner' && newUser.teamId) {
    const team = dbState.teams.find(t => t.id === newUser.teamId);
    if (team) {
      newUser.username = team.name;
    }
  }

  if (!newUser.username) {
    return res.status(400).json({ error: 'Username is required (or assign a team to auto-generate from team name).' });
  }

  // Prevent duplicate usernames
  if (dbState.users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    return res.status(400).json({ error: `The username or team owner seat for "${newUser.username}" is already assigned/taken.` });
  }

  dbState.users.push(newUser);
  saveDB();
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const updated = req.body;
  if (!dbState.users) dbState.users = [];

  const userIdx = dbState.users.findIndex(u => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const role = updated.role || dbState.users[userIdx].role || 'Team Owner';
  const teamId = updated.teamId !== undefined ? updated.teamId : (dbState.users[userIdx].teamId || '');
  let username = updated.username || dbState.users[userIdx].username;

  // Auto override username to Team Name if role is Team Owner and a team is selected
  if (role === 'Team Owner' && teamId) {
    const team = dbState.teams.find(t => t.id === teamId);
    if (team) {
      username = team.name;
    }
  }

  // Prevent duplicate usernames (excluding self)
  if (dbState.users.some(u => u.id !== userId && u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: `The username or team owner seat for "${username}" is already assigned/taken.` });
  }

  dbState.users[userIdx] = {
    ...dbState.users[userIdx],
    username,
    password: updated.password || dbState.users[userIdx].password,
    role,
    teamId,
    permissions: updated.permissions || dbState.users[userIdx].permissions
  };

  saveDB();
  res.json(dbState.users[userIdx]);
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  if (!dbState.users) dbState.users = [];
  const originalLength = dbState.users.length;
  dbState.users = dbState.users.filter(u => u.id !== userId);
  if (dbState.users.length === originalLength) {
    return res.status(404).json({ error: 'User not found.' });
  }
  saveDB();
  res.json({ success: true });
});

// 15. Chat & Messaging API
app.get('/api/chats/rooms', (req, res) => {
  if (!dbState.chatRooms) {
    dbState.chatRooms = [
      {
        id: 'room-general',
        name: 'General Federation Lobby',
        type: 'general',
        memberIds: ['admin', 'commissioner', 'espn'],
        createdById: 'system',
        createdAt: new Date().toISOString()
      }
    ];
  }
  res.json(dbState.chatRooms);
});

app.get('/api/chats/messages', (req, res) => {
  if (!dbState.chatMessages) dbState.chatMessages = [];
  res.json(dbState.chatMessages);
});

app.post('/api/chats/rooms', (req, res) => {
  const { name, type, memberIds, createdById } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Chat room name is required.' });
  }
  if (!dbState.chatRooms) dbState.chatRooms = [];

  const newRoom = {
    id: `room-${Date.now()}`,
    name,
    type: type || 'group',
    memberIds: Array.isArray(memberIds) ? memberIds : [],
    createdById: createdById || 'unknown',
    createdAt: new Date().toISOString()
  };

  dbState.chatRooms.push(newRoom);
  saveDB();

  broadcastToAll({ type: 'room_created', room: newRoom });

  res.status(201).json(newRoom);
});

app.post('/api/chats/messages', (req, res) => {
  const { roomId, senderId, senderName, senderLogo, senderColor, content } = req.body;
  if (!roomId || !content) {
    return res.status(400).json({ error: 'Room ID and message content are required.' });
  }
  if (!dbState.chatMessages) dbState.chatMessages = [];

  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    roomId,
    senderId,
    senderName,
    senderLogo,
    senderColor,
    content,
    timestamp: new Date().toISOString()
  };

  dbState.chatMessages.push(newMessage);
  saveDB();

  broadcastToAll({ type: 'message', message: newMessage });

  res.status(201).json(newMessage);
});

// Active WebSocket Clients
const wsClients = new Set<any>();

function broadcastToAll(payload: any) {
  const data = JSON.stringify(payload);
  for (const client of wsClients) {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(data);
      } catch (err) {
        console.error('Failed to send to client:', err);
      }
    }
  }
}


// ----------------------------------------------------
// FRONT-END INTEGRATION
// ----------------------------------------------------

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server mounted as Express middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static assets from', distPath);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Viper2kSim Server successfully running on http://localhost:${PORT}`);
  });

  // Setup WebSocket Server bound to same HTTP server
  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    wsClients.add(ws);
    
    // Send immediate connection acknowledgement
    ws.send(JSON.stringify({ type: 'connected' }));

    ws.on('message', (messageBuffer) => {
      try {
        const payload = JSON.parse(messageBuffer.toString());
        if (payload.type === 'message') {
          const msgData = payload.message;
          if (msgData && msgData.roomId && msgData.content) {
            const newMessage = {
              id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              roomId: msgData.roomId,
              senderId: msgData.senderId,
              senderName: msgData.senderName,
              senderLogo: msgData.senderLogo,
              senderColor: msgData.senderColor,
              content: msgData.content,
              timestamp: new Date().toISOString()
            };
            if (!dbState.chatMessages) dbState.chatMessages = [];
            dbState.chatMessages.push(newMessage);
            saveDB();
            broadcastToAll({ type: 'message', message: newMessage });
          }
        } else if (payload.type === 'room_created') {
          const roomData = payload.room;
          if (roomData && roomData.name) {
            const newRoom = {
              id: `room-${Date.now()}`,
              name: roomData.name,
              type: roomData.type || 'group',
              memberIds: Array.isArray(roomData.memberIds) ? roomData.memberIds : [],
              createdById: roomData.createdById || 'unknown',
              createdAt: new Date().toISOString()
            };
            if (!dbState.chatRooms) dbState.chatRooms = [];
            dbState.chatRooms.push(newRoom);
            saveDB();
            broadcastToAll({ type: 'room_created', room: newRoom });
          }
        }
      } catch (err) {
        console.error('WebSocket incoming frame error:', err);
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.on('error', () => {
      wsClients.delete(ws);
    });
  });
}

startServer();
