"use client";

import { useState, useEffect } from "react";
import { words } from "@/src/data/words";
import WordCard from "./WordCard";
import type { GameCard } from "@shared/types/game";

function createGameCards(): GameCard[] {
  const startingTeam = Math.random() < 0.5 ? "red" : "blue";

  const types = [
    ...Array(8 + (startingTeam === "red" ? 1 : 0)).fill("red"),
    ...Array(8 + (startingTeam === "blue" ? 1 : 0)).fill("blue"),
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
  const [isSpymaster, setIsSpymaster] = useState<boolean>(false);

  useEffect(() => {
    setCards(createGameCards());
  }, []);

  if (!cards) {
    return <div>Loading...</div>;
  }

  const handleCardSelect = (cardId: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-5">
        <span>Choose a view:</span>

        <button
          onClick={() => setIsSpymaster(false)}
          className={!isSpymaster ? "font-bold text-blue-600" : "text-gray-500"}
        >
          [ Operative ]
        </button>

        <button
          onClick={() => setIsSpymaster(true)}
          className={isSpymaster ? "font-bold text-red-600" : "text-gray-500"}
        >
          [ Spymaster ]
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {cards.map((card) => (
          <WordCard 
            key={card.id}
            card={card} 
            isSelected={selectedCards.includes(card.id)}
            onSelect={() => handleCardSelect(card.id)}
            isSpymaster={isSpymaster}
          />
        ))}
      </div>
    </div>
  );
}