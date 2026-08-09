type WordCardProps = {
  word: string;
  isSelected: boolean;
  onSelect: () => void;
  type?: "red" | "blue" | "neutral" | "assassin";
};

export default function WordCard({ 
  word,
  isSelected,
  onSelect,
  type
}: WordCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`flex aspect-4/3 items-center justify-center rounded-lg border-2 p-4 text-black font-bold shadow transition ${
        isSelected
          ? "border-blue-600 bg-blue-200"
          : "border-gray-300 bg-amber-100"
      } ${type === "red" ? "bg-red-200" : ""} ${type === "blue" ? "bg-blue-200" : ""} ${
        type === "neutral" ? "bg-gray-200" : ""
      } ${type === "assassin" ? "bg-black text-white" : ""}`}
    >
      {word}
    </button>
  );
}