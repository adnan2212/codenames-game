"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { socket } from "../lib/socket";

const gameInstructions = [
  "Enter your nickname and click on the ENTER GAME button.",
  "Select the preferred game settings and start the game.",
  "Connect with your friends using your favorite audio or video chat.",
  "Share the room URL with your friends.",
  "Enjoy the game!"
];

export default function Home() {

  const router = useRouter();

  const [nickname, setNickname] = useState<string>("");

  useEffect(() => {
    const sessionData= sessionStorage.getItem("cnd-lobby");
    const parsedData = sessionData ? JSON.parse(sessionData) : null;

    if (parsedData && parsedData.nickname) {
      setNickname(parsedData.nickname);
    }

    const handleRoomCreated = ({roomId}: { roomId: string }) => {
      console.log("Room created: ", roomId);
      router.push(`/${roomId}`);
    }
    
    socket.on("room:created", handleRoomCreated);

    return () => {
      socket.off("room:created", handleRoomCreated);
    }
  }, [router]);

  const handleEnterGame = () => {
    const trimmedName = nickname.trim();
    if (!trimmedName) return;

    const value = {
      nickname: trimmedName,
      image: null
    }

    sessionStorage.setItem("cnd-lobby", JSON.stringify(value));

    socket.emit("room:create", {
      playerName: trimmedName,
    });
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">
          Codenames
        </h1>

        <div className="mx-auto mt-12 max-w-2xl text-white">
          <h2 className="mb-4 text-2xl font-bold">How to Play:</h2>

          <ol className="list-decimal space-y-2 pl-6">
            {gameInstructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-12 flex max-w-md flex-col items-center">
          <label
            htmlFor="nickname"
            className="mb-2 self-start text-sm font-medium text-gray-300"
          >
            Enter your nickname
          </label>

          <input
            id="nickname"
            value={nickname}
            onChange={(e) =>  setNickname(e.target.value)}
            type="text"
            placeholder="Nickname"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
          />
          
          <button
            onClick={handleEnterGame}
            className="mt-5 font-bold text-2xl text-green-600"
          >
            [ Enter Game ]
          </button>
        </div>
      </div>
    </main>
  );
}