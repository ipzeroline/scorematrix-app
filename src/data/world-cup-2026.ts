export type WorldCupTeam = {
  name: string;
  code: string;
  flagCode: string;
  rank: number;
};

export type WorldCupMatch = {
  matchday: 1 | 2 | 3;
  kickoffUtc: string;
  homeCode: string;
  awayCode: string;
  venue: string;
};

export type WorldCupGroup = {
  id: string;
  name: string;
  teams: WorldCupTeam[];
  spotlight: string;
  matches: WorldCupMatch[];
};

export const worldCupGroups: WorldCupGroup[] = [
  {
    id: "A",
    name: "Group A",
    spotlight: "Opening path: Mexico City, Guadalajara, Atlanta",
    teams: [
      { name: "Mexico", code: "MEX", flagCode: "mx", rank: 15 },
      { name: "South Africa", code: "RSA", flagCode: "za", rank: 60 },
      { name: "Korea Republic", code: "KOR", flagCode: "kr", rank: 25 },
      { name: "Czechia", code: "CZE", flagCode: "cz", rank: 41 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-11T19:00:00Z", homeCode: "MEX", awayCode: "RSA", venue: "Mexico City Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-12T02:00:00Z", homeCode: "KOR", awayCode: "CZE", venue: "Guadalajara Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-18T16:00:00Z", homeCode: "CZE", awayCode: "RSA", venue: "Atlanta Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-19T01:00:00Z", homeCode: "MEX", awayCode: "KOR", venue: "Guadalajara Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-25T01:00:00Z", homeCode: "RSA", awayCode: "KOR", venue: "Monterrey Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-25T01:00:00Z", homeCode: "CZE", awayCode: "MEX", venue: "Mexico City Stadium" },
    ],
  },
  {
    id: "B",
    name: "Group B",
    spotlight: "Canada starts at home with a tight European test",
    teams: [
      { name: "Canada", code: "CAN", flagCode: "ca", rank: 30 },
      { name: "Bosnia and Herzegovina", code: "BIH", flagCode: "ba", rank: 65 },
      { name: "Qatar", code: "QAT", flagCode: "qa", rank: 55 },
      { name: "Switzerland", code: "SUI", flagCode: "ch", rank: 19 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-12T19:00:00Z", homeCode: "CAN", awayCode: "BIH", venue: "Toronto Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-13T19:00:00Z", homeCode: "QAT", awayCode: "SUI", venue: "San Francisco Bay Area Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-18T19:00:00Z", homeCode: "SUI", awayCode: "BIH", venue: "Los Angeles Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-18T22:00:00Z", homeCode: "CAN", awayCode: "QAT", venue: "BC Place Vancouver" },
      { matchday: 3, kickoffUtc: "2026-06-24T19:00:00Z", homeCode: "BIH", awayCode: "QAT", venue: "Seattle Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-24T19:00:00Z", homeCode: "SUI", awayCode: "CAN", venue: "BC Place Vancouver" },
    ],
  },
  {
    id: "C",
    name: "Group C",
    spotlight: "Brazil and Morocco headline one of the most watchable groups",
    teams: [
      { name: "Brazil", code: "BRA", flagCode: "br", rank: 6 },
      { name: "Morocco", code: "MAR", flagCode: "ma", rank: 8 },
      { name: "Haiti", code: "HAI", flagCode: "ht", rank: 83 },
      { name: "Scotland", code: "SCO", flagCode: "gb-sct", rank: 43 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-13T22:00:00Z", homeCode: "BRA", awayCode: "MAR", venue: "New York/New Jersey Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-14T01:00:00Z", homeCode: "HAI", awayCode: "SCO", venue: "Boston Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-19T22:00:00Z", homeCode: "SCO", awayCode: "MAR", venue: "Boston Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-20T00:30:00Z", homeCode: "BRA", awayCode: "HAI", venue: "Philadelphia Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-24T22:00:00Z", homeCode: "MAR", awayCode: "HAI", venue: "Atlanta Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-24T22:00:00Z", homeCode: "SCO", awayCode: "BRA", venue: "Miami Stadium" },
    ],
  },
  {
    id: "D",
    name: "Group D",
    spotlight: "The United States route runs through Paraguay, Australia and Turkiye",
    teams: [
      { name: "United States", code: "USA", flagCode: "us", rank: 14 },
      { name: "Paraguay", code: "PAR", flagCode: "py", rank: 39 },
      { name: "Australia", code: "AUS", flagCode: "au", rank: 24 },
      { name: "Turkiye", code: "TUR", flagCode: "tr", rank: 26 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-13T01:00:00Z", homeCode: "USA", awayCode: "PAR", venue: "Los Angeles Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-14T04:00:00Z", homeCode: "AUS", awayCode: "TUR", venue: "BC Place Vancouver" },
      { matchday: 2, kickoffUtc: "2026-06-19T19:00:00Z", homeCode: "USA", awayCode: "AUS", venue: "Seattle Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-20T03:00:00Z", homeCode: "TUR", awayCode: "PAR", venue: "San Francisco Bay Area Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-26T02:00:00Z", homeCode: "PAR", awayCode: "AUS", venue: "San Francisco Bay Area Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-26T02:00:00Z", homeCode: "TUR", awayCode: "USA", venue: "Los Angeles Stadium" },
    ],
  },
  {
    id: "E",
    name: "Group E",
    spotlight: "Germany meets Ecuador, Cote d'Ivoire and Curacao",
    teams: [
      { name: "Germany", code: "GER", flagCode: "de", rank: 10 },
      { name: "Curacao", code: "CUW", flagCode: "cw", rank: 86 },
      { name: "Cote d'Ivoire", code: "CIV", flagCode: "ci", rank: 42 },
      { name: "Ecuador", code: "ECU", flagCode: "ec", rank: 23 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-14T17:00:00Z", homeCode: "GER", awayCode: "CUW", venue: "Houston Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-14T23:00:00Z", homeCode: "CIV", awayCode: "ECU", venue: "Philadelphia Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-20T20:00:00Z", homeCode: "GER", awayCode: "CIV", venue: "Toronto Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-21T00:00:00Z", homeCode: "ECU", awayCode: "CUW", venue: "Kansas City Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-25T20:00:00Z", homeCode: "CUW", awayCode: "CIV", venue: "Philadelphia Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-25T20:00:00Z", homeCode: "ECU", awayCode: "GER", venue: "New York/New Jersey Stadium" },
    ],
  },
  {
    id: "F",
    name: "Group F",
    spotlight: "Netherlands, Japan, Sweden and Tunisia bring four distinct styles",
    teams: [
      { name: "Netherlands", code: "NED", flagCode: "nl", rank: 7 },
      { name: "Japan", code: "JPN", flagCode: "jp", rank: 18 },
      { name: "Sweden", code: "SWE", flagCode: "se", rank: 38 },
      { name: "Tunisia", code: "TUN", flagCode: "tn", rank: 44 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-14T20:00:00Z", homeCode: "NED", awayCode: "JPN", venue: "Dallas Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-15T02:00:00Z", homeCode: "SWE", awayCode: "TUN", venue: "Monterrey Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-20T17:00:00Z", homeCode: "NED", awayCode: "SWE", venue: "Houston Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-21T04:00:00Z", homeCode: "TUN", awayCode: "JPN", venue: "Monterrey Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-25T23:00:00Z", homeCode: "TUN", awayCode: "NED", venue: "Kansas City Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-25T23:00:00Z", homeCode: "JPN", awayCode: "SWE", venue: "Dallas Stadium" },
    ],
  },
  {
    id: "G",
    name: "Group G",
    spotlight: "Belgium, Egypt and Iran chase control against New Zealand",
    teams: [
      { name: "Belgium", code: "BEL", flagCode: "be", rank: 9 },
      { name: "Egypt", code: "EGY", flagCode: "eg", rank: 29 },
      { name: "Iran", code: "IRN", flagCode: "ir", rank: 21 },
      { name: "New Zealand", code: "NZL", flagCode: "nz", rank: 89 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-15T19:00:00Z", homeCode: "BEL", awayCode: "EGY", venue: "Seattle Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-16T01:00:00Z", homeCode: "IRN", awayCode: "NZL", venue: "Los Angeles Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-21T19:00:00Z", homeCode: "BEL", awayCode: "IRN", venue: "Los Angeles Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-22T01:00:00Z", homeCode: "NZL", awayCode: "EGY", venue: "BC Place Vancouver" },
      { matchday: 3, kickoffUtc: "2026-06-27T03:00:00Z", homeCode: "NZL", awayCode: "BEL", venue: "BC Place Vancouver" },
      { matchday: 3, kickoffUtc: "2026-06-27T03:00:00Z", homeCode: "EGY", awayCode: "IRN", venue: "Seattle Stadium" },
    ],
  },
  {
    id: "H",
    name: "Group H",
    spotlight: "Spain and Uruguay share a group with Saudi Arabia and Cape Verde",
    teams: [
      { name: "Spain", code: "ESP", flagCode: "es", rank: 2 },
      { name: "Cape Verde", code: "CPV", flagCode: "cv", rank: 66 },
      { name: "Saudi Arabia", code: "KSA", flagCode: "sa", rank: 60 },
      { name: "Uruguay", code: "URU", flagCode: "uy", rank: 17 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-15T16:00:00Z", homeCode: "ESP", awayCode: "CPV", venue: "Atlanta Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-15T22:00:00Z", homeCode: "KSA", awayCode: "URU", venue: "Miami Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-21T16:00:00Z", homeCode: "ESP", awayCode: "KSA", venue: "Atlanta Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-21T22:00:00Z", homeCode: "URU", awayCode: "CPV", venue: "Miami Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-27T00:00:00Z", homeCode: "URU", awayCode: "ESP", venue: "Guadalajara Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-27T00:00:00Z", homeCode: "CPV", awayCode: "KSA", venue: "Houston Stadium" },
    ],
  },
  {
    id: "I",
    name: "Group I",
    spotlight: "France, Senegal, Norway and Iraq make the heavy traffic group",
    teams: [
      { name: "France", code: "FRA", flagCode: "fr", rank: 1 },
      { name: "Senegal", code: "SEN", flagCode: "sn", rank: 14 },
      { name: "Iraq", code: "IRQ", flagCode: "iq", rank: 58 },
      { name: "Norway", code: "NOR", flagCode: "no", rank: 34 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-16T19:00:00Z", homeCode: "FRA", awayCode: "SEN", venue: "New York/New Jersey Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-16T22:00:00Z", homeCode: "IRQ", awayCode: "NOR", venue: "Boston Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-22T21:00:00Z", homeCode: "FRA", awayCode: "IRQ", venue: "Philadelphia Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-23T00:00:00Z", homeCode: "NOR", awayCode: "SEN", venue: "New York/New Jersey Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-26T19:00:00Z", homeCode: "SEN", awayCode: "IRQ", venue: "Toronto Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-26T19:00:00Z", homeCode: "NOR", awayCode: "FRA", venue: "Boston Stadium" },
    ],
  },
  {
    id: "J",
    name: "Group J",
    spotlight: "Argentina starts the defense against Algeria, Austria and Jordan",
    teams: [
      { name: "Argentina", code: "ARG", flagCode: "ar", rank: 3 },
      { name: "Algeria", code: "ALG", flagCode: "dz", rank: 35 },
      { name: "Austria", code: "AUT", flagCode: "at", rank: 22 },
      { name: "Jordan", code: "JOR", flagCode: "jo", rank: 68 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-17T01:00:00Z", homeCode: "ARG", awayCode: "ALG", venue: "Kansas City Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-17T04:00:00Z", homeCode: "AUT", awayCode: "JOR", venue: "San Francisco Bay Area Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-22T17:00:00Z", homeCode: "ARG", awayCode: "AUT", venue: "Dallas Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-23T03:00:00Z", homeCode: "JOR", awayCode: "ALG", venue: "San Francisco Bay Area Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-28T02:00:00Z", homeCode: "ALG", awayCode: "AUT", venue: "Kansas City Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-28T02:00:00Z", homeCode: "JOR", awayCode: "ARG", venue: "Dallas Stadium" },
    ],
  },
  {
    id: "K",
    name: "Group K",
    spotlight: "Portugal faces Colombia, Uzbekistan and DR Congo",
    teams: [
      { name: "Portugal", code: "POR", flagCode: "pt", rank: 5 },
      { name: "DR Congo", code: "COD", flagCode: "cd", rank: 46 },
      { name: "Uzbekistan", code: "UZB", flagCode: "uz", rank: 50 },
      { name: "Colombia", code: "COL", flagCode: "co", rank: 13 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-17T17:00:00Z", homeCode: "POR", awayCode: "COD", venue: "Houston Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-18T02:00:00Z", homeCode: "UZB", awayCode: "COL", venue: "Mexico City Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-23T17:00:00Z", homeCode: "POR", awayCode: "UZB", venue: "Houston Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-24T02:00:00Z", homeCode: "COL", awayCode: "COD", venue: "Guadalajara Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-27T23:30:00Z", homeCode: "COD", awayCode: "UZB", venue: "Atlanta Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-27T23:30:00Z", homeCode: "COL", awayCode: "POR", venue: "Miami Stadium" },
    ],
  },
  {
    id: "L",
    name: "Group L",
    spotlight: "England, Croatia, Ghana and Panama close the group map",
    teams: [
      { name: "England", code: "ENG", flagCode: "gb-eng", rank: 4 },
      { name: "Croatia", code: "CRO", flagCode: "hr", rank: 11 },
      { name: "Ghana", code: "GHA", flagCode: "gh", rank: 61 },
      { name: "Panama", code: "PAN", flagCode: "pa", rank: 72 },
    ],
    matches: [
      { matchday: 1, kickoffUtc: "2026-06-17T20:00:00Z", homeCode: "ENG", awayCode: "CRO", venue: "Dallas Stadium" },
      { matchday: 1, kickoffUtc: "2026-06-17T23:00:00Z", homeCode: "GHA", awayCode: "PAN", venue: "Toronto Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-23T20:00:00Z", homeCode: "ENG", awayCode: "GHA", venue: "Boston Stadium" },
      { matchday: 2, kickoffUtc: "2026-06-23T23:00:00Z", homeCode: "PAN", awayCode: "CRO", venue: "Toronto Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-27T21:00:00Z", homeCode: "PAN", awayCode: "ENG", venue: "New York/New Jersey Stadium" },
      { matchday: 3, kickoffUtc: "2026-06-27T21:00:00Z", homeCode: "CRO", awayCode: "GHA", venue: "Philadelphia Stadium" },
    ],
  },
];
