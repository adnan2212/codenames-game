export type Team = "red" | "blue" | null;

export type PlayerRole = "spymaster" | "operative" | "spectator" | null;

export type Player = {
  id: string;
  name?: string;
  socketId?: string;
  team?: Team;
  role?: PlayerRole;
  isHost?: boolean;
  isConnected?: boolean;
};

export type CardType = "red" | "blue" | "neutral" | "assassin" | "hidden";

export type GameCard = {
  id: string;
  word: string;
  type: CardType;
  isRevealed: boolean;
};

export type WordCardProps = {
  card: GameCard;
  onSelect: () => void;
  isSpymaster: boolean;
  disabled: boolean;
};

export type GameBoardProps = {
  roomId: string;
  game: GameState;
  currentPlayer: Player | null;
};

export type GameStatus = "playing" | "red-won" | "blue-won";

export type GamePhase = "lobby" | "clue" | "guessing";

export type Clue = {
  word: string;
  number: number;
}

export type GameState = {
  cards: GameCard[];
  players: Player[];
  currentPlayerId: string;
  startingTeam: Team;
  currentTeam: Team;
  status: GameStatus;
  phase: GamePhase;
  clue: Clue | null;
  guessCount: number;
}

export type GameRoom = {
  id: string;
  hostId: string;
  players: Player[];
  game: GameState | null;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };