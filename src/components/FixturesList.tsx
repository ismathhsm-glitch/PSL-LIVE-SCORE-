/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, MatchStatus } from "../types";
import { formatOvers } from "../utils";
import { Calendar, MapPin, Play, Trophy, Users, Award, Trash2 } from "lucide-react";

interface FixturesListProps {
  matches: Match[];
  isAdmin: boolean;
  onStartScoring: (matchId: string) => void;
  onViewMatch: (matchId: string) => void;
  activeMatchId: string | null;
  onDeleteMatch?: (matchId: string) => void;
}

export default function FixturesList({
  matches,
  isAdmin,
  onStartScoring,
  onViewMatch,
  activeMatchId,
  onDeleteMatch,
}: FixturesListProps) {
  return (
    <div id="fixtures-list-section" className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-500" />
          PSL 2026 Fixtures &amp; Results
        </h2>
        <span className="text-xs text-emerald-400 font-medium">
          {matches.length} Matches Scheduled
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {matches.map((match) => {
          const isLive = match.status === MatchStatus.Live;
          const isCompleted = match.status === MatchStatus.Completed;
          const isCurrentActive = activeMatchId === match.id;

          // Helper to get formatted match score
          const renderInningsScore = (teamName: string, inn: any) => {
            if (!inn) return null;
            return (
              <span className="text-sm font-mono font-bold text-white">
                {inn.runs}/{inn.wickets} <span className="text-xs text-emerald-400 font-normal">({formatOvers(inn.balls)} ov)</span>
              </span>
            );
          };

          return (
            <div
              key={match.id}
              className={`bg-[#0b2513] border rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-emerald-800/80 ${
                isLive
                  ? "border-yellow-500/50 shadow-yellow-500/5 ring-1 ring-yellow-500/20"
                  : isCurrentActive
                  ? "border-emerald-500/60"
                  : "border-emerald-900/40"
              }`}
            >
              {/* Top Row - Status Badge & Date */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  {match.date}
                </span>

                {isLive && (
                  <span className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 px-2.5 py-0.5 rounded-full text-[10px] text-red-400 font-bold uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Live Now
                  </span>
                )}

                {isCompleted && (
                  <span className="bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    Completed
                  </span>
                )}

                {!isLive && !isCompleted && (
                  <span className="bg-emerald-950/30 border border-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                    Upcoming
                  </span>
                )}
              </div>

              {/* Match details & Teams */}
              <div className="space-y-3.5 mb-5">
                {/* Team 1 Row */}
                <div className="flex items-center justify-between">
                  <span className={`font-display text-base font-bold ${isCompleted && match.winner === match.teamA ? "text-yellow-500" : "text-white"}`}>
                    {match.teamA}
                  </span>
                  {renderInningsScore(match.teamA, match.innings1)}
                </div>

                {/* Team 2 Row */}
                <div className="flex items-center justify-between">
                  <span className={`font-display text-base font-bold ${isCompleted && match.winner === match.teamB ? "text-yellow-500" : "text-white"}`}>
                    {match.teamB}
                  </span>
                  {renderInningsScore(match.teamB, match.innings2)}
                </div>
              </div>

              {/* Venue Info */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-400/70 border-t border-emerald-950 pt-3 mb-4">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{match.venue}</span>
              </div>

              {/* Match Result Display if completed */}
              {isCompleted && match.resultMessage && (
                <div className="bg-emerald-950/50 border border-emerald-900/60 rounded-xl p-2.5 mb-4 text-xs font-semibold text-center text-yellow-400/95 flex items-center justify-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                  <span>{match.resultMessage}</span>
                  {match.manOfTheMatch && (
                    <span className="text-[11px] text-emerald-300 font-normal border-l border-emerald-800 pl-1.5 ml-1.5 flex items-center gap-0.5">
                      <Award className="w-3 h-3 text-yellow-500 shrink-0" />
                      MoM: {match.manOfTheMatch}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5">
                <button
                  id={`view-match-btn-${match.id}`}
                  onClick={() => onViewMatch(match.id)}
                  className={`flex-1 font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrentActive
                      ? "bg-yellow-500 text-emerald-950 font-bold hover:bg-yellow-400"
                      : "bg-[#05140b] border border-emerald-800 text-emerald-300 hover:bg-emerald-950 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  {isLive ? "View Live Scoreboard" : "View Scorecard"}
                </button>

                {isAdmin && (isLive || !isCompleted) && (
                  <button
                    id={`score-match-btn-${match.id}`}
                    onClick={() => onStartScoring(match.id)}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-md active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isLive ? "Keep Scoring" : "Setup & Start Match"}
                  </button>
                )}

                {isAdmin && onDeleteMatch && (
                  <button
                    onClick={() => onDeleteMatch(match.id)}
                    className="bg-red-950/25 hover:bg-red-900/50 text-red-400 p-2 px-3.5 rounded-xl border border-red-900/30 transition-all flex items-center justify-center gap-1 active:scale-95 shadow-md"
                    title="Delete Match"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
