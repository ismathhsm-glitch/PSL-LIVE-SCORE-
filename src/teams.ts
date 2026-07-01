/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ORIGINAL_TEAMS = [
  "Cricket Hitters",
  "Golden Eagles",
  "Trending 11",
  "Royal Diamond",
  "Silent Killers",
  "Royal Kings",
  "Trophy Fighters",
  "Big Beaters"
];

// --- EDIT TEAM NAMES HERE ---
// Any changes to these names will automatically propagate everywhere in the application
// (fixtures, standings, scorecards, points table, schedules, live updates, etc.).
export const CONFIG_TEAMS = [
  "Cricket Hitters",
  "Golden Eagles",
  "Trending 11",
  "Royal Diamond",
  "Silent Killers",
  "Royal Kings",
  "Trophy Fighters",
  "Big Beaters"
];

export const getTeamNameMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  ORIGINAL_TEAMS.forEach((original, index) => {
    map[original] = CONFIG_TEAMS[index] || original;
  });
  return map;
};

/**
 * Translates any original team name to the current configured name
 */
export function translateTeamName(name: string | undefined): string {
  if (!name) return "";
  const map = getTeamNameMap();
  return map[name] || name;
}

/**
 * Clean and migrate saved matches from localStorage to use the updated configured team names.
 * This guarantees that when a user edits the team names, the changes are instantly visible
 * even for matches loaded from persistence (localStorage).
 */
export function migrateSavedMatches(savedMatches: any[]): any[] {
  if (!Array.isArray(savedMatches)) return savedMatches;

  const map = getTeamNameMap();

  const findCurrentName = (name: string | undefined): string => {
    if (!name) return "";
    
    // Check if it is one of the original team names
    const origIndex = ORIGINAL_TEAMS.indexOf(name);
    if (origIndex !== -1) {
      return CONFIG_TEAMS[origIndex];
    }
    
    // If it's already one of the current configured names, keep it
    if (CONFIG_TEAMS.includes(name)) {
      return name;
    }

    // Fallback to mapped or original
    return map[name] || name;
  };

  return savedMatches.map((match) => {
    if (!match) return match;
    const updated = { ...match };
    updated.teamA = findCurrentName(updated.teamA);
    updated.teamB = findCurrentName(updated.teamB);
    
    if (updated.winner && updated.winner !== "Tie" && updated.winner !== "Tied" && updated.winner !== "Draw") {
      updated.winner = findCurrentName(updated.winner);
    }
    if (updated.tossWinner) {
      updated.tossWinner = findCurrentName(updated.tossWinner);
    }
    
    if (updated.innings1) {
      updated.innings1 = {
        ...updated.innings1,
        battingTeam: findCurrentName(updated.innings1.battingTeam),
        bowlingTeam: findCurrentName(updated.innings1.bowlingTeam)
      };
    }
    
    if (updated.innings2) {
      updated.innings2 = {
        ...updated.innings2,
        battingTeam: findCurrentName(updated.innings2.battingTeam),
        bowlingTeam: findCurrentName(updated.innings2.bowlingTeam)
      };
    }
    
    if (updated.superOverInnings1) {
      updated.superOverInnings1 = {
        ...updated.superOverInnings1,
        battingTeam: findCurrentName(updated.superOverInnings1.battingTeam),
        bowlingTeam: findCurrentName(updated.superOverInnings1.bowlingTeam)
      };
    }
    
    if (updated.superOverInnings2) {
      updated.superOverInnings2 = {
        ...updated.superOverInnings2,
        battingTeam: findCurrentName(updated.superOverInnings2.battingTeam),
        bowlingTeam: findCurrentName(updated.superOverInnings2.bowlingTeam)
      };
    }
    
    return updated;
  });
}
