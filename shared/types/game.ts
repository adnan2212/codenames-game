export type Team = "red" | "blue";

export type PlayerRole = "spymaster" | "operative";

export type Player = {
  id: string;
  name: string;
  team: Team;
  role: PlayerRole;
};

export type CardType = "red" | "blue" | "neutral" | "assassin";

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
};

export type GameStatus = "playing" | "red-won" | "blue-won";

export type GamePhase = "clue" | "guessing";

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
  game: GameState;
};
