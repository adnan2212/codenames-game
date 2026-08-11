"use client";

import { useState, useEffect } from "react";
import { createGame, selectCard, giveClue, endTurn } from "@/src/game/gameLogic";
import WordCard from "./WordCard";
import type { GameState } from "@shared/types/game";

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
      if (!prevGame) return prevGame;

      return selectCard(prevGame, cardId);
    });
  };

  const handleGiveClue = () => {
    setGame((prevGame) => {
      if (!prevGame) return prevGame;

      return giveClue(prevGame, clueWord, clueNumber);
    });
    setClueWord('');    
    setClueNumber(1);
  }

  const handleEndTurn = () => {
    setGame((prevGame) => {
      if (!prevGame) return prevGame;

      return endTurn(prevGame);
    });
    setClueWord('');    
    setClueNumber(1);
  }

  const handleResetGame = () => {
    setGame(createGame());
  }

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

          {game.status === "playing" && (
            <div className="text-gray-500">
              {game.phase === "clue"
                ? "🗣️ Waiting for clue"
                : "🎯 Operatives are guessing"}
            </div>
          )}
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
            onClick={handleResetGame}
            className="font-bold text-green-600"
          >
            [ Reset Game ]
          </button>
        )}
      </div>

      {
        game.status === "playing" && 
        game.phase === "guessing" && 
        game.clue !== null && 
          <div className="flex items-center justify-center gap-4 mb-5">
            Guesses: {game.guessCount} / {game.clue.number + 1}
          </div>
      }

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
        {isSpymaster && game.phase === "clue" && game.status === "playing" && (
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
              onClick={handleGiveClue}
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

          {!isSpymaster && game.phase === "guessing" && game.clue && <button
            onClick={handleEndTurn}
            className="font-bold text-2xl text-red-600"
          >
            [ End Guess ]
          </button>}
        </div>
      )}
    </div>
  );
}