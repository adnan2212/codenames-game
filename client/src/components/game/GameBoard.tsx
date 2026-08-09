"use client";

import { useState, useEffect } from "react";
import { words } from "@/src/data/words";
import WordCard from "./WordCard";
import type { GameCard, Team, GameStatus } from "@shared/types/game";

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
    type: types[index],
    isRevealed: false
  }));
}

export default function GameBoard() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [currentTeam, setCurrentTeam] = useState<Team>("red");
  const [cards, setCards] = useState<GameCard[] | null>(null);
  const [isSpymaster, setIsSpymaster] = useState<boolean>(false);

  useEffect(() => {
    setCards(createGameCards());
  }, []);

  if (!cards) {
    return <div>Loading...</div>;
  }

  const endTurn = () => {
    setCurrentTeam((prev) => (prev === "red" ? "blue" : "red"));
  }

  const handleCardSelect = (cardId: string) => {

    const selectedCard = cards?.find((card) => card.id === cardId);
    if (!selectedCard || selectedCard.isRevealed || gameStatus !== "playing") {
      return;
    }

    setCards((prevCards) => {
      if (!prevCards) return prevCards;

      return prevCards.map((card) =>
        card.id === cardId ? { ...card, isRevealed: true } : card
      );
    });

    if (selectedCard.type === "assassin") {
      setGameStatus(currentTeam === "red" ? "blue-won" : "red-won");
      return;
    }

    if (selectedCard.type !== currentTeam) {
      endTurn();
      return;
    }
  };

  const statusMessage =
    gameStatus === "red-won"
      ? "🔴 RED TEAM WINS!"
        : gameStatus === "blue-won"
      ? "🔵 BLUE TEAM WINS!"
      : currentTeam === "red"
      ? "🔴 RED TEAM'S TURN"
      : "🔵 BLUE TEAM'S TURN";

  return (
    <div>
      <div className="mb-4 text-center text-xl font-bold">
        {statusMessage}
      </div>

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

        {gameStatus !== "playing" && (
          <button
            onClick={() => {
              setGameStatus("playing");
              setCurrentTeam("red");
              setCards(createGameCards());
            }}
            className="font-bold text-green-600"
          >
            [ Reset Game ]
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {cards.map((card) => (
          <WordCard 
            key={card.id}
            card={card} 
            onSelect={() => handleCardSelect(card.id)}
            isSpymaster={isSpymaster}
          />
        ))}
      </div>
    </div>
  );
}