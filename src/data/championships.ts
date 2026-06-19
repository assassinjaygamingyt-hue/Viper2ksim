/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChampionshipRecord {
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

export const championshipsData: ChampionshipRecord[] = [
  {
    year: "2003-04",
    champion: "Detroit Pistons",
    championKey: "detroit-pistons",
    runnerUp: "Los Angeles Lakers",
    runnerUpKey: "los-angeles-lakers",
    result: "4-1",
    fmvpName: "Chauncey Billups",
    fmvpStats: "21.0 PPG, 5.2 APG, 3.2 RPG, shot 50.1% FG and 47.1% 3PT",
    highlight: "One of the greatest upsets in sports history. The starless but incredibly cohesive 'Goin' to Work' Pistons completely dismantled the heavily favored Lakers' four-star superteam through suffocating defense."
  },
  {
    year: "2002-03",
    champion: "San Antonio Spurs",
    championKey: "san-antonio-spurs",
    runnerUp: "New Jersey Nets",
    runnerUpKey: "new-jersey-nets",
    result: "4-2",
    fmvpName: "Tim Duncan",
    fmvpStats: "24.2 PPG, 17.0 RPG, 5.3 APG, 5.3 BPG, 1.0 SPG",
    highlight: "Tim Duncan turned in a historically dominant masterpiece, nearly registering a quadruple-double in the Game 6 clincher (21 pts, 20 reb, 10 ast, 8 blk) to secure David Robinson's retirement title."
  },
  {
    year: "2001-02",
    champion: "Los Angeles Lakers",
    championKey: "los-angeles-lakers",
    runnerUp: "New Jersey Nets",
    runnerUpKey: "new-jersey-nets",
    result: "4-0",
    fmvpName: "Shaquille O'Neal",
    fmvpStats: "36.3 PPG, 12.3 RPG, 3.8 APG, 2.8 BPG",
    highlight: "To cap off a three-peat, Shaq exerted absolute interior physical dominance, leaving New Jersey's defense completely helpless as the Lakers swept the series."
  },
  {
    year: "2000-01",
    champion: "Los Angeles Lakers",
    championKey: "los-angeles-lakers",
    runnerUp: "Philadelphia 76ers",
    runnerUpKey: "philadelphia-76ers",
    result: "4-1",
    fmvpName: "Shaquille O'Neal",
    fmvpStats: "33.0 PPG, 15.8 RPG, 4.8 APG, 3.4 BPG",
    highlight: "After Allen Iverson's legendary Game 1 'step-over' shocker, the Lakers went on an unstoppable run to finish a near-perfect 15-1 postseason run."
  },
  {
    year: "1999-00",
    champion: "Los Angeles Lakers",
    championKey: "los-angeles-lakers",
    runnerUp: "Indiana Pacers",
    runnerUpKey: "indiana-pacers",
    result: "4-2",
    fmvpName: "Shaquille O'Neal",
    fmvpStats: "38.0 PPG, 16.7 RPG, 2.7 BPG, shot 61.1% FG",
    highlight: "Shaq's first rings and the official start of the Lakers' 2000s dynasty. O'Neal recorded an absurd 40+ points in three separate games during a highly physical matchup against Reggie Miller's Pacers."
  },
  {
    year: "1998-99",
    champion: "San Antonio Spurs",
    championKey: "san-antonio-spurs",
    runnerUp: "New York Knicks",
    runnerUpKey: "new-york-knicks",
    result: "4-1",
    fmvpName: "Tim Duncan",
    fmvpStats: "27.4 PPG, 14.0 RPG, 2.4 APG, 2.2 BPG",
    highlight: "The Twin Towers of Tim Duncan and David Robinson secure the franchise's very first championship title, defeating a historic, hard-nosed 8th-seeded Knicks squad."
  },
  {
    year: "1997-98",
    champion: "Chicago Bulls",
    championKey: "chicago-bulls",
    runnerUp: "Utah Jazz",
    runnerUpKey: "utah-jazz",
    result: "4-2",
    fmvpName: "Michael Jordan",
    fmvpStats: "33.5 PPG, 4.0 RPG, 2.3 APG, 1.8 SPG",
    highlight: "The Last Dance. Jordan steals the ball from Karl Malone and sinks the iconic, championship-clinching crossover jumper in Salt Lake City to secure his second three-peat."
  },
  {
    year: "1996-97",
    champion: "Chicago Bulls",
    championKey: "chicago-bulls",
    runnerUp: "Utah Jazz",
    runnerUpKey: "utah-jazz",
    result: "4-2",
    fmvpName: "Michael Jordan",
    fmvpStats: "32.3 PPG, 7.0 RPG, 6.0 APG, 1.2 SPG",
    highlight: "Highlighted by Jordan's legendary 'Flu Game' in Utah (Game 5), where he overcame severe food poisoning to drop 38 points and push the Bulls to victory."
  },
  {
    year: "1995-96",
    champion: "Chicago Bulls",
    championKey: "chicago-bulls",
    runnerUp: "Seattle SuperSonics",
    runnerUpKey: "seattle-supersonics",
    result: "4-2",
    fmvpName: "Michael Jordan",
    fmvpStats: "27.3 PPG, 5.3 RPG, 4.2 APG, 1.7 SPG",
    highlight: "Capping off a historic 72-10 regular season, Michael Jordan wins his fourth ring on Father's Day, breaking down in tears in the locker room memory of his late father."
  },
  {
    year: "1994-95",
    champion: "Houston Rockets",
    championKey: "houston-rockets",
    runnerUp: "Orlando Magic",
    runnerUpKey: "orlando-magic",
    result: "4-0",
    fmvpName: "Hakeem Olajuwon",
    fmvpStats: "32.8 PPG, 11.5 RPG, 5.5 APG, 2.0 BPG",
    highlight: "Entering the playoffs as a lowly 6th seed, Rudy Tomjanovich's Rockets sweeping Shaq's rising Magic generated the legendary quote: 'Don't ever underestimate the heart of a champion!'"
  },
  {
    year: "1993-94",
    champion: "Houston Rockets",
    championKey: "houston-rockets",
    runnerUp: "New York Knicks",
    runnerUpKey: "new-york-knicks",
    result: "4-3",
    fmvpName: "Hakeem Olajuwon",
    fmvpStats: "26.9 PPG, 9.1 RPG, 3.6 APG, 3.9 BPG",
    highlight: "An epic, bruising defensive battle between two legendary centers, Hakeem Olajuwon and Patrick Ewing. Olajuwon's iconic Game 6 block on John Starks saved the season."
  },
  {
    year: "1992-93",
    champion: "Chicago Bulls",
    championKey: "chicago-bulls",
    runnerUp: "Phoenix Suns",
    runnerUpKey: "phoenix-suns",
    result: "4-2",
    fmvpName: "Michael Jordan",
    fmvpStats: "41.0 PPG, 8.5 RPG, 6.3 APG, 1.7 SPG",
    highlight: "Jordan set a Finals record that still stands, averaging an unbelievable 41.0 PPG including four straight 40+ point games to outlast Charles Barkley's MVP Suns."
  },
  {
    year: "1991-92",
    champion: "Chicago Bulls",
    championKey: "chicago-bulls",
    runnerUp: "Portland Trail Blazers",
    runnerUpKey: "portland-trail-blazers",
    result: "4-2",
    fmvpName: "Michael Jordan",
    fmvpStats: "35.8 PPG, 4.8 RPG, 6.5 APG, 1.7 SPG",
    highlight: "Features the legendary 'shrug' game (Game 1), where Jordan hit an unprecedented 6 three-pointers in the first half of a dominant thrashing of Clyde Drexler's Blazers."
  },
  {
    year: "1990-91",
    champion: "Chicago Bulls",
    championKey: "chicago-bulls",
    runnerUp: "Los Angeles Lakers",
    runnerUpKey: "los-angeles-lakers",
    result: "4-1",
    fmvpName: "Michael Jordan",
    fmvpStats: "31.2 PPG, 6.6 RPG, 11.4 APG, 2.8 SPG",
    highlight: "Passing of the torch. Jordan wins his very first title, defeating Magic Johnson's Lakers, highlighted by Jordan's legendary mid-air hand-switching layup."
  },
  {
    year: "1989-90",
    champion: "Detroit Pistons",
    championKey: "detroit-pistons",
    runnerUp: "Portland Trail Blazers",
    runnerUpKey: "portland-trail-blazers",
    result: "4-1",
    fmvpName: "Isiah Thomas",
    fmvpStats: "27.6 PPG, 5.2 RPG, 7.0 APG, 1.6 SPG",
    highlight: "Detroit's 'Bad Boys' captured their second straight NBA title through suffocating, lock-down physical defense and Isiah Thomas's clutch scoring outbursts."
  }
];
