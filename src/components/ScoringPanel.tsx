/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Match, DismissalType, MatchStatus, InningsState } from "../types";
import { PSL_TEAMS } from "../initialData";
import { formatOvers } from "../utils";
import {
  RotateCw,
  Undo2,
  Trash2,
  Play,
  User,
  Activity,
  AlertCircle,
  HelpCircle,
  Award,
  Crown
} from "lucide-react";

interface ScoringPanelProps {
  match: Match;
  onInitializeMatch: (
    teamA: string,
    teamB: string,
    maxOvers: number,
    tossWinner: string,
    tossDecision: "Bat" | "Bowl",
    striker: string,
    nonStriker: string,
    bowler: string,
    ballsPerOver?: number
  ) => void;
  onScoreRun: (runs: number) => void;
  onScoreExtra: (type: "Wide" | "No Ball" | "Bye" | "Leg Bye", runsRun: number) => void;
  onScoreWicket: (dismissalType: DismissalType, newBatsmanName: string) => void;
  onUndo: () => void;
  onRotateStrike: () => void;
  onStartInnings2: (striker: string, nonStriker: string, bowler: string) => void;
  onEndMatch: (manOfTheMatch: string) => void;
  onStartSuperOver: (striker: string, nonStriker: string, bowler: string) => void;
  onResetMatch: () => void;
}

export default function ScoringPanel({
  match,
  onInitializeMatch,
  onScoreRun,
  onScoreExtra,
  onScoreWicket,
  onUndo,
  onRotateStrike,
  onStartInnings2,
  onEndMatch,
  onStartSuperOver,
  onResetMatch,
}: ScoringPanelProps) {
  // 1. Setup Form States
  const [setupTeamA, setSetupTeamA] = useState(match.teamA || PSL_TEAMS[0]);
  const [setupTeamB, setSetupTeamB] = useState(match.teamB || PSL_TEAMS[1]);
  const [setupMaxOvers, setSetupMaxOvers] = useState(20);
  const [setupBallsPerOver, setSetupBallsPerOver] = useState(6);
  const [tossWinner, setTossWinner] = useState(match.teamA || PSL_TEAMS[0]);
  const [tossDecision, setTossDecision] = useState<"Bat" | "Bowl">("Bat");
  const [strikerName, setStrikerName] = useState("");
  const [nonStrikerName, setNonStrikerName] = useState("");
  const [bowlerName, setBowlerName] = useState("");

  // 2. Mid-match interactive states
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [dismissalType, setDismissalType] = useState<DismissalType>(DismissalType.Bowled);
  const [newBatsmanName, setNewBatsmanName] = useState("");

  const [selectedExtraType, setSelectedExtraType] = useState<"Wide" | "No Ball" | "Bye" | "Leg Bye" | null>(null);
  const [extraRunsRun, setExtraRunsRun] = useState<number>(0);

  const [manOfTheMatchInput, setManOfTheMatchInput] = useState("");
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);

  // Switch team choices automatically when Team A is chosen
  const handleTeamAChange = (val: string) => {
    setSetupTeamA(val);
    setTossWinner(val);
    if (val === setupTeamB) {
      const remaining = PSL_TEAMS.find((t) => t !== val) || "";
      setSetupTeamB(remaining);
    }
  };

  const handleStartInnings1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strikerName.trim() || !nonStrikerName.trim() || !bowlerName.trim()) {
      alert("Please fill in batsman and bowler names to start!");
      return;
    }
    onInitializeMatch(
      setupTeamA,
      setupTeamB,
      setupMaxOvers,
      tossWinner,
      tossDecision,
      strikerName.trim(),
      nonStrikerName.trim(),
      bowlerName.trim(),
      setupBallsPerOver
    );
  };

  // 2nd innings setup
  const [inn2Striker, setInn2Striker] = useState("");
  const [inn2NonStriker, setInn2NonStriker] = useState("");
  const [inn2Bowler, setInn2Bowler] = useState("");
  const [showInn2Setup, setShowInn2Setup] = useState(false);

  const handleStartInnings2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inn2Striker.trim() || !inn2NonStriker.trim() || !inn2Bowler.trim()) {
      alert("Please fill in batsman and bowler names to start 2nd Innings!");
      return;
    }
    onStartInnings2(inn2Striker.trim(), inn2NonStriker.trim(), inn2Bowler.trim());
    setShowInn2Setup(false);
  };

  // Super Over Setup
  const [superStriker, setSuperStriker] = useState("");
  const [superNonStriker, setSuperNonStriker] = useState("");
  const [superBowler, setSuperBowler] = useState("");
  const [showSuperSetup, setShowSuperSetup] = useState(false);

  const handleSuperOverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superStriker.trim() || !superNonStriker.trim() || !superBowler.trim()) {
      alert("Please fill in all names for the Super Over!");
      return;
    }
    onStartSuperOver(superStriker.trim(), superNonStriker.trim(), superBowler.trim());
    setShowSuperSetup(false);
  };

  // Handle scoring wicket
  const handleWicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatsmanName.trim()) {
      alert("Please enter the name of the incoming batsman!");
      return;
    }
    onScoreWicket(dismissalType, newBatsmanName.trim());
    setNewBatsmanName("");
    setShowWicketModal(false);
  };

  // Handle scoring extra
  const handleApplyExtra = (runsRunCount: number) => {
    if (!selectedExtraType) return;
    onScoreExtra(selectedExtraType, runsRunCount);
    setSelectedExtraType(null);
    setExtraRunsRun(0);
  };

  // Switch/Active Innings info
  const isUpcoming = match.status === MatchStatus.Upcoming;
  const isLive = match.status === MatchStatus.Live;
  const isCompleted = match.status === MatchStatus.Completed;
  const isFirstInnings = match.currentInnings === 1;
  const inn = isFirstInnings ? match.innings1 : match.innings2;

  // Render Setup state if upcoming
  if (isUpcoming) {
    return (
      <div id="setup-scoring-form" className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-6 md:p-8 shadow-xl max-w-2xl mx-auto">
        <div className="text-center mb-6 border-b border-emerald-950 pb-4">
          <h2 className="text-2xl font-display font-black text-white flex items-center justify-center gap-2">
            <Activity className="w-6 h-6 text-yellow-500" />
            PSL 2026 Match Setup
          </h2>
          <p className="text-xs text-emerald-400 mt-1">
            Initialize the match teams, overs, toss decision, and starting players
          </p>
        </div>

        <form onSubmit={handleStartInnings1Submit} className="space-y-6">
          {/* Teams Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="teama-select">
                Team A (Batting/Bowling)
              </label>
              <select
                id="teama-select"
                value={setupTeamA}
                onChange={(e) => handleTeamAChange(e.target.value)}
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                {PSL_TEAMS.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="teamb-select">
                Team B (Opponent)
              </label>
              <select
                id="teamb-select"
                value={setupTeamB}
                onChange={(e) => setSetupTeamB(e.target.value)}
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                {PSL_TEAMS.filter((t) => t !== setupTeamA).map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overs & Toss Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="overs-input">
                Match Overs
              </label>
              <input
                id="overs-input"
                type="number"
                min="1"
                max="50"
                value={setupMaxOvers}
                onChange={(e) => setSetupMaxOvers(parseInt(e.target.value, 10) || 20)}
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="balls-per-over-input">
                Balls Per Over
              </label>
              <input
                id="balls-per-over-input"
                type="number"
                min="1"
                max="10"
                value={setupBallsPerOver}
                onChange={(e) => setSetupBallsPerOver(parseInt(e.target.value, 10) || 6)}
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="toss-winner-select">
                Toss Won By
              </label>
              <select
                id="toss-winner-select"
                value={tossWinner}
                onChange={(e) => setTossWinner(e.target.value)}
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value={setupTeamA}>{setupTeamA}</option>
                <option value={setupTeamB}>{setupTeamB}</option>
              </select>
            </div>

            <div>
              <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="toss-decision-select">
                Toss Decision
              </label>
              <select
                id="toss-decision-select"
                value={tossDecision}
                onChange={(e) => setTossDecision(e.target.value as "Bat" | "Bowl")}
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="Bat">Bat First</option>
                <option value="Bowl">Bowl First</option>
              </select>
            </div>
          </div>

          {/* Starting Players Input */}
          <div className="border-t border-emerald-950 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-500">
              1st Innings Players
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-emerald-400 text-[11px] font-semibold mb-1" htmlFor="striker-name-input">
                  Striker Batsman Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    id="striker-name-input"
                    type="text"
                    value={strikerName}
                    onChange={(e) => setStrikerName(e.target.value)}
                    placeholder="e.g. Babar Azam"
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-400 text-[11px] font-semibold mb-1" htmlFor="nonstriker-name-input">
                  Non-Striker Batsman
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    id="nonstriker-name-input"
                    type="text"
                    value={nonStrikerName}
                    onChange={(e) => setNonStrikerName(e.target.value)}
                    placeholder="e.g. Mohammad Rizwan"
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-400 text-[11px] font-semibold mb-1" htmlFor="bowler-name-input">
                  Opening Bowler Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    id="bowler-name-input"
                    type="text"
                    value={bowlerName}
                    onChange={(e) => setBowlerName(e.target.value)}
                    placeholder="e.g. Shaheen Afridi"
                    className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-950">
            <button
              id="start-match-btn"
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-emerald-950 font-black py-3 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current animate-pulse" />
              Lock Rosters &amp; Start Match
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Live and Scoring controls
  return (
    <div id="live-scoring-panel-container" className="space-y-6">
      {/* Mini state reminder */}
      <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-xs text-emerald-300 font-semibold uppercase">
            Active: <span className="text-white font-bold">{match.teamA} vs {match.teamB}</span>
          </span>
          <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono font-semibold">
            Innings {match.currentInnings}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            id="rotate-strike-btn"
            onClick={onRotateStrike}
            className="bg-[#05140b] border border-emerald-800 text-emerald-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Swap batsman striker ends"
          >
            <RotateCw className="w-3.5 h-3.5 text-yellow-500" />
            Rotate Strike
          </button>
          <button
            id="undo-last-ball-btn"
            onClick={onUndo}
            className="bg-[#05140b] border border-red-950 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors hover:bg-red-950/20"
            title="Revert previous ball entry"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo Last Ball
          </button>
        </div>
      </div>

      {/* Primary Scoring Control Deck (LARGE BUTTONS) */}
      <div className="bg-[#0c2e17] border border-emerald-800/50 rounded-3xl p-5 md:p-6 shadow-xl">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-yellow-500 mb-4 text-center border-b border-emerald-950 pb-2">
          Tap to Score This Ball
        </h3>

        {/* Runs Buttons Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
          {[0, 1, 2, 3, 4, 6].map((runs) => (
            <button
              id={`score-runs-btn-${runs}`}
              key={runs}
              onClick={() => onScoreRun(runs)}
              className="h-16 rounded-2xl bg-[#05140b] border border-emerald-800/80 text-white hover:border-yellow-500 hover:bg-emerald-950 font-mono font-black text-2xl flex flex-col items-center justify-center transition-all shadow active:scale-95 hover:shadow-yellow-500/5"
            >
              <span className="text-2xl">{runs}</span>
              <span className="text-[10px] text-emerald-500 font-normal tracking-wide lowercase">
                {runs === 1 ? "run" : runs === 4 || runs === 6 ? "boundary" : "runs"}
              </span>
            </button>
          ))}
        </div>

        {/* Wicket & Extras Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Wicket Section */}
          <div className="bg-[#05140b]/80 border border-emerald-900/60 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase font-bold text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                Dismissal
              </span>
              <span className="text-[10px] text-emerald-500">ICC Rule Validated</span>
            </div>
            <button
              id="open-wicket-modal-btn"
              onClick={() => setShowWicketModal(true)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              Wicket Out! 🔴
            </button>
          </div>

          {/* Extras Options */}
          <div className="bg-[#05140b]/80 border border-emerald-900/60 rounded-2xl p-4">
            <span className="text-xs uppercase font-bold text-blue-400 block mb-3">
              Extras &amp; Runs
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["Wide", "No Ball", "Bye", "Leg Bye"] as const).map((type) => (
                <button
                  id={`select-extra-btn-${type.toLowerCase().replace(" ", "")}`}
                  key={type}
                  onClick={() => setSelectedExtraType(type)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedExtraType === type
                      ? "bg-blue-600 border-blue-500 text-white font-extrabold scale-105"
                      : "bg-[#0b2513] border-emerald-900 text-emerald-300 hover:text-white hover:border-emerald-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Popover Additional Runs for Extras */}
        {selectedExtraType && (
          <div id="extras-popover" className="mt-5 bg-blue-950/80 border border-blue-800/60 rounded-2xl p-4 animate-fade-in relative">
            <button
              id="close-extras-popover"
              onClick={() => setSelectedExtraType(null)}
              className="absolute top-3 right-3 text-blue-400 hover:text-white text-xs font-bold"
            >
              Cancel
            </button>
            <h4 className="text-xs uppercase font-bold text-blue-300 mb-3 flex items-center gap-1">
              Select runs run between wickets for {selectedExtraType}
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((runs) => (
                <button
                  id={`apply-extra-runs-btn-${runs}`}
                  key={runs}
                  onClick={() => handleApplyExtra(runs)}
                  className="py-3 rounded-xl bg-blue-900/60 hover:bg-blue-800 border border-blue-800 text-white font-mono font-bold text-sm transition-all active:scale-95"
                >
                  +{runs} Runs
                </button>
              ))}
            </div>
            <p className="text-[10px] text-blue-400 mt-2 text-center">
              Formula: {selectedExtraType === "Wide" || selectedExtraType === "No Ball" ? "1 Pen" : "0 Pen"} + physical runs scored. Strike rotates on odd physical runs.
            </p>
          </div>
        )}
      </div>

      {/* Innings Management Deck & Match End Controls */}
      <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-950 pb-2">
          Match Operations &amp; Actions
        </h3>

        <div className="flex flex-wrap gap-3">
          {/* Innings 2 Setup Trigger */}
          {isLive && isFirstInnings && (
            <button
              id="trigger-innings2-setup-btn"
              onClick={() => setShowInn2Setup(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow active:scale-95"
            >
              End Innings 1 &amp; Start Innings 2
            </button>
          )}

          {/* Super Over Trigger */}
          {isLive && isCompleted && (
            <button
              id="trigger-superover-setup-btn"
              onClick={() => setShowSuperSetup(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow active:scale-95"
            >
              Trigger Tie Super Over Mode
            </button>
          )}

          {/* Complete Match Dialog Trigger */}
          {isLive && (
            <button
              id="trigger-endmatch-modal-btn"
              onClick={() => setShowEndMatchModal(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow active:scale-95 ml-auto"
            >
              Manually Complete Match
            </button>
          )}

          <button
            id="reset-current-scoring-btn"
            onClick={() => {
              if (confirm("Are you sure you want to reset this match scoring entirely?")) {
                onResetMatch();
              }
            }}
            className="bg-red-950 text-red-400 border border-red-900/40 hover:bg-red-900 hover:text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase transition-colors"
          >
            Reset Match
          </button>
        </div>
      </div>

      {/* MODAL 1: WICKET POPUP AND INCOMING BATSMAN PROMPT */}
      {showWicketModal && (
        <div id="wicket-dismissal-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b2513] border border-emerald-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-display font-bold text-white mb-4 uppercase tracking-wider border-b border-emerald-950 pb-2 flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Wicket Dismissal Type
            </h3>

            <form onSubmit={handleWicketSubmit} className="space-y-4">
              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="dismissal-type-select">
                  Dismissal Category
                </label>
                <select
                  id="dismissal-type-select"
                  value={dismissalType}
                  onChange={(e) => setDismissalType(e.target.value as DismissalType)}
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none"
                >
                  {Object.values(DismissalType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="incoming-batsman-input">
                  New Incoming Batsman Name
                </label>
                <input
                  id="incoming-batsman-input"
                  type="text"
                  value={newBatsmanName}
                  onChange={(e) => setNewBatsmanName(e.target.value)}
                  placeholder="e.g. Fakhar Zaman"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  id="cancel-wicket-btn"
                  type="button"
                  onClick={() => setShowWicketModal(false)}
                  className="flex-1 py-2.5 border border-emerald-800 text-emerald-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  id="confirm-wicket-btn"
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase"
                >
                  Record Wicket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: 2ND INNINGS START FORM */}
      {showInn2Setup && (
        <div id="innings2-setup-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b2513] border border-emerald-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4 border-b border-emerald-950 pb-3">
              <h3 className="text-lg font-display font-black text-white flex items-center justify-center gap-1.5">
                <Crown className="w-5 h-5 text-yellow-500" />
                Initialize 2nd Innings
              </h3>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                Enter players for the chasing innings ({match.teamB} batting)
              </p>
            </div>

            <form onSubmit={handleStartInnings2Submit} className="space-y-4">
              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="inn2-striker-input">
                  Striker Batsman Name
                </label>
                <input
                  id="inn2-striker-input"
                  type="text"
                  value={inn2Striker}
                  onChange={(e) => setInn2Striker(e.target.value)}
                  placeholder="e.g. Fakhar Zaman"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="inn2-nonstriker-input">
                  Non-Striker Batsman
                </label>
                <input
                  id="inn2-nonstriker-input"
                  type="text"
                  value={inn2NonStriker}
                  onChange={(e) => setInn2NonStriker(e.target.value)}
                  placeholder="e.g. Haris Sohail"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="inn2-bowler-input">
                  Opening Bowler
                </label>
                <input
                  id="inn2-bowler-input"
                  type="text"
                  value={inn2Bowler}
                  onChange={(e) => setInn2Bowler(e.target.value)}
                  placeholder="e.g. Naseem Shah"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  id="cancel-inn2-btn"
                  type="button"
                  onClick={() => setShowInn2Setup(false)}
                  className="flex-1 py-2.5 border border-emerald-800 text-emerald-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  id="confirm-inn2-btn"
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-black py-2.5 rounded-xl text-xs uppercase"
                >
                  Start Innings 2
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUPER OVER SETUP */}
      {showSuperSetup && (
        <div id="super-over-setup-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b2513] border border-emerald-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4 border-b border-emerald-950 pb-3">
              <h3 className="text-lg font-display font-black text-white flex items-center justify-center gap-1.5">
                <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                Super Over Setup
              </h3>
              <p className="text-[11px] text-purple-300 mt-0.5">
                Match Tied! Enter players for the 1-over Super Over shootout
              </p>
            </div>

            <form onSubmit={handleSuperOverSubmit} className="space-y-4">
              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="super-striker-input">
                  Striker Batsman
                </label>
                <input
                  id="super-striker-input"
                  type="text"
                  value={superStriker}
                  onChange={(e) => setSuperStriker(e.target.value)}
                  placeholder="e.g. Asif Ali"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="super-nonstriker-input">
                  Non-Striker Batsman
                </label>
                <input
                  id="super-nonstriker-input"
                  type="text"
                  value={superNonStriker}
                  onChange={(e) => setSuperNonStriker(e.target.value)}
                  placeholder="e.g. Iftikhar Ahmed"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="super-bowler-input">
                  Super Bowler
                </label>
                <input
                  id="super-bowler-input"
                  type="text"
                  value={superBowler}
                  onChange={(e) => setSuperBowler(e.target.value)}
                  placeholder="e.g. Haris Rauf"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  id="cancel-super-btn"
                  type="button"
                  onClick={() => setShowSuperSetup(false)}
                  className="flex-1 py-2.5 border border-emerald-800 text-emerald-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  id="confirm-super-btn"
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-2.5 rounded-xl text-xs uppercase"
                >
                  Launch Super Over
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANUALLY END MATCH & ENTER MAN OF THE MATCH */}
      {showEndMatchModal && (
        <div id="end-match-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b2513] border border-emerald-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-display font-black text-white mb-4 uppercase tracking-wider border-b border-emerald-950 pb-2 flex items-center gap-1.5 text-yellow-500">
              <Award className="w-5 h-5 text-yellow-500" />
              Declare Match Completed
            </h3>

            <div className="space-y-4">
              <div className="bg-emerald-950/50 p-3 rounded-xl border border-emerald-900 text-xs text-emerald-300">
                This will lock the scores, calculate the exact winning margin, award standings points, and save the match as "Completed".
              </div>

              <div>
                <label className="block text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5" htmlFor="mom-input">
                  Man of the Match
                </label>
                <input
                  id="mom-input"
                  type="text"
                  value={manOfTheMatchInput}
                  onChange={(e) => setManOfTheMatchInput(e.target.value)}
                  placeholder="e.g. Shaheen Afridi"
                  className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  id="cancel-endmatch-btn"
                  type="button"
                  onClick={() => setShowEndMatchModal(false)}
                  className="flex-1 py-2.5 border border-emerald-800 text-emerald-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Go Back
                </button>
                <button
                  id="confirm-endmatch-btn"
                  type="button"
                  onClick={() => {
                    onEndMatch(manOfTheMatchInput.trim());
                    setShowEndMatchModal(false);
                  }}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-black py-2.5 rounded-xl text-xs uppercase"
                >
                  Declare Match Finished
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
