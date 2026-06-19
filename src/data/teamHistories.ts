/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TeamHistory {
  established: string;
  championships: string[];
  legendaryPlayers: string[];
  historicalBio: string;
}

export const detailedTeamHistories: { [key: string]: TeamHistory } = {
  "los-angeles-lakers": {
    established: "1947",
    championships: ["1949", "1950", "1952", "1953", "1954", "1972", "1980", "1982", "1985", "1987", "1988", "2000", "2001", "2002"],
    legendaryPlayers: ["Kobe Bryant", "Shaquille O'Neal", "Magic Johnson", "Kareem Abdul-Jabbar", "Jerry West", "Elgin Baylor"],
    historicalBio: "Originally originating in Minneapolis as the lake-named powerhouse, the Lakers moved to Hollywood in 1960 and established one of sports' most glamorous and winning legacies. From the Showtime era in the 80s to the legendary early 2000s Shaq-and-Kobe three-peat, the Purple and Gold are synonymous with championship royalty."
  },
  "boston-celtics": {
    established: "1946",
    championships: ["1957", "1959", "1960", "1961", "1962", "1963", "1964", "1965", "1966", "1968", "1969", "1974", "1976", "1981", "1984", "1986"],
    legendaryPlayers: ["Bill Russell", "Larry Bird", "John Havlicek", "Bob Cousy", "Dave Cowens", "Paul Pierce"],
    historicalBio: "A founding charter member of the BAA/NBA, Boston's green legacy is anchored by Bill Russell's unprecedented 11 championship rings in 13 seasons and Larry Bird's fierce 1980s rivalry years. Playing on the iconic parquet floors, the Celtics have defined professional basketball's team-first standard for generations."
  },
  "chicago-bulls": {
    established: "1966",
    championships: ["1991", "1992", "1993", "1996", "1997", "1998"],
    legendaryPlayers: ["Michael Jordan", "Scottie Pippen", "Dennis Rodman", "Artis Gilmore"],
    historicalBio: "The Bulls dominated the 1990s behind the greatest of all time, Michael Jordan, alongside defensive mastermind Scottie Pippen and legendary head coach Phil Jackson. With two historic three-peats, Chicago transformed professional hoops into a global cultural phenomenon."
  },
  "san-antonio-spurs": {
    established: "1967",
    championships: ["1999", "2003"],
    legendaryPlayers: ["Tim Duncan", "David Robinson", "George Gervin", "Tony Parker", "Manu Ginobili"],
    historicalBio: "Transitioning from the ABA's Dallas Chaparrals, the Spurs created an elite, sustained standard of success under legendary coach Gregg Popovich and low-post anchor Tim Duncan, earning championships in 1999 and 2003 through deep roster continuity and flawless defensive fundamentals."
  },
  "detroit-pistons": {
    established: "1941",
    championships: ["1989", "1990", "2004"],
    legendaryPlayers: ["Isiah Thomas", "Joe Dumars", "Bill Laimbeer", "Ben Wallace", "Chauncey Billups"],
    historicalBio: "First starting as the Fort Wayne Zollner Pistons, Detroit won legendary back-to-back cups in 1989 and 1990 as the physical, feared 'Bad Boys.' Known for their suffocating defense and hard-nosed team-first chemistry, they defeated the heavily favored Lakers to secure the 2004 NBA championship."
  },
  "philadelphia-76ers": {
    established: "1946",
    championships: ["1955", "1967", "1983"],
    legendaryPlayers: ["Julius Erving", "Allen Iverson", "Wilt Chamberlain", "Moses Malone", "Hal Greer"],
    historicalBio: "Beginning as the Syracuse Nationals, Philly enjoyed historic title eras with Wilt Chamberlain in 1967 and the unstoppable Julius 'Dr. J' Erving and Moses Malone in 1983. In 2001, Allen Iverson captured the world's heart with a historic MVP run to the Finals."
  },
  "indiana-pacers": {
    established: "1967",
    championships: ["1970", "1972", "1973 (ABA)"],
    legendaryPlayers: ["Reggie Miller", "Jermaine O'Neal", "Mel Daniels", "George McGinnis"],
    historicalBio: "An old ABA powerhouse that joined during the 1976 merger, the Pacers have been synonymous with Reggie Miller's clutch shooting and legendary postseason battles. Under Jermaine O'Neal and Ron Artest, they finished with a league-best 61 wins in 2003-04."
  },
  "new-york-knicks": {
    established: "1946",
    championships: ["1970", "1973"],
    legendaryPlayers: ["Walt Frazier", "Willis Reed", "Patrick Ewing", "Earl Monroe"],
    historicalBio: "As one of the charter franchises located in the world's most famous arena (Madison Square Garden), the Knicks' legendary 1970s titles defined grit, team passing, and Willis Reed's epic gametime courage. Patrick Ewing later anchored a physical, perennially elite Eastern giant in the 90s."
  },
  "miami-heat": {
    established: "1988",
    championships: [],
    legendaryPlayers: ["Alonzo Mourning", "Tim Hardaway", "Dwyane Wade", "Lamar Odom"],
    historicalBio: "An expansion franchise that grew quickly into an Eastern threat under Alonzo Mourning and Tim Hardaway. They entered an exciting new era in the 2003-04 season with electrifying rookie guard Dwyane Wade and young All-Star contender Lamar Odom."
  },
  "sacramento-kings": {
    established: "1923",
    championships: ["1951"],
    legendaryPlayers: ["Oscar Robertson", "Chris Webber", "Peja Stojakovic", "Mitch Richmond", "Vlade Divac"],
    historicalBio: "Operating across Rochester, Cincinnati, and Kansas City as the Royals, they took home the 1951 title led by all-time legend Oscar Robertson. In the early 2000s, Sacramento emerged as 'The Greatest Show on Court,' famous for their rapid sharing style."
  },
  "portland-trail-blazers": {
    established: "1970",
    championships: ["1977"],
    legendaryPlayers: ["Bill Walton", "Clyde Drexler", "Terry Porter", "Zach Randolph"],
    historicalBio: "Famous for Blazermania and the 1977 title led by Bill Walton's all-around genius. In the late 80s and 90s, Clyde Drexler kept the franchise among the league elite, known for high-altitude scoring and incredibly passionate Pacific Northwest fan support."
  },
  "dallas-mavericks": {
    established: "1980",
    championships: [],
    legendaryPlayers: ["Dirk Nowitzki", "Steve Nash", "Michael Finley", "Mark Aguirre"],
    historicalBio: "Starting as a 1980 expansion franchise, Dallas reached legendary heights in the early 2000s under Dirk Nowitzki and Steve Nash. Their high-scoring, fluid gameplay converted them into a staple Western powerhouse."
  },
  "houston-rockets": {
    established: "1967",
    championships: ["1994", "1995"],
    legendaryPlayers: ["Hakeem Olajuwon", "Moses Malone", "Yao Ming", "Steve Francis", "Clyde Drexler"],
    historicalBio: "Relocating from San Diego, the Rockets captured back-to-back flags in 1994 and 1995 led by Hakeem 'The Dream' Olajuwon's parallel dominance. Today, they represent the future with All-Star center Yao Ming."
  },
  "phoenix-suns": {
    established: "1968",
    championships: [],
    legendaryPlayers: ["Charles Barkley", "Kevin Johnson", "Steve Nash", "Shawn Marion", "Amare Stoudemire"],
    historicalBio: "Phoenix has run some of the most electric offenses in history, highlighted by Kevin Johnson, Charles Barkley's 1993 Finals run, and the early 2000s high-flying core of Shawn Marion and Amare Stoudemire."
  },
  "minnesota-timberwolves": {
    established: "1989",
    championships: [],
    legendaryPlayers: ["Kevin Garnett", "Sam Cassell", "Latrell Sprewell", "Wally Szczerbiak"],
    historicalBio: "Joining as an expansion franchise in 1989, Minnesota became a force behind Kevin Garnett. Garnett's intense passion and complete skillset carried them to a franchise-record 58 wins and the top seed in the West in 2003-04."
  },
  "seattle-supersonics": {
    established: "1967",
    championships: ["1979"],
    legendaryPlayers: ["Gary Payton", "Shawn Kemp", "Ray Allen", "Jack Sikma", "Dennis Johnson"],
    historicalBio: "Seattle achieved legendary heights with their 1979 NBA Championship under Lenny Wilkens. In the 90s, the Payton-to-Kemp 'Lob City' era captivated fans worldwide, succeeded in the 2000s by the elite sniper duo of Ray Allen and Rashard Lewis."
  },
  "cleveland-cavaliers": {
    established: "1970",
    championships: [],
    legendaryPlayers: ["LeBron James", "Mark Price", "Brad Daugherty", "Zydrunas Ilgauskas"],
    historicalBio: "Cleveland entered a completely historical epoch in 2003 by drafting high-school phenomenon LeBron 'The Chosen One' James. Alongside veteran Zydrunas Ilgauskas, they represent one of the fastest ascending franchises in professional sports."
  },
  "orlando-magic": {
    established: "1989",
    championships: [],
    legendaryPlayers: ["Shaquille O'Neal", "Penny Hardaway", "Tracy McGrady", "Nick Anderson"],
    historicalBio: "Famous for the electric young Shaq-and-Penny duo in the mid-90s, the Magic reached the 1995 Finals. Under scoring champion Tracy McGrady's historic individual volume in the early 2000s, Orlando is known as an exciting, explosive franchise."
  },
  "utah-jazz": {
    established: "1974",
    championships: [],
    legendaryPlayers: ["Karl Malone", "John Stockton", "Andrei Kirilenko", "Pete Maravich"],
    historicalBio: "Starting in New Orleans, the Jazz relocated to Utah in 1979. Behind Stockton and Malone's legendary pick-and-roll partnership, Utah reached consecutive Finals in 1997 and 1998, continuing their disciplined winning tradition with defensive star Andrei Kirilenko."
  }
};

export function getTeamHistory(teamId: string, teamName: string, abbrev: string): TeamHistory {
  if (detailedTeamHistories[teamId]) {
    return detailedTeamHistories[teamId];
  }

  // Generate dynamic, high-quality generic history for expansion/other teams
  return {
    established: "1980",
    championships: [],
    legendaryPlayers: [`Legendary ${abbrev} Players`],
    historicalBio: `The ${teamName} franchise has been a dedicated competitor in the league, characterized by passionate fan support and persistent efforts to acquire franchise cornerstone players. They continue to compete and build historical rivalries across the conference divisions.`
  };
}
