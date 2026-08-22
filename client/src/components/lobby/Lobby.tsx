"use client";

import TeamPanel from "./TeamPanel";
import { socket } from "@/src/lib/socket";
import type { Player, Team } from "@shared/types/game";

type LobbyProps = {
  roomId: string;
  hostId: string;
  players: Player[];
  currentPlayer: Player | null;
};

export default function Lobby({ roomId, hostId, players, currentPlayer }: LobbyProps) {
  const handleJoinTeam = (team: Exclude<Team, null>, role: "spymaster" | "operative") => {
    socket.emit("room:join-team", { roomId, team, role });
  };

  const handleStartGame = () => {
    socket.emit("game:start", { roomId });
  };

  const isHost = currentPlayer?.isHost;
  const unassigned = players.filter((p) => p.socketId && !p.team);

  return (
    <div className="grid grid-cols-3 gap-6">
      <TeamPanel
        team="blue"
        players={players}
        currentPlayerId={currentPlayer?.socketId}
        onJoin={handleJoinTeam}
      />

      <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-700 p-4 text-white">
        <h2 className="text-xl font-bold">Settings</h2>

        <div className="text-sm text-gray-400">
          Room code: <span className="font-mono text-white">{roomId}</span>
        </div>

        {unassigned.length > 0 && (
          <div className="w-full">
            <div className="mb-1 text-sm font-medium text-gray-400">Unassigned</div>
            <div className="space-y-1">
              {unassigned.map((p) => (
                <div key={p.id} className="rounded border border-gray-700 px-2 py-1 text-sm">
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {isHost ? (
          <button
            onClick={handleStartGame}
            className="mt-auto font-bold text-2xl text-green-600"
          >
            [ Start Game ]
          </button>
        ) : (
          <div className="mt-auto text-sm text-gray-500">Waiting for host to start…</div>
        )}
      </div>

      <TeamPanel
        team="red"
        players={players}
        currentPlayerId={currentPlayer?.socketId}
        onJoin={handleJoinTeam}
      />
    </div>
  );
}