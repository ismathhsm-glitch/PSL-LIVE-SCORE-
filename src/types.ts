/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DismissalType {
  Bowled = "Bowled",
  Caught = "Caught",
  LBW = "LBW",
  RunOut = "Run Out",
  Stumped = "Stumped",
  HitWicket = "Hit Wicket",
}

export interface BatsmanStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalType?: DismissalType;
  dismissedBy?: string; // bowler name
}

export interface BowlerStats {
  name: string;
  ballsBowled: number; // total balls bowled
  maidens: number;
  runsConceded: number;
  wickets: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  batsmanName: string;
  score: number;
  wickets: number;
  overs: string;
}

export interface InningsState {
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  balls: number; // total valid balls bowled in this innings
  batsmen: BatsmanStats[];
  bowlers: BowlerStats[];
  strikerIndex: number; // index in batsmen array
  nonStrikerIndex: number; // index in batsmen array
  currentBowlerIndex: number; // index in bowlers array
  fallOfWickets: FallOfWicket[];
  overHistory: string[]; // history of the current over (e.g. ["1", "Wd", "Nb+4", "W"])
  commentary: string[]; // ball-by-ball comments
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  partnershipRuns: number;
  partnershipBalls: number;
}

export enum MatchStatus {
  Upcoming = "Upcoming",
  Live = "Live",
  Completed = "Completed",
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  date: string;
  venue: string;
  maxOvers: number;
  tossWinner?: string;
  tossDecision?: "Bat" | "Bowl";
  status: MatchStatus;
  currentInnings: 1 | 2;
  innings1?: InningsState;
  innings2?: InningsState;
  winner?: string;
  resultMessage?: string;
  manOfTheMatch?: string;
  isSuperOver: boolean;
  superOverInnings1?: InningsState;
  superOverInnings2?: InningsState;
  ballsPerOver?: number;
}

export interface TeamStats {
  teamName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  runsScored: number;
  oversFaced: number; // total balls faced / 6
  runsConceded: number;
  oversBowled: number; // total balls bowled / 6
  nrr: number;
  wicketsLost?: number;
  wicketsTaken?: number;
}

export interface TeamAdjustment {
  teamName: string;
  pointsAdjustment: number;
  runsScoredAdjustment: number;
  oversFacedAdjustment: number;
  runsConcededAdjustment: number;
  oversBowledAdjustment: number;
  nrrAdjustment: number;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string; // base64 or custom preset image
  isOwner?: boolean;
  players?: string[];
}
