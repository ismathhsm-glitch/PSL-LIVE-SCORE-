/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, MatchStatus, CommitteeMember } from "./types";
import { CONFIG_TEAMS } from "./teams";

export const PSL_TEAMS = CONFIG_TEAMS;

export const INITIAL_MATCHES: Match[] = [
  {
    id: "match-1",
    teamA: CONFIG_TEAMS[0],
    teamB: CONFIG_TEAMS[1],
    date: "2026-07-01",
    venue: "Gaddafi Stadium, Lahore",
    maxOvers: 20,
    status: MatchStatus.Upcoming,
    currentInnings: 1,
    isSuperOver: false
  },
  {
    id: "match-2",
    teamA: CONFIG_TEAMS[2],
    teamB: CONFIG_TEAMS[3],
    date: "2026-07-02",
    venue: "Rawalpindi Cricket Stadium",
    maxOvers: 20,
    status: MatchStatus.Upcoming,
    currentInnings: 1,
    isSuperOver: false
  },
  {
    id: "match-3",
    teamA: CONFIG_TEAMS[5],
    teamB: CONFIG_TEAMS[4],
    date: "2026-07-03",
    venue: "Multan Cricket Stadium",
    maxOvers: 20,
    status: MatchStatus.Upcoming,
    currentInnings: 1,
    isSuperOver: false
  },
  {
    id: "match-4",
    teamA: CONFIG_TEAMS[0],
    teamB: CONFIG_TEAMS[2],
    date: "2026-07-04",
    venue: "National Stadium, Karachi",
    maxOvers: 20,
    status: MatchStatus.Upcoming,
    currentInnings: 1,
    isSuperOver: false
  },
  {
    id: "match-5",
    teamA: CONFIG_TEAMS[3],
    teamB: CONFIG_TEAMS[4],
    date: "2026-07-05",
    venue: "Gaddafi Stadium, Lahore",
    maxOvers: 20,
    status: MatchStatus.Upcoming,
    currentInnings: 1,
    isSuperOver: false
  }
];

export const INITIAL_COMMITTEE: CommitteeMember[] = [
  // Default Owners
  {
    id: "owner-1",
    name: "Fawad Rana",
    role: "Owner, Cricket Hitters",
    isOwner: true,
    photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2316a34a'/><stop offset='100%' stop-color='%2314532d'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>FAWAD</text></svg>",
    players: ["Babar Azam", "Shaheen Afridi"],
    captainName: "Shaheen Afridi",
    captainPhotoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='cg1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310b981'/><stop offset='100%' stop-color='%23047857'/></linearGradient></defs><rect width='100' height='100' fill='url(%23cg1)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>SHAHEEN</text></svg>"
  },
  {
    id: "owner-2",
    name: "Salman Iqbal",
    role: "Owner, Golden Eagles",
    isOwner: true,
    photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%232563eb'/><stop offset='100%' stop-color='%231e3a8a'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>SALMAN</text></svg>",
    players: ["Mohammad Rizwan", "Naseem Shah"],
    captainName: "Mohammad Rizwan",
    captainPhotoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='cg2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%233b82f6'/><stop offset='100%' stop-color='%231d4ed8'/></linearGradient></defs><rect width='100' height='100' fill='url(%23cg2)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>RIZWAN</text></svg>"
  },
  {
    id: "owner-3",
    name: "Javed Afridi",
    role: "Owner, Trending 11",
    isOwner: true,
    photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ca8a04'/><stop offset='100%' stop-color='%23854d0e'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>JAVED</text></svg>",
    players: ["Saim Ayub", "Haris Rauf"],
    captainName: "Saim Ayub",
    captainPhotoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='cg3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23eab308'/><stop offset='100%' stop-color='%23a16207'/></linearGradient></defs><rect width='100' height='100' fill='url(%23cg3)'/><circle cx='50' cy='35' r='18' fill='%23ffffff' opacity='0.35'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23ffffff' opacity='0.45'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>SAIM</text></svg>"
  },
  // Default Committee Members
  {
    id: "member-1",
    name: "Arsaam",
    role: "Tournament Director & Chief Scorer",
    isOwner: false,
    photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2314532d'/><stop offset='100%' stop-color='%23022c22'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23facc15'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23eab308'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>ARSAAM</text></svg>"
  },
  {
    id: "member-2",
    name: "Javed Miandad",
    role: "Technical Advisor",
    isOwner: false,
    photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231e3a8a'/><stop offset='100%' stop-color='%23172554'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%2338bdf8'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%230284c7'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>MEMBER</text></svg>"
  },
  {
    id: "member-3",
    name: "Wasim Akram",
    role: "Chief Match Referee",
    isOwner: false,
    photoUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23581c87'/><stop offset='100%' stop-color='%233b0764'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g)'/><circle cx='50' cy='35' r='18' fill='%23c084fc'/><path d='M20,80 C20,60 30,55 50,55 C70,55 80,60 80,80 Z' fill='%23a855f7'/><text x='50' y='92' font-family='sans-serif' font-size='10' font-weight='bold' fill='%23ffffff' text-anchor='middle'>MEMBER</text></svg>"
  }
];
