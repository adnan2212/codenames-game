"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../lib/socket";

export default function Home() {

  const router = useRouter();

  useEffect(() => {
    const handleRoomCreated = ({roomId}: { roomId: string }) => {
      console.log("Room created: ", roomId);
      router.push(`/${roomId}`);
    }
    
    socket.on("room:created", handleRoomCreated);

    return () => {
      socket.off("room:created", handleRoomCreated);
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Codenames
        </h1>

        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              socket.emit("room:create");
            }}
            className="font-bold text-2xl text-green-600"
          >
            [ Create Room ]
          </button>
        </div>
      </div>
    </main>
  );
}