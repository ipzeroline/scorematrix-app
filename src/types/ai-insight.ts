export interface AIInsight {
  id: string;
  matchId: string;
  confidenceScore: number;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  heatMeter: number;
  homeAdvantageFactor: number;
  formComparison: {
    homeFormIndex: number;
    awayFormIndex: number;
    homeLastFive: ('W' | 'D' | 'L')[];
    awayLastFive: ('W' | 'D' | 'L')[];
  };
  headToHead: HeadToHeadRecord[];
  injuryImpact: {
    homeImpact: number;
    awayImpact: number;
    homeInjuries: string[];
    awayInjuries: string[];
  };
  upsetAlert: boolean;
  upsetDescription: string | null;
  communitySentiment: {
    homePercentage: number;
    drawPercentage: number;
    awayPercentage: number;
    totalVotes: number;
  };
  keyFactors: string[];
  generatedAt: string;
}

export interface HeadToHeadRecord {
  date: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
}
