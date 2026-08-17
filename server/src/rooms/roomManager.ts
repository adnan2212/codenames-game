import { createGame } from "../../../shared/game/gameLogic";
import type {
  Player,
  Team,
  PlayerRole,
  GameRoom,
} from "../../../shared/types/game";

const rooms = new Map<string, GameRoom>();

function generateRoomId(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    roomId += chars.charAt(randomIndex);
  }

  return roomId;
}

export function createRoom(): GameRoom {
  let roomId = generateRoomId();

  const room: GameRoom = {
    id: roomId,
    game: createGame(),
  };

  rooms.set(roomId, room);

  return room;
}

export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId);
}

export function joinRoom(roomId: string, socketId: string): Player | null {
  const room = getRoom(roomId);

  if (!room) return null;

  const existingPlyer = room.game.players.find((player) => player.id === socketId);

  if (existingPlyer) return existingPlyer;

  const redPlayers = room.game.players.filter(
    (player) => player.team === "red",
  ).length;

  const bluePlayers = room.game.players.filter(
    (player) => player.team === "blue",
  ).length;

  const team: Team = redPlayers <= bluePlayers ? "red" : "blue";

  const teamPlayers = room.game.players.filter((player) => player.team === team);

  const role: PlayerRole = teamPlayers.some(
    (player) => player.role === "spymaster",
  )
    ? "operative"
    : "spymaster";

  const player: Player = {
    id: socketId,
    name: `user-${socketId}`,
    team,
    role,
  };

  room.game.players.push(player);

  return player;
}

export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId);
}
