"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/src/lib/socket";
import Lobby from "@/src/components/lobby/Lobby";
import NicknameModal from "@/src/components/lobby/NicknameModal";
import GameBoard from "@/src/components/game/GameBoard";
import type { GameState, Player } from "@shared/types/game";
import { useRoom } from "@/src/hooks/useRoom";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { room } = useRoom();

  const [game, setGame] = useState<GameState | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [needsNickname, setNeedsNickname] = useState(false);

  useEffect(() => {
    const sessionData = sessionStorage.getItem("cnd-lobby");

    if (!sessionData) {
      setNeedsNickname(true);
      return;
    }

    try {
      const parsedData = JSON.parse(sessionData);
      if (parsedData.nickname) {
        setNickname(parsedData.nickname);
      } else {
        setNeedsNickname(true);
      }
    } catch (error) {
      console.error("INVALID_SESSION_DATA", error);
      setNeedsNickname(true);
    }
  }, []);

  const handleNicknameSubmit = (submittedNickname: string) => {
    sessionStorage.setItem(
      "cnd-lobby",
      JSON.stringify({ nickname: submittedNickname, image: null })
    );
    setNickname(submittedNickname);
    setNeedsNickname(false);
  };

  useEffect(() => {
    if (!roomId || !nickname) return;

    const handleJoined = (data: { roomId: string; player: Player }) => {
      console.log(`Player ${data.player.name} joined room ${data.roomId}`);
    };

    const handleNeedsJoin = ({ roomId }: { roomId: string }) => {
      socket.emit("room:join", { roomId, playerName: nickname });
    };

    const handleError = (data: { message: string }) => {
      console.error("SOCKET_ERROR", data.message);
    };

    const handleGameState = (gameState: GameState) => {
      setGame(gameState);
    };

    socket.on("room:joined", handleJoined);
    socket.on("room:needs-join", handleNeedsJoin);
    socket.on("room:error", handleError);
    socket.on("game:state", handleGameState);

    socket.emit("room:check", { roomId });

    return () => {
      socket.off("room:joined", handleJoined);
      socket.off("room:needs-join", handleNeedsJoin);
      socket.off("room:error", handleError);
      socket.off("game:state", handleGameState);
    };
  }, [roomId, nickname]);

  const findPlayer = (players: Player[]): Player | null => {
    return players.find((p) => p.socketId === socket.id) ?? null;
  };

  const currentPlayer = useMemo(() => {
    if (game) return findPlayer(game.players);
    if (room) return findPlayer(room.players);
    return null;
  }, [game, room]);

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-5xl">
        {needsNickname && <NicknameModal onSubmit={handleNicknameSubmit} />}

        {game ? (
          <GameBoard roomId={roomId} game={game} currentPlayer={currentPlayer} />
        ) : room ? (
          <Lobby roomId={room.roomId} hostId={room.hostId} players={room.players} currentPlayer={currentPlayer} />
        ) : !needsNickname ? (
          <div className="text-white">Connecting to room...</div>
        ) : null}
      </div>
    </main>
  );
}
