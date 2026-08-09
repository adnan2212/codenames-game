import type { WordCardProps } from "@shared/types/game";;

export default function WordCard({ 
  card,
  isSelected,
  onSelect,
  isSpymaster
}: WordCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        flex aspect-4/3 items-center justify-center
        rounded-lg border-2 p-4 font-bold text-black shadow transition
        ${
          isSpymaster
            ? card.type === "red"
              ? "bg-red-200"
              : card.type === "blue"
              ? "bg-blue-200"
              : card.type === "neutral"
              ? "bg-gray-200" 
              : "bg-black text-white"
            : isSelected
            ? "border-blue-600 bg-blue-200"
            : "border-gray-300 bg-amber-100"
        }
      `}
    >
      {card.word}
    </button>
  );
}