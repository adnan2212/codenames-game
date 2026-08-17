"use client";

import { useState, useEffect } from "react";
import { socket } from "../lib/socket";
import { Player } from "@shared/types/game";

export function usePlayer() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const handleJoined = (data: { roomId: string; player: Player }) => {
      setCurrentPlayer(data.player);
    };

    socket.on("room:joined", handleJoined);

    return () => {
      socket.off("room:joined", handleJoined);
    };
  }, []);

  return {
    currentPlayer
  };
}
