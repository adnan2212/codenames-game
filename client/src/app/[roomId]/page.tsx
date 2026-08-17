"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { socket } from './../../lib/socket';
import GameBoard from "@/src/components/game/GameBoard";
import { Player } from "@shared/types/game";

export default function RoomPage() {
  const { roomId } = useParams<{roomId: string}>();

  useEffect(() => {
    if (!roomId) return;

    const handleJoined = (data: { roomId: string, player: Player}) => {
      console.log(`Player ${data.player.name} joined room ${data.roomId}`);
    }

    const handleError = (data: { message: string }) => {
      console.log(`SOMETHING_WENT_WRONG_PLEASE_CHECK_SOCKET_ERROR`);
      console.error(data.message);
    }

    socket.on("room:joined", handleJoined);
    socket.on("room:error", handleError);

    socket.emit("room:join", {
      roomId
    });

    return () => {
      socket.off("room:joined", handleJoined);
      socket.off("room:error", handleError);
    }
  }, [roomId]);

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-5xl">
        <GameBoard roomId={roomId}/>
      </div>
    </main>
  );
}