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
