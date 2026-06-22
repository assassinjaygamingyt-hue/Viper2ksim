var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_ws = require("ws");
var import_genai = require("@google/genai");

// src/data/championships.ts
var championshipsData = [
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

// src/data/teamHistories.ts
var detailedTeamHistories = {
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

// src/data/initPlayers.ts
var initPlayersPool = {
  "indiana-pacers": [
    { name: "Jermaine O'Neal", position: "PF", age: 25, rating: 91, contract: "$14.7M / 4 Yrs" },
    { name: "Ron Artest", position: "SF", age: 24, rating: 89, contract: "$6.2M / 3 Yrs" },
    { name: "Reggie Miller", position: "SG", age: 38, rating: 83, contract: "$5.5M / 1 Yr" },
    { name: "Jamaal Tinsley", position: "PG", age: 25, rating: 81, contract: "$4.1M / 2 Yrs" },
    { name: "Al Harrington", position: "PF", age: 23, rating: 82, contract: "$5.8M / 2 Yrs" },
    { name: "Jeff Foster", position: "C", age: 26, rating: 78, contract: "$3.0M / 3 Yrs" },
    { name: "Fred Jones", position: "SG", age: 24, rating: 76, contract: "$1.5M / 2 Yrs" },
    { name: "Austin Croshere", position: "PF", age: 28, rating: 75, contract: "$7.5M / 3 Yrs" },
    { name: "Anthony Johnson", position: "PG", age: 29, rating: 74, contract: "$1.2M / 1 Yr" },
    { name: "Scot Pollard", position: "C", age: 28, rating: 73, contract: "$5.1M / 2 Yrs" },
    { name: "James Jones", position: "SF", age: 23, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Jonathan Bender", position: "SF", age: 23, rating: 74, contract: "$6.0M / 2 Yrs" },
    { name: "Primoz Brezec", position: "C", age: 24, rating: 70, contract: "$1.1M / 1 Yr" },
    { name: "Kenny Anderson", position: "PG", age: 33, rating: 72, contract: "$1.5M / 1 Yr" },
    { name: "Jamison Brewer", position: "PG", age: 23, rating: 68, contract: "$0.8M / 1 Yr" }
  ],
  "detroit-pistons": [
    { name: "Chauncey Billups", position: "PG", age: 27, rating: 88, contract: "$6.0M / 3 Yrs" },
    { name: "Richard Hamilton", position: "SG", age: 25, rating: 86, contract: "$8.5M / 4 Yrs" },
    { name: "Tayshaun Prince", position: "SF", age: 23, rating: 81, contract: "$1.2M / 2 Yrs" },
    { name: "Rasheed Wallace", position: "PF", age: 29, rating: 89, contract: "$17.0M / 1 Yr" },
    { name: "Ben Wallace", position: "C", age: 29, rating: 92, contract: "$5.5M / 3 Yrs" },
    { name: "Mehmet Okur", position: "C", age: 24, rating: 80, contract: "$1.5M / 1 Yr" },
    { name: "Corliss Williamson", position: "SF", age: 30, rating: 77, contract: "$5.0M / 2 Yrs" },
    { name: "Lindsey Hunter", position: "PG", age: 33, rating: 75, contract: "$1.8M / 1 Yr" },
    { name: "Elden Campbell", position: "C", age: 35, rating: 74, contract: "$1.5M / 1 Yr" },
    { name: "Mike James", position: "PG", age: 28, rating: 76, contract: "$1.2M / 1 Yr" },
    { name: "Darvin Ham", position: "SF", age: 30, rating: 71, contract: "$0.9M / 1 Yr" },
    { name: "Chucky Atkins", position: "PG", age: 29, rating: 75, contract: "$3.5M / 1 Yr" },
    { name: "Bob Sura", position: "SG", age: 30, rating: 75, contract: "$2.2M / 1 Yr" },
    { name: "Tremaine Fowlkes", position: "SF", age: 27, rating: 69, contract: "$0.8M / 1 Yr" },
    { name: "Darko Milicic", position: "C", age: 18, rating: 72, contract: "$3.5M / 3 Yrs" }
  ],
  "new-jersey-nets": [
    { name: "Jason Kidd", position: "PG", age: 30, rating: 93, contract: "$13.1M / 4 Yrs" },
    { name: "Richard Jefferson", position: "SF", age: 23, rating: 85, contract: "$2.5M / 2 Yrs" },
    { name: "Kenyon Martin", position: "PF", age: 26, rating: 87, contract: "$5.1M / 1 Yr" },
    { name: "Kerry Kittles", position: "SG", age: 29, rating: 82, contract: "$9.5M / 2 Yrs" },
    { name: "Lucious Harris", position: "SG", age: 33, rating: 77, contract: "$2.2M / 1 Yr" },
    { name: "Jason Collins", position: "C", age: 25, rating: 77, contract: "$1.8M / 2 Yrs" },
    { name: "Aaron Williams", position: "PF", age: 32, rating: 76, contract: "$3.2M / 2 Yrs" },
    { name: "Rodney Rogers", position: "PF", age: 32, rating: 75, contract: "$3.0M / 1 Yr" },
    { name: "Alonzo Mourning", position: "C", age: 33, rating: 81, contract: "$5.4M / 2 Yrs" },
    { name: "Tamar Slay", position: "SF", age: 23, rating: 69, contract: "$0.8M / 1 Yr" },
    { name: "Zoran Planinic", position: "PG", age: 21, rating: 73, contract: "$1.1M / 3 Yrs" },
    { name: "Brandon Armstrong", position: "SG", age: 23, rating: 71, contract: "$0.9M / 1 Yr" },
    { name: "Robert Pack", position: "PG", age: 34, rating: 70, contract: "$1.0M / 1 Yr" },
    { name: "Hubert Davis", position: "SG", age: 33, rating: 73, contract: "$1.2M / 1 Yr" },
    { name: "Mikki Moore", position: "C", age: 28, rating: 72, contract: "$0.9M / 1 Yr" }
  ],
  "miami-heat": [
    { name: "Dwyane Wade", position: "SG", age: 22, rating: 86, contract: "$2.6M / 3 Yrs" },
    { name: "Eddie Jones", position: "SG", age: 32, rating: 84, contract: "$13.4M / 3 Yrs" },
    { name: "Caron Butler", position: "SF", age: 23, rating: 81, contract: "$1.8M / 2 Yrs" },
    { name: "Lamar Odom", position: "PF", age: 24, rating: 85, contract: "$11.0M / 4 Yrs" },
    { name: "Brian Grant", position: "C", age: 31, rating: 80, contract: "$12.0M / 3 Yrs" },
    { name: "Udonis Haslem", position: "PF", age: 23, rating: 78, contract: "$0.6M / 1 Yr" },
    { name: "Rafer Alston", position: "PG", age: 27, rating: 78, contract: "$1.2M / 2 Yrs" },
    { name: "Malik Allen", position: "PF", age: 25, rating: 74, contract: "$1.0M / 1 Yr" },
    { name: "Rasual Butler", position: "SF", age: 24, rating: 75, contract: "$0.8M / 1 Yr" },
    { name: "John Wallace", position: "SF", age: 29, rating: 74, contract: "$1.1M / 1 Yr" },
    { name: "Wang Zhizhi", position: "C", age: 26, rating: 71, contract: "$1.0M / 1 Yr" },
    { name: "Loren Woods", position: "C", age: 25, rating: 72, contract: "$0.8M / 1 Yr" },
    { name: "Bimbo Coles", position: "PG", age: 35, rating: 70, contract: "$0.9M / 1 Yr" },
    { name: "Samaki Walker", position: "PF", age: 27, rating: 73, contract: "$1.5M / 1 Yr" },
    { name: "Tyrone Hill", position: "PF", age: 35, rating: 72, contract: "$1.0M / 1 Yr" }
  ],
  "philadelphia-76ers": [
    { name: "Allen Iverson", position: "SG", age: 28, rating: 95, contract: "$13.5M / 4 Yrs" },
    { name: "Glenn Robinson", position: "SF", age: 31, rating: 83, contract: "$11.4M / 2 Yrs" },
    { name: "Eric Snow", position: "PG", age: 30, rating: 80, contract: "$4.5M / 3 Yrs" },
    { name: "Kenny Thomas", position: "PF", age: 26, rating: 81, contract: "$5.5M / 4 Yrs" },
    { name: "Samuel Dalembert", position: "C", age: 22, rating: 79, contract: "$1.8M / 2 Yrs" },
    { name: "Aaron McKie", position: "SG", age: 31, rating: 79, contract: "$5.0M / 3 Yrs" },
    { name: "Marc Jackson", position: "C", age: 29, rating: 76, contract: "$3.5M / 2 Yrs" },
    { name: "Kyle Korver", position: "SF", age: 22, rating: 74, contract: "$0.6M / 2 Yrs" },
    { name: "Derrick Coleman", position: "PF", age: 36, rating: 75, contract: "$4.5M / 1 Yr" },
    { name: "John Salmons", position: "SG", age: 24, rating: 74, contract: "$1.1M / 2 Yrs" },
    { name: "Greg Buckner", position: "SG", age: 27, rating: 73, contract: "$1.2M / 1 Yr" },
    { name: "Zendon Hamilton", position: "C", age: 28, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Amal McCaskill", position: "PF", age: 30, rating: 68, contract: "$0.8M / 1 Yr" },
    { name: "Todd MacCulloch", position: "C", age: 28, rating: 70, contract: "$5.5M / 2 Yrs" },
    { name: "Monty Williams", position: "SF", age: 32, rating: 72, contract: "$1.0M / 1 Yr" }
  ],
  "boston-celtics": [
    { name: "Paul Pierce", position: "SF", age: 26, rating: 92, contract: "$12.5M / 4 Yrs" },
    { name: "Ricky Davis", position: "SG", age: 24, rating: 83, contract: "$5.2M / 3 Yrs" },
    { name: "Mark Blount", position: "C", age: 28, rating: 79, contract: "$1.5M / 1 Yr" },
    { name: "Mike James", position: "PG", age: 28, rating: 78, contract: "$1.2M / 1 Yr" },
    { name: "Walter McCarty", position: "PF", age: 30, rating: 75, contract: "$2.0M / 2 Yrs" },
    { name: "Chucky Atkins", position: "PG", age: 29, rating: 76, contract: "$3.5M / 1 Yr" },
    { name: "Jiri Welsch", position: "SG", age: 24, rating: 75, contract: "$1.2M / 2 Yrs" },
    { name: "Marcus Banks", position: "PG", age: 22, rating: 74, contract: "$1.5M / 3 Yrs" },
    { name: "Kendrick Perkins", position: "C", age: 19, rating: 71, contract: "$0.9M / 3 Yrs" },
    { name: "Brandon Hunter", position: "PF", age: 23, rating: 70, contract: "$0.6M / 1 Yr" },
    { name: "Chris Mihm", position: "C", age: 24, rating: 75, contract: "$2.5M / 2 Yrs" },
    { name: "Jumaine Jones", position: "SF", age: 24, rating: 74, contract: "$1.3M / 1 Yr" },
    { name: "Michael Stewart", position: "C", age: 28, rating: 69, contract: "$4.0M / 2 Yrs" },
    { name: "Raef LaFrentz", position: "PF", age: 27, rating: 80, contract: "$9.0M / 4 Yrs" },
    { name: "Vin Baker", position: "PF", age: 32, rating: 73, contract: "$8.5M / 1 Yr" }
  ],
  "new-york-knicks": [
    { name: "Stephon Marbury", position: "PG", age: 26, rating: 91, contract: "$13.5M / 4 Yrs" },
    { name: "Allan Houston", position: "SG", age: 32, rating: 85, contract: "$15.9M / 3 Yrs" },
    { name: "Keith Van Horn", position: "PF", age: 28, rating: 82, contract: "$12.0M / 2 Yrs" },
    { name: "Kurt Thomas", position: "PF", age: 31, rating: 81, contract: "$4.5M / 3 Yrs" },
    { name: "Dikembe Mutombo", position: "C", age: 37, rating: 79, contract: "$4.5M / 1 Yr" },
    { name: "Penny Hardaway", position: "SG", age: 32, rating: 80, contract: "$13.5M / 3 Yrs" },
    { name: "Shandon Anderson", position: "SF", age: 30, rating: 76, contract: "$6.0M / 3 Yrs" },
    { name: "Tim Thomas", position: "SF", age: 26, rating: 81, contract: "$9.0M / 2 Yrs" },
    { name: "Nazr Mohammed", position: "C", age: 26, rating: 76, contract: "$4.5M / 2 Yrs" },
    { name: "Frank Williams", position: "PG", age: 23, rating: 74, contract: "$1.1M / 2 Yrs" },
    { name: "Michael Sweetney", position: "PF", age: 21, rating: 75, contract: "$2.1M / 3 Yrs" },
    { name: "Moochie Norris", position: "PG", age: 30, rating: 73, contract: "$3.5M / 2 Yrs" },
    { name: "Cezary Trybanski", position: "C", age: 24, rating: 68, contract: "$1.5M / 1 Yr" },
    { name: "Othella Harrington", position: "PF", age: 29, rating: 74, contract: "$2.8M / 2 Yrs" },
    { name: "DerMarr Johnson", position: "SF", age: 23, rating: 73, contract: "$0.8M / 1 Yr" }
  ],
  "washington-wizards": [
    { name: "Gilbert Arenas", position: "PG", age: 22, rating: 88, contract: "$8.5M / 5 Yrs" },
    { name: "Larry Hughes", position: "SG", age: 25, rating: 84, contract: "$5.5M / 2 Yrs" },
    { name: "Antawn Jamison", position: "PF", age: 27, rating: 85, contract: "$11.0M / 4 Yrs" },
    { name: "Kwame Brown", position: "PF", age: 21, rating: 80, contract: "$3.5M / 2 Yrs" },
    { name: "Jarvis Hayes", position: "SF", age: 22, rating: 77, contract: "$1.6M / 3 Yrs" },
    { name: "Etan Thomas", position: "C", age: 25, rating: 76, contract: "$1.6M / 2 Yrs" },
    { name: "Christian Laettner", position: "PF", age: 34, rating: 74, contract: "$5.0M / 1 Yr" },
    { name: "Steve Blake", position: "PG", age: 23, rating: 74, contract: "$0.6M / 2 Yrs" },
    { name: "Juan Dixon", position: "SG", age: 25, rating: 77, contract: "$1.2M / 2 Yrs" },
    { name: "Jared Jeffries", position: "SF", age: 22, rating: 75, contract: "$1.8M / 3 Yrs" },
    { name: "Brendan Haywood", position: "C", age: 24, rating: 78, contract: "$2.0M / 2 Yrs" },
    { name: "Jerry Stackhouse", position: "SG", age: 29, rating: 83, contract: "$7.0M / 2 Yrs" },
    { name: "Brevin Knight", position: "PG", age: 28, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Mitchell Butler", position: "SG", age: 31, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Laron Profit", position: "SG", age: 26, rating: 71, contract: "$0.8M / 1 Yr" }
  ],
  "orlando-magic": [
    { name: "Tracy McGrady", position: "SG", age: 24, rating: 96, contract: "$13.2M / 4 Yrs" },
    { name: "Juwan Howard", position: "PF", age: 30, rating: 81, contract: "$5.5M / 3 Yrs" },
    { name: "Drew Gooden", position: "PF", age: 22, rating: 80, contract: "$2.8M / 2 Yrs" },
    { name: "Tyronn Lue", position: "PG", age: 26, rating: 76, contract: "$1.5M / 2 Yrs" },
    { name: "DeShawn Stevenson", position: "SG", age: 22, rating: 77, contract: "$1.0M / 1 Yr" },
    { name: "Andrew DeClercq", position: "C", age: 30, rating: 73, contract: "$2.5M / 2 Yrs" },
    { name: "Keith Bogans", position: "SF", age: 23, rating: 74, contract: "$0.6M / 2 Yrs" },
    { name: "Gordan Giricek", position: "SG", age: 26, rating: 78, contract: "$2.5M / 2 Yrs" },
    { name: "Reece Gaines", position: "PG", age: 23, rating: 72, contract: "$1.1M / 3 Yrs" },
    { name: "Zaza Pachulia", position: "C", age: 19, rating: 73, contract: "$0.6M / 2 Yrs" },
    { name: "Rod Strickland", position: "PG", age: 37, rating: 74, contract: "$1.0M / 1 Yr" },
    { name: "Shammond Williams", position: "PG", age: 28, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Britton Johnsen", position: "SF", age: 24, rating: 68, contract: "$0.6M / 1 Yr" },
    { name: "Donnell Harvey", position: "PF", age: 23, rating: 72, contract: "$0.8M / 1 Yr" },
    { name: "Pat Garrity", position: "PF", age: 27, rating: 75, contract: "$3.5M / 2 Yrs" }
  ],
  "new-orleans-hornets": [
    { name: "Baron Davis", position: "PG", age: 24, rating: 92, contract: "$11.0M / 4 Yrs" },
    { name: "David Wesley", position: "SG", age: 33, rating: 80, contract: "$4.8M / 2 Yrs" },
    { name: "Jamal Mashburn", position: "SF", age: 31, rating: 85, contract: "$9.3M / 3 Yrs" },
    { name: "P.J. Brown", position: "PF", age: 34, rating: 82, contract: "$7.5M / 3 Yrs" },
    { name: "Jamaal Magloire", position: "C", age: 25, rating: 83, contract: "$4.5M / 3 Yrs" },
    { name: "Darrell Armstrong", position: "PG", age: 35, rating: 77, contract: "$1.5M / 1 Yr" },
    { name: "Courtney Alexander", position: "SG", age: 26, rating: 75, contract: "$2.2M / 1 Yr" },
    { name: "George Lynch", position: "SF", age: 33, rating: 75, contract: "$2.8M / 2 Yrs" },
    { name: "Robert Traylor", position: "PF", age: 26, rating: 74, contract: "$1.5M / 1 Yr" },
    { name: "David West", position: "PF", age: 23, rating: 77, contract: "$1.0M / 3 Yrs" },
    { name: "Steve Smith", position: "SG", age: 34, rating: 75, contract: "$1.1M / 1 Yr" },
    { name: "Stacey Augmon", position: "SG", age: 35, rating: 72, contract: "$1.0M / 1 Yr" },
    { name: "Sean Rooks", position: "C", age: 34, rating: 71, contract: "$0.9M / 1 Yr" },
    { name: "Maurice Carter", position: "PG", age: 24, rating: 68, contract: "$0.6M / 1 Yr" },
    { name: "Kirk Haston", position: "PF", age: 24, rating: 69, contract: "$1.5M / 1 Yr" }
  ],
  "milwaukee-bucks": [
    { name: "Michael Redd", position: "SG", age: 24, rating: 88, contract: "$3.5M / 2 Yrs" },
    { name: "Joe Smith", position: "PF", age: 28, rating: 79, contract: "$5.1M / 4 Yrs" },
    { name: "Keith Van Horn", position: "PF", age: 28, rating: 82, contract: "$12.0M / 2 Yrs" },
    { name: "Toni Kukoc", position: "SF", age: 35, rating: 80, contract: "$3.0M / 1 Yr" },
    { name: "T.J. Ford", position: "PG", age: 20, rating: 80, contract: "$2.1M / 3 Yrs" },
    { name: "Desmond Mason", position: "SF", age: 26, rating: 81, contract: "$2.5M / 2 Yrs" },
    { name: "Damon Jones", position: "PG", age: 27, rating: 77, contract: "$0.8M / 1 Yr" },
    { name: "Brian Skinner", position: "C", age: 27, rating: 76, contract: "$1.5M / 1 Yr" },
    { name: "Daniel Santiago", position: "C", age: 27, rating: 72, contract: "$1.0M / 1 Yr" },
    { name: "Brevin Knight", position: "PG", age: 28, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Erick Strickland", position: "SG", age: 30, rating: 73, contract: "$1.2M / 1 Yr" },
    { name: "Marcus Fizer", position: "PF", age: 25, rating: 76, contract: "$3.8M / 1 Yr" },
    { name: "Mike Wilks", position: "PG", age: 24, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Zendon Hamilton", position: "C", age: 28, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Joel Przybilla", position: "C", age: 24, rating: 74, contract: "$2.0M / 1 Yr" }
  ],
  "cleveland-cavaliers": [
    { name: "LeBron James", position: "SG", age: 19, rating: 91, contract: "$4.0M / 3 Yrs" },
    { name: "Zydrunas Ilgauskas", position: "C", age: 28, rating: 86, contract: "$13.5M / 2 Yrs" },
    { name: "Carlos Boozer", position: "PF", age: 22, rating: 85, contract: "$0.6M / 1 Yr" },
    { name: "Dajuan Wagner", position: "PG", age: 20, rating: 78, contract: "$2.3M / 2 Yrs" },
    { name: "Jeff McInnis", position: "PG", age: 29, rating: 78, contract: "$3.0M / 1 Yr" },
    { name: "Ira Newble", position: "SF", age: 28, rating: 74, contract: "$2.5M / 2 Yrs" },
    { name: "Kedrick Brown", position: "SG", age: 22, rating: 73, contract: "$1.8M / 1 Yr" },
    { name: "Eric Williams", position: "SF", age: 31, rating: 76, contract: "$3.5M / 1 Yr" },
    { name: "Tony Battie", position: "C", age: 27, rating: 77, contract: "$4.1M / 2 Yrs" },
    { name: "DeSagana Diop", position: "C", age: 21, rating: 72, contract: "$2.2M / 2 Yrs" },
    { name: "Kevin Ollie", position: "PG", age: 31, rating: 74, contract: "$2.5M / 2 Yrs" },
    { name: "Jason Kapono", position: "SF", age: 22, rating: 72, contract: "$0.6M / 2 Yrs" },
    { name: "Lee Nailon", position: "PF", age: 28, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Mateen Cleaves", position: "PG", age: 26, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Bruno Sundov", position: "C", age: 23, rating: 68, contract: "$0.8M / 1 Yr" }
  ],
  "toronto-raptors": [
    { name: "Vince Carter", position: "SG", age: 27, rating: 91, contract: "$11.5M / 4 Yrs" },
    { name: "Jalen Rose", position: "SF", age: 31, rating: 83, contract: "$13.2M / 3 Yrs" },
    { name: "Donyell Marshall", position: "PF", age: 30, rating: 81, contract: "$4.5M / 2 Yrs" },
    { name: "Morris Peterson", position: "SG", age: 26, rating: 79, contract: "$1.8M / 1 Yr" },
    { name: "Chris Bosh", position: "PF", age: 19, rating: 83, contract: "$2.9M / 3 Yrs" },
    { name: "Alvin Williams", position: "PG", age: 29, rating: 78, contract: "$5.5M / 3 Yrs" },
    { name: "Lamond Murray", position: "SF", age: 30, rating: 76, contract: "$4.0M / 2 Yrs" },
    { name: "Corie Blount", position: "PF", age: 35, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Roger Mason Jr.", position: "SG", age: 23, rating: 73, contract: "$0.8M / 1 Yr" },
    { name: "Michael Bradley", position: "PF", age: 24, rating: 72, contract: "$1.8M / 1 Yr" },
    { name: "Mengke Bateer", position: "C", age: 28, rating: 69, contract: "$0.8M / 1 Yr" },
    { name: "Milt Palacio", position: "PG", age: 25, rating: 72, contract: "$1.0M / 1 Yr" },
    { name: "Lonny Baxter", position: "PF", age: 24, rating: 73, contract: "$0.8M / 1 Yr" },
    { name: "Dion Glover", position: "SG", age: 25, rating: 75, contract: "$1.5M / 1 Yr" },
    { name: "Robert Archibald", position: "C", age: 23, rating: 70, contract: "$0.8M / 1 Yr" }
  ],
  "atlanta-hawks": [
    { name: "Shareef Abdur-Rahim", position: "PF", age: 27, rating: 85, contract: "$13.5M / 2 Yrs" },
    { name: "Jason Terry", position: "PG", age: 26, rating: 84, contract: "$7.5M / 3 Yrs" },
    { name: "Stephen Jackson", position: "SF", age: 25, rating: 81, contract: "$1.2M / 1 Yr" },
    { name: "Bob Sura", position: "SG", age: 30, rating: 77, contract: "$2.2M / 1 Yr" },
    { name: "Chris Crawford", position: "PF", age: 28, rating: 75, contract: "$1.8M / 1 Yr" },
    { name: "Joel Przybilla", position: "C", age: 24, rating: 74, contract: "$2.0M / 1 Yr" },
    { name: "Boris Diaw", position: "SF", age: 21, rating: 76, contract: "$1.1M / 3 Yrs" },
    { name: "Alan Henderson", position: "PF", age: 31, rating: 74, contract: "$7.0M / 1 Yr" },
    { name: "Travis Hansen", position: "SG", age: 25, rating: 72, contract: "$0.8M / 1 Yr" },
    { name: "Jason Collier", position: "C", age: 26, rating: 73, contract: "$0.8M / 1 Yr" },
    { name: "Mamadou N'Diaye", position: "C", age: 28, rating: 70, contract: "$0.9M / 1 Yr" },
    { name: "Dan Dickau", position: "PG", age: 25, rating: 73, contract: "$1.1M / 1 Yr" },
    { name: "Lee Nailon", position: "PF", age: 28, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Jacque Vaughn", position: "PG", age: 28, rating: 74, contract: "$1.2M / 1 Yr" },
    { name: "Obinna Ekezie", position: "C", age: 28, rating: 71, contract: "$0.8M / 1 Yr" }
  ],
  "chicago-bulls": [
    { name: "Jamal Crawford", position: "SG", age: 23, rating: 82, contract: "$2.5M / 1 Yr" },
    { name: "Kirk Hinrich", position: "PG", age: 23, rating: 81, contract: "$2.2M / 3 Yrs" },
    { name: "Eddy Curry", position: "C", age: 21, rating: 81, contract: "$2.8M / 2 Yrs" },
    { name: "Tyson Chandler", position: "PF", age: 21, rating: 80, contract: "$3.5M / 2 Yrs" },
    { name: "Antonio Davis", position: "PF", age: 35, rating: 78, contract: "$12.0M / 2 Yrs" },
    { name: "Kendall Gill", position: "SG", age: 35, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Corie Blount", position: "PF", age: 35, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Marcus Fizer", position: "PF", age: 25, rating: 76, contract: "$3.8M / 1 Yr" },
    { name: "Scottie Pippen", position: "SF", age: 38, rating: 77, contract: "$5.0M / 1 Yr" },
    { name: "Linton Johnson", position: "SF", age: 23, rating: 70, contract: "$0.6M / 1 Yr" },
    { name: "Jannero Pargo", position: "PG", age: 24, rating: 73, contract: "$0.8M / 1 Yr" },
    { name: "Ronald Dupree", position: "SF", age: 23, rating: 71, contract: "$0.6M / 1 Yr" },
    { name: "Rick Brunson", position: "PG", age: 31, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Eddie Robinson", position: "SF", age: 27, rating: 74, contract: "$5.5M / 2 Yrs" },
    { name: "Jerome Williams", position: "PF", age: 30, rating: 75, contract: "$5.2M / 2 Yrs" }
  ],
  "minnesota-timberwolves": [
    { name: "Kevin Garnett", position: "PF", age: 27, rating: 98, contract: "$28.0M / 1 Yr" },
    { name: "Sam Cassell", position: "PG", age: 34, rating: 88, contract: "$5.1M / 2 Yrs" },
    { name: "Latrell Sprewell", position: "SF", age: 33, rating: 85, contract: "$13.5M / 2 Yrs" },
    { name: "Trenton Hassell", position: "SG", age: 24, rating: 77, contract: "$0.8M / 1 Yr" },
    { name: "Ervin Johnson", position: "C", age: 36, rating: 74, contract: "$1.2M / 1 Yr" },
    { name: "Fred Hoiberg", position: "SG", age: 31, rating: 76, contract: "$1.0M / 1 Yr" },
    { name: "Wally Szczerbiak", position: "SF", age: 26, rating: 81, contract: "$9.0M / 3 Yrs" },
    { name: "Michael Olowokandi", position: "C", age: 28, rating: 78, contract: "$5.1M / 2 Yrs" },
    { name: "Mark Madsen", position: "PF", age: 28, rating: 74, contract: "$1.2M / 2 Yrs" },
    { name: "Ndudi Ebi", position: "PF", age: 19, rating: 72, contract: "$1.1M / 3 Yrs" },
    { name: "Oliver Miller", position: "C", age: 33, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Gary Trent", position: "PF", age: 29, rating: 75, contract: "$1.5M / 1 Yr" },
    { name: "Troy Hudson", position: "PG", age: 27, rating: 78, contract: "$2.5M / 2 Yrs" },
    { name: "Keith McLeod", position: "PG", age: 24, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Quincy Lewis", position: "SF", age: 26, rating: 71, contract: "$0.8M / 1 Yr" }
  ],
  "san-antonio-spurs": [
    { name: "Tim Duncan", position: "PF", age: 27, rating: 97, contract: "$12.0M / 4 Yrs" },
    { name: "Tony Parker", position: "PG", age: 21, rating: 85, contract: "$1.5M / 2 Yrs" },
    { name: "Manu Ginobili", position: "SG", age: 26, rating: 85, contract: "$2.8M / 1 Yr" },
    { name: "Bruce Bowen", position: "SF", age: 32, rating: 82, contract: "$3.5M / 2 Yrs" },
    { name: "Rasho Nesterovic", position: "C", age: 27, rating: 79, contract: "$5.5M / 3 Yrs" },
    { name: "Hedo Turkoglu", position: "SF", age: 24, rating: 79, contract: "$4.5M / 2 Yrs" },
    { name: "Robert Horry", position: "PF", age: 33, rating: 77, contract: "$4.0M / 1 Yr" },
    { name: "Malik Rose", position: "PF", age: 29, rating: 77, contract: "$5.5M / 3 Yrs" },
    { name: "Devin Brown", position: "SG", age: 25, rating: 75, contract: "$0.8M / 1 Yr" },
    { name: "Kevin Willis", position: "C", age: 41, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Anthony Carter", position: "PG", age: 28, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Ron Mercer", position: "SG", age: 27, rating: 75, contract: "$2.5M / 1 Yr" },
    { name: "Jason Hart", position: "PG", age: 25, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Charlie Ward", position: "PG", age: 33, rating: 74, contract: "$1.2M / 1 Yr" },
    { name: "Alex Garcia", position: "SG", age: 23, rating: 69, contract: "$0.6M / 1 Yr" }
  ],
  "los-angeles-lakers": [
    { name: "Shaquille O'Neal", position: "C", age: 31, rating: 96, contract: "$24.7M / 1 Yr" },
    { name: "Kobe Bryant", position: "SG", age: 25, rating: 97, contract: "$13.5M / 1 Yr" },
    { name: "Karl Malone", position: "PF", age: 40, rating: 85, contract: "$1.5M / 1 Yr" },
    { name: "Gary Payton", position: "PG", age: 35, rating: 87, contract: "$4.9M / 1 Yr" },
    { name: "Derek Fisher", position: "PG", age: 29, rating: 79, contract: "$3.0M / 1 Yr" },
    { name: "Devean George", position: "SF", age: 26, rating: 77, contract: "$4.5M / 2 Yrs" },
    { name: "Rick Fox", position: "SF", age: 34, rating: 75, contract: "$4.8M / 1 Yr" },
    { name: "Luke Walton", position: "SF", age: 23, rating: 72, contract: "$0.6M / 2 Yrs" },
    { name: "Stanislav Medvedenko", position: "PF", age: 24, rating: 75, contract: "$1.5M / 1 Yr" },
    { name: "Horace Grant", position: "PF", age: 38, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Kareem Rush", position: "SG", age: 23, rating: 74, contract: "$1.1M / 2 Yrs" },
    { name: "Brian Cook", position: "PF", age: 23, rating: 74, contract: "$0.9M / 3 Yrs" },
    { name: "Jannero Pargo", position: "PG", age: 24, rating: 73, contract: "$0.8M / 1 Yr" },
    { name: "Jamal Sampson", position: "C", age: 20, rating: 70, contract: "$0.6M / 1 Yr" },
    { name: "Bryon Russell", position: "SF", age: 33, rating: 73, contract: "$1.0M / 1 Yr" }
  ],
  "sacramento-kings": [
    { name: "Chris Webber", position: "PF", age: 30, rating: 92, contract: "$14.3M / 4 Yrs" },
    { name: "Peja Stojakovic", position: "SF", age: 26, rating: 93, contract: "$6.5M / 3 Yrs" },
    { name: "Mike Bibby", position: "PG", age: 25, rating: 87, contract: "$9.5M / 4 Yrs" },
    { name: "Vlade Divac", position: "C", age: 35, rating: 81, contract: "$5.6M / 1 Yr" },
    { name: "Doug Christie", position: "SG", age: 33, rating: 83, contract: "$7.0M / 2 Yrs" },
    { name: "Brad Miller", position: "C", age: 27, rating: 85, contract: "$6.5M / 4 Yrs" },
    { name: "Bobby Jackson", position: "PG", age: 30, rating: 82, contract: "$3.5M / 2 Yrs" },
    { name: "Anthony Peeler", position: "SG", age: 34, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Gerald Wallace", position: "SF", age: 21, rating: 77, contract: "$1.4M / 1 Yr" },
    { name: "Jabari Smith", position: "C", age: 26, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Rodney Buford", position: "SG", age: 26, rating: 73, contract: "$0.9M / 1 Yr" },
    { name: "Darius Songaila", position: "PF", age: 25, rating: 74, contract: "$1.0M / 2 Yrs" },
    { name: "Tony Massenburg", position: "PF", age: 36, rating: 71, contract: "$1.0M / 1 Yr" },
    { name: "Jim Jackson", position: "SF", age: 33, rating: 78, contract: "$2.5M / 1 Yr" },
    { name: "Lawrence Funderburke", position: "PF", age: 33, rating: 72, contract: "$1.5M / 1 Yr" }
  ],
  "dallas-mavericks": [
    { name: "Dirk Nowitzki", position: "PF", age: 25, rating: 94, contract: "$12.5M / 4 Yrs" },
    { name: "Steve Nash", position: "PG", age: 29, rating: 89, contract: "$5.8M / 1 Yr" },
    { name: "Michael Finley", position: "SG", age: 30, rating: 86, contract: "$13.5M / 3 Yrs" },
    { name: "Antoine Walker", position: "PF", age: 27, rating: 84, contract: "$13.5M / 2 Yrs" },
    { name: "Antawn Jamison", position: "PF", age: 27, rating: 85, contract: "$11.0M / 4 Yrs" },
    { name: "Marquis Daniels", position: "SG", age: 23, rating: 78, contract: "$0.6M / 1 Yr" },
    { name: "Josh Howard", position: "SF", age: 23, rating: 79, contract: "$1.1M / 3 Yrs" },
    { name: "Danny Fortson", position: "PF", age: 27, rating: 76, contract: "$5.5M / 2 Yrs" },
    { name: "Shawn Bradley", position: "C", age: 31, rating: 75, contract: "$4.5M / 2 Yrs" },
    { name: "Tony Delk", position: "PG", age: 30, rating: 76, contract: "$3.0M / 2 Yrs" },
    { name: "Travis Best", position: "PG", age: 31, rating: 75, contract: "$1.5M / 1 Yr" },
    { name: "Eduardo Najera", position: "PF", age: 27, rating: 75, contract: "$2.5M / 2 Yrs" },
    { name: "Mamadou N'Diaye", position: "C", age: 28, rating: 70, contract: "$0.9M / 1 Yr" },
    { name: "Tariq Abdul-Wahad", position: "SF", age: 29, rating: 72, contract: "$6.0M / 2 Yrs" },
    { name: "Jon Koncak", position: "C", age: 40, rating: 65, contract: "$0.8M / 1 Yr" }
  ],
  "memphis-grizzlies": [
    { name: "Pau Gasol", position: "PF", age: 23, rating: 88, contract: "$4.3M / 2 Yrs" },
    { name: "Jason Williams", position: "PG", age: 28, rating: 83, contract: "$6.5M / 3 Yrs" },
    { name: "Mike Miller", position: "SG", age: 23, rating: 82, contract: "$5.5M / 3 Yrs" },
    { name: "James Posey", position: "SF", age: 26, rating: 81, contract: "$4.5M / 3 Yrs" },
    { name: "Bonzi Wells", position: "SG", age: 27, rating: 82, contract: "$6.5M / 2 Yrs" },
    { name: "Shane Battier", position: "SF", age: 25, rating: 80, contract: "$2.5M / 2 Yrs" },
    { name: "Stromile Swift", position: "PF", age: 24, rating: 78, contract: "$3.5M / 1 Yr" },
    { name: "Lorenzen Wright", position: "C", age: 28, rating: 77, contract: "$5.5M / 2 Yrs" },
    { name: "Earl Watson", position: "PG", age: 24, rating: 76, contract: "$1.2M / 1 Yr" },
    { name: "Bo Outlaw", position: "PF", age: 32, rating: 74, contract: "$4.5M / 1 Yr" },
    { name: "Ryan Humphrey", position: "PF", age: 24, rating: 71, contract: "$1.2M / 1 Yr" },
    { name: "Theron Smith", position: "SF", age: 23, rating: 70, contract: "$0.6M / 1 Yr" },
    { name: "Dahntay Jones", position: "SG", age: 23, rating: 72, contract: "$1.1M / 3 Yrs" },
    { name: "Robert Archibald", position: "C", age: 23, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Jake Tsakalidis", position: "C", age: 24, rating: 73, contract: "$2.5M / 1 Yr" }
  ],
  "houston-rockets": [
    { name: "Yao Ming", position: "C", age: 23, rating: 91, contract: "$4.4M / 2 Yrs" },
    { name: "Steve Francis", position: "PG", age: 26, rating: 89, contract: "$11.0M / 4 Yrs" },
    { name: "Cuttino Mobley", position: "SG", age: 28, rating: 82, contract: "$5.5M / 2 Yrs" },
    { name: "Jim Jackson", position: "SF", age: 33, rating: 78, contract: "$2.5M / 1 Yr" },
    { name: "Kelvin Cato", position: "C", age: 29, rating: 76, contract: "$6.5M / 2 Yrs" },
    { name: "Maurice Taylor", position: "PF", age: 27, rating: 77, contract: "$7.5M / 3 Yrs" },
    { name: "Eric Piatkowski", position: "SG", age: 33, rating: 74, contract: "$2.5M / 2 Yrs" },
    { name: "Mark Jackson", position: "C", age: 38, rating: 72, contract: "$1.0M / 1 Yr" },
    { name: "Bostjan Nachbar", position: "SF", age: 23, rating: 73, contract: "$1.3M / 2 Yrs" },
    { name: "Mike Wilks", position: "PG", age: 24, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Scott Padgett", position: "PF", age: 27, rating: 72, contract: "$1.2M / 1 Yr" },
    { name: "Adrian Griffin", position: "SF", age: 29, rating: 74, contract: "$1.1M / 1 Yr" },
    { name: "Charles Oakley", position: "PF", age: 40, rating: 72, contract: "$1.0M / 1 Yr" },
    { name: "Alton Ford", position: "PF", age: 22, rating: 69, contract: "$0.8M / 1 Yr" },
    { name: "Torraye Braggs", position: "PF", age: 27, rating: 70, contract: "$0.8M / 1 Yr" }
  ],
  "denver-nuggets": [
    { name: "Carmelo Anthony", position: "SF", age: 19, rating: 88, contract: "$3.2M / 3 Yrs" },
    { name: "Andre Miller", position: "PG", age: 27, rating: 84, contract: "$5.1M / 4 Yrs" },
    { name: "Marcus Camby", position: "C", age: 29, rating: 83, contract: "$5.5M / 1 Yr" },
    { name: "Voshon Lenard", position: "SG", age: 30, rating: 79, contract: "$1.5M / 1 Yr" },
    { name: "Nene Hilario", position: "PF", age: 21, rating: 81, contract: "$2.2M / 2 Yrs" },
    { name: "Earl Boykins", position: "PG", age: 27, rating: 78, contract: "$2.5M / 3 Yrs" },
    { name: "Jon Barry", position: "SG", age: 34, rating: 75, contract: "$1.5M / 1 Yr" },
    { name: "Chris Andersen", position: "PF", age: 25, rating: 76, contract: "$1.0M / 1 Yr" },
    { name: "Francisco Elson", position: "C", age: 27, rating: 73, contract: "$1.0M / 1 Yr" },
    { name: "Rodney White", position: "SF", age: 23, rating: 75, contract: "$2.1M / 1 Yr" },
    { name: "Ryan Bowen", position: "SF", age: 28, rating: 72, contract: "$1.0M / 1 Yr" },
    { name: "Mark Pope", position: "PF", age: 31, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Jeff Trepagnier", position: "SG", age: 24, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Nikoloz Tskitishvili", position: "PF", age: 20, rating: 70, contract: "$2.8M / 2 Yrs" },
    { name: "Zendon Hamilton", position: "C", age: 28, rating: 71, contract: "$0.8M / 1 Yr" }
  ],
  "utah-jazz": [
    { name: "Andrei Kirilenko", position: "SF", age: 22, rating: 89, contract: "$1.6M / 2 Yrs" },
    { name: "Carlos Arroyo", position: "PG", age: 24, rating: 80, contract: "$1.2M / 1 Yr" },
    { name: "Gordan Giricek", position: "SG", age: 26, rating: 78, contract: "$2.5M / 2 Yrs" },
    { name: "Greg Ostertag", position: "C", age: 30, rating: 75, contract: "$5.0M / 1 Yr" },
    { name: "Jarron Collins", position: "C", age: 25, rating: 74, contract: "$1.5M / 1 Yr" },
    { name: "Maurice Williams", position: "PG", age: 21, rating: 77, contract: "$0.6M / 2 Yrs" },
    { name: "DeShawn Stevenson", position: "SG", age: 22, rating: 77, contract: "$1.0M / 1 Yr" },
    { name: "Raja Bell", position: "SG", age: 27, rating: 78, contract: "$1.5M / 2 Yrs" },
    { name: "Matt Harpring", position: "SF", age: 27, rating: 81, contract: "$4.5M / 3 Yrs" },
    { name: "Michael Ruffin", position: "PF", age: 26, rating: 72, contract: "$0.8M / 1 Yr" },
    { name: "Curtis Borchardt", position: "C", age: 25, rating: 72, contract: "$1.3M / 2 Yrs" },
    { name: "Aleksandar Pavlovic", position: "SG", age: 20, rating: 74, contract: "$1.1M / 3 Yrs" },
    { name: "Keon Clark", position: "C", age: 28, rating: 77, contract: "$5.0M / 1 Yr" },
    { name: "Ben Handlogten", position: "PF", age: 30, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Mikki Moore", position: "C", age: 28, rating: 72, contract: "$0.9M / 1 Yr" }
  ],
  "portland-trail-blazers": [
    { name: "Zach Randolph", position: "PF", age: 22, rating: 87, contract: "$1.8M / 2 Yrs" },
    { name: "Damon Stoudamire", position: "PG", age: 30, rating: 81, contract: "$12.5M / 2 Yrs" },
    { name: "Derek Anderson", position: "SG", age: 29, rating: 80, contract: "$6.5M / 3 Yrs" },
    { name: "Shareef Abdur-Rahim", position: "PF", age: 27, rating: 85, contract: "$13.5M / 2 Yrs" },
    { name: "Theo Ratliff", position: "C", age: 30, rating: 81, contract: "$9.5M / 2 Yrs" },
    { name: "Jeff McInnis", position: "PG", age: 29, rating: 78, contract: "$3.0M / 1 Yr" },
    { name: "Ruben Patterson", position: "SF", age: 28, rating: 77, contract: "$5.5M / 3 Yrs" },
    { name: "Bonzi Wells", position: "SG", age: 27, rating: 82, contract: "$6.5M / 2 Yrs" },
    { name: "Dale Davis", position: "C", age: 34, rating: 76, contract: "$6.0M / 1 Yr" },
    { name: "Qyntel Woods", position: "SF", age: 22, rating: 74, contract: "$1.1M / 2 Yrs" },
    { name: "Vladimir Stepania", position: "C", age: 27, rating: 72, contract: "$1.5M / 1 Yr" },
    { name: "Travis Outlaw", position: "SF", age: 19, rating: 74, contract: "$0.9M / 3 Yrs" },
    { name: "Wesley Person", position: "SG", age: 32, rating: 75, contract: "$1.2M / 1 Yr" },
    { name: "Matt Carroll", position: "SG", age: 23, rating: 70, contract: "$0.8M / 1 Yr" },
    { name: "Rasheed Wallace", position: "PF", age: 29, rating: 89, contract: "$17.0M / 1 Yr" }
  ],
  "seattle-supersonics": [
    { name: "Ray Allen", position: "SG", age: 28, rating: 92, contract: "$13.5M / 2 Yrs" },
    { name: "Rashard Lewis", position: "SF", age: 24, rating: 86, contract: "$8.5M / 4 Yrs" },
    { name: "Ronald Murray", position: "SG", age: 24, rating: 79, contract: "$0.8M / 1 Yr" },
    { name: "Brent Barry", position: "SG", age: 32, rating: 81, contract: "$5.1M / 1 Yr" },
    { name: "Vladimir Radmanovic", position: "PF", age: 23, rating: 79, contract: "$1.8M / 2 Yrs" },
    { name: "Luke Ridnour", position: "PG", age: 22, rating: 77, contract: "$1.8M / 3 Yrs" },
    { name: "Vitaly Potapenko", position: "C", age: 28, rating: 74, contract: "$5.5M / 2 Yrs" },
    { name: "Calvin Booth", position: "C", age: 27, rating: 73, contract: "$5.5M / 3 Yrs" },
    { name: "Antonio Daniels", position: "PG", age: 28, rating: 78, contract: "$2.5M / 2 Yrs" },
    { name: "Jerome James", position: "C", age: 28, rating: 74, contract: "$4.5M / 2 Yrs" },
    { name: "Ansu Sesay", position: "SF", age: 27, rating: 71, contract: "$0.8M / 1 Yr" },
    { name: "Reggie Evans", position: "PF", age: 23, rating: 76, contract: "$1.0M / 2 Yrs" },
    { name: "Nick Collison", position: "PF", age: 23, rating: 75, contract: "$1.8M / 3 Yrs" },
    { name: "Richie Frahm", position: "SG", age: 26, rating: 72, contract: "$0.8M / 1 Yr" },
    { name: "Leon Smith", position: "C", age: 23, rating: 68, contract: "$0.8M / 1 Yr" }
  ],
  "golden-state-warriors": [
    { name: "Jason Richardson", position: "SG", age: 23, rating: 85, contract: "$3.2M / 1 Yr" },
    { name: "Mike Dunleavy", position: "SF", age: 23, rating: 80, contract: "$3.5M / 2 Yrs" },
    { name: "Troy Murphy", position: "PF", age: 23, rating: 81, contract: "$2.0M / 1 Yr" },
    { name: "Clifford Robinson", position: "PF", age: 37, rating: 79, contract: "$5.3M / 2 Yrs" },
    { name: "Adonal Foyle", position: "C", age: 28, rating: 76, contract: "$4.5M / 1 Yr" },
    { name: "Derek Fisher", position: "PG", age: 29, rating: 79, contract: "$3.0M / 1 Yr" },
    { name: "Mickael Pietrus", position: "SF", age: 22, rating: 76, contract: "$1.8M / 3 Yrs" },
    { name: "Speedy Claxton", position: "PG", age: 25, rating: 78, contract: "$3.0M / 2 Yrs" },
    { name: "Calbert Cheaney", position: "SG", age: 32, rating: 74, contract: "$1.5M / 1 Yr" },
    { name: "Dale Davis", position: "C", age: 34, rating: 76, contract: "$6.0M / 1 Yr" },
    { name: "Eduardo Najera", position: "PF", age: 27, rating: 75, contract: "$2.5M / 2 Yrs" },
    { name: "Brian Cardinal", position: "PF", age: 26, rating: 76, contract: "$1.2M / 1 Yr" },
    { name: "Avery Johnson", position: "PG", age: 38, rating: 74, contract: "$1.0M / 1 Yr" },
    { name: "Popeye Jones", position: "PF", age: 33, rating: 71, contract: "$1.0M / 1 Yr" },
    { name: "Baron Davis", position: "PG", age: 24, rating: 92, contract: "$11.0M / 4 Yrs" }
  ],
  "phoenix-suns": [
    { name: "Shawn Marion", position: "SF", age: 25, rating: 89, contract: "$11.0M / 4 Yrs" },
    { name: "Joe Johnson", position: "SG", age: 22, rating: 83, contract: "$2.0M / 2 Yrs" },
    { name: "Amar'e Stoudemire", position: "PF", age: 21, rating: 87, contract: "$2.1M / 2 Yrs" },
    { name: "Leandro Barbosa", position: "PG", age: 21, rating: 78, contract: "$0.9M / 3 Yrs" },
    { name: "Jake Voskuhl", position: "C", age: 26, rating: 74, contract: "$1.5M / 2 Yrs" },
    { name: "Howard Eisley", position: "PG", age: 31, rating: 75, contract: "$5.5M / 1 Yr" },
    { name: "Casey Jacobsen", position: "SG", age: 22, rating: 74, contract: "$1.1M / 2 Yrs" },
    { name: "Maciej Lampe", position: "PF", age: 19, rating: 71, contract: "$0.8M / 2 Yrs" },
    { name: "Jahidi White", position: "C", age: 31, rating: 72, contract: "$5.5M / 1 Yr" },
    { name: "Zarko Cabarkapa", position: "SF", age: 22, rating: 74, contract: "$1.2M / 3 Yrs" },
    { name: "Antonio McDyess", position: "PF", age: 29, rating: 82, contract: "$13.5M / 1 Yr" },
    { name: "Brevin Knight", position: "PG", age: 28, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Scott Williams", position: "C", age: 35, rating: 71, contract: "$1.0M / 1 Yr" },
    { name: "Stephon Marbury", position: "PG", age: 26, rating: 91, contract: "$13.5M / 4 Yrs" },
    { name: "Penny Hardaway", position: "SG", age: 32, rating: 80, contract: "$13.5M / 3 Yrs" }
  ],
  "los-angeles-clippers": [
    { name: "Elton Brand", position: "PF", age: 24, rating: 90, contract: "$11.0M / 5 Yrs" },
    { name: "Corey Maggette", position: "SF", age: 24, rating: 85, contract: "$7.0M / 4 Yrs" },
    { name: "Quentin Richardson", position: "SG", age: 23, rating: 81, contract: "$2.5M / 1 Yr" },
    { name: "Bobby Simmons", position: "SF", age: 23, rating: 77, contract: "$0.8M / 1 Yr" },
    { name: "Chris Wilcox", position: "PF", age: 21, rating: 78, contract: "$2.0M / 2 Yrs" },
    { name: "Marko Jaric", position: "PG", age: 25, rating: 78, contract: "$3.5M / 3 Yrs" },
    { name: "Keyon Dooling", position: "PG", age: 23, rating: 75, contract: "$1.5M / 1 Yr" },
    { name: "Melvin Ely", position: "PF", age: 25, rating: 74, contract: "$1.6M / 2 Yrs" },
    { name: "Matt Barnes", position: "SF", age: 23, rating: 74, contract: "$0.6M / 1 Yr" },
    { name: "Predrag Drobnjak", position: "C", age: 28, rating: 75, contract: "$2.8M / 2 Yrs" },
    { name: "Eddie House", position: "PG", age: 26, rating: 75, contract: "$1.0M / 1 Yr" },
    { name: "Glen Rice", position: "SF", age: 36, rating: 73, contract: "$1.2M / 1 Yr" },
    { name: "Josh Moore", position: "C", age: 23, rating: 68, contract: "$0.8M / 1 Yr" },
    { name: "Wang Zhizhi", position: "C", age: 26, rating: 71, contract: "$1.0M / 1 Yr" },
    { name: "Tremaine Fowlkes", position: "SF", age: 27, rating: 69, contract: "$0.8M / 1 Yr" }
  ]
};

// server.ts
var DB_PATH = import_path.default.resolve(process.cwd(), "./src/db.json");
var HISTORICAL_LOGOS_2003_2004 = {
  IND: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Indiana_Pacers_logo_%281990-2005%29.svg/1200px-Indiana_Pacers_logo_%281990-2005%29.svg.png",
  DET: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Detroit_Pistons_logo_%282001-2005%29.svg/1200px-Detroit_Pistons_logo_%282001-2005%29.svg.png",
  NJN: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/New_Jersey_Nets_logo_%281997-2012%29.svg/1200px-New_Jersey_Nets_logo_%281997-2012%29.svg.png",
  MIA: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Miami_Heat_logo.svg/1200px-Miami_Heat_logo.svg.png",
  PHI: "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Philadelphia_76ers_logo_%281997-2009%29.svg/1200px-Philadelphia_76ers_logo_%281997-2009%29.svg.png",
  BOS: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/1200px-Boston_Celtics.svg.png",
  NYK: "https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Knicks_logo.svg/1200px-New_York_Knicks_logo.svg.png",
  WAS: "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Washington_Wizards_logo_%281997-2011%29.svg/1200px-Washington_Wizards_logo_%281997-2011%29.svg.png",
  ORL: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Orlando_Magic_logo_%282000-2010%29.svg/1200px-Orlando_Magic_logo_%282000-2010%29.svg.png",
  NOH: "https://upload.wikimedia.org/wikipedia/en/thumb/2/21/New_Orleans_Hornets_logo.svg/1200px-New_Orleans_Hornets_logo.svg.png",
  MIL: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Milwaukee_Bucks_logo_%281993-2006%29.svg/1200px-Milwaukee_Bucks_logo_%281993-2006%29.svg.png",
  CLE: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Cleveland_Cavaliers_2003_Logo.svg/1200px-Cleveland_Cavaliers_2003_Logo.svg.png",
  TOR: "https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Toronto_Raptors_logo_%281995-2008%29.svg/1200px-Toronto_Raptors_logo_%281995-2008%29.svg.png",
  ATL: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Atlanta_Hawks_logo_%281995-2007%29.svg/1200px-Atlanta_Hawks_logo_%281995-2007%29.svg.png",
  CHI: "https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Chicago_Bulls_logo.svg/1200px-Chicago_Bulls_logo.svg.png",
  MIN: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Minnesota_Timberwolves_logo_%281996-2017%29.svg/1200px-Minnesota_Timberwolves_logo_%281996-2017%29.svg.png",
  SAS: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/San_Antonio_Spurs_logo.svg/1200px-San_Antonio_Spurs_logo.svg.png",
  LAL: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png",
  SAC: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Sacramento_Kings_logo_%281994-2016%29.svg/1200px-Sacramento_Kings_logo_%281994-2016%29.svg.png",
  DAL: "https://upload.wikimedia.org/wikipedia/en/thumb/9/97/Dallas_Mavericks_logo.svg/1200px-Dallas_Mavericks_logo.svg.png",
  MEM: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Memphis_Grizzlies_logo_%281995-2004%29.svg/1200px-Memphis_Grizzlies_logo_%281995-2004%29.svg.png",
  HOU: "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Houston_Rockets_logo.svg/1200px-Houston_Rockets_logo.svg.png",
  DEN: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Denver_Nuggets_logo_%282003-2018%29.svg/1200px-Denver_Nuggets_logo_%282003-2018%29.svg.png",
  UTA: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Utah_Jazz_logo_%281996-2004%29.svg/1200px-Utah_Jazz_logo_%281996-2004%29.svg.png",
  POR: "https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Portland_Trail_Blazers_logo_%282002-2017%29.svg/1200px-Portland_Trail_Blazers_logo_%282002-2017%29.svg.png",
  SEA: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Seattle_SuperSonics_logo.svg/1200px-Seattle_SuperSonics_logo.svg.png",
  GSW: "https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo_%281997-2010%29.svg/1200px-Golden_State_Warriors_logo_%281997-2010%29.svg.png",
  PHX: "https://upload.wikimedia.org/wikipedia/en/thumb/d/dc/Phoenix_Suns_Logo_%282000-2013%29.svg/1200px-Phoenix_Suns_Logo_%282000-2013%29.svg.png",
  LAC: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/Los_Angeles_Clippers_logo_%281984-2015%29.svg/1200px-Los_Angeles_Clippers_logo_%281984-2015%29.svg.png"
};
var dbState = {
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
function loadDB() {
  try {
    if (import_fs.default.existsSync(DB_PATH)) {
      const fileData = import_fs.default.readFileSync(DB_PATH, "utf-8");
      dbState = JSON.parse(fileData);
      console.log("Database loaded successfully from", DB_PATH);
    } else {
      console.warn("DB file not found, initializing empty draft structure at", DB_PATH);
    }
    let modified = false;
    if (!dbState.championships || dbState.championships.length === 0) {
      dbState.championships = championshipsData.map((c, i) => ({
        id: `champ-${1e3 + i}`,
        ...c
      }));
      modified = true;
    } else {
      dbState.championships.forEach((c, i) => {
        if (!c.id) {
          c.id = `champ-init-${1e3 + i}-${Date.now()}`;
          modified = true;
        }
      });
    }
    if (!dbState.teamHistories || Object.keys(dbState.teamHistories).length === 0) {
      dbState.teamHistories = detailedTeamHistories;
      modified = true;
    }
    if (!dbState.users) {
      dbState.users = [];
      modified = true;
    } else {
      dbState.users.forEach((u, i) => {
        if (!u.id) {
          u.id = `mod-init-${1e3 + i}-${Date.now()}`;
          modified = true;
        }
      });
    }
    if (dbState.registrationDisabled === void 0) {
      dbState.registrationDisabled = false;
      modified = true;
    }
    if (!dbState.chatRooms) {
      dbState.chatRooms = [
        {
          id: "room-general",
          name: "General Federation Lobby",
          type: "general",
          memberIds: ["admin", "commissioner", "espn"],
          createdById: "system",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ];
      modified = true;
    }
    if (!dbState.chatMessages) {
      dbState.chatMessages = [];
      modified = true;
    }
    if (!dbState.proposals) {
      dbState.proposals = [];
      modified = true;
    }
    if (dbState.teams && dbState.teams.length > 0) {
      dbState.teams.forEach((t) => {
        const standardLogo = HISTORICAL_LOGOS_2003_2004[t.abbrev];
        if (standardLogo) {
          const isEmoji = !t.logo || t.logo.length <= 4 || !t.logo.startsWith("http") && !t.logo.startsWith("data:");
          if (isEmoji) {
            t.logo = standardLogo;
            modified = true;
          }
        }
      });
    }
    if (dbState.teams && dbState.teams.length > 0) {
      dbState.teams.forEach((t) => {
        let teamPlayers = dbState.players.filter((p) => p.teamId === t.id);
        if (teamPlayers.length < 15) {
          const pool = initPlayersPool[t.id] || [];
          for (const candidate of pool) {
            if (teamPlayers.length >= 15) break;
            const exists = teamPlayers.some((p) => p.name.trim().toLowerCase() === candidate.name.trim().toLowerCase());
            if (!exists) {
              const safeNameId = candidate.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
              const newPlayer = {
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
              teamPlayers = dbState.players.filter((p) => p.teamId === t.id);
            }
          }
        }
      });
    }
    if (modified) {
      saveDB();
    }
  } catch (error) {
    console.error("Failed to load database. Using blank template.", error);
  }
}
function saveDB() {
  try {
    import_fs.default.writeFileSync(DB_PATH, JSON.stringify(dbState, null, 2), "utf-8");
    console.log("Database saved successfully to", DB_PATH);
  } catch (err) {
    console.error("Failed to save database state:", err);
  }
}
loadDB();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
app.post("/api/login", (req, res) => {
  const { username, password, requestedRole } = req.body;
  const cleanUser = (username || "").trim().toLowerCase();
  if (cleanUser === "viper2ksim" && password === "admin") {
    const isESPN = requestedRole === "ESPN/News Outlet";
    return res.json({
      success: true,
      token: "viper-session-super-token-99824",
      user: {
        username: "Viper2ksim",
        role: "admin",
        subRole: isESPN ? "ESPN/News Outlet" : "Commissioner",
        permissions: {
          editHistory: true,
          editDrafts: true,
          editRosters: !isESPN
        }
      }
    });
  }
  if ((password === "viper2ksimadmin" || password === "admin") && (!username || cleanUser === "admin" || cleanUser === "administrator")) {
    const isESPN = requestedRole === "ESPN/News Outlet";
    return res.json({
      success: true,
      token: "viper-session-super-token-99824",
      user: {
        username: "Viper2ksim",
        role: "admin",
        subRole: isESPN ? "ESPN/News Outlet" : "Commissioner",
        permissions: {
          editHistory: true,
          editDrafts: true,
          editRosters: !isESPN
        }
      }
    });
  }
  const mods = dbState.users || [];
  const foundMod = mods.find(
    (m) => m.username.toLowerCase() === (username || "").toLowerCase() && m.password === password
  );
  if (foundMod) {
    return res.json({
      success: true,
      token: `viper-session-mod-token-${foundMod.id}`,
      user: {
        id: foundMod.id,
        username: foundMod.username,
        role: "mod",
        subRole: foundMod.role || "Team Owner",
        teamId: foundMod.teamId,
        permissions: foundMod.permissions
      }
    });
  }
  return res.status(401).json({ success: false, message: "Invalid login credentials or insufficient privileges." });
});
app.get("/api/db", (req, res) => {
  res.json(dbState);
});
app.post("/api/teams", (req, res) => {
  const newTeam = req.body;
  if (!newTeam.id || !newTeam.name || !newTeam.abbrev) {
    return res.status(400).json({ error: "Missing team data." });
  }
  if (dbState.teams.some((t) => t.id === newTeam.id)) {
    return res.status(400).json({ error: "Team ID already exists." });
  }
  newTeam.wins = Number(newTeam.wins) || 0;
  newTeam.losses = Number(newTeam.losses) || 0;
  newTeam.streak = newTeam.streak || "None";
  newTeam.ptsFor = Number(newTeam.ptsFor) || 110;
  newTeam.ptsAgainst = Number(newTeam.ptsAgainst) || 110;
  newTeam.retiredJerseys = newTeam.retiredJerseys || "";
  newTeam.gmInstagram = newTeam.gmInstagram || "";
  dbState.teams.push(newTeam);
  const maxRank = dbState.powerRankings.reduce((max, r) => r.rank > max ? r.rank : max, 0);
  dbState.powerRankings.push({
    teamId: newTeam.id,
    rank: maxRank + 1,
    prevRank: maxRank + 1,
    movement: "same",
    notes: `The newly created ${newTeam.name} franchise seeks to build their roster and compete.`
  });
  saveDB();
  res.status(201).json(newTeam);
});
app.put("/api/teams/:id", (req, res) => {
  const teamId = req.params.id;
  const index = dbState.teams.findIndex((t) => t.id === teamId);
  if (index === -1) {
    return res.status(404).json({ error: "Team not found" });
  }
  const updatedTeam = { ...dbState.teams[index], ...req.body };
  dbState.teams[index] = updatedTeam;
  saveDB();
  res.json(updatedTeam);
});
app.post("/api/teams/auto-assign-logos", (req, res) => {
  let count = 0;
  dbState.teams.forEach((t) => {
    const standardLogo = HISTORICAL_LOGOS_2003_2004[t.abbrev];
    if (standardLogo) {
      t.logo = standardLogo;
      count++;
    }
  });
  saveDB();
  res.json({ success: true, message: `Auto-assigned historical 2003-2004 NBA logos to ${count} teams.` });
});
app.delete("/api/teams/:id", (req, res) => {
  const teamId = req.params.id;
  const originalCount = dbState.teams.length;
  dbState.teams = dbState.teams.filter((t) => t.id !== teamId);
  if (dbState.teams.length === originalCount) {
    return res.status(404).json({ error: "Team not found" });
  }
  dbState.powerRankings = dbState.powerRankings.filter((r) => r.teamId !== teamId).sort((a, b) => a.rank - b.rank).map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
  dbState.players = dbState.players.filter((p) => p.teamId !== teamId);
  dbState.news = dbState.news.filter((n) => n.teamId !== teamId);
  saveDB();
  res.json({ success: true, message: `Team ${teamId} and associated players successfully deleted.` });
});
app.get("/api/players", (req, res) => {
  res.json(dbState.players || []);
});
app.post("/api/players", (req, res) => {
  const newPlayer = req.body;
  if (!newPlayer.id || !newPlayer.name || !newPlayer.teamId) {
    return res.status(400).json({ error: "Missing essential player data." });
  }
  const currentRosterSize = dbState.players.filter((p) => p.teamId === newPlayer.teamId).length;
  if (currentRosterSize >= 15) {
    return res.status(400).json({ error: "Franchise roster is full. A team can have at most 15 players." });
  }
  newPlayer.age = Number(newPlayer.age) || 20;
  newPlayer.rating = Number(newPlayer.rating) || 75;
  newPlayer.ppg = Number(newPlayer.ppg) || 0;
  newPlayer.rpg = Number(newPlayer.rpg) || 0;
  newPlayer.apg = Number(newPlayer.apg) || 0;
  newPlayer.spg = Number(newPlayer.spg) || 0;
  newPlayer.bpg = Number(newPlayer.bpg) || 0;
  newPlayer.contract = newPlayer.contract || "$2.0M / 1 Yr";
  dbState.players.push(newPlayer);
  saveDB();
  res.status(201).json(newPlayer);
});
app.put("/api/players/:id", (req, res) => {
  const playerId = req.params.id;
  const index = dbState.players.findIndex((p) => p.id === playerId);
  if (index === -1) {
    return res.status(404).json({ error: "Player not found." });
  }
  const oldPlayer = dbState.players[index];
  const targetTeamId = req.body.teamId;
  if (targetTeamId && targetTeamId !== oldPlayer.teamId) {
    const targetRosterSize = dbState.players.filter((p) => p.teamId === targetTeamId).length;
    if (targetRosterSize >= 15) {
      return res.status(400).json({ error: "Target franchise roster is full. A team can have at most 15 players." });
    }
  }
  const updatedPlayer = { ...dbState.players[index], ...req.body };
  updatedPlayer.age = Number(updatedPlayer.age ?? 20);
  updatedPlayer.rating = Number(updatedPlayer.rating ?? 75);
  updatedPlayer.ppg = Number(updatedPlayer.ppg ?? 0);
  updatedPlayer.rpg = Number(updatedPlayer.rpg ?? 0);
  updatedPlayer.apg = Number(updatedPlayer.apg ?? 0);
  updatedPlayer.spg = Number(updatedPlayer.spg ?? 0);
  updatedPlayer.bpg = Number(updatedPlayer.bpg ?? 0);
  dbState.players[index] = updatedPlayer;
  saveDB();
  res.json(updatedPlayer);
});
app.delete("/api/players/:id", (req, res) => {
  const playerId = req.params.id;
  const originalLength = dbState.players.length;
  dbState.players = dbState.players.filter((p) => p.id !== playerId);
  if (dbState.players.length === originalLength) {
    return res.status(404).json({ error: "Player not found" });
  }
  saveDB();
  res.json({ success: true });
});
app.post("/api/ocr-roster", async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "Please submit a screenshot image." });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is not configured in the workspace settings. Please configure it in Settings > Secrets." });
  }
  try {
    const ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Data
      }
    };
    const promptString = `Analyze this NBA 2K roster screenshot. Run high-quality OCR and identify all players listed. Extract:
- Name (full clean name)
- Age (integer, e.g. 25)
- Position ( strictly one of: PG, SG, SF, PF, C )
- Overall Rating (OVR rating as integer, e.g. 88)

Format your response exactly inside the JSON structure specified, representing the listed players. Do not add markdown backticks.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, { text: promptString }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            players: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  name: { type: import_genai.Type.STRING, description: "Clean full name of the player" },
                  age: { type: import_genai.Type.INTEGER, description: "Player age" },
                  position: { type: import_genai.Type.STRING, description: "Strictly PG, SG, SF, PF, or C" },
                  rating: { type: import_genai.Type.INTEGER, description: "Overall (OVR) rating between 40 and 99" }
                },
                required: ["name", "age", "position", "rating"]
              }
            }
          },
          required: ["players"]
        }
      }
    });
    const text = response.text || '{"players": []}';
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);
  } catch (error) {
    console.error("Failed to parse screenshot roster:", error);
    return res.status(500).json({ error: "Screenshot processing failed: " + (error?.message || error) });
  }
});
app.post("/api/teams/:id/overwrite-roster", (req, res) => {
  const teamId = req.params.id;
  const { players: newPlayers } = req.body;
  if (!Array.isArray(newPlayers)) {
    return res.status(400).json({ error: "Players parameter must be an array." });
  }
  const team = dbState.teams.find((t) => t.id === teamId);
  if (!team) {
    return res.status(404).json({ error: "Franchise not found." });
  }
  dbState.players = dbState.players.filter((p) => p.teamId !== teamId);
  newPlayers.forEach((candidate, idx) => {
    const safeNameId = (candidate.name || "player").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    let position = String(candidate.position || "SG").toUpperCase().trim();
    if (!["PG", "SG", "SF", "PF", "C"].includes(position)) {
      position = "SG";
    }
    const rating = Math.max(40, Math.min(99, Number(candidate.rating || 75)));
    const age = Math.max(18, Math.min(50, Number(candidate.age || 20)));
    const newPlayer = {
      id: `player-ocr-${team.abbrev.toLowerCase()}-${safeNameId}-${idx}-${Date.now()}`,
      teamId: team.id,
      name: candidate.name || "Unknown Player",
      position,
      age,
      rating,
      contract: candidate.contract || "$2.00M / 1 Yr",
      ppg: 0,
      rpg: 0,
      apg: 0,
      spg: 0,
      bpg: 0,
      isStarter: idx < 5,
      // Auto-assign top 5 as starters as a helpful default
      rotationMinutes: idx < 5 ? 32 : 12,
      // Default rotation minutes for starting & bench
      rotationRole: idx < 5 ? "Starter" : "Bench"
    };
    dbState.players.push(newPlayer);
  });
  saveDB();
  res.json({ success: true, count: newPlayers.length });
});
app.post("/api/news", (req, res) => {
  const newArticle = req.body;
  if (!newArticle.title || !newArticle.content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  newArticle.id = "news-" + Date.now();
  newArticle.date = newArticle.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  newArticle.image = newArticle.image || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80";
  newArticle.category = newArticle.category || "League News";
  newArticle.teamId = newArticle.teamId || null;
  dbState.news.unshift(newArticle);
  saveDB();
  res.status(201).json(newArticle);
});
app.put("/api/news/:id", (req, res) => {
  const articleId = req.params.id;
  const index = dbState.news.findIndex((n) => n.id === articleId);
  if (index === -1) {
    return res.status(404).json({ error: "News article not found." });
  }
  const updatedArticle = { ...dbState.news[index], ...req.body };
  dbState.news[index] = updatedArticle;
  saveDB();
  res.json(updatedArticle);
});
app.delete("/api/news/:id", (req, res) => {
  const articleId = req.params.id;
  const originalLength = dbState.news.length;
  dbState.news = dbState.news.filter((n) => n.id !== articleId);
  if (dbState.news.length === originalLength) {
    return res.status(404).json({ error: "News article not found." });
  }
  saveDB();
  res.json({ success: true });
});
app.put("/api/standings", (req, res) => {
  const standingsData = req.body;
  if (!Array.isArray(standingsData)) {
    return res.status(400).json({ error: "Body must be an array of standings data." });
  }
  standingsData.forEach((item) => {
    const team = dbState.teams.find((t) => t.id === item.id);
    if (team) {
      team.wins = Number(item.wins);
      team.losses = Number(item.losses);
      team.streak = item.streak;
    }
  });
  saveDB();
  res.json({ success: true, message: "Standings updated successfully." });
});
app.put("/api/power_rankings", (req, res) => {
  const newRankings = req.body;
  if (!Array.isArray(newRankings)) {
    return res.status(400).json({ error: "Body must be an array of power rankings." });
  }
  dbState.powerRankings = newRankings;
  saveDB();
  res.json({ success: true, message: "Power rankings updated successfully." });
});
app.post("/api/trades", (req, res) => {
  const newTrade = req.body;
  if (!newTrade.teamAId || !newTrade.teamBId) {
    return res.status(400).json({ error: "Teams involved are required." });
  }
  newTrade.id = "trade-" + Date.now();
  newTrade.date = newTrade.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  newTrade.teamAReceives = Array.isArray(newTrade.teamAReceives) ? newTrade.teamAReceives : [];
  newTrade.teamBReceives = Array.isArray(newTrade.teamBReceives) ? newTrade.teamBReceives : [];
  newTrade.details = newTrade.details || "No trade description provided.";
  dbState.trades.unshift(newTrade);
  saveDB();
  res.status(201).json(newTrade);
});
app.delete("/api/trades/:id", (req, res) => {
  const tradeId = req.params.id;
  const originalLength = dbState.trades.length;
  dbState.trades = dbState.trades.filter((t) => t.id !== tradeId);
  if (dbState.trades.length === originalLength) {
    return res.status(404).json({ error: "Trade not found." });
  }
  saveDB();
  res.json({ success: true });
});
app.post("/api/draft_results", (req, res) => {
  const newDraftResult = req.body;
  if (!newDraftResult.teamId || !newDraftResult.playerName) {
    return res.status(400).json({ error: "Draft pick requires teamId and player name." });
  }
  newDraftResult.id = "draft-" + Date.now();
  newDraftResult.year = Number(newDraftResult.year) || (/* @__PURE__ */ new Date()).getFullYear();
  newDraftResult.round = Number(newDraftResult.round) || 1;
  newDraftResult.pick = Number(newDraftResult.pick) || 1;
  newDraftResult.position = newDraftResult.position || "SG";
  newDraftResult.college = newDraftResult.college || "Prospect";
  dbState.draftResults.push(newDraftResult);
  dbState.draftResults.sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (a.round !== b.round) return a.round - b.round;
    return a.pick - b.pick;
  });
  saveDB();
  res.status(201).json(newDraftResult);
});
app.delete("/api/draft_results/:id", (req, res) => {
  const pickId = req.params.id;
  const originalLength = dbState.draftResults.length;
  dbState.draftResults = dbState.draftResults.filter((d) => d.id !== pickId);
  if (dbState.draftResults.length === originalLength) {
    return res.status(404).json({ error: "Draft pick not found." });
  }
  saveDB();
  res.json({ success: true });
});
app.post("/api/awards", (req, res) => {
  const award = req.body;
  if (!award.category || !award.playerName || !award.teamId) {
    return res.status(400).json({ error: "Award requires category, player name, and team." });
  }
  award.id = "award-" + Date.now();
  award.year = award.year || "2025-26";
  award.statsLine = award.statsLine || "-";
  dbState.awards.unshift(award);
  saveDB();
  res.status(201).json(award);
});
app.delete("/api/awards/:id", (req, res) => {
  const awardId = req.params.id;
  const originalLength = dbState.awards.length;
  dbState.awards = dbState.awards.filter((a) => a.id !== awardId);
  if (dbState.awards.length === originalLength) {
    return res.status(404).json({ error: "Award not found" });
  }
  saveDB();
  res.json({ success: true });
});
app.put("/api/awards/:id", (req, res) => {
  const awardId = req.params.id;
  const updated = req.body;
  const awardIdx = dbState.awards.findIndex((a) => a.id === awardId);
  if (awardIdx === -1) {
    return res.status(404).json({ error: "Award not found." });
  }
  dbState.awards[awardIdx] = { ...dbState.awards[awardIdx], ...updated };
  saveDB();
  res.json(dbState.awards[awardIdx]);
});
app.put("/api/draft_results/:id", (req, res) => {
  const pickId = req.params.id;
  const updated = req.body;
  const pickIdx = dbState.draftResults.findIndex((d) => d.id === pickId);
  if (pickIdx === -1) {
    return res.status(404).json({ error: "Draft pick not found." });
  }
  dbState.draftResults[pickIdx] = { ...dbState.draftResults[pickIdx], ...updated };
  saveDB();
  res.json(dbState.draftResults[pickIdx]);
});
app.put("/api/trades/:id", (req, res) => {
  const tradeId = req.params.id;
  const updated = req.body;
  const tradeIdx = dbState.trades.findIndex((t) => t.id === tradeId);
  if (tradeIdx === -1) {
    return res.status(404).json({ error: "Trade record not found." });
  }
  dbState.trades[tradeIdx] = { ...dbState.trades[tradeIdx], ...updated };
  saveDB();
  res.json(dbState.trades[tradeIdx]);
});
app.post("/api/championships", (req, res) => {
  const newChamp = req.body;
  if (!newChamp.year || !newChamp.champion) {
    return res.status(400).json({ error: "Championship record requires a year and champion." });
  }
  newChamp.id = `champ-${Date.now()}`;
  if (!dbState.championships) dbState.championships = [];
  dbState.championships.unshift(newChamp);
  saveDB();
  res.status(201).json(newChamp);
});
app.put("/api/championships/:id", (req, res) => {
  const champId = req.params.id;
  const updated = req.body;
  if (!dbState.championships) dbState.championships = [];
  const champIdx = dbState.championships.findIndex((c) => c.id === champId);
  if (champIdx === -1) {
    return res.status(404).json({ error: "Championship record not found." });
  }
  dbState.championships[champIdx] = { ...dbState.championships[champIdx], ...updated };
  saveDB();
  res.json(dbState.championships[champIdx]);
});
app.delete("/api/championships/:id", (req, res) => {
  const champId = req.params.id;
  if (!dbState.championships) dbState.championships = [];
  const originalLength = dbState.championships.length;
  dbState.championships = dbState.championships.filter((c) => c.id !== champId && String(c.year) !== champId);
  if (dbState.championships.length === originalLength) {
    return res.status(404).json({ error: "Championship record not found." });
  }
  saveDB();
  res.json({ success: true });
});
app.put("/api/team_histories/:teamId", (req, res) => {
  const teamId = req.params.teamId;
  const updated = req.body;
  if (!dbState.teamHistories) dbState.teamHistories = {};
  dbState.teamHistories[teamId] = {
    established: updated.established || "1980",
    championships: Array.isArray(updated.championships) ? updated.championships : [],
    legendaryPlayers: Array.isArray(updated.legendaryPlayers) ? updated.legendaryPlayers : [],
    historicalBio: updated.historicalBio || ""
  };
  saveDB();
  res.json(dbState.teamHistories[teamId]);
});
app.post("/api/users", (req, res) => {
  if (!dbState.users) dbState.users = [];
  if (dbState.users.length >= 40) {
    return res.status(400).json({ error: "Cannot create user. League is at maximum capacity (40 users)." });
  }
  const newUser = req.body;
  if (!newUser.password) {
    return res.status(400).json({ error: "Password is required." });
  }
  newUser.id = `mod-${Date.now()}`;
  newUser.role = newUser.role || "Team Owner";
  newUser.permissions = newUser.permissions || { editHistory: false, editDrafts: false, editRosters: false };
  newUser.teamId = newUser.teamId || "";
  if (newUser.role === "Team Owner" && newUser.teamId) {
    const team = dbState.teams.find((t) => t.id === newUser.teamId);
    if (team) {
      newUser.username = team.name;
    }
  }
  if (!newUser.username) {
    return res.status(400).json({ error: "Username is required (or assign a team to auto-generate from team name)." });
  }
  if (dbState.users.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase())) {
    return res.status(400).json({ error: `The username or team owner seat for "${newUser.username}" is already assigned/taken.` });
  }
  dbState.users.push(newUser);
  saveDB();
  res.status(201).json(newUser);
});
app.get("/api/settings", (req, res) => {
  res.json({
    registrationDisabled: !!dbState.registrationDisabled,
    userCount: dbState.users ? dbState.users.length : 0
  });
});
app.post("/api/settings", (req, res) => {
  const { registrationDisabled } = req.body;
  if (registrationDisabled !== void 0) {
    dbState.registrationDisabled = Boolean(registrationDisabled);
    saveDB();
  }
  res.json({
    success: true,
    registrationDisabled: !!dbState.registrationDisabled,
    userCount: dbState.users ? dbState.users.length : 0
  });
});
app.post("/api/register", (req, res) => {
  if (!dbState.users) dbState.users = [];
  if (dbState.registrationDisabled) {
    return res.status(400).json({ error: "Self-registration has been disabled by the Commissioner." });
  }
  if (dbState.users.length >= 40) {
    return res.status(400).json({ error: "League is at maximum capacity (40 users). Registration automatically locked." });
  }
  const { username, password, role, teamId } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "");
  if (dbState.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: `The username "${cleanUsername}" is already taken.` });
  }
  const finalRole = role || "Viewer";
  const finalTeamId = finalRole === "Team Owner" ? teamId || "" : "";
  const isSovereign = finalRole === "Commissioner" || finalRole === "Co-Commissioner";
  const permissions = {
    editHistory: isSovereign,
    editDrafts: isSovereign,
    editRosters: isSovereign
  };
  const newUser = {
    id: `mod-${Date.now()}`,
    username: cleanUsername,
    password,
    role: finalRole,
    teamId: finalTeamId,
    permissions
  };
  dbState.users.push(newUser);
  saveDB();
  res.status(201).json({ success: true, user: newUser });
});
app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const updated = req.body;
  if (!dbState.users) dbState.users = [];
  const userIdx = dbState.users.findIndex((u) => u.id === userId);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User not found." });
  }
  const role = updated.role || dbState.users[userIdx].role || "Team Owner";
  const teamId = updated.teamId !== void 0 ? updated.teamId : dbState.users[userIdx].teamId || "";
  let username = updated.username || dbState.users[userIdx].username;
  if (role === "Team Owner" && teamId) {
    const team = dbState.teams.find((t) => t.id === teamId);
    if (team) {
      username = team.name;
    }
  }
  if (dbState.users.some((u) => u.id !== userId && u.username.toLowerCase() === username.toLowerCase())) {
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
app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  if (!dbState.users) dbState.users = [];
  const originalLength = dbState.users.length;
  dbState.users = dbState.users.filter((u) => u.id !== userId);
  if (dbState.users.length === originalLength) {
    return res.status(404).json({ error: "User not found." });
  }
  saveDB();
  res.json({ success: true });
});
app.get("/api/chats/rooms", (req, res) => {
  if (!dbState.chatRooms) {
    dbState.chatRooms = [
      {
        id: "room-general",
        name: "General Federation Lobby",
        type: "general",
        memberIds: ["admin", "commissioner", "espn"],
        createdById: "system",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ];
  }
  res.json(dbState.chatRooms);
});
app.get("/api/chats/messages", (req, res) => {
  if (!dbState.chatMessages) dbState.chatMessages = [];
  res.json(dbState.chatMessages);
});
app.post("/api/chats/rooms", (req, res) => {
  const { name, type, memberIds, createdById } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Chat room name is required." });
  }
  if (!dbState.chatRooms) dbState.chatRooms = [];
  const newRoom = {
    id: `room-${Date.now()}`,
    name,
    type: type || "group",
    memberIds: Array.isArray(memberIds) ? memberIds : [],
    createdById: createdById || "unknown",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.chatRooms.push(newRoom);
  saveDB();
  broadcastToAll({ type: "room_created", room: newRoom });
  res.status(201).json(newRoom);
});
app.post("/api/chats/messages", (req, res) => {
  const { roomId, senderId, senderName, senderLogo, senderColor, content } = req.body;
  if (!roomId || !content) {
    return res.status(400).json({ error: "Room ID and message content are required." });
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
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.chatMessages.push(newMessage);
  saveDB();
  broadcastToAll({ type: "message", message: newMessage });
  res.status(201).json(newMessage);
});
app.get("/api/proposals", (req, res) => {
  res.json(dbState.proposals || []);
});
app.post("/api/proposals", (req, res) => {
  const prop = req.body;
  if (!prop.type || !prop.teamAId || !prop.submittedBy) {
    return res.status(400).json({ error: "Missing essential proposal details." });
  }
  prop.id = "prop-" + Date.now() + "-" + Math.floor(Math.random() * 1e3);
  prop.createdAt = prop.createdAt || (/* @__PURE__ */ new Date()).toISOString();
  prop.status = prop.status || (prop.type === "trade" && prop.teamBId ? "pending_acceptance" : "pending_commissioner");
  if (!dbState.proposals) dbState.proposals = [];
  dbState.proposals.push(prop);
  saveDB();
  broadcastToAll({ type: "proposal_update", proposal: prop });
  res.status(201).json(prop);
});
app.put("/api/proposals/:id", (req, res) => {
  const { id } = req.params;
  if (!dbState.proposals) dbState.proposals = [];
  const index = dbState.proposals.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Proposal not found" });
  }
  const oldProp = dbState.proposals[index];
  const newProp = { ...oldProp, ...req.body };
  if (newProp.status === "approved" && oldProp.status !== "approved") {
    if (newProp.type === "trade") {
      const sendsA = newProp.teamASendsPlayerIds || [];
      const sendsB = newProp.teamBSendsPlayerIds || [];
      sendsA.forEach((pId) => {
        const p = dbState.players.find((x) => x.id === pId);
        if (p) p.teamId = newProp.teamBId;
      });
      sendsB.forEach((pId) => {
        const p = dbState.players.find((x) => x.id === pId);
        if (p) p.teamId = newProp.teamAId;
      });
      const teamA = dbState.teams.find((t) => t.id === newProp.teamAId);
      const teamB = dbState.teams.find((t) => t.id === newProp.teamBId);
      const teamAName = teamA ? teamA.name : newProp.teamAId;
      const teamBName = teamB ? teamB.name : newProp.teamBId;
      const playersA = sendsA.map((pId) => dbState.players.find((x) => x.id === pId)?.name || pId).join(", ");
      const playersB = sendsB.map((pId) => dbState.players.find((x) => x.id === pId)?.name || pId).join(", ");
      const desc = `${teamAName} receives: ${playersB || "Future Picks/Assets"}. ${teamBName} receives: ${playersA || "Future Picks/Assets"}.`;
      const newTradeLog = {
        id: "trade-" + Date.now(),
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        teamAId: newProp.teamAId,
        teamBId: newProp.teamBId,
        teamAReceives: sendsB,
        teamBReceives: sendsA,
        details: desc
      };
      dbState.trades.unshift(newTradeLog);
      const newNews = {
        id: "news-" + Date.now(),
        title: `TRADE APPROVED: ${teamA ? teamA.abbrev : "TEAM"} & ${teamB ? teamB.abbrev : "TEAM"} Roster Swap Certified`,
        content: `The Commissioner Office has greenlit a blockbuster agreement.

Transaction Summary:
\u2022 ${teamAName} receives: ${playersB || "Draft Assets"}
\u2022 ${teamBName} receives: ${playersA || "Draft Assets"}

Front-office executives verified that all virtual salary standards align with historical rules. Player roles are rescheduled immediately.`,
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        category: "Trade Alert",
        teamId: newProp.teamAId
      };
      dbState.news.unshift(newNews);
    } else if (newProp.type === "roster_update") {
      if (newProp.simPriorityChange) {
        const team2 = dbState.teams.find((t) => t.id === newProp.teamAId);
        if (team2) {
          team2.simPriority = newProp.simPriorityChange;
        }
      }
      if (newProp.tradeBlockChanges && Array.isArray(newProp.tradeBlockChanges)) {
        newProp.tradeBlockChanges.forEach((change) => {
          const p = dbState.players.find((x) => x.id === change.playerId);
          if (p) {
            p.isOnTradeBlock = change.isOnBlock;
          }
        });
      }
      if (newProp.lineupChanges && Array.isArray(newProp.lineupChanges)) {
        newProp.lineupChanges.forEach((change) => {
          const p = dbState.players.find((x) => x.id === change.playerId);
          if (p) {
            p.isStarter = change.isStarter;
            p.rotationMinutes = change.rotationMinutes;
            p.rotationRole = change.rotationRole;
          }
        });
      }
      const team = dbState.teams.find((t) => t.id === newProp.teamAId);
      if (team) {
        let updateDesc = `The representative of ${team.name} has recalibrated team priorities.`;
        if (newProp.simPriorityChange) {
          const mapPriority = {
            championship: "push for championship contendership \u{1F3C6}",
            development: "young prospect development \u26A1",
            tank: "rebuild mode & draft optimization \u{1F4CA}",
            neutral: "standard balanced rotation \u{1F4C5}"
          };
          updateDesc += ` They are officially targeting: ${mapPriority[newProp.simPriorityChange]}.`;
        }
        const rosterNews = {
          id: "news-" + Date.now(),
          title: `RECALIBRATION: ${team.abbrev} Formally Updates Strategic Mandate`,
          content: `${updateDesc}

Lineups and active rotations have been re-assigned to optimize for these competitive settings. Fans can check current roster listings in the designated screens.`,
          date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          image: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          category: "League News",
          teamId: team.id
        };
        dbState.news.unshift(rosterNews);
      }
    }
  }
  dbState.proposals[index] = newProp;
  saveDB();
  broadcastToAll({ type: "proposal_update", proposal: newProp });
  res.json(newProp);
});
app.delete("/api/proposals/:id", (req, res) => {
  const { id } = req.params;
  if (!dbState.proposals) dbState.proposals = [];
  const originalLength = dbState.proposals.length;
  dbState.proposals = dbState.proposals.filter((p) => p.id !== id);
  if (dbState.proposals.length === originalLength) {
    return res.status(404).json({ error: "Proposal not found" });
  }
  saveDB();
  broadcastToAll({ type: "proposal_deleted", id });
  res.json({ success: true });
});
var wsClients = /* @__PURE__ */ new Set();
function broadcastToAll(payload) {
  const data = JSON.stringify(payload);
  for (const client of wsClients) {
    if (client.readyState === 1) {
      try {
        client.send(data);
      } catch (err) {
        console.error("Failed to send to client:", err);
      }
    }
  }
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted as Express middleware.");
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from", distPath);
  }
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Viper2kSim Server successfully running on http://localhost:${PORT}`);
  });
  const wss = new import_ws.WebSocketServer({ server });
  wss.on("connection", (ws) => {
    wsClients.add(ws);
    ws.send(JSON.stringify({ type: "connected" }));
    ws.on("message", (messageBuffer) => {
      try {
        const payload = JSON.parse(messageBuffer.toString());
        if (payload.type === "message") {
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
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            };
            if (!dbState.chatMessages) dbState.chatMessages = [];
            dbState.chatMessages.push(newMessage);
            saveDB();
            broadcastToAll({ type: "message", message: newMessage });
          }
        } else if (payload.type === "room_created") {
          const roomData = payload.room;
          if (roomData && roomData.name) {
            const newRoom = {
              id: `room-${Date.now()}`,
              name: roomData.name,
              type: roomData.type || "group",
              memberIds: Array.isArray(roomData.memberIds) ? roomData.memberIds : [],
              createdById: roomData.createdById || "unknown",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            if (!dbState.chatRooms) dbState.chatRooms = [];
            dbState.chatRooms.push(newRoom);
            saveDB();
            broadcastToAll({ type: "room_created", room: newRoom });
          }
        }
      } catch (err) {
        console.error("WebSocket incoming frame error:", err);
      }
    });
    ws.on("close", () => {
      wsClients.delete(ws);
    });
    ws.on("error", () => {
      wsClients.delete(ws);
    });
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
