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
    status: "playing",
    clue: null,
    guessCount: 0
  };
}

export default function GameBoard() {
  const [game, setGame] = useState<GameState | null>(null);
  const [isSpymaster, setIsSpymaster] = useState<boolean>(false);
  const [clueWord, setClueWord] = useState('');
  const [clueNumber, setClueNumber] = useState(1);

  useEffect(() => {
    setGame(createGame());
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  const handleCardSelect = (cardId: string) => {
    setGame((prevGame) => {
      if (
        !prevGame || 
        prevGame.status !== "playing" || 
        isSpymaster || 
        prevGame.clue === null
      ) {
          return prevGame;
      }

      const selectedCard = prevGame.cards.find((card) => card.id === cardId);
      if (!selectedCard || selectedCard.isRevealed) return prevGame;

      const revealedCards = prevGame.cards.map((card) => 
        card.id === cardId 
          ? { ...card, isRevealed: true }
          : card
      );

      const newGuessCount = prevGame.guessCount + 1;

      // Assassin = opposing team wins
      if (selectedCard.type === "assassin") {
        return {
          ...prevGame,
          cards: revealedCards,
          status: prevGame.currentTeam === "red" ? "blue-won" : "red-won"
        };
      }

      // check whether the current team has revealed all of their cards 
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
      
      // Guess-limit condition
      if (newGuessCount >= prevGame.clue?.number + 1) {
        return {
          ...prevGame,
          cards: revealedCards,
          currentTeam: prevGame.currentTeam === "red" ? "blue" : "red",
          clue: null,
          guessCount: 0
        }
      } 

      return {
        ...prevGame,
        cards: revealedCards,
        guessCount: newGuessCount,
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

  const giveClue = () => {
    if (game.status !== "playing" || !clueWord.trim() || game.clue !== null) return;

    setGame((prevGame) => {
      if (!prevGame) return prevGame;

      return {
        ...prevGame,
        clue: {
          word: clueWord.trim(),
          number: clueNumber
        },
        guessCount: 0
      }
    });

    setClueWord('');
    setClueNumber(1);
  }

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

      {game.clue !== null && <div className="flex items-center justify-center gap-4 mb-5">
        Guesses: {game.guessCount} / {game.clue.number + 1}
      </div>}

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

      <div>
        {isSpymaster && game.clue == null && (
          <div className="mb-5 mt-5 flex items-center justify-center gap-3">
            <input
              type="text"
              value={clueWord}
              onChange={(e) => setClueWord(e.target.value)}
              placeholder="Enter clue"
              className="rounded border px-3 py-2"
            />

            <input
              type="number"
              min={1}
              max={9}
              value={clueNumber}
              onChange={(e) => setClueNumber(Number(e.target.value))}
              className="w-20 rounded border px-3 py-2"
            />

            <button
              onClick={giveClue}
              className="font-bold text-2xl text-green-600"
            >
              [ Give Clue ]
            </button>
          </div>
        )}
      </div>

      {game.clue && (
        <div className="mb-5 mt-5 flex items-center justify-center gap-3">
          <div className="rounded border px-3 py-2">
            {game.clue.word}
          </div>

          <div className="w-20 rounded border px-3 py-2">
           {game.clue.number}
          </div>

          {!isSpymaster && <button
            onClick={() => {
              setGame((prevGame) => {
                if (!prevGame) return prevGame;
                return {
                  ...prevGame,
                  currentTeam: prevGame.currentTeam === "red" ? "blue" : "red",
                  clue: null,
                  guessCount: 0
                }
              });

              setClueWord('');
              setClueNumber(1);
            }}
            className="font-bold text-2xl text-red-600"
          >
            [ End Guess ]
          </button>}
        </div>
      )}
    </div>
  );
}