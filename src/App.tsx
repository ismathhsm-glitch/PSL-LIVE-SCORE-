/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Match, MatchStatus, InningsState, DismissalType, CommitteeMember, TeamStats, TeamAdjustment } from "./types";
import { PSL_TEAMS, INITIAL_MATCHES, INITIAL_COMMITTEE } from "./initialData";
import { calculatePointsTable, formatOvers } from "./utils";
import PointsTable from "./components/PointsTable";
import FixturesList from "./components/FixturesList";
import CommitteeSection from "./components/CommitteeSection";
import LiveScoreDisplay from "./components/LiveScoreDisplay";
import ScoringPanel from "./components/ScoringPanel";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import { Trophy, Calendar, Users, Shield, LogIn, LogOut, RefreshCw, Star, Info, Gamepad2, ArrowRight, Crown, Settings } from "lucide-react";
import { migrateSavedMatches } from "./teams";
import {
  initializeDatabaseIfEmpty,
  subscribeMatches,
  subscribeCommittee,
  subscribeSettings,
  saveMatchToFirestore,
  deleteMatchFromFirestore,
  saveMatchesToFirestore,
  saveCommitteeToFirestore,
  deleteCommitteeFromFirestore,
  saveSettingsToFirestore,
  resetFirestoreDatabase,
} from "./firebaseSync";

export default function App() {
  // --- 1. Persistent State Management ---
  const [matches, rawSetMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem("psl_2026_matches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return migrateSavedMatches(parsed);
      } catch (e) {
        console.error("Failed to parse saved matches", e);
      }
    }
    return INITIAL_MATCHES;
  });

  const [committee, rawSetCommittee] = useState<CommitteeMember[]>(() => {
    const saved = localStorage.getItem("psl_2026_committee");
    if (saved) {
      try {
        const parsed: CommitteeMember[] = JSON.parse(saved);
        // Clean up or merge INITIAL_COMMITTEE if some default items (like owners) are missing
        const parsedIds = new Set(parsed.map((m) => m.id));
        const missing = INITIAL_COMMITTEE.filter((m) => !parsedIds.has(m.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved committee", e);
      }
    }
    return INITIAL_COMMITTEE;
  });

  const [activeMatchId, rawSetActiveMatchId] = useState<string | null>(() => {
    const saved = localStorage.getItem("psl_2026_active_match");
    return saved || INITIAL_MATCHES[0].id;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("psl_2026_is_admin") === "true";
  });

  const [teamAdjustments, rawSetTeamAdjustments] = useState<TeamAdjustment[]>(() => {
    const saved = localStorage.getItem("psl_2026_adjustments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved adjustments", e);
      }
    }
    return [];
  });

  // Wrapper functions to intercept admin writes and sync them to Firestore in real-time
  const setMatches = (value: Match[] | ((prev: Match[]) => Match[])) => {
    const next = typeof value === "function" ? value(matches) : value;
    rawSetMatches(next);

    if (isAdmin) {
      // Find if a match was updated/added
      const updatedMatch = next.find((m) => {
        const prevM = matches.find((pm) => pm.id === m.id);
        return !prevM || JSON.stringify(m) !== JSON.stringify(prevM);
      });

      // Find if a match was deleted
      const prevDeleted = matches.find((pm) => !next.some((m) => m.id === pm.id));

      if (updatedMatch) {
        saveMatchToFirestore(updatedMatch).catch((err) => {
          console.error("Failed to sync match to Firestore:", err);
        });
      } else if (prevDeleted) {
        deleteMatchFromFirestore(prevDeleted.id).catch((err) => {
          console.error("Failed to delete match from Firestore:", err);
        });
      }
    }
  };

  const setCommittee = (value: CommitteeMember[] | ((prev: CommitteeMember[]) => CommitteeMember[])) => {
    const next = typeof value === "function" ? value(committee) : value;
    rawSetCommittee(next);

    if (isAdmin) {
      const deletedMembers = committee.filter((m) => !next.some((nm) => nm.id === m.id));

      saveCommitteeToFirestore(next).catch((err) => {
        console.error("Failed to save committee to Firestore:", err);
      });

      for (const member of deletedMembers) {
        deleteCommitteeFromFirestore(member.id).catch((err) => {
          console.error("Failed to delete committee member from Firestore:", err);
        });
      }
    }
  };

  const setActiveMatchId = (value: string | null | ((prev: string | null) => string | null)) => {
    const next = typeof value === "function" ? value(activeMatchId) : value;
    rawSetActiveMatchId(next);

    if (isAdmin) {
      saveSettingsToFirestore(next || "", teamAdjustments).catch((err) => {
        console.error("Failed to save settings to Firestore:", err);
      });
    }
  };

  const setTeamAdjustments = (value: TeamAdjustment[] | ((prev: TeamAdjustment[]) => TeamAdjustment[])) => {
    const next = typeof value === "function" ? value(teamAdjustments) : value;
    rawSetTeamAdjustments(next);

    if (isAdmin) {
      saveSettingsToFirestore(activeMatchId || "", next).catch((err) => {
        console.error("Failed to save settings to Firestore:", err);
      });
    }
  };

  // Real-time Firestore synchronization subscription on mount
  useEffect(() => {
    // Run initialization in the background without blocking subscriptions
    initializeDatabaseIfEmpty().catch((err) => {
      console.error("Background DB initialization failed:", err);
    });

    const unsubMatches = subscribeMatches((remoteMatches) => {
      rawSetMatches((curr) => {
        if (JSON.stringify(curr) !== JSON.stringify(remoteMatches)) {
          return remoteMatches;
        }
        return curr;
      });
    });

    const unsubCommittee = subscribeCommittee((remoteCommittee) => {
      rawSetCommittee((curr) => {
        if (JSON.stringify(curr) !== JSON.stringify(remoteCommittee)) {
          return remoteCommittee;
        }
        return curr;
      });
    });

    const unsubSettings = subscribeSettings((remoteActiveMatchId, remoteAdjustments) => {
      rawSetActiveMatchId((curr) => (curr !== remoteActiveMatchId ? remoteActiveMatchId : curr));
      rawSetTeamAdjustments((curr) => {
        if (JSON.stringify(curr) !== JSON.stringify(remoteAdjustments)) {
          return remoteAdjustments;
        }
        return curr;
      });
    });

    return () => {
      unsubMatches();
      unsubCommittee();
      unsubSettings();
    };
  }, [isAdmin]);

  const [activeTab, setActiveTab] = useState<"live" | "points" | "owners" | "committee">("live");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Undo History Stack (for the active match scoring)
  const [historyStack, setHistoryStack] = useState<Match[]>([]);

  // Over-complete bowler change input
  const [newBowlerNameForNextOver, setNewBowlerNameForNextOver] = useState("");
  const [showOverChangePrompt, setShowOverChangePrompt] = useState(false);

  // Free hit toggle (persists across balls during No Balls)
  const [isFreeHitActive, setIsFreeHitActive] = useState(false);

  // Save state to local storage on changes
  useEffect(() => {
    localStorage.setItem("psl_2026_matches", JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem("psl_2026_committee", JSON.stringify(committee));
  }, [committee]);

  useEffect(() => {
    if (activeMatchId) {
      localStorage.setItem("psl_2026_active_match", activeMatchId);
    }
  }, [activeMatchId]);

  useEffect(() => {
    localStorage.setItem("psl_2026_is_admin", isAdmin ? "true" : "false");
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem("psl_2026_adjustments", JSON.stringify(teamAdjustments));
  }, [teamAdjustments]);

  // Find active match
  const activeMatch = matches.find((m) => m.id === activeMatchId) || matches[0];

  // Recalculate Points Table dynamically based on completed matches and adjustments
  const pointsTableStats = calculatePointsTable(matches, teamAdjustments);

  // Save snapshot of active match before any scoring operation for Undo functionality
  const pushSnapshot = () => {
    if (activeMatch) {
      // Perform deep clone of current active match state
      const clone = JSON.parse(JSON.stringify(activeMatch));
      setHistoryStack((prev) => [...prev, clone]);
    }
  };

  // Rotate Strike Manual Action
  const handleRotateStrike = () => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        const inn = m.currentInnings === 1 ? m.innings1 : m.innings2;
        if (!inn) return m;

        const updatedInnings = {
          ...inn,
          // Swap striker and non-striker
          strikerIndex: inn.nonStrikerIndex,
          nonStrikerIndex: inn.strikerIndex,
        };

        return {
          ...m,
          innings1: m.currentInnings === 1 ? updatedInnings : m.innings1,
          innings2: m.currentInnings === 2 ? updatedInnings : m.innings2,
        };
      })
    );
  };

  // Undo Last Ball Action
  const handleUndo = () => {
    if (historyStack.length === 0) {
      alert("No actions left to undo!");
      return;
    }
    const previousState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    setMatches((prev) =>
      prev.map((m) => (m.id === activeMatchId ? previousState : m))
    );

    // Re-check free hit state from restored commentary / history
    const prevInn = previousState.currentInnings === 1 ? previousState.innings1 : previousState.innings2;
    if (prevInn && prevInn.overHistory.length > 0) {
      const lastBall = prevInn.overHistory[prevInn.overHistory.length - 1];
      setIsFreeHitActive(lastBall.includes("Nb"));
    } else {
      setIsFreeHitActive(false);
    }
  };

  // Reset all matches, history, and standing overrides
  const handleResetAllData = async () => {
    if (isAdmin) {
      await resetFirestoreDatabase();
    } else {
      rawSetMatches(INITIAL_MATCHES);
      rawSetTeamAdjustments([]);
      rawSetActiveMatchId(INITIAL_MATCHES[0].id);
    }
    setHistoryStack([]);
    localStorage.removeItem("psl_2026_matches");
    localStorage.removeItem("psl_2026_adjustments");
    localStorage.removeItem("psl_2026_active_match");
    alert("All tournament matches, scores, and standings adjustments have been reset successfully!");
  };

  // Initialize Match Setup
  const handleInitializeMatch = (
    teamA: string,
    teamB: string,
    maxOvers: number,
    tossWinner: string,
    tossDecision: "Bat" | "Bowl",
    striker: string,
    nonStriker: string,
    bowler: string,
    ballsPerOver?: number
  ) => {
    // Check which team bats first
    // If Team A wins toss & bats -> Team A bats, Team B bowls
    // If Team A wins toss & bowls -> Team B bats, Team A bowls
    const battingTeam =
      tossDecision === "Bat"
        ? tossWinner
        : tossWinner === teamA
        ? teamB
        : teamA;

    const bowlingTeam = battingTeam === teamA ? teamB : teamA;

    const initialInnings: InningsState = {
      battingTeam,
      bowlingTeam,
      runs: 0,
      wickets: 0,
      balls: 0,
      byes: 0,
      legByes: 0,
      wides: 0,
      noBalls: 0,
      partnershipRuns: 0,
      partnershipBalls: 0,
      batsmen: [
        { name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
        { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
      ],
      bowlers: [
        { name: bowler, ballsBowled: 0, runsConceded: 0, wickets: 0, maidens: 0 },
      ],
      strikerIndex: 0,
      nonStrikerIndex: 1,
      currentBowlerIndex: 0,
      fallOfWickets: [],
      overHistory: [],
      commentary: ["Match started. Best of luck!"],
    };

    setHistoryStack([]); // Clear history for new setup
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        return {
          ...m,
          teamA,
          teamB,
          maxOvers,
          tossWinner,
          tossDecision,
          status: MatchStatus.Live,
          currentInnings: 1,
          innings1: initialInnings,
          innings2: undefined,
          winner: undefined,
          resultMessage: undefined,
          manOfTheMatch: undefined,
          ballsPerOver: ballsPerOver || 6,
        };
      })
    );
  };

  // --- 2. Core Cricket Scoring Handler ---
  const handleScoreRun = (runs: number) => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        const is1st = m.currentInnings === 1;
        const inn = is1st ? m.innings1 : m.innings2;
        if (!inn) return m;

        // Clone deeply
        const nextInn = JSON.parse(JSON.stringify(inn)) as InningsState;
        const bpo = m.ballsPerOver || 6;

        // Increments
        nextInn.balls += 1;
        nextInn.runs += runs;
        nextInn.partnershipRuns += runs;
        nextInn.partnershipBalls += 1;

        // Batsman on strike
        const curStriker = nextInn.batsmen[nextInn.strikerIndex];
        curStriker.runs += runs;
        curStriker.balls += 1;
        if (runs === 4) curStriker.fours += 1;
        if (runs === 6) curStriker.sixes += 1;

        // Bowler
        const curBowler = nextInn.bowlers[nextInn.currentBowlerIndex];
        curBowler.ballsBowled += 1;
        curBowler.runsConceded += runs;

        // Over history
        nextInn.overHistory.push(runs.toString());

        // Commentary
        nextInn.commentary.unshift(
          `${curStriker.name} hits ${runs} runs off ${curBowler.name}.`
        );

        // Rotate strike on odd runs
        if (runs === 1 || runs === 3) {
          const temp = nextInn.strikerIndex;
          nextInn.strikerIndex = nextInn.nonStrikerIndex;
          nextInn.nonStrikerIndex = temp;
        }

        // Check if over completed (ballsPerOver valid balls)
        const isOverEnded = nextInn.balls % bpo === 0;

        // If free hit was active, it expires after a normal delivery
        if (isFreeHitActive) {
          setIsFreeHitActive(false);
        }

        // Apply automatic Innings target completion or over completion
        let matchStatus = m.status;
        let currentInnings = m.currentInnings;
        let winner = m.winner;
        let resultMessage = m.resultMessage;

        // If second innings, check if target reached
        if (!is1st && m.innings1) {
          const target = m.innings1.runs + 1;
          if (nextInn.runs >= target) {
            matchStatus = MatchStatus.Completed;
            winner = nextInn.battingTeam;
            const wktMargin = 10 - nextInn.wickets;
            resultMessage = `${nextInn.battingTeam} won by ${wktMargin} wickets!`;
          } else if (nextInn.balls >= m.maxOvers * bpo || nextInn.wickets >= 10) {
            matchStatus = MatchStatus.Completed;
            if (nextInn.runs === target - 1) {
              winner = "Tie";
              resultMessage = "Match Tied! Scores are level.";
            } else {
              winner = nextInn.bowlingTeam;
              const runMargin = target - 1 - nextInn.runs;
              resultMessage = `${nextInn.bowlingTeam} won by ${runMargin} runs.`;
            }
          }
        } else {
          // 1st innings ends if overs or wickets finished
          if (nextInn.balls >= m.maxOvers * bpo || nextInn.wickets >= 10) {
            nextInn.commentary.unshift(
              `1st Innings completed. ${nextInn.battingTeam} scored ${nextInn.runs}/${nextInn.wickets}.`
            );
          }
        }

        // Trigger Bowler change inline prompt if over finished and match is not completed
        if (isOverEnded && matchStatus === MatchStatus.Live && nextInn.balls < m.maxOvers * bpo && nextInn.wickets < 10) {
          setTimeout(() => {
            setShowOverChangePrompt(true);
          }, 400);
        }

        return {
          ...m,
          status: matchStatus,
          currentInnings,
          winner,
          resultMessage,
          innings1: is1st ? nextInn : m.innings1,
          innings2: !is1st ? nextInn : m.innings2,
        };
      })
    );
  };

  const handleScoreExtra = (type: "Wide" | "No Ball" | "Bye" | "Leg Bye", runsRun: number) => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        const is1st = m.currentInnings === 1;
        const inn = is1st ? m.innings1 : m.innings2;
        if (!inn) return m;

        const nextInn = JSON.parse(JSON.stringify(inn)) as InningsState;
        const bpo = m.ballsPerOver || 6;
        const curStriker = nextInn.batsmen[nextInn.strikerIndex];
        const curBowler = nextInn.bowlers[nextInn.currentBowlerIndex];

        let addedToTotal = 0;
        let isFreeHitNext = isFreeHitActive;

        if (type === "Wide") {
          // Wide = 1 penalty + runs run
          addedToTotal = 1 + runsRun;
          nextInn.wides += addedToTotal;
          nextInn.runs += addedToTotal;
          nextInn.partnershipRuns += addedToTotal;

          // Bowler gets runs conceded, no valid ball added
          curBowler.runsConceded += addedToTotal;

          nextInn.overHistory.push(`Wd${runsRun > 0 ? `+${runsRun}` : ""}`);
          nextInn.commentary.unshift(`Wide! Extra ${addedToTotal} runs added.`);

          // Rotate strike on odd runs run
          if (runsRun % 2 !== 0) {
            const temp = nextInn.strikerIndex;
            nextInn.strikerIndex = nextInn.nonStrikerIndex;
            nextInn.nonStrikerIndex = temp;
          }
        } else if (type === "No Ball") {
          // No ball faced by batsman counts as balls faced, runs hit go to batsman
          addedToTotal = 1 + runsRun;
          nextInn.noBalls += 1;
          nextInn.runs += addedToTotal;
          nextInn.partnershipRuns += addedToTotal;
          nextInn.partnershipBalls += 1;

          curStriker.runs += runsRun;
          curStriker.balls += 1;
          if (runsRun === 4) curStriker.fours += 1;
          if (runsRun === 6) curStriker.sixes += 1;

          curBowler.runsConceded += addedToTotal;

          nextInn.overHistory.push(`Nb${runsRun > 0 ? `+${runsRun}` : ""}`);
          nextInn.commentary.unshift(
            `No Ball! ${runsRun} scored by batsman. Next ball is a FREE HIT!`
          );

          // Free Hit Active
          isFreeHitNext = true;

          if (runsRun % 2 !== 0) {
            const temp = nextInn.strikerIndex;
            nextInn.strikerIndex = nextInn.nonStrikerIndex;
            nextInn.nonStrikerIndex = temp;
          }
        } else {
          // Bye or Leg Bye (counts as valid ball in over, team runs increase, bowler gets ball but NO runs conceded)
          addedToTotal = runsRun;
          nextInn.balls += 1;
          nextInn.runs += addedToTotal;
          nextInn.partnershipRuns += addedToTotal;
          nextInn.partnershipBalls += 1;

          if (type === "Bye") nextInn.byes += addedToTotal;
          else nextInn.legByes += addedToTotal;

          curStriker.balls += 1;
          curBowler.ballsBowled += 1;

          nextInn.overHistory.push(`${type === "Bye" ? "B" : "Lb"}${runsRun}`);
          nextInn.commentary.unshift(`${type} of ${runsRun} runs run.`);

          if (runsRun % 2 !== 0) {
            const temp = nextInn.strikerIndex;
            nextInn.strikerIndex = nextInn.nonStrikerIndex;
            nextInn.nonStrikerIndex = temp;
          }

          // If free hit was active, it expires
          if (isFreeHitActive) {
            isFreeHitNext = false;
          }
        }

        setIsFreeHitActive(isFreeHitNext);

        // Over end logic
        const isOverEnded = nextInn.balls % bpo === 0 && type !== "Wide" && type !== "No Ball";

        let matchStatus = m.status;
        let winner = m.winner;
        let resultMessage = m.resultMessage;

        // Check 2nd Innings Target reached
        if (!is1st && m.innings1) {
          const target = m.innings1.runs + 1;
          if (nextInn.runs >= target) {
            matchStatus = MatchStatus.Completed;
            winner = nextInn.battingTeam;
            const wktMargin = 10 - nextInn.wickets;
            resultMessage = `${nextInn.battingTeam} won by ${wktMargin} wickets!`;
          } else if (nextInn.balls >= m.maxOvers * bpo || nextInn.wickets >= 10) {
            matchStatus = MatchStatus.Completed;
            if (nextInn.runs === target - 1) {
              winner = "Tie";
              resultMessage = "Match Tied! Scores are level.";
            } else {
              winner = nextInn.bowlingTeam;
              const runMargin = target - 1 - nextInn.runs;
              resultMessage = `${nextInn.bowlingTeam} won by ${runMargin} runs.`;
            }
          }
        }

        if (isOverEnded && matchStatus === MatchStatus.Live && nextInn.balls < m.maxOvers * bpo && nextInn.wickets < 10) {
          setTimeout(() => {
            setShowOverChangePrompt(true);
          }, 400);
        }

        return {
          ...m,
          status: matchStatus,
          winner,
          resultMessage,
          innings1: is1st ? nextInn : m.innings1,
          innings2: !is1st ? nextInn : m.innings2,
        };
      })
    );
  };

  const handleScoreWicket = (type: DismissalType, incomingName: string) => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        const is1st = m.currentInnings === 1;
        const inn = is1st ? m.innings1 : m.innings2;
        if (!inn) return m;

        const nextInn = JSON.parse(JSON.stringify(inn)) as InningsState;
        const bpo = m.ballsPerOver || 6;
        const outBatsman = nextInn.batsmen[nextInn.strikerIndex];
        const curBowler = nextInn.bowlers[nextInn.currentBowlerIndex];

        // Valid ball unless Free Hit (only Run Out valid on Free Hit)
        if (isFreeHitActive && type !== DismissalType.RunOut) {
          alert("Only Run Out is valid on a Free Hit delivery!");
          return m;
        }

        // Add ball
        nextInn.balls += 1;
        nextInn.wickets += 1;

        // Out batsman details
        outBatsman.isOut = true;
        outBatsman.dismissalType = type;
        outBatsman.dismissedBy = curBowler.name;
        outBatsman.balls += 1;

        // Bowler stats (Run Outs don't go to bowler wickets)
        curBowler.ballsBowled += 1;
        if (type !== DismissalType.RunOut) {
          curBowler.wickets += 1;
        }

        // Fall of wickets log
        const fowOverStr = formatOvers(nextInn.balls, bpo);
        nextInn.fallOfWickets.push({
          wicketNumber: nextInn.wickets,
          batsmanName: outBatsman.name,
          score: nextInn.runs,
          wickets: nextInn.wickets,
          overs: fowOverStr,
        });

        // Over history
        nextInn.overHistory.push("W");

        // Commentary
        nextInn.commentary.unshift(
          `WICKET OUT! ${outBatsman.name} is dismissed (${type}) off ${curBowler.name}.`
        );

        // Reset partnership
        nextInn.partnershipRuns = 0;
        nextInn.partnershipBalls = 0;

        // Insert new batsman
        nextInn.batsmen.push({
          name: incomingName,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
        });

        // New batsman takes striker's position
        nextInn.strikerIndex = nextInn.batsmen.length - 1;

        // Free hit expires
        if (isFreeHitActive) {
          setIsFreeHitActive(false);
        }

        // State & Result verification
        let matchStatus = m.status;
        let winner = m.winner;
        let resultMessage = m.resultMessage;

        const target = is1st ? 0 : (m.innings1?.runs || 0) + 1;

        if (nextInn.wickets >= 10 || nextInn.balls >= m.maxOvers * bpo) {
          if (is1st) {
            nextInn.commentary.unshift(
              `Innings ended. Target for ${m.teamB} is ${nextInn.runs + 1} runs.`
            );
          } else {
            // Chasing ended
            matchStatus = MatchStatus.Completed;
            if (nextInn.runs === target - 1) {
              winner = "Tie";
              resultMessage = "Match Tied! Super Over required.";
            } else if (nextInn.runs < target - 1) {
              winner = nextInn.bowlingTeam;
              const runMargin = target - 1 - nextInn.runs;
              resultMessage = `${nextInn.bowlingTeam} won by ${runMargin} runs.`;
            }
          }
        }

        const isOverEnded = nextInn.balls % bpo === 0;
        if (isOverEnded && matchStatus === MatchStatus.Live && nextInn.balls < m.maxOvers * bpo && nextInn.wickets < 10) {
          setTimeout(() => {
            setShowOverChangePrompt(true);
          }, 400);
        }

        return {
          ...m,
          status: matchStatus,
          winner,
          resultMessage,
          innings1: is1st ? nextInn : m.innings1,
          innings2: !is1st ? nextInn : m.innings2,
        };
      })
    );
  };

  // Bowler change at end of over
  const handleApplyNextOverBowler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBowlerNameForNextOver.trim()) return;

    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        const inn = m.currentInnings === 1 ? m.innings1 : m.innings2;
        if (!inn) return m;

        const nextInn = JSON.parse(JSON.stringify(inn)) as InningsState;

        // Clear over history dots for new over
        nextInn.overHistory = [];

        // Check if bowler already exists in statistics
        let bIndex = nextInn.bowlers.findIndex(
          (b) => b.name.toLowerCase() === newBowlerNameForNextOver.trim().toLowerCase()
        );

        if (bIndex === -1) {
          nextInn.bowlers.push({
            name: newBowlerNameForNextOver.trim(),
            ballsBowled: 0,
            runsConceded: 0,
            wickets: 0,
            maidens: 0,
          });
          bIndex = nextInn.bowlers.length - 1;
        }

        nextInn.currentBowlerIndex = bIndex;
        nextInn.commentary.unshift(
          `Over completed. ${newBowlerNameForNextOver.trim()} comes into the attack.`
        );

        return {
          ...m,
          innings1: m.currentInnings === 1 ? nextInn : m.innings1,
          innings2: m.currentInnings === 2 ? nextInn : m.innings2,
        };
      })
    );

    setNewBowlerNameForNextOver("");
    setShowOverChangePrompt(false);
  };

  // Start Innings 2 setup
  const handleStartInnings2 = (striker: string, nonStriker: string, bowler: string) => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        if (!m.innings1) return m;

        // Team B batting, Team A bowling
        const battingTeam = m.innings1.bowlingTeam;
        const bowlingTeam = m.innings1.battingTeam;

        const innings2: InningsState = {
          battingTeam,
          bowlingTeam,
          runs: 0,
          wickets: 0,
          balls: 0,
          byes: 0,
          legByes: 0,
          wides: 0,
          noBalls: 0,
          partnershipRuns: 0,
          partnershipBalls: 0,
          batsmen: [
            { name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
            { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
          ],
          bowlers: [
            { name: bowler, ballsBowled: 0, runsConceded: 0, wickets: 0, maidens: 0 },
          ],
          strikerIndex: 0,
          nonStrikerIndex: 1,
          currentBowlerIndex: 0,
          fallOfWickets: [],
          overHistory: [],
          commentary: [`2nd Innings started! ${battingTeam} needs ${m.innings1.runs + 1} runs to win.`],
        };

        return {
          ...m,
          currentInnings: 2,
          innings2,
        };
      })
    );
  };

  // Complete Match manually
  const handleEndMatch = (manOfTheMatch: string) => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        const is1st = m.currentInnings === 1;
        const inn = is1st ? m.innings1 : m.innings2;
        if (!inn) return m;

        let winner = m.winner;
        let resultMessage = m.resultMessage;

        // Auto calculate winner if not already set
        if (!winner) {
          if (m.innings1 && m.innings2) {
            const t = m.innings1.runs + 1;
            if (m.innings2.runs >= t) {
              winner = m.innings2.battingTeam;
              resultMessage = `${m.innings2.battingTeam} won by ${10 - m.innings2.wickets} wickets!`;
            } else if (m.innings2.runs === t - 1) {
              winner = "Tie";
              resultMessage = "Match Tied!";
            } else {
              winner = m.innings1.battingTeam;
              resultMessage = `${m.innings1.battingTeam} won by ${t - 1 - m.innings2.runs} runs.`;
            }
          } else {
            winner = inn.battingTeam;
            resultMessage = `${inn.battingTeam} completed their innings first.`;
          }
        }

        return {
          ...m,
          status: MatchStatus.Completed,
          winner,
          resultMessage,
          manOfTheMatch: manOfTheMatch || undefined,
        };
      })
    );
  };

  // Super Over Mode
  const handleStartSuperOver = (striker: string, nonStriker: string, bowler: string) => {
    pushSnapshot();
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;

        // Super over is 1 over (6 balls) with max 2 wickets (3 batsmen playing)
        const superInnings1: InningsState = {
          battingTeam: m.teamA,
          bowlingTeam: m.teamB,
          runs: 0,
          wickets: 0,
          balls: 0,
          byes: 0,
          legByes: 0,
          wides: 0,
          noBalls: 0,
          partnershipRuns: 0,
          partnershipBalls: 0,
          batsmen: [
            { name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
            { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
          ],
          bowlers: [
            { name: bowler, ballsBowled: 0, runsConceded: 0, wickets: 0, maidens: 0 },
          ],
          strikerIndex: 0,
          nonStrikerIndex: 1,
          currentBowlerIndex: 0,
          fallOfWickets: [],
          overHistory: [],
          commentary: ["SUPER OVER MATCH STARTED!"],
        };

        return {
          ...m,
          isSuperOver: true,
          status: MatchStatus.Live,
          currentInnings: 1,
          innings1: superInnings1,
          innings2: undefined,
          winner: undefined,
          resultMessage: "Super Over Shootout underway!",
        };
      })
    );
  };

  // Reset current match
  const handleResetMatch = () => {
    setHistoryStack([]);
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== activeMatchId) return m;
        return {
          ...m,
          status: MatchStatus.Upcoming,
          currentInnings: 1,
          innings1: undefined,
          innings2: undefined,
          winner: undefined,
          resultMessage: undefined,
          manOfTheMatch: undefined,
          isSuperOver: false,
        };
      })
    );
  };

  // --- 3. Committee Operations ---
  const handleAddCommitteeMember = (newMem: Omit<CommitteeMember, "id">) => {
    const freshMem: CommitteeMember = {
      ...newMem,
      id: `member-${Date.now()}`,
    };
    setCommittee((prev) => [...prev, freshMem]);
  };

  const handleRemoveCommitteeMember = (id: string) => {
    if (confirm("Are you sure you want to remove this committee member card?")) {
      setCommittee((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleUpdateCommitteeMember = (updated: CommitteeMember) => {
    setCommittee((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  return (
    <div className="min-h-screen bg-[#04160b] text-emerald-100 font-sans selection:bg-yellow-500 selection:text-emerald-950 pb-12 relative">
      {/* Dynamic Background visual glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/2 blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- App Header Navigation Bar --- */}
      <header className="bg-gradient-to-b from-[#072410] to-[#04160b] border-b border-emerald-900/40 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg border border-yellow-400/20">
              <span className="font-display font-black text-emerald-950 text-lg">P</span>
            </div>
            <div>
              <h1 className="text-lg font-display font-black tracking-tight text-white flex items-center gap-1.5">
                PSL 2026
                <span className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-extrabold px-1.5 py-0.5 rounded-md">
                  LIVE
                </span>
              </h1>
              <p 
                onClick={() => setShowLoginModal(true)}
                className="text-[10px] text-emerald-500/80 hover:text-yellow-400 font-mono tracking-widest uppercase cursor-pointer transition-colors"
                title="Admin Authentication Area"
              >
                Ismath Admin
              </p>
            </div>
          </div>

          {/* Tab Navigation links for Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-900/40 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("live")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "live"
                  ? "bg-yellow-500 text-emerald-950"
                  : "text-emerald-400 hover:text-white"
              }`}
            >
              Match Live
            </button>
            <button
              onClick={() => setActiveTab("points")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "points"
                  ? "bg-yellow-500 text-emerald-950"
                  : "text-emerald-400 hover:text-white"
              }`}
            >
              Standings
            </button>
            <button
              onClick={() => setActiveTab("owners")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "owners"
                  ? "bg-yellow-500 text-emerald-950"
                  : "text-emerald-400 hover:text-white"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setActiveTab("committee")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "committee"
                  ? "bg-yellow-500 text-emerald-950"
                  : "text-emerald-400 hover:text-white"
              }`}
            >
              Committee
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "admin"
                  ? "bg-yellow-500 text-emerald-950"
                  : "text-emerald-400 hover:text-white"
              }`}
            >
              Admin Panel
            </button>
          </nav>

          {/* Admin authorization trigger buttons */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider bg-yellow-500/10 border border-yellow-500/20 py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                  Ismath (Admin)
                </span>
                <button
                  onClick={() => {
                    setIsAdmin(false);
                    setHistoryStack([]);
                  }}
                  className="bg-emerald-950/40 hover:bg-red-950/40 hover:text-red-400 border border-emerald-900 p-2.5 rounded-xl text-emerald-400 transition-all cursor-pointer active:scale-95"
                  title="Logout Admin Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation for Mobile */}
        <div className="md:hidden flex border-t border-emerald-950 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("live")}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 ${
              activeTab === "live"
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                : "border-transparent text-emerald-500"
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setActiveTab("points")}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 ${
              activeTab === "points"
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                : "border-transparent text-emerald-500"
            }`}
          >
            Standings
          </button>
          <button
            onClick={() => setActiveTab("owners")}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 ${
              activeTab === "owners"
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                : "border-transparent text-emerald-500"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("committee")}
            className={`flex-1 min-w-[75px] py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 ${
              activeTab === "committee"
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                : "border-transparent text-emerald-500"
            }`}
          >
            Committee
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 min-w-[75px] py-3 text-[10px] font-bold uppercase tracking-wider text-center border-b-2 ${
              activeTab === "admin"
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                : "border-transparent text-emerald-500"
            }`}
          >
            Admin
          </button>
        </div>
      </header>

      {/* --- Main Application Content Stage --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 relative z-10">
        {/* MATCH LIVE SCORE & SCORING TAB */}
        {activeTab === "live" && (
          <div className="space-y-6">
            {/* Match details & selection dropdown for viewer */}
            <div className="bg-[#0b2513] border border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-yellow-500" />
                <span className="font-display font-bold text-sm text-white">Active Match Center:</span>
              </div>
              <div className="w-full sm:w-auto">
                <select
                  id="active-match-center-select"
                  value={activeMatchId || ""}
                  onChange={(e) => {
                    setActiveMatchId(e.target.value);
                    setHistoryStack([]); // reset history when changing match
                  }}
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

            {/* If Admin is logged in, show side-by-side or stacked scoring operations panel */}
            {isAdmin ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Scoring input controls - left */}
                <div className="lg:col-span-6">
                  <div className="bg-[#05140b] rounded-2xl p-4 border border-emerald-900/40 mb-3 text-center">
                    <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-extrabold uppercase text-[10px] px-3 py-1 rounded-full">
                      ⚽ Admin Scoring Terminal Active
                    </span>
                  </div>
                  <ScoringPanel
                    match={activeMatch}
                    onInitializeMatch={handleInitializeMatch}
                    onScoreRun={handleScoreRun}
                    onScoreExtra={handleScoreExtra}
                    onScoreWicket={handleScoreWicket}
                    onUndo={handleUndo}
                    onRotateStrike={handleRotateStrike}
                    onStartInnings2={handleStartInnings2}
                    onEndMatch={handleEndMatch}
                    onStartSuperOver={handleStartSuperOver}
                    onResetMatch={handleResetMatch}
                  />
                </div>

                {/* Scoreboard display visualization - right */}
                <div className="lg:col-span-6">
                  <div className="bg-[#05140b] rounded-2xl p-4 border border-emerald-900/40 mb-3 text-center">
                    <span className="text-emerald-400 font-bold uppercase text-[10px] px-3 py-1 rounded-full">
                      👁️ Public Viewer Layout Preview
                    </span>
                  </div>
                  <LiveScoreDisplay match={activeMatch} allMatches={matches} committeeMembers={committee} />
                </div>
              </div>
            ) : (
              // Simple viewer display (read-only)
              <div className="max-w-4xl mx-auto">
                <LiveScoreDisplay match={activeMatch} allMatches={matches} committeeMembers={committee} />
              </div>
            )}

            {/* Fixtures & Results Section */}
            <div className="border-t border-emerald-900/20 pt-6 mt-8">
              <div className="max-w-6xl mx-auto">
                <FixturesList
                  matches={matches}
                  isAdmin={isAdmin}
                  onStartScoring={(id) => {
                    setActiveMatchId(id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onViewMatch={(id) => {
                    setActiveMatchId(id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  activeMatchId={activeMatchId}
                  onDeleteMatch={(id) => {
                    if (confirm("Are you sure you want to delete this match?")) {
                      setMatches((prev) => prev.filter((m) => m.id !== id));
                      if (activeMatchId === id) {
                        const remaining = matches.filter((m) => m.id !== id);
                        setActiveMatchId(remaining.length > 0 ? remaining[0].id : null);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* OWNERS TAB */}
        {activeTab === "owners" && (
          <div className="max-w-5xl mx-auto">
            <CommitteeSection
              members={committee}
              isAdmin={isAdmin}
              mode="owners"
              onAddMember={handleAddCommitteeMember}
              onRemoveMember={handleRemoveCommitteeMember}
              onUpdateMember={handleUpdateCommitteeMember}
            />
          </div>
        )}

        {/* STANDINGS/POINTS TABLE TAB */}
        {activeTab === "points" && (
          <div className="max-w-4xl mx-auto">
            <PointsTable stats={pointsTableStats} />
          </div>
        )}

        {/* COMMITTEE TAB */}
        {activeTab === "committee" && (
          <div className="max-w-5xl mx-auto">
            <CommitteeSection
              members={committee}
              isAdmin={isAdmin}
              mode="committee"
              onAddMember={handleAddCommitteeMember}
              onRemoveMember={handleRemoveCommitteeMember}
              onUpdateMember={handleUpdateCommitteeMember}
            />
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === "admin" && (
          <div className="max-w-5xl mx-auto">
            {isAdmin ? (
              <AdminPanel
                matches={matches}
                activeMatchId={activeMatchId}
                onSelectMatch={setActiveMatchId}
                onUpdateMatch={(updatedMatch) => {
                  setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
                }}
                onAddMatch={(newMatch) => {
                  setMatches((prev) => [...prev, newMatch]);
                }}
                onDeleteMatch={(id) => {
                  if (confirm("Are you sure you want to delete this match?")) {
                    setMatches((prev) => prev.filter((m) => m.id !== id));
                    if (activeMatchId === id) {
                      const remaining = matches.filter((m) => m.id !== id);
                      setActiveMatchId(remaining.length > 0 ? remaining[0].id : null);
                    }
                  }
                }}
                teamAdjustments={teamAdjustments}
                onUpdateAdjustments={setTeamAdjustments}
                onResetAllData={handleResetAllData}
                scoringTerminal={
                  <ScoringPanel
                    match={activeMatch}
                    onInitializeMatch={handleInitializeMatch}
                    onScoreRun={handleScoreRun}
                    onScoreExtra={handleScoreExtra}
                    onScoreWicket={handleScoreWicket}
                    onUndo={handleUndo}
                    onRotateStrike={handleRotateStrike}
                    onStartInnings2={handleStartInnings2}
                    onEndMatch={handleEndMatch}
                    onStartSuperOver={handleStartSuperOver}
                    onResetMatch={handleResetMatch}
                  />
                }
              />
            ) : (
              <div className="max-w-md mx-auto">
                <AdminLogin
                  onLoginSuccess={() => {
                    setIsAdmin(true);
                    setHistoryStack([]);
                  }}
                  onClose={() => setActiveTab("live")}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- INLINE MODAL OVERLAYS --- */}

      {/* 1. Admin Login Form modal */}
      {showLoginModal && (
        <div id="login-modal-overlay" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-md w-full relative">
            <button
              id="close-login-modal-btn"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-emerald-500 hover:text-white font-bold"
            >
              ✕
            </button>
            <AdminLogin
              onLoginSuccess={() => {
                setIsAdmin(true);
                setShowLoginModal(false);
                setHistoryStack([]);
              }}
              onClose={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Bowler Change End-Of-Over prompt */}
      {showOverChangePrompt && (
        <div id="over-change-modal" className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0b2513] border border-yellow-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-base font-display font-black text-white mb-2 uppercase tracking-wider flex items-center justify-center gap-1">
              <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
              Over Completed! 🏏
            </h3>
            <p className="text-xs text-emerald-400 mb-4">
              Enter the bowler's name who will bowl the next over
            </p>

            <form onSubmit={handleApplyNextOverBowler} className="space-y-4">
              <input
                id="next-over-bowler-input"
                type="text"
                value={newBowlerNameForNextOver}
                onChange={(e) => setNewBowlerNameForNextOver(e.target.value)}
                placeholder="e.g. Haris Rauf"
                className="w-full bg-[#05140b] border border-emerald-800 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
                autoFocus
              />
              <button
                id="submit-next-over-bowler-btn"
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-emerald-950 font-black py-2 rounded-xl text-xs uppercase"
              >
                Change Bowler &amp; Resume Scoring
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
