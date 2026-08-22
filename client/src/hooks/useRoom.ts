"use client";

import { useState, useEffect } from "react";
import { socket } from "@/src/lib/socket";
import type { Player } from "@shared/types/game";

type RoomState = {
  roomId: string;
  hostId: string;
  players: Player[];
};

export function useRoom() {
  const [room, setRoom] = useState<RoomState | null>(null);

  useEffect(() => {
    const handleRoomState = (data: RoomState) => {
      console.log("ROOM_STATE_RECEIVED", data);
      setRoom(data);
    };

    socket.on("room:state", handleRoomState);

    return () => {
      socket.off("room:state", handleRoomState);
    };
  }, []);

  return { room };
}