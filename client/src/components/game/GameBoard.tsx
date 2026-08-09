"use client";

import { useState, useEffect } from "react";
import { words } from "@/data/words";
import WordCard from "./WordCard";

type CardType = "red" | "blue" | "neutral" | "assassin";

type GameCard = {
  id: string;
  word: string;
  type: CardType;
};

function createGameCards(): GameCard[] {
  const types = [
  ...Array(9).fill("red"),
  ...Array(8).fill("blue"),
  ...Array(7).fill("neutral"),
  "assassin"
];

// Fisher-Yates shuffle
for (let i = types.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [types[i], types[j]] = [types[j], types[i]];
}

 return words.map((word, index) => ({
  id: `card-${index + 1}`,
  word,
  type: types[index]
}));
}

export default function GameBoard() {
  const [cards, setCards] = useState<GameCard[] | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    setCards(createGameCards());
  }, []);

  if (!cards) {
    return <div>Loading...</div>;
  }

  const handleCardSelect = (word: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(word)) {
        return prev.filter((w) => w !== word);
      } else {
        return [...prev, word];
      }
    });
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card) => (
        <WordCard 
          key={card.id} 
          word={card.word}
          isSelected={selectedCards.includes(card.word)}
          onSelect={() => handleCardSelect(card.word)}
          type={card.type}
        />
      ))}
    </div>
  );
}