/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Renders a team logo. Supports both text emojis and base64/URL image sources.
 */
export function renderLogo(logo: string | undefined, className: string = "w-6 h-6 object-contain inline-block rounded-md") {
  if (!logo) return <span className="inline-block">🏀</span>;
  
  if (logo.startsWith('http') || logo.startsWith('data:')) {
    return (
      <img
        src={logo}
        className={className}
        alt="Team logo"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  
  return <span className="inline-block">{logo}</span>;
}

const TEAM_PRIMARY_COLORS: { [key: string]: string } = {
  IND: '#002D62', // Pacers Blue
  DET: '#ED174C', // Pistons Red
  NJN: '#002A5B', // Nets Blue
  MIA: '#98002E', // Heat Crimson
  PHI: '#006BB6', // Sixers Blue
  BOS: '#007A33', // Celtics Green
  NYK: '#F58426', // Knicks Orange
  WAS: '#002B5C', // Wizards Blue
  ORL: '#0077C0', // Magic Blue
  NOH: '#008FC8', // Hornets Teal (New Orleans)
  MIL: '#00471B', // Bucks Green
  CLE: '#860038', // Cavaliers Wine
  TOR: '#CE1141', // Raptors Red
  ATL: '#E03A3E', // Hawks Red
  CHI: '#CE1141', // Bulls Red
  MIN: '#005083', // Timberwolves Blue
  SAS: '#8A8D8F', // Spurs Silver
  LAL: '#552583', // Lakers Purple
  SAC: '#5A2D81', // Kings Purple
  DAL: '#00538C', // Mavericks Blue
  MEM: '#002855', // Grizzlies Navy
  HOU: '#CE1141', // Rockets Red
  DEN: '#0E2240', // Nuggets Skyline Blue
  UTA: '#001E33', // Jazz Blue
  POR: '#E03A3E', // Blazers Red
  SEA: '#006532', // SuperSonics Green
  GSW: '#006BB6', // Warriors Blue
  PHX: '#E56020', // Suns Orange
  LAC: '#ED174C'  // Clippers Red
};

export function getTeamColor(abbrev: string | undefined): string {
  if (!abbrev) return '#111827';
  return TEAM_PRIMARY_COLORS[abbrev.toUpperCase()] || '#111827';
}

