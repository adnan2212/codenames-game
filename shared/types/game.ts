export type Team = "red" | "blue";

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
};

export type GameStatus = "playing" | "red-won" | "blue-won";

export type GamePhase = "clue" | "guessing";

export type Clue = {
  word: string;
  number: number;
}

export type GameState = {
  cards: GameCard[];
  startingTeam: Team;
  currentTeam: Team;
  status: GameStatus;
  phase: GamePhase;
  clue: Clue | null;
  guessCount: number;
}