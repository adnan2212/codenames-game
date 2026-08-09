export type CardType = "red" | "blue" | "neutral" | "assassin";

export type GameCard = {
  id: string;
  word: string;
  type: CardType;
};

export type WordCardProps = {
  card: GameCard;
  isSelected: boolean;
  onSelect: () => void;
  isSpymaster: boolean;
};
