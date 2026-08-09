import type { WordCardProps } from "@shared/types/game";

export default function WordCard({ 
  card,
  onSelect,
  isSpymaster
}: WordCardProps) {
  const showType = isSpymaster || card.isRevealed;

  const cardColor = showType
    ? card.type === "red"
      ? "bg-red-200"
      : card.type === "blue"
      ? "bg-blue-200"
      : card.type === "neutral"
      ? "bg-gray-200"
      : "bg-black text-white"
    : "bg-amber-100";

  return (
    <button
      onClick={onSelect}
      className={`
        flex aspect-4/3 items-center justify-center
        rounded-lg border-2 p-4 font-bold text-black shadow transition
        ${cardColor}
      `}
    >
      {card.word}
    </button>
  );
}