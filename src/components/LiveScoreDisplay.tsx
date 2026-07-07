/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, InningsState, DismissalType, CommitteeMember } from "../types";
import {
  formatOvers,
  calculateStrikeRate,
  calculateEconomyRate,
  calculateRequiredRunRate,
  calculateCurrentRunRate,
} from "../utils";
import { AlertCircle, ArrowRight, Award, Zap, RefreshCw, Trophy, FileDown } from "lucide-react";
import { downloadMatchReportPDF } from "../utils/pdfReport";

interface LiveScoreDisplayProps {
  match: Match;
  allMatches?: Match[];
  committeeMembers?: CommitteeMember[];
}

export default function LiveScoreDisplay({ match, allMatches = [], committeeMembers = [] }: LiveScoreDisplayProps) {
  // Extract active innings data
  const isFirstInnings = match.currentInnings === 1;
  const inn = isFirstInnings ? match.innings1 : match.innings2;
  const oppInn = isFirstInnings ? match.innings2 : match.innings1; // opponent in case we need target

  if (!inn) {
    return (
      <div id="no-live-data-container" className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-8 text-center shadow-xl">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-bounce" />
        <h3 className="text-lg font-display font-bold text-white mb-1">Match Scoring Not Started</h3>
        <p className="text-emerald-400/70 text-sm max-w-sm mx-auto">
          The admin (Arsaam) hasn't initialized the scoring for this match yet. Check back once the match begins!
        </p>
      </div>
    );
  }

  // Calculate critical values
  const bpo = match.ballsPerOver || 6;
  const currentRuns = inn.runs;
  const currentWickets = inn.wickets;
  const currentBalls = inn.balls;
  const currentOversStr = formatOvers(currentBalls, bpo);
  const crr = calculateCurrentRunRate(currentRuns, currentBalls, bpo);

  // 2nd innings calculations
  const isSecondInnings = match.currentInnings === 2;
  const target = isSecondInnings && match.innings1 ? match.innings1.runs + 1 : 0;
  const runsNeeded = target - currentRuns;
  const totalInningsBalls = match.maxOvers * bpo;
  const ballsRemaining = Math.max(0, totalInningsBalls - currentBalls);
  const rrr = isSecondInnings ? calculateRequiredRunRate(runsNeeded, ballsRemaining, bpo) : "0.00";

  // Active Batsmen
  const striker = inn.batsmen[inn.strikerIndex];
  const nonStriker = inn.batsmen[inn.nonStrikerIndex];

  // Active Bowler
  const currentBowler = inn.bowlers[inn.currentBowlerIndex];

  // Determine Match Winner Status
  const isMatchFinished = match.status === "Completed";

  return (
    <div id="live-score-display-container" className="space-y-6">
      {/* 1. Primary Broadcast Scoreboard Header */}
      <div className="bg-gradient-to-br from-[#0c3117] to-[#041a0d] border border-emerald-800/60 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative elements - stadium floodlight effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-1 bg-yellow-500/30 blur-md rounded-full"></div>
        <div className="absolute top-0 right-12 w-20 h-20 bg-yellow-500/5 blur-2xl rounded-full"></div>

        {/* Live / Completed status ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/50 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-yellow-500 font-display">
              {match.isSuperOver ? "SUPER OVER MODE" : isSecondInnings ? "2nd Innings Live" : "1st Innings Live"}
            </span>
          </div>

          {match.tossWinner && (
            <div className="text-[11px] text-emerald-300 font-medium bg-emerald-950/80 border border-emerald-900/60 px-3 py-1 rounded-full">
              Toss: <span className="text-white font-semibold">{match.tossWinner}</span> won &amp; chose to <span className="text-yellow-500 font-bold lowercase">{match.tossDecision === "Bat" ? "Bat" : "Bowl"}</span>
            </div>
          )}
        </div>

        {/* Major Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Live Score Counter */}
          <div className="md:col-span-7 flex flex-col justify-center">
            <span className="text-emerald-400 text-xs uppercase font-bold tracking-wider mb-1">
              {inn.battingTeam} is Batting
            </span>
            <div className="flex items-baseline gap-3">
              <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tight">
                {currentRuns}
                <span className="text-emerald-500 font-light">/</span>
                <span className="text-yellow-500">{currentWickets}</span>
              </h1>
              <span className="text-lg md:text-xl font-mono text-emerald-300 font-medium">
                ({currentOversStr} <span className="text-xs text-emerald-400/70">Overs</span>)
              </span>
            </div>
          </div>

          {/* Innings Target or Run Rates */}
          <div className="md:col-span-5 bg-[#04160b]/80 border border-emerald-900/50 rounded-2xl p-4 flex flex-col justify-center">
            {isSecondInnings ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-medium">Target Score:</span>
                  <span className="text-white font-mono font-bold text-sm bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-500">
                    {target} Runs
                  </span>
                </div>
                {runsNeeded > 0 ? (
                  <p className="text-sm font-semibold text-white pt-1">
                    Need <span className="text-yellow-500 font-bold font-mono">{runsNeeded}</span> runs in{" "}
                    <span className="text-emerald-400 font-bold font-mono">{ballsRemaining}</span> balls
                  </p>
                ) : (
                  <p className="text-sm font-bold text-emerald-400 pt-1">
                    Target achieved!
                  </p>
                )}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-900/40">
                  <span className="text-emerald-500">Req Rate: <span className="text-white font-mono font-bold">{rrr}</span></span>
                  <span className="text-emerald-500">Cur Rate: <span className="text-white font-mono font-bold">{crr}</span></span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 block font-medium">Current Run Rate</span>
                  <span className="text-2xl font-mono font-black text-white">{crr}</span>
                </div>
                {match.innings1 && (
                  <div className="text-right">
                    <span className="text-xs text-emerald-500 block">Projected ({match.maxOvers} ov)</span>
                    <span className="text-lg font-mono font-bold text-emerald-300">
                      {Math.round(parseFloat(crr) * match.maxOvers)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Current Batting Partnership Tracker */}
        <div className="mt-4 bg-[#051c0e] border border-emerald-950 rounded-xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Current Partnership:
            </span>
          </div>
          <span className="text-sm text-white font-bold font-mono">
            {inn.partnershipRuns} <span className="text-xs text-emerald-400 font-normal">Runs off</span> {inn.partnershipBalls} <span className="text-xs text-emerald-400 font-normal">Balls</span>
          </span>
        </div>

        {/* Auto Result Overlay if match is Completed */}
        {isMatchFinished && match.resultMessage && (
          <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-4 text-center z-20 backdrop-blur-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-display font-black text-white mb-1">
              Match Completed!
            </h2>
            <p className="text-yellow-400 font-semibold text-lg max-w-md mx-auto mb-4">
              {match.resultMessage}
            </p>
            {match.manOfTheMatch && (
              <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3.5 py-1.5 rounded-full text-xs text-white">
                <Award className="w-4 h-4 text-yellow-500" />
                Man of the Match: <span className="text-yellow-400 font-bold">{match.manOfTheMatch}</span>
              </div>
            )}
            <button
              onClick={() => downloadMatchReportPDF(match, allMatches, committeeMembers)}
              className="mt-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-emerald-950 font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:shadow-yellow-500/10 cursor-pointer active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              Download Match Report PDF
            </button>
          </div>
        )}
      </div>

      {/* 2. Active Players Board (Batsmen & Bowlers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Batsmen Board */}
        <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 md:p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 font-display">
            Batting
          </h3>
          <div className="space-y-3">
            {/* Striker */}
            {striker ? (
              <div className="bg-[#05140b] border border-yellow-500/20 rounded-xl p-3 flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-r"></div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{striker.name}</span>
                    <span className="bg-yellow-500 text-emerald-950 text-[9px] font-extrabold px-1 py-0.2 rounded uppercase">
                      Strike
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-mono">
                    SR: {calculateStrikeRate(striker.runs, striker.balls)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-white font-mono">
                    {striker.runs}
                    <span className="text-xs font-normal text-emerald-400"> ({striker.balls}b)</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-mono">
                    4s: <span className="text-emerald-300 font-bold">{striker.fours}</span> | 6s: <span className="text-emerald-300 font-bold">{striker.sixes}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-emerald-600 text-xs italic text-center py-4">No batsman on strike</div>
            )}

            {/* Non-Striker */}
            {nonStriker ? (
              <div className="bg-[#05140b]/60 border border-emerald-900/40 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-200 text-sm">{nonStriker.name}</span>
                  <div className="text-[10px] text-emerald-500 font-mono">
                    SR: {calculateStrikeRate(nonStriker.runs, nonStriker.balls)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-100 font-mono">
                    {nonStriker.runs}
                    <span className="text-xs font-normal text-emerald-400"> ({nonStriker.balls}b)</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-mono">
                    4s: <span className="text-emerald-300 font-bold">{nonStriker.fours}</span> | 6s: <span className="text-emerald-300 font-bold">{nonStriker.sixes}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-emerald-600 text-xs italic text-center py-4">No non-striker batsman</div>
            )}
          </div>
        </div>

        {/* Bowler Board */}
        <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 md:p-5 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 font-display">
            Bowling
          </h3>
          {currentBowler ? (
            <div className="bg-[#05140b] border border-emerald-800/60 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="font-bold text-white text-sm">{currentBowler.name}</span>
                <div className="text-[10px] text-emerald-500 font-mono">
                  Econ: {calculateEconomyRate(currentBowler.runsConceded, currentBowler.ballsBowled, bpo)}
                </div>
              </div>
              <div className="text-right grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 block">O</span>
                  <span className="text-sm font-bold text-white font-mono">{formatOvers(currentBowler.ballsBowled, bpo)}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 block">M</span>
                  <span className="text-sm font-bold text-white font-mono">{currentBowler.maidens}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 block">R</span>
                  <span className="text-sm font-bold text-white font-mono">{currentBowler.runsConceded}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 block">W</span>
                  <span className="text-sm font-black text-yellow-500 font-mono">{currentBowler.wickets}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-emerald-600 text-xs italic text-center py-6">No bowler active</div>
          )}
        </div>
      </div>

      {/* 3. Over History Dots & Ball-by-ball Log */}
      <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 md:p-5 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 font-display">
          This Over
        </h3>
        <div className="flex flex-wrap gap-2.5 items-center mb-4">
          {inn.overHistory.length === 0 ? (
            <span className="text-xs text-emerald-600 italic">Waiting for first ball...</span>
          ) : (
            inn.overHistory.map((ball, i) => {
              const isWicket = ball.startsWith("W") && !ball.includes("Wd") && !ball.includes("Nb");
              const isBoundary = ball === "4" || ball === "6";
              const isExtra = ball.includes("Wd") || ball.includes("Nb") || ball.includes("B") || ball.includes("Lb");

              let dotColor = "bg-emerald-950 text-emerald-300 border border-emerald-900/60";
              if (isWicket) dotColor = "bg-red-600 text-white font-bold border border-red-500";
              else if (isBoundary) dotColor = "bg-yellow-500 text-emerald-950 font-black border border-yellow-400";
              else if (isExtra) dotColor = "bg-blue-950 text-blue-300 border border-blue-900";

              return (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-mono font-bold ${dotColor} shadow-sm`}
                >
                  {ball}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Split View: Fall of Wickets & Commentary list */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Fall of Wickets Table */}
        <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 md:p-5 shadow-lg md:col-span-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 font-display">
            Fall of Wickets
          </h3>
          {inn.fallOfWickets.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-emerald-900/30 rounded-xl text-emerald-600 text-xs">
              No wickets fallen yet in this innings.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-emerald-500 border-b border-emerald-950 pb-1 uppercase tracking-wider font-bold">
                    <th className="pb-2">Wkt</th>
                    <th className="pb-2">Score</th>
                    <th className="pb-2">Over</th>
                    <th className="pb-2">Batsman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/40">
                  {inn.fallOfWickets.map((fow) => (
                    <tr key={fow.wicketNumber} className="text-white hover:bg-emerald-950/20">
                      <td className="py-2 text-yellow-500 font-bold">{fow.wicketNumber}</td>
                      <td className="py-2 font-bold">{fow.score}-{fow.wickets}</td>
                      <td className="py-2 text-emerald-400">{fow.overs}</td>
                      <td className="py-2 text-emerald-200 truncate max-w-[120px]">{fow.batsmanName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commentary List */}
        <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 md:p-5 shadow-lg md:col-span-7">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 font-display">
            Live Commentary
          </h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {inn.commentary.length === 0 ? (
              <div className="text-center py-10 text-emerald-600 text-xs italic">
                Commentary will populate once the live action begins...
              </div>
            ) : (
              inn.commentary.map((log, index) => {
                const isWicket = log.includes("WICKET") || log.includes("OUT");
                const isBoundary = log.includes("FOUR") || log.includes("SIX") || log.includes("hits a six") || log.includes("hits a four");

                let logBg = "bg-[#05140b] border border-emerald-950 text-emerald-200";
                if (isWicket) logBg = "bg-red-950/20 border border-red-900/30 text-red-200";
                else if (isBoundary) logBg = "bg-yellow-500/5 border border-yellow-500/10 text-yellow-400";

                return (
                  <div key={index} className={`rounded-xl p-2.5 text-xs ${logBg} flex items-start gap-2`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{log}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
