/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Match, MatchStatus, InningsState, DismissalType, TeamAdjustment } from "../types";
import { PlusCircle, Trash2, Edit2, Check, X, FilePlus, ChevronRight, Settings, Gamepad2, Info, RefreshCw, Sliders } from "lucide-react";
import { PSL_TEAMS } from "../initialData";

interface AdminPanelProps {
  matches: Match[];
  activeMatchId: string | null;
  onSelectMatch: (id: string) => void;
  onUpdateMatch: (match: Match) => void;
  onAddMatch: (match: Match) => void;
  onDeleteMatch: (id: string) => void;
  scoringTerminal: React.ReactNode;
  teamAdjustments: TeamAdjustment[];
  onUpdateAdjustments: (adjustments: TeamAdjustment[]) => void;
  onResetAllData: () => void;
}

export default function AdminPanel({
  matches,
  activeMatchId,
  onSelectMatch,
  onUpdateMatch,
  onAddMatch,
  onDeleteMatch,
  scoringTerminal,
  teamAdjustments,
  onUpdateAdjustments,
  onResetAllData,
}: AdminPanelProps) {
  const [subTab, setSubTab] = useState<"scoring" | "manage" | "add" | "adjustments">("scoring");
  
  // State for Editing Match Details
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editTeamA, setEditTeamA] = useState("");
  const [editTeamB, setEditTeamB] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editMaxOvers, setEditMaxOvers] = useState(20);
  const [editStatus, setEditStatus] = useState<MatchStatus>(MatchStatus.Upcoming);
  const [editWinner, setEditWinner] = useState("");
  const [editResultMessage, setEditResultMessage] = useState("");
  const [editManOfTheMatch, setEditManOfTheMatch] = useState("");

  // Innings Overrides
  const [editInn1Runs, setEditInn1Runs] = useState("");
  const [editInn1Wickets, setEditInn1Wickets] = useState("");
  const [editInn1Balls, setEditInn1Balls] = useState("");
  const [editInn2Runs, setEditInn2Runs] = useState("");
  const [editInn2Wickets, setEditInn2Wickets] = useState("");
  const [editInn2Balls, setEditInn2Balls] = useState("");

  // State for Adding Match
  const [newTeamA, setNewTeamA] = useState(PSL_TEAMS[0] || "");
  const [newTeamB, setNewTeamB] = useState(PSL_TEAMS[1] || "");
  const [newDate, setNewDate] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newMaxOvers, setNewMaxOvers] = useState(20);

  const startEditing = (m: Match) => {
    setEditingMatchId(m.id);
    setEditTeamA(m.teamA);
    setEditTeamB(m.teamB);
    setEditDate(m.date);
    setEditVenue(m.venue);
    setEditMaxOvers(m.maxOvers);
    setEditStatus(m.status);
    setEditWinner(m.winner || "");
    setEditResultMessage(m.resultMessage || "");
    setEditManOfTheMatch(m.manOfTheMatch || "");

    setEditInn1Runs(m.innings1 ? String(m.innings1.runs) : "");
    setEditInn1Wickets(m.innings1 ? String(m.innings1.wickets) : "");
    setEditInn1Balls(m.innings1 ? String(m.innings1.balls) : "");

    setEditInn2Runs(m.innings2 ? String(m.innings2.runs) : "");
    setEditInn2Wickets(m.innings2 ? String(m.innings2.wickets) : "");
    setEditInn2Balls(m.innings2 ? String(m.innings2.balls) : "");
  };

  const cancelEditing = () => {
    setEditingMatchId(null);
  };

  const saveEditedMatch = (originalMatch: Match) => {
    if (!editTeamA.trim() || !editTeamB.trim() || !editVenue.trim() || !editDate.trim()) {
      alert("Please fill in all mandatory match details!");
      return;
    }

    // Helper to build or override InningsState
    const buildInningsState = (
      existing: InningsState | undefined,
      batting: string,
      bowling: string,
      runsStr: string,
      wicketsStr: string,
      ballsStr: string
    ): InningsState | undefined => {
      if (runsStr === "" && wicketsStr === "" && ballsStr === "") {
        return existing; // no override
      }

      const runs = runsStr !== "" ? parseInt(runsStr, 10) || 0 : (existing?.runs || 0);
      const wickets = wicketsStr !== "" ? parseInt(wicketsStr, 10) || 0 : (existing?.wickets || 0);
      const balls = ballsStr !== "" ? parseInt(ballsStr, 10) || 0 : (existing?.balls || 0);

      const baseInnings: InningsState = existing || {
        battingTeam: batting,
        bowlingTeam: bowling,
        runs,
        wickets,
        balls,
        batsmen: [
          { name: "Batsman 1", runs: Math.max(0, runs - 10), balls: Math.max(1, Math.round(balls * 0.5)), fours: Math.round(runs * 0.05), sixes: Math.round(runs * 0.02), isOut: wickets > 0 },
          { name: "Batsman 2", runs: 10, balls: Math.max(1, Math.round(balls * 0.5)), fours: 1, sixes: 0, isOut: false },
        ],
        bowlers: [
          { name: "Bowler 1", ballsBowled: balls, maidens: 0, runsConceded: runs, wickets: wickets },
        ],
        strikerIndex: 0,
        nonStrikerIndex: 1,
        currentBowlerIndex: 0,
        fallOfWickets: [],
        overHistory: [],
        commentary: ["Innings details overridden manually by Admin."],
        byes: 0,
        legByes: 0,
        wides: 0,
        noBalls: 0,
        partnershipRuns: runs,
        partnershipBalls: balls,
      };

      return {
        ...baseInnings,
        battingTeam: batting,
        bowlingTeam: bowling,
        runs,
        wickets,
        balls,
      };
    };

    const updatedInnings1 = buildInningsState(
      originalMatch.innings1,
      editTeamA,
      editTeamB,
      editInn1Runs,
      editInn1Wickets,
      editInn1Balls
    );

    const updatedInnings2 = buildInningsState(
      originalMatch.innings2,
      editTeamB,
      editTeamA,
      editInn2Runs,
      editInn2Wickets,
      editInn2Balls
    );

    const updated: Match = {
      ...originalMatch,
      teamA: editTeamA.trim(),
      teamB: editTeamB.trim(),
      date: editDate.trim(),
      venue: editVenue.trim(),
      maxOvers: editMaxOvers,
      status: editStatus,
      winner: editWinner.trim() || undefined,
      resultMessage: editResultMessage.trim() || undefined,
      manOfTheMatch: editManOfTheMatch.trim() || undefined,
      innings1: updatedInnings1,
      innings2: updatedInnings2,
    };

    onUpdateMatch(updated);
    setEditingMatchId(null);
  };

  const handleAddNewMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamA.trim() || !newTeamB.trim() || !newVenue.trim() || !newDate.trim()) {
      alert("Please fill in all match details!");
      return;
    }

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      teamA: newTeamA.trim(),
      teamB: newTeamB.trim(),
      date: newDate.trim(),
      venue: newVenue.trim(),
      maxOvers: newMaxOvers,
      status: MatchStatus.Upcoming,
      currentInnings: 1,
      isSuperOver: false,
    };

    onAddMatch(newMatch);
    
    // Reset state
    setNewTeamA("");
    setNewTeamB("");
    setNewDate("");
    setNewVenue("");
    setNewMaxOvers(20);
    setSubTab("manage");
  };

  const activeMatch = matches.find((m) => m.id === activeMatchId) || matches[0];

  return (
    <div id="admin-panel-container" className="space-y-6">
      {/* Sub tabs inside Admin Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/40 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-display font-black text-white">Ismath Admin Controller</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-950/60 p-1 rounded-xl border border-emerald-900/55">
            <button
              onClick={() => setSubTab("scoring")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                subTab === "scoring" ? "bg-yellow-500 text-emerald-950" : "text-emerald-400 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Scoring Terminal
            </button>
            <button
              onClick={() => setSubTab("manage")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                subTab === "manage" ? "bg-yellow-500 text-emerald-950" : "text-emerald-400 hover:text-white"
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Matches &amp; Scores
            </button>
            <button
              onClick={() => setSubTab("add")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                subTab === "add" ? "bg-yellow-500 text-emerald-950" : "text-emerald-400 hover:text-white"
              }`}
            >
              <FilePlus className="w-3.5 h-3.5" />
              Add Match
            </button>
            <button
              onClick={() => setSubTab("adjustments")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                subTab === "adjustments" ? "bg-yellow-500 text-emerald-950" : "text-emerald-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Adjust NRR &amp; Standings
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm("🚨 WARNING: Are you sure you want to reset ALL tournament data? This will restore the default matches, clear all scoring histories, and clear all standings adjustments! This action cannot be undone.")) {
                onResetAllData();
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 bg-red-950/45 hover:bg-red-900/60 text-red-300 border border-red-900/40 active:scale-95 shadow-md"
            title="Reset All Tournament Data"
          >
            <RefreshCw className="w-3.5 h-3.5 opacity-80" />
            Reset Tournament
          </button>
        </div>
      </div>

      {/* SUBTAB CONTENT 1: SCORING TERMINAL */}
      {subTab === "scoring" && (
        <div className="space-y-6">
          <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-yellow-400">Select Match to Score:</span>
            </div>
            <div className="w-full sm:w-auto">
              <select
                id="admin-active-match-select"
                value={activeMatchId || ""}
                onChange={(e) => onSelectMatch(e.target.value)}
                className="bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none w-full"
              >
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.teamA} vs {m.teamB} ({m.date}) - {m.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-12">
              {scoringTerminal}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 2: MANAGE & DIRECTLY EDIT SCORES */}
      {subTab === "manage" && (
        <div className="space-y-6">
          <div className="bg-[#0b2513] border border-emerald-950 p-4 rounded-xl flex items-center gap-2 text-xs text-yellow-300">
            <Info className="w-4 h-4 text-yellow-500 shrink-0" />
            <span>Here you can change team names, dates, venues, match status, and directly override live or final scores manually. Perfect for quick error correction!</span>
          </div>

          <div className="space-y-4">
            {matches.map((m) => {
              const isEditing = editingMatchId === m.id;
              return (
                <div key={m.id} className="bg-[#05140b] border border-emerald-900/40 rounded-2xl p-5 shadow-lg space-y-4">
                  {isEditing ? (
                    // EDITING STATE FORM
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Team A (Batting 1st)</label>
                          <select
                            value={editTeamA}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditTeamA(val);
                              if (editTeamB === val) {
                                setEditTeamB(PSL_TEAMS.find((t) => t !== val) || "");
                              }
                            }}
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          >
                            {PSL_TEAMS.map((team) => (
                              <option key={team} value={team}>{team}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Team B (Batting 2nd)</label>
                          <select
                            value={editTeamB}
                            onChange={(e) => setEditTeamB(e.target.value)}
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          >
                            {PSL_TEAMS.filter((t) => t !== editTeamA).map((team) => (
                              <option key={team} value={team}>{team}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Date</label>
                          <input
                            type="text"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Venue</label>
                          <input
                            type="text"
                            value={editVenue}
                            onChange={(e) => setEditVenue(e.target.value)}
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Max Overs</label>
                          <input
                            type="number"
                            value={editMaxOvers}
                            onChange={(e) => setEditMaxOvers(parseInt(e.target.value, 10) || 20)}
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as MatchStatus)}
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          >
                            <option value={MatchStatus.Upcoming}>Upcoming</option>
                            <option value={MatchStatus.Live}>Live</option>
                            <option value={MatchStatus.Completed}>Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* SCORE INNINGS OVERRIDES */}
                      <div className="border-t border-emerald-900/30 pt-3 space-y-3">
                        <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Manual Scores Overrides</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
                          {/* Innings 1 */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-emerald-300 block">1st Innings Runs/Wkts/Balls</span>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                placeholder="Runs"
                                value={editInn1Runs}
                                onChange={(e) => setEditInn1Runs(e.target.value)}
                                className="bg-black border border-emerald-800 rounded-xl py-1.5 px-2 text-white text-xs focus:outline-none"
                              />
                              <input
                                type="number"
                                placeholder="Wickets"
                                value={editInn1Wickets}
                                onChange={(e) => setEditInn1Wickets(e.target.value)}
                                className="bg-black border border-emerald-800 rounded-xl py-1.5 px-2 text-white text-xs focus:outline-none"
                              />
                              <input
                                type="number"
                                placeholder="Balls bowled"
                                value={editInn1Balls}
                                onChange={(e) => setEditInn1Balls(e.target.value)}
                                className="bg-black border border-emerald-800 rounded-xl py-1.5 px-2 text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Innings 2 */}
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-emerald-300 block">2nd Innings Runs/Wkts/Balls</span>
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                placeholder="Runs"
                                value={editInn2Runs}
                                onChange={(e) => setEditInn2Runs(e.target.value)}
                                className="bg-black border border-emerald-800 rounded-xl py-1.5 px-2 text-white text-xs focus:outline-none"
                              />
                              <input
                                type="number"
                                placeholder="Wickets"
                                value={editInn2Wickets}
                                onChange={(e) => setEditInn2Wickets(e.target.value)}
                                className="bg-black border border-emerald-800 rounded-xl py-1.5 px-2 text-white text-xs focus:outline-none"
                              />
                              <input
                                type="number"
                                placeholder="Balls bowled"
                                value={editInn2Balls}
                                onChange={(e) => setEditInn2Balls(e.target.value)}
                                className="bg-black border border-emerald-800 rounded-xl py-1.5 px-2 text-white text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* RESULT OVERRIDES */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-emerald-900/30 pt-3">
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Winner Team Name</label>
                          <input
                            type="text"
                            value={editWinner}
                            onChange={(e) => setEditWinner(e.target.value)}
                            placeholder="e.g. Peshawar Zalmi"
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Result Message</label>
                          <input
                            type="text"
                            value={editResultMessage}
                            onChange={(e) => setEditResultMessage(e.target.value)}
                            placeholder="e.g. Peshawar Zalmi won by 6 runs"
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-emerald-300 text-xs font-semibold mb-1 uppercase tracking-wider">Man of the Match</label>
                          <input
                            type="text"
                            value={editManOfTheMatch}
                            onChange={(e) => setEditManOfTheMatch(e.target.value)}
                            placeholder="e.g. Babar Azam"
                            className="w-full bg-black border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex justify-end gap-2.5 pt-2">
                        <button
                          onClick={cancelEditing}
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 py-2 px-4 rounded-xl text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditedMatch(m)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    // DISPLAY STATE
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-900/40 text-emerald-300 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-800/30">
                            {m.status}
                          </span>
                          <h3 className="text-sm font-display font-black text-white">
                            {m.teamA} vs {m.teamB}
                          </h3>
                        </div>
                        <p className="text-xs text-emerald-500">
                          {m.date} | {m.venue} | Max {m.maxOvers} Overs
                        </p>
                        
                        {/* Scores view */}
                        <div className="text-xs space-y-0.5 pt-1.5 text-emerald-300 font-mono">
                          <div>
                            1st Innings Score:{" "}
                            {m.innings1 ? (
                              <span className="text-yellow-400 font-bold">
                                {m.innings1.runs}/{m.innings1.wickets} (
                                {Math.floor(m.innings1.balls / 6)}.{m.innings1.balls % 6} Overs)
                              </span>
                            ) : (
                              "No Score"
                            )}
                          </div>
                          <div>
                            2nd Innings Score:{" "}
                            {m.innings2 ? (
                              <span className="text-yellow-400 font-bold">
                                {m.innings2.runs}/{m.innings2.wickets} (
                                {Math.floor(m.innings2.balls / 6)}.{m.innings2.balls % 6} Overs)
                              </span>
                            ) : (
                              "No Score"
                            )}
                          </div>
                          {m.winner && (
                            <div className="text-[11px] text-amber-400 mt-1">
                              🏆 Winner: {m.winner} ({m.resultMessage})
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => onSelectMatch(m.id)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                            activeMatchId === m.id
                              ? "bg-yellow-500 text-emerald-950 font-black"
                              : "bg-[#0b2513] text-emerald-400 hover:text-white border border-emerald-900/40"
                          }`}
                        >
                          {activeMatchId === m.id ? "Currently Active" : "Select to Score"}
                        </button>
                        <button
                          onClick={() => startEditing(m)}
                          className="bg-emerald-900/30 hover:bg-emerald-900/60 text-emerald-300 p-2 rounded-lg border border-emerald-800/20 transition-all"
                          title="Edit Match Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMatch(m.id)}
                          className="bg-red-950/20 hover:bg-red-950/50 text-red-400 p-2 rounded-lg border border-red-900/20 transition-all"
                          title="Delete Match"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT 3: ADD MATCH */}
      {subTab === "add" && (
        <div className="bg-[#05140b] border border-emerald-900/40 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-display font-black text-white border-b border-emerald-900/30 pb-2">
            Create &amp; Schedule New Match
          </h3>

          <form onSubmit={handleAddNewMatch} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-emerald-300 text-xs font-bold mb-1.5 uppercase tracking-wider">Team A (1st Batting Team)</label>
                <select
                  value={newTeamA}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTeamA(val);
                    if (newTeamB === val) {
                      setNewTeamB(PSL_TEAMS.find((t) => t !== val) || "");
                    }
                  }}
                  className="w-full bg-[#0b2513] border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                >
                  {PSL_TEAMS.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-emerald-300 text-xs font-bold mb-1.5 uppercase tracking-wider">Team B (2nd Batting Team)</label>
                <select
                  value={newTeamB}
                  onChange={(e) => setNewTeamB(e.target.value)}
                  className="w-full bg-[#0b2513] border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                >
                  {PSL_TEAMS.filter((t) => t !== newTeamA).map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-emerald-300 text-xs font-bold mb-1.5 uppercase tracking-wider">Match Date &amp; Time</label>
                <input
                  type="text"
                  placeholder="e.g. July 01, 2026 - 7:30 PM"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#0b2513] border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-emerald-300 text-xs font-bold mb-1.5 uppercase tracking-wider">Venue / Stadium</label>
                <input
                  type="text"
                  placeholder="e.g. Gaddafi Stadium, Lahore"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full bg-[#0b2513] border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-emerald-300 text-xs font-bold mb-1.5 uppercase tracking-wider">Max Overs</label>
                <input
                  type="number"
                  value={newMaxOvers}
                  onChange={(e) => setNewMaxOvers(parseInt(e.target.value, 10) || 20)}
                  className="w-full bg-[#0b2513] border border-emerald-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add &amp; Save Match
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUBTAB CONTENT 4: STANDINGS & NRR ADJUSTMENTS */}
      {subTab === "adjustments" && (
        <div className="bg-[#05140b] border border-emerald-900/40 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-emerald-900/30 pb-3">
            <h3 className="text-lg font-display font-black text-white">
              Standings &amp; Net Run Rate Overrides
            </h3>
            <p className="text-xs text-emerald-400 mt-1">
              Add manual points, custom NRR offsets, or adjust runs/overs for any of the 8 teams. These values will be added directly to the automatically calculated standings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PSL_TEAMS.map((teamName) => {
              // Find or create default adjustment for this team
              const currentAdj = teamAdjustments.find((a) => a.teamName === teamName) || {
                teamName,
                pointsAdjustment: 0,
                runsScoredAdjustment: 0,
                oversFacedAdjustment: 0,
                runsConcededAdjustment: 0,
                oversBowledAdjustment: 0,
                nrrAdjustment: 0,
              };

              const updateTeamField = (field: keyof TeamAdjustment, value: number) => {
                const existingIndex = teamAdjustments.findIndex((a) => a.teamName === teamName);
                let updatedList = [...teamAdjustments];
                if (existingIndex > -1) {
                  updatedList[existingIndex] = {
                    ...updatedList[existingIndex],
                    [field]: value,
                  };
                } else {
                  updatedList.push({
                    teamName,
                    pointsAdjustment: 0,
                    runsScoredAdjustment: 0,
                    oversFacedAdjustment: 0,
                    runsConcededAdjustment: 0,
                    oversBowledAdjustment: 0,
                    nrrAdjustment: 0,
                    [field]: value,
                  });
                }
                onUpdateAdjustments(updatedList);
              };

              return (
                <div key={teamName} className="bg-[#081c0e] border border-emerald-900/40 rounded-xl p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-900/20 pb-2">
                    <span className="font-display font-bold text-sm text-yellow-400">{teamName}</span>
                    <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full text-emerald-300 border border-emerald-900/40 uppercase tracking-wider font-semibold">
                      Adjustments
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-emerald-300 font-semibold mb-1">Points Adjustment</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={currentAdj.pointsAdjustment || ""}
                        onChange={(e) => updateTeamField("pointsAdjustment", parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#05140b] border border-emerald-900/60 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-300 font-semibold mb-1">NRR Custom Offset</label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="0.000"
                        value={currentAdj.nrrAdjustment || ""}
                        onChange={(e) => updateTeamField("nrrAdjustment", parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#05140b] border border-emerald-900/60 rounded-lg py-1.5 px-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-emerald-900/10 pt-2">
                    <div>
                      <label className="block text-emerald-400 font-medium mb-1">Runs Scored (+)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={currentAdj.runsScoredAdjustment || ""}
                        onChange={(e) => updateTeamField("runsScoredAdjustment", parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#05140b] border border-emerald-900/40 rounded-lg py-1 px-2 text-emerald-100 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-400 font-medium mb-1">Overs Faced (+)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={currentAdj.oversFacedAdjustment || ""}
                        onChange={(e) => updateTeamField("oversFacedAdjustment", parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#05140b] border border-emerald-900/40 rounded-lg py-1 px-2 text-emerald-100 text-xs focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-emerald-400 font-medium mb-1">Runs Conceded (+)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={currentAdj.runsConcededAdjustment || ""}
                        onChange={(e) => updateTeamField("runsConcededAdjustment", parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#05140b] border border-emerald-900/40 rounded-lg py-1 px-2 text-emerald-100 text-xs focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-400 font-medium mb-1">Overs Bowled (+)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={currentAdj.oversBowledAdjustment || ""}
                        onChange={(e) => updateTeamField("oversBowledAdjustment", parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#05140b] border border-emerald-900/40 rounded-lg py-1 px-2 text-emerald-100 text-xs focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                onUpdateAdjustments([]);
                alert("Standings and NRR overrides have been completely reset to 0.");
              }}
              className="bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/30 font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95"
            >
              Clear All Overrides
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
