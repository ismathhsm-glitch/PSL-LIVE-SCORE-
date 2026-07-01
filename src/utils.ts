/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, MatchStatus, TeamStats, InningsState, TeamAdjustment } from "./types";
import { PSL_TEAMS } from "./initialData";

/**
 * Format total balls into cricket overs format (e.g. 15 balls -> "2.3")
 */
export function formatOvers(balls: number, ballsPerOver: number = 6): string {
  const completeOvers = Math.floor(balls / ballsPerOver);
  const remainingBalls = balls % ballsPerOver;
  return `${completeOvers}.${remainingBalls}`;
}

/**
 * Convert overs string (like "3.2") back to total balls
 */
export function getBallsFromOversStr(oversStr: string, ballsPerOver: number = 6): number {
  if (!oversStr) return 0;
  const parts = oversStr.split(".");
  const overs = parseInt(parts[0], 10) || 0;
  const balls = parseInt(parts[1], 10) || 0;
  return (overs * ballsPerOver) + balls;
}

/**
 * Calculate batsman's Strike Rate
 */
export function calculateStrikeRate(runs: number, balls: number): string {
  if (balls === 0) return "0.00";
  return ((runs / balls) * 100).toFixed(2);
}

/**
 * Calculate bowler's Economy Rate
 */
export function calculateEconomy() {
  // Let's declare this in standard way
}

export function calculateEconomyRate(runsConceded: number, ballsBowled: number, ballsPerOver: number = 6): string {
  if (ballsBowled === 0) return "0.00";
  return ((runsConceded / (ballsBowled / ballsPerOver))).toFixed(2);
}

/**
 * Calculate Required Run Rate
 */
export function calculateRequiredRunRate(runsNeeded: number, ballsRemaining: number, ballsPerOver: number = 6): string {
  if (ballsRemaining <= 0) return runsNeeded > 0 ? "∞" : "0.00";
  const oversRemaining = ballsRemaining / ballsPerOver;
  return (runsNeeded / oversRemaining).toFixed(2);
}

/**
 * Calculate Current Run Rate
 */
export function calculateCurrentRunRate(runs: number, balls: number, ballsPerOver: number = 6): string {
  if (balls === 0) return "0.00";
  const overs = balls / ballsPerOver;
  return (runs / overs).toFixed(2);
}

/**
 * Recalculates the points table for PSL 2026 based on all matches.
 * Follows ICC Net Run Rate rules:
 * - If a team is bowled out (all-out), they are considered to have faced their full quota of overs.
 * - If they bowl out the opponent, the opponent is considered to have faced their full quota of overs.
 */
export function calculatePointsTable(matches: Match[], adjustments: TeamAdjustment[] = []): TeamStats[] {
  // Initialize teams stats
  const tableMap: Record<string, TeamStats> = {};
  for (const team of PSL_TEAMS) {
    tableMap[team] = {
      teamName: team,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      points: 0,
      runsScored: 0,
      oversFaced: 0, // represented as actual overs (fractional, e.g. 20.0)
      runsConceded: 0,
      oversBowled: 0, // represented as actual overs (fractional, e.g. 20.0)
      nrr: 0,
      wicketsLost: 0,
      wicketsTaken: 0,
    };
  }

  // Iterate over completed matches
  for (const match of matches) {
    if (match.status !== MatchStatus.Completed) continue;

    const tA = match.teamA;
    const tB = match.teamB;

    if (!tableMap[tA] || !tableMap[tB]) continue;

    tableMap[tA].played += 1;
    tableMap[tB].played += 1;

    // Check winner
    if (match.winner === "Tie" || match.winner === "Tied" || match.resultMessage?.toLowerCase().includes("tied") || match.resultMessage?.toLowerCase().includes("draw")) {
      tableMap[tA].tied += 1;
      tableMap[tB].tied += 1;
      tableMap[tA].points += 1;
      tableMap[tB].points += 1;
    } else if (match.winner === tA) {
      tableMap[tA].won += 1;
      tableMap[tA].points += 2;
      tableMap[tB].lost += 1;
    } else if (match.winner === tB) {
      tableMap[tB].won += 1;
      tableMap[tB].points += 2;
      tableMap[tA].lost += 1;
    }

    // Accumulate scores and NRR details
    const inn1 = match.innings1;
    const inn2 = match.innings2;

    if (inn1 && inn2) {
      const bpo = match.ballsPerOver || 6;

      // Innings 1: Team 1 batting, Team 2 bowling
      const team1 = inn1.battingTeam;
      const team2 = inn1.bowlingTeam;

      if (tableMap[team1] && tableMap[team2]) {
        // Runs
        tableMap[team1].runsScored += inn1.runs;
        tableMap[team2].runsConceded += inn1.runs;

        // Wickets
        tableMap[team1].wicketsLost = (tableMap[team1].wicketsLost || 0) + inn1.wickets;
        tableMap[team2].wicketsTaken = (tableMap[team2].wicketsTaken || 0) + inn1.wickets;

        // Overs Faced by Team 1
        // If team1 is all out, they are considered to have faced full allotted overs
        const isTeam1AllOut = inn1.wickets >= 10;
        const ballsFaced1 = isTeam1AllOut ? match.maxOvers * bpo : inn1.balls;
        tableMap[team1].oversFaced += ballsFaced1 / bpo;

        // Overs Bowled by Team 2 (which is the same as faced by Team 1)
        tableMap[team2].oversBowled += ballsFaced1 / bpo;
      }

      // Innings 2: Team 2 batting, Team 1 bowling
      const team2Batting = inn2.battingTeam;
      const team1Bowling = inn2.bowlingTeam;

      if (tableMap[team2Batting] && tableMap[team1Bowling]) {
        // Runs
        tableMap[team2Batting].runsScored += inn2.runs;
        tableMap[team1Bowling].runsConceded += inn2.runs;

        // Wickets
        tableMap[team2Batting].wicketsLost = (tableMap[team2Batting].wicketsLost || 0) + inn2.wickets;
        tableMap[team1Bowling].wicketsTaken = (tableMap[team1Bowling].wicketsTaken || 0) + inn2.wickets;

        // Overs Faced by Team 2
        // Note: in a second innings, if Team 2 wins by chasing, they might face less than maxOvers but they are NOT all out,
        // so we use actual balls. But if they are all out, they are considered to have faced full allotted overs.
        const isTeam2AllOut = inn2.wickets >= 10;
        const ballsFaced2 = isTeam2AllOut ? match.maxOvers * bpo : inn2.balls;
        tableMap[team2Batting].oversFaced += ballsFaced2 / bpo;

        // Overs Bowled by Team 1 (same as faced by Team 2)
        tableMap[team1Bowling].oversBowled += ballsFaced2 / bpo;
      }
    }
  }

  // Apply manual adjustments
  for (const adj of adjustments) {
    const stats = tableMap[adj.teamName];
    if (stats) {
      stats.points += adj.pointsAdjustment;
      stats.runsScored += adj.runsScoredAdjustment;
      stats.oversFaced += adj.oversFacedAdjustment;
      stats.runsConceded += adj.runsConcededAdjustment;
      stats.oversBowled += adj.oversBowledAdjustment;
    }
  }

  // Calculate NRR for each team
  const result: TeamStats[] = Object.values(tableMap).map((stats) => {
    const runRateScored = stats.oversFaced > 0 ? stats.runsScored / stats.oversFaced : 0;
    const runRateConceded = stats.oversBowled > 0 ? stats.runsConceded / stats.oversBowled : 0;
    const basicNrr = runRateScored - runRateConceded;

    const adj = adjustments.find((a) => a.teamName === stats.teamName);
    const nrrAdj = adj ? adj.nrrAdjustment : 0;
    const nrr = basicNrr + nrrAdj;

    return {
      ...stats,
      nrr: parseFloat(nrr.toFixed(3)),
    };
  });

  // Sort by Points (descending), then NRR (descending)
  return result.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.nrr - a.nrr;
  });
}
