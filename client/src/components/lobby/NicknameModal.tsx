"use client";

import { useState, useEffect } from "react";

type NicknameModalProps = {
  onSubmit: (nickname: string) => void;
};

export default function NicknameModal({ onSubmit }: NicknameModalProps) {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const sessionData = sessionStorage.getItem("cnd-lobby");
    const parsedData = sessionData ? JSON.parse(sessionData) : null;

    if (parsedData && parsedData.nickname) {
      setNickname(parsedData.nickname);
    }
  }, [])

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    sessionStorage.setItem(
      "cnd-lobby",
      JSON.stringify({ nickname: trimmed, image: null })
    );
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">
          Enter your nickname
        </h2>

        <input
          autoFocus
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Nickname"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
        />

        <button
          onClick={handleSubmit}
          className="mt-4 w-full font-bold text-xl text-green-600"
        >
          [ Join Room ]
        </button>
      </div>
    </div>
  );
}