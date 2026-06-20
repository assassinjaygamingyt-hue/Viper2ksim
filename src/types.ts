/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Team {
  id: string; // URL slugs/IDs e.g. "lakers", "bulls"
  name: string;
  abbrev: string; // e.g. "LAL", "CHI"
  conference: 'East' | 'West';
  division: string; // e.g. "Atlantic", "Pacific", "Central", "Southwest"
  logo: string; // URL or preset identifier
  banner: string; // Custom background styling, e.g. "linear-gradient(to right, #ed1c24, #1d428a)"
  wins: number;
  losses: number;
  streak: string; // e.g. "W3", "L1"
  ptsFor: number;
  ptsAgainst: number;
  retiredJerseys?: string; // e.g. "8, 24, 32"
  gmInstagram?: string; // e.g. "@jacobm"
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  age: number;
  rating: number; // Overall rating between 50 and 99
  ppg?: number;
  rpg?: number;
  apg?: number;
  spg?: number;
  bpg?: number;
  contract: string; // e.g. "Y1: $32.4M, Y2: $34.1M" or "$15M / 2Y"
  isHOF?: boolean;
  isRetired?: boolean;
  careerAwards?: string[]; // e.g. ["2003-04 NBA MVP", "3x NBA Champion"]
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string or human date e.g. "Jun 20, 2026"
  image: string; // URL or placeholder category image
  category: 'League News' | 'Trade Alert' | 'Game Recap' | 'Injuries' | 'Offseason';
  teamId: string | null; // Associated team, if any
}

export interface PowerRankingEntry {
  teamId: string;
  rank: number;
  prevRank: number;
  movement: 'up' | 'down' | 'same';
  notes: string;
}

export interface Trade {
  id: string;
  date: string;
  teamAId: string;
  teamBId: string;
  teamAReceives: string[]; // Players/Picks Team A receives
  teamBReceives: string[]; // Players/Picks Team B receives
  details: string; // Editorial paragraph
}

export interface DraftResult {
  id: string;
  year: number;
  round: number;
  pick: number;
  teamId: string;
  playerName: string;
  position: string;
  college: string;
}

export interface Award {
  id: string;
  year: string; // e.g. "2025-26"
  category: 'Most Valuable Player' | 'Defensive Player of the Year' | 'Rookie of the Year' | 'Sixth Man of the Year' | 'Most Improved Player' | 'Coach of the Year' | 'Finals MVP' | 'General Manager of the Year';
  playerName: string;
  teamId: string;
  statsLine: string; // e.g. "29.4 PPG, 11.2 RPG, 2.5 BPG"
}

export interface DBState {
  teams: Team[];
  players: Player[];
  news: NewsArticle[];
  powerRankings: PowerRankingEntry[];
  trades: Trade[];
  draftResults: DraftResult[];
  awards: Award[];
  championships?: ChampionshipRecord[];
  teamHistories?: { [key: string]: TeamHistory };
  users?: ModUser[];
  chatRooms?: ChatRoom[];
  chatMessages?: ChatMessage[];
}

export interface ChampionshipRecord {
  id?: string;
  year: string;
  champion: string;
  championKey: string;
  runnerUp: string;
  runnerUpKey: string;
  result: string;
  fmvpName: string;
  fmvpStats: string;
  highlight: string;
}

export interface TeamHistory {
  established: string;
  championships: string[];
  legendaryPlayers: string[];
  historicalBio: string;
}

export interface ModUser {
  id: string;
  username: string;
  password?: string;
  role?: string;
  teamId?: string;
  permissions: {
    editHistory: boolean;
    editDrafts: boolean;
    editRosters: boolean;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'general' | 'group';
  memberIds: string[]; // Team IDs/abbrevs or 'admin', 'espn', etc.
  createdById: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string; // e.g. "LAL", "MIA", "admin", "espn"
  senderName: string;
  senderLogo?: string;
  senderColor?: string;
  content: string;
  timestamp: string;
}
