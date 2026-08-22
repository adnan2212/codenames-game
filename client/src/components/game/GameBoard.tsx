"use client";

import { useState, useEffect } from "react";
import WordCard from "./WordCard";
import { socket } from "@/src/lib/socket";
import type { GameBoardProps } from "@shared/types/game";

export default function GameBoard({ roomId, game, currentPlayer }: GameBoardProps) {
  const [clueWord, setClueWord] = useState('');
  const [clueNumber, setClueNumber] = useState(1);

  if (!currentPlayer) {
    return <div>Connecting to room...</div>;
  }

  const handleCardSelect = (cardId: string) => {
    if (!currentPlayer) return;

    socket.emit("game:select-card", {
      roomId,
      cardId
    });
  };

  const handleGiveClue = () => {
    socket.emit("game:give-clue", {
      roomId,
      playerId: currentPlayer.id,
      word: clueWord,
      number: clueNumber,
    });

    setClueWord('');    
    setClueNumber(1);
  }

  const handleEndTurn = () => {
    socket.emit("game:end-turn", {
      roomId
    });
    setClueWord('');    
    setClueNumber(1);
  }

  const handleResetGame = () => {}

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

      <div className="mb-6 text-white">
        <h2 className="mb-3 text-lg font-bold">
          Players
        </h2>

        <div className="space-y-2">
          {game.players.map((player) => (
            <div
              key={player.id}
              className="rounded border border-gray-600 p-2"
            >
              <strong>{player.name}</strong>

              {" — "}

              {player.team === "red" ? "🔴 Red" : "🔵 Blue"}

              {" — "}

              {player.role === "spymaster"
                ? "🕵️ Spymaster"
                : "👤 Operative"}
            </div>
          ))}
        </div>
      </div>


      <div className="mb-5 flex items-center justify-center gap-4">
        <div>
          You are: <strong>{currentPlayer.name}</strong>
        </div>

        <div>
          Team:{" "}
          <strong>
            {currentPlayer.team === "red" ? "🔴 Red" : "🔵 Blue"}
          </strong>
        </div>

        <div>
          Role:{" "}
          <strong>
            {currentPlayer.role === "spymaster"
              ? "🕵️ Spymaster"
              : "👤 Operative"}
          </strong>
        </div>

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
            disabled={
              currentPlayer.role !== "operative" ||
              currentPlayer.team !== game.currentTeam ||
              game.phase !== "guessing" ||
              card.isRevealed
            }
            key={card.id}
            card={card} 
            onSelect={() => handleCardSelect(card.id)}
            isSpymaster={currentPlayer.role === "spymaster"}
          />
        ))}
      </div>

      <div>
        {
          currentPlayer.team === game.currentTeam &&
          currentPlayer.role === "spymaster" &&
          game.phase === "clue" && 
          game.status === "playing" && (
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

          { 
            currentPlayer.role === "operative" && 
            currentPlayer.team === game.currentTeam &&
            game.phase === "guessing" && 
            game.clue && <button
            onClick={handleEndTurn}
            className="font-bold text-2xl text-red-600"
          >
            [ End Guess ]
          </button>
          }
        </div>
      )}
    </div>
  );
}