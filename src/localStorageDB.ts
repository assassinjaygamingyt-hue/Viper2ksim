import initialDB from './db.json';
import { DBState } from './types';

// Load state from local storage or seed from initialDB
const STORAGE_KEY = 'viper2ksim_local_db';

let dbState: DBState = (() => {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      // Ensure essential arrays exist
      return {
        teams: parsed.teams || [],
        players: parsed.players || [],
        news: parsed.news || [],
        powerRankings: parsed.powerRankings || [],
        trades: parsed.trades || [],
        draftResults: parsed.draftResults || [],
        awards: parsed.awards || [],
        championships: parsed.championships || [],
        teamHistories: parsed.teamHistories || {},
        users: parsed.users || []
      };
    } catch (e) {
      console.error('Error parsing local storage database, falling back to initial data.', e);
    }
  }
  // Return typed initial DB fallback with deep cloning to allow full mutability of records
  const clonedInitial = JSON.parse(JSON.stringify(initialDB));
  return {
    teams: clonedInitial.teams || [],
    players: clonedInitial.players || [],
    news: clonedInitial.news || [],
    powerRankings: clonedInitial.powerRankings || [],
    trades: clonedInitial.trades || [],
    draftResults: clonedInitial.draftResults || [],
    awards: clonedInitial.awards || [],
    championships: clonedInitial.championships || [],
    teamHistories: clonedInitial.teamHistories || {},
    users: clonedInitial.users || []
  };
})();

// Save database back to localStorage
function saveDB() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dbState));
  // Dispatch a custom event to notify other browser components to sync their states
  window.dispatchEvent(new Event('viper_db_synced'));
}

// Global hook to intercept window.fetch and redirect all API calls to localStorage in Static Mode
export function initLocalStorageInterceptor() {
  const originalFetch = window.fetch;

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept if the call targets /api/... and there is no responding backend server
    // (Or we can enable it by default when hosted on github.io or weebly static embed nodes)
    const isStaticHost = 
      window.location.hostname.includes('github.io') || 
      window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('netlify.app') || 
      window.location.hostname.includes('surge.sh') || 
      window.location.hostname.includes('render.com') || 
      window.location.hostname.includes('weebly') || 
      window.location.hostname.includes('webflow') || 
      window.location.hostname.includes('card') || 
      window.location.protocol === 'file:' ||
      localStorage.getItem('force_static_mode') === 'true';

    // If it's an API call and we are on a static host, handle it completely client-side!
    if (urlStr.includes('/api/') && (isStaticHost || localStorage.getItem('force_static_mode') === 'true')) {
      const url = new URL(urlStr, window.location.origin);
      const pathname = url.pathname;
      const method = (init?.method || 'GET').toUpperCase();
      let bodyData: any = {};
      
      if (init?.body) {
        try {
          bodyData = JSON.parse(init.body as string);
        } catch {
          // ignore
        }
      }

      console.log(`[Static Offline DB] Intercepted Fetch: ${method} ${pathname}`);

      // Helper to generate text/json Response
      const jsonResponse = (data: any, status = 200) => {
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      // 1. GET /api/db
      if (pathname === '/api/db' && method === 'GET') {
        return jsonResponse(dbState);
      }

      // 2. POST /api/login
      if (pathname === '/api/login' && method === 'POST') {
        const { username, password, requestedRole } = bodyData;
        
        // Custom authentication login bypass for static hosters
        const enteredUser = username?.trim().toLowerCase() || '';
        const isAuthViper = enteredUser === 'viper2ksim' && password === 'admin';
        const isAuthFallback = (enteredUser === 'admin' || enteredUser === '') && (password === 'admin' || password === 'viper2ksimadmin');
        const customUser = dbState.users?.find(u => u.username.toLowerCase() === enteredUser && u.password === password);

        if (isAuthViper || isAuthFallback || customUser) {
          const matchedUser = customUser || {
            username: 'Viper2ksim',
            role: 'admin',
            permissions: { editHistory: true, editDrafts: true, editRosters: true }
          };
          return jsonResponse({
            token: 'viper-session-super-token-99824',
            user: matchedUser
          });
        }
        return jsonResponse({ message: 'Invalid admin credentials or custom login.' }, 401);
      }

      // 3. TEAM OPERATIONS: /api/teams
      if (pathname === '/api/teams') {
        if (method === 'POST') {
          const newTeam = {
            id: `team-${Date.now()}`,
            wins: 0,
            losses: 0,
            streak: '0-0',
            ptsFor: 100,
            ptsAgainst: 100,
            ...bodyData
          };
          dbState.teams.push(newTeam);
          saveDB();
          return jsonResponse(newTeam, 201);
        }
      }

      // /api/teams/:id
      const teamIdMatch = pathname.match(/^\/api\/teams\/([a-zA-Z0-9\-_]+)$/);
      if (teamIdMatch) {
        const teamId = teamIdMatch[1];
        if (method === 'PUT') {
          dbState.teams = dbState.teams.map(t => t.id === teamId ? { ...t, ...bodyData } : t);
          saveDB();
          return jsonResponse({ success: true, id: teamId });
        }
        if (method === 'DELETE') {
          dbState.teams = dbState.teams.filter(t => t.id !== teamId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 4. TEAM STANDINGS UPDATE /api/standings
      if (pathname === '/api/standings' && method === 'PUT') {
        const standingUpdates = bodyData; // expects array of structural standings
        if (Array.isArray(standingUpdates)) {
          dbState.teams = dbState.teams.map(t => {
            const up = standingUpdates.find((u: any) => u.id === t.id);
            return up ? { ...t, wins: up.wins, losses: up.losses, streak: up.streak, ptsFor: up.ptsFor, ptsAgainst: up.ptsAgainst } : t;
          });
          saveDB();
        }
        return jsonResponse({ success: true });
      }

      // 5. PLAYER OPERATIONS: /api/players
      if (pathname === '/api/players') {
        if (method === 'POST') {
          const newPlayer = {
            id: `player-${Date.now()}`,
            ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, age: 22, rating: 70,
            contract: 'Standard', isStarter: false, isHOF: false,
            ...bodyData
          };
          dbState.players.push(newPlayer);
          saveDB();
          return jsonResponse(newPlayer, 201);
        }
      }

      // /api/players/:id
      const playerIdMatch = pathname.match(/^\/api\/players\/([a-zA-Z0-9\-_]+)$/);
      if (playerIdMatch) {
        const playerId = playerIdMatch[1];
        if (method === 'PUT') {
          dbState.players = dbState.players.map(p => p.id === playerId ? { ...p, ...bodyData } : p);
          saveDB();
          return jsonResponse({ success: true });
        }
        if (method === 'DELETE') {
          dbState.players = dbState.players.filter(p => p.id !== playerId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 6. POWER RANKINGS: /api/power_rankings
      if (pathname === '/api/power_rankings') {
        if (method === 'PUT') {
          dbState.powerRankings = bodyData;
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 7. NEWS ARTICLES: /api/news
      if (pathname === '/api/news') {
        if (method === 'POST') {
          const newArticle = {
            id: `news-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            ...bodyData
          };
          dbState.news.unshift(newArticle);
          saveDB();
          return jsonResponse(newArticle, 210);
        }
      }
      const newsIdMatch = pathname.match(/^\/api\/news\/([a-zA-Z0-9\-_]+)$/);
      if (newsIdMatch) {
        const nId = newsIdMatch[1];
        if (method === 'DELETE') {
          dbState.news = dbState.news.filter(n => n.id !== nId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 8. TRADES TRACKER: /api/trades
      if (pathname === '/api/trades') {
        if (method === 'POST') {
          const newTrade = {
            id: `trade-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            ...bodyData
          };
          dbState.trades.unshift(newTrade);
          saveDB();
          return jsonResponse(newTrade, 201);
        }
      }
      const tradeIdMatch = pathname.match(/^\/api\/trades\/([a-zA-Z0-9\-_]+)$/);
      if (tradeIdMatch) {
         const tId = tradeIdMatch[1];
         if (method === 'DELETE') {
           dbState.trades = dbState.trades.filter(t => t.id !== tId);
           saveDB();
           return jsonResponse({ success: true });
         }
      }

      // 9. DRAFT RESULTS: /api/draft_results
      if (pathname === '/api/draft_results') {
        if (method === 'POST') {
          const newDraft = {
            id: `draft-${Date.now()}`,
            ...bodyData
          };
          dbState.draftResults.push(newDraft);
          saveDB();
          return jsonResponse(newDraft, 201);
        }
      }
      const draftIdMatch = pathname.match(/^\/api\/draft_results\/([a-zA-Z0-9\-_]+)$/);
      if (draftIdMatch) {
        const dId = draftIdMatch[1];
        if (method === 'PUT') {
          dbState.draftResults = dbState.draftResults.map(d => d.id === dId ? { ...d, ...bodyData } : d);
          saveDB();
          return jsonResponse({ success: true });
        }
        if (method === 'DELETE') {
          dbState.draftResults = dbState.draftResults.filter(d => d.id !== dId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 10. RECOGNIZED AWARDS: /api/awards
      if (pathname === '/api/awards') {
        if (method === 'POST') {
          const newAward = {
            id: `award-${Date.now()}`,
            ...bodyData
          };
          dbState.awards.push(newAward);
          saveDB();
          return jsonResponse(newAward, 201);
        }
      }
      const awardIdMatch = pathname.match(/^\/api\/awards\/([a-zA-Z0-9\-_]+)$/);
      if (awardIdMatch) {
        const aId = awardIdMatch[1];
        if (method === 'PUT') {
          dbState.awards = dbState.awards.map(a => a.id === aId ? { ...a, ...bodyData } : a);
          saveDB();
          return jsonResponse({ success: true });
        }
        if (method === 'DELETE') {
          dbState.awards = dbState.awards.filter(a => a.id !== aId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 11. CHAMPIONSHIPS: /api/championships
      if (pathname === '/api/championships') {
        if (method === 'POST') {
          const newChamp = {
            id: `champ-${Date.now()}`,
            ...bodyData
          };
          dbState.championships.push(newChamp);
          saveDB();
          return jsonResponse(newChamp, 201);
        }
      }
      const champIdMatch = pathname.match(/^\/api\/championships\/([a-zA-Z0-9\-_]+)$/);
      if (champIdMatch) {
        const cId = champIdMatch[1];
        if (method === 'PUT') {
          dbState.championships = dbState.championships.map(c => c.id === cId ? { ...c, ...bodyData } : c);
          saveDB();
          return jsonResponse({ success: true });
        }
        if (method === 'DELETE') {
          dbState.championships = dbState.championships.filter(c => c.id !== cId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 12. TEAM DETAILED HISTORIES
      const historyIdMatch = pathname.match(/^\/api\/team_histories\/([a-zA-Z0-9\-_]+)$/);
      if (historyIdMatch) {
        const teamId = historyIdMatch[1];
        if (method === 'PUT') {
          dbState.teamHistories[teamId] = bodyData;
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // 13. USER/MOD CONTROL: /api/users
      if (pathname === '/api/users' && method === 'POST') {
        if (!dbState.users) dbState.users = [];
        if (dbState.users.length >= 40) {
          return jsonResponse({ error: 'Cannot create user. League is at maximum capacity (40 users).' }, 400);
        }
        const newUser = {
          id: `mod-${Date.now()}`,
          role: bodyData.role || 'Team Owner',
          permissions: bodyData.permissions || { editHistory: false, editDrafts: false, editRosters: false },
          teamId: bodyData.teamId || '',
          ...bodyData
        };
        dbState.users.push(newUser);
        saveDB();
        return jsonResponse(newUser, 201);
      }

      if (pathname === '/api/settings') {
        if (method === 'GET') {
          return jsonResponse({
            registrationDisabled: !!dbState.registrationDisabled,
            userCount: dbState.users ? dbState.users.length : 0
          });
        }
        if (method === 'POST') {
          dbState.registrationDisabled = Boolean(bodyData.registrationDisabled);
          saveDB();
          return jsonResponse({
            success: true,
            registrationDisabled: !!dbState.registrationDisabled,
            userCount: dbState.users ? dbState.users.length : 0
          });
        }
      }

      if (pathname === '/api/register' && method === 'POST') {
        if (!dbState.users) dbState.users = [];
        if (dbState.registrationDisabled) {
          return jsonResponse({ error: 'Self-registration has been disabled by the Commissioner.' }, 400);
        }
        if (dbState.users.length >= 40) {
          return jsonResponse({ error: 'League is at maximum capacity (40 users). Registration automatically locked.' }, 400);
        }
        const cleanUsername = bodyData.username?.trim().toLowerCase().replace(/\s+/g, '') || '';
        if (dbState.users.some(u => u.username.toLowerCase() === cleanUsername)) {
          return jsonResponse({ error: `The username "${cleanUsername}" is already taken.` }, 400);
        }
        const finalRole = bodyData.role || 'Viewer';
        const finalTeamId = finalRole === 'Team Owner' ? (bodyData.teamId || '') : '';
        const isSovereign = finalRole === 'Commissioner' || finalRole === 'Co-Commissioner';
        const newUser = {
          id: `mod-${Date.now()}`,
          username: cleanUsername,
          password: bodyData.password,
          role: finalRole,
          teamId: finalTeamId,
          permissions: {
            editHistory: isSovereign,
            editDrafts: isSovereign,
            editRosters: isSovereign
          }
        };
        dbState.users.push(newUser);
        saveDB();
        return jsonResponse({ success: true, user: newUser }, 201);
      }

      const userIdMatch = pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)$/);
      if (userIdMatch) {
        const uId = userIdMatch[1];
        if (method === 'PUT') {
          dbState.users = dbState.users.map(u => u.id === uId ? { ...u, ...bodyData } : u);
          saveDB();
          return jsonResponse({ success: true });
        }
        if (method === 'DELETE') {
          dbState.users = dbState.users.filter(u => u.id !== uId);
          saveDB();
          return jsonResponse({ success: true });
        }
      }

      // Backup fallback empty successes
      return jsonResponse({ message: 'Static API mock succeeded.' });
    }

    // Otherwise, perform original backend server fetch
    return originalFetch ? originalFetch.apply(this, [input, init]) : new Response('No backend connection available.', { status: 503 });
  };

  try {
    Object.defineProperty(window, 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true
    });
  } catch (e) {
    try {
      (window as any).fetch = customFetch;
    } catch (err) {
      console.warn('[Static Offline DB] Critical: window.fetch is readonly and cannot be configured in this environment.', err);
    }
  }
}
