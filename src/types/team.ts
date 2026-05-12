export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string;
  country: string;
  leagueId: string;
  form: ('W' | 'D' | 'L')[];
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  tier: number;
  flagEmoji: string;
}
