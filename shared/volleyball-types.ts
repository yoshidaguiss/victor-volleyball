// Match related types
export type MatchStatus = "preparing" | "inProgress" | "completed";
export type TeamSide = "home" | "away";
export type Position = "S" | "MB" | "WS" | "OP" | "L";
export type PlayType = "serve" | "receive" | "set" | "attack" | "block" | "dig";
export type PlayResult = "point" | "continue" | "error";

// Play details
export interface PlayDetails {
  serveType?: "jump" | "float";
  serveResult?: "ace" | "in" | "net" | "out" | "error";
  receiveRating?: "A" | "B" | "C";
  setTarget?: string;
  attackType?: "open" | "quick" | "back" | "pipe" | "slide";
  attackCourse?: "straight" | "cross";
  attackResult?: "kill" | "blocked" | "dug" | "error" | "out";
  blockCount?: 1 | 2 | 3;
  blockResult?: "stuff" | "touch" | "none";
}

// Statistics types
export interface PlayerStatistics {
  playerId: number;
  playerNumber: number;
  playerName: string;
  attack: {
    total: number;
    kills: number;
    errors: number;
    blocked: number;
    successRate: number;
  };
  serve: {
    total: number;
    aces: number;
    errors: number;
    effective: number;
    successRate: number;
  };
  receive: {
    total: number;
    perfect: number;
    good: number;
    poor: number;
    successRate: number;
  };
  block: {
    total: number;
    stuffs: number;
    touches: number;
  };
  set?: {
    total: number;
    distribution: { [playerId: string]: number };
  };
}

export interface TeamStatistics {
  teamSide: TeamSide;
  teamName: string;
  totalPoints: number;
  totalErrors: number;
  sideoutRate: number;
  breakPointRate: number;
  attack: {
    total: number;
    kills: number;
    errors: number;
    successRate: number;
  };
  serve: {
    total: number;
    aces: number;
    errors: number;
    effectiveRate: number;
  };
  receive: {
    total: number;
    successRate: number;
  };
  block: {
    total: number;
    stuffs: number;
  };
  players: PlayerStatistics[];
}

export interface HeatmapData {
  type: "serve" | "receive" | "attack" | "dig";
  teamSide: TeamSide;
  grid: number[][];
  total: number;
}

export interface ScoreProgress {
  timestamp: Date;
  homeScore: number;
  awayScore: number;
  setNumber: number;
  rallyNumber: number;
}
