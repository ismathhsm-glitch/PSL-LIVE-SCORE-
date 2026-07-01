/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TeamStats } from "../types";
import { Award, TrendingUp, HelpCircle } from "lucide-react";

interface PointsTableProps {
  stats: TeamStats[];
}

export default function PointsTable({ stats }: PointsTableProps) {
  return (
    <div id="points-table-section" className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
      {/* Stadium backdrop glows */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>

      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500 animate-pulse" />
          <h2 className="text-xl font-display font-bold text-white">PSL 2026 Points Table</h2>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2.5 py-0.5 text-[10px] text-yellow-500 uppercase font-bold tracking-wider">
          Playoffs Race
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-900/40">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#04160b] text-emerald-400 font-display text-xs font-bold uppercase tracking-wider border-b border-emerald-900/30">
              <th className="py-3.5 px-4 text-center w-12">Pos</th>
              <th className="py-3.5 px-4">Team</th>
              <th className="py-3.5 px-3 text-center w-16">P</th>
              <th className="py-3.5 px-3 text-center w-14">W</th>
              <th className="py-3.5 px-3 text-center w-14">L</th>
              <th className="py-3.5 px-3 text-center w-14">T/NR</th>
              <th className="py-3.5 px-4 text-center">FOR (Runs/Overs)</th>
              <th className="py-3.5 px-4 text-center">AGAINST (Runs/Overs)</th>
              <th className="py-3.5 px-3 text-center w-16 font-extrabold text-white">PTS</th>
              <th className="py-3.5 px-4 text-right w-24">NRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-950">
            {stats.map((team, index) => {
              const isQualified = index < 4; // Top 4 advance to playoffs
              return (
                <tr
                  key={team.teamName}
                  className={`text-sm transition-colors hover:bg-emerald-950/45 ${
                    isQualified ? "bg-emerald-950/15" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono ${
                        index === 0
                          ? "bg-yellow-500 text-emerald-950 font-extrabold"
                          : isQualified
                          ? "bg-emerald-800 text-emerald-100"
                          : "bg-emerald-950 text-emerald-500 border border-emerald-900/40"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <span>{team.teamName}</span>
                      {index === 0 && <Award className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-center text-emerald-200 font-mono">{team.played}</td>
                  <td className="py-3.5 px-3 text-center text-emerald-300 font-mono">{team.won}</td>
                  <td className="py-3.5 px-3 text-center text-emerald-400 font-mono">{team.lost}</td>
                  <td className="py-3.5 px-3 text-center text-emerald-400 font-mono">{team.tied}</td>
                  <td className="py-3.5 px-4 text-center text-emerald-100 font-mono text-xs">
                    <span className="font-bold text-sm text-emerald-200">{team.runsScored}</span>
                    <span className="text-emerald-500">/</span>
                    <span className="text-emerald-300 font-medium">{team.wicketsLost ?? 0}</span>
                    <div className="text-[10px] text-emerald-500">Overs: {team.oversFaced.toFixed(1)}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-100 font-mono text-xs">
                    <span className="font-bold text-sm text-amber-200">{team.runsConceded}</span>
                    <span className="text-emerald-500">/</span>
                    <span className="text-amber-400 font-medium">{team.wicketsTaken ?? 0}</span>
                    <div className="text-[10px] text-amber-600/70">Overs: {team.oversBowled.toFixed(1)}</div>
                  </td>
                  <td className="py-3.5 px-3 text-center text-yellow-500 font-mono font-extrabold text-base bg-yellow-500/5">
                    {team.points}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${
                      team.nrr >= 0 ? "text-emerald-400" : "text-amber-500"
                    }`}
                  >
                    {team.nrr >= 0 ? "+" : ""}
                    {team.nrr.toFixed(3)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ICC Net Run Rate Rules explanation card */}
      <div className="mt-4 bg-[#05140b] border border-emerald-900/40 rounded-xl p-3 flex gap-2.5 items-start">
        <HelpCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
        <div className="text-[11px] text-emerald-400/80 leading-relaxed">
          <p className="font-semibold text-emerald-300">ICC Net Run Rate Rules Applied:</p>
          <p>
            If a team is bowled out (all-out), they are considered to have faced their full quota of overs (e.g., 20.0 overs) for NRR calculations. Similarly, bowling a team out treats them as having faced full overs. Top 4 teams qualify for the PSL 2026 Playoffs.
          </p>
        </div>
      </div>
    </div>
  );
}
