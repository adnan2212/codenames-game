"use client";

import { useState, useEffect } from "react";
import { words } from "@/src/data/words";
import WordCard from "./WordCard";
import type { Team, CardType, GameCard, GameState } from "@shared/types/game";

function createGame(): GameState {
  const startingTeam: Team = Math.random() < 0.5 ? "red" : "blue";

  const types: CardType[] = [
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

  const cards: GameCard[] = words.map((word, index) => ({
    id: `card-${index + 1}`,
    word,
    type: types[index],
    isRevealed: false
  }));

  return {
    cards,
    startingTeam,
    currentTeam: startingTeam,
    status: "playing"
  };
}

export default function GameBoard() {
  const [game, setGame] = useState<GameState | null>(null);
  const [isSpymaster, setIsSpymaster] = useState<boolean>(false);

  useEffect(() => {
    setGame(createGame());
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  const handleCardSelect = (cardId: string) => {
    setGame((prevGame) => {
      if (!prevGame || prevGame.status !== "playing" || isSpymaster) return prevGame;

      const selectedCard = prevGame.cards.find((card) => card.id === cardId);
      if (!selectedCard || selectedCard.isRevealed) return prevGame;

      const revealedCards = prevGame.cards.map((card) => 
        card.id === cardId 
          ? { ...card, isRevealed: true }
          : card
      );

      // Assassin = opposing team wins
      if (selectedCard.type === "assassin") {
        return {
          ...prevGame,
          cards: revealedCards,
          status: prevGame.currentTeam === "red" ? "blue-won" : "red-won"
        };
      }

      // check whether the selected card wins the game 
      const teamHasWon = revealedCards 
        .filter((card) => card.type === prevGame.currentTeam)
        .every((card) => card.isRevealed);

      if (teamHasWon) {
        return {
          ...prevGame,
          cards: revealedCards,
          status: prevGame.currentTeam === "red" ? "red-won" : "blue-won"
        };
      }

      // Wrong team's card = turn ends 
      if (selectedCard.type !== prevGame.currentTeam) {
        return {
          ...prevGame,
          cards: revealedCards,
          currentTeam: prevGame.currentTeam === "red" ? "blue" : "red"
        }
      }
      
      // Correct card = same team continues
      return {
        ...prevGame,
        cards: revealedCards
      };
    });
  };

  const statusMessage =
    game.status === "red-won"
      ? "🔴 RED TEAM WINS!"
        : game.status === "blue-won"
      ? "🔵 BLUE TEAM WINS!"
      : game.currentTeam === "red"
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

        {game.status !== "playing" && (
          <button
            onClick={() => {
              setGame(createGame());
            }}
            className="font-bold text-green-600"
          >
            [ Reset Game ]
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {game.cards.map((card) => (
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