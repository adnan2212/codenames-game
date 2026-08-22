"use client";

import type { Player, Team } from "@shared/types/game";

type TeamPanelProps = {
  team: Exclude<Team, null>;
  players: Player[];
  currentPlayerId: string | undefined;
  onJoin: (team: Exclude<Team, null>, role: "spymaster" | "operative") => void;
};

export default function TeamPanel({ team, players, currentPlayerId, onJoin }: TeamPanelProps) {
  const teamPlayers = players.filter((p) => p.team === team && p.socketId);
  const spymaster = teamPlayers.find((p) => p.role === "spymaster");
  const operatives = teamPlayers.filter((p) => p.role === "operative");

  const isRed = team === "red";
  const label = isRed ? "🔴 Red" : "🔵 Blue";
  const accent = isRed ? "border-red-600 text-red-500" : "border-blue-600 text-blue-500";

  return (
    <div className={`flex flex-col gap-4 rounded-lg border p-4 ${accent}`}>
      <h2 className="text-xl font-bold">{label} Team</h2>

      <div>
        <div className="mb-1 text-sm font-medium text-gray-400">Spymaster</div>
        <button
          onClick={() => onJoin(team, "spymaster")}
          disabled={!!spymaster && spymaster.socketId !== currentPlayerId}
          className="w-full rounded border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {spymaster ? spymaster.name : `Join as ${label} Spymaster`}
        </button>
      </div>

      <div>
        <div className="mb-1 text-sm font-medium text-gray-400">Operatives</div>
        <button
          onClick={() => onJoin(team, "operative")}
          className="w-full rounded border px-3 py-2 font-bold"
        >
          Join as {label} Operative
        </button>

        <div className="mt-2 space-y-1">
          {operatives.map((p) => (
            <div key={p.id} className="rounded border border-gray-700 px-2 py-1 text-sm">
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}