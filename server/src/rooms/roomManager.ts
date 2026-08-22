import { createGame } from "../../../shared/game/gameLogic";
import type {
  Player,
  Team,
  PlayerRole,
  GameRoom,
  ActionResult,
} from "../../../shared/types/game";

const rooms = new Map<string, GameRoom>();
const MAX_PLAYERS = 11;

function generateRoomId(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let roomId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    roomId += chars.charAt(randomIndex);
  }

  return roomId;
}

function createEmptySlots(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({ id: String(i) }));
}

export function createRoom(
  socketId: string,
  playerName: string
): GameRoom {
  let roomId = generateRoomId();

  const players = createEmptySlots(MAX_PLAYERS);

  // Host takes seat 0
  players[0] = {
    id: "0",
    socketId,
    name: playerName,
    team: null,
    role: null,
    isHost: true,
    isConnected: true,
  };

  const room: GameRoom = {
    id: roomId,
    hostId: socketId,
    players: players,
    game: null,
  };

  rooms.set(roomId, room);

  return room;
}

export function getRoom(roomId: string): GameRoom | undefined {
  return rooms.get(roomId);
}

export function joinRoom(
  roomId: string, 
  socketId: string, 
  playerName: string
): Player | null {
  const room = getRoom(roomId);

  if (!room) return null;

  const existingPlyer = room.players.find((player) => player.socketId === socketId);
  if (existingPlyer) return existingPlyer;

  const emptySlotIndex = room.players.findIndex((p) => !p.socketId);
  if (emptySlotIndex === -1) return null; // room full — caller must handle this

  const player: Player = {
    id: String(emptySlotIndex),
    socketId: socketId,
    name: playerName,
    team: null,
    role: null,
    isConnected: true
  };

  room.players[emptySlotIndex] = player;
  return player;
}

export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId);
}

export function joinTeam(
  roomId: string,
  socketId: string,
  team: Team,
  role: PlayerRole
): ActionResult<GameRoom> {
  const room = getRoom(roomId);
  if (!room) return {
    ok: false,
    error: "Room not found"
  }

  const player = room.players.find(p => p.socketId === socketId);
  if (!player) return { ok: false, error: "Plyer is not in this room" }

  if (room.game && room.game.status === "playing") {
    return { ok: false, error: "Cannot change team or role mid-game" }
  }

  if (team !== "red" && team !== "blue") {
    return { ok: false, error: "Invalid team" };
  }

  if (role !== "spymaster" && role !== "operative") {
    return { ok: false, error: "Invalid role" };
  }

  if (role === "spymaster") {
    const existingSpymaster = room.players.find(
      (p) => p.id !== player.id && p.team === team && p.role === "spymaster"
    );

    if (existingSpymaster) {
      return {
        ok: false,
        error: `${existingSpymaster.name ?? "Someone"} is already spymaster for ${team}`,
      }
    }
  }

  player.team = team;
  player.role = role;

  return { ok: true, data: room }
}

export function startGame(
  roomId: string,
  socketId: string
): ActionResult<GameRoom> {
  const room = getRoom(roomId);
  if (!room) return { ok: false, error: "Room not found" };

  if (room.hostId !== socketId) {
    return { ok: false, error: "Only the host can start the game" };
  }

  const seatedPlayers = room.players.filter((p) => p.socketId);
  const redTeam = seatedPlayers.filter((p) => p.team === "red");
  const blueTeam = seatedPlayers.filter((p) => p.team === "blue");

  // if (redTeam.length < 1 || blueTeam.length < 1) {
  //   return { ok: false, error: "Both teams need at least one player" };
  // }

  // if (!redTeam.some((p) => p.role === "spymaster") || !blueTeam.some((p) => p.role === "spymaster")) {
  //   return { ok: false, error: "Each team needs a spymaster" };
  // }

  const game = createGame();
  game.players = seatedPlayers;
  game.currentPlayerId =
    seatedPlayers.find((p) => p.team === game.currentTeam && p.role === "spymaster")?.id ?? "";

  room.game = game;

  return { ok: true, data: room };
}