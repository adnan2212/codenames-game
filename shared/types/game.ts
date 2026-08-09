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