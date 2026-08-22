import type { Server } from "socket.io";
import type { GameRoom, GameState, Player, GameCard } from "../../../shared/types/game";

function redactCardForPlayer(card: GameCard, canSeeAllColors: boolean): GameCard {
  if (canSeeAllColors || card.isRevealed) return card;
  return { ...card, type: "hidden" };
}

function redactGameForPlayer(game: GameState, player: Player): GameState {
  const canSeeAllColors = player.role === "spymaster";

  return {
    ...game,
    cards: game.cards.map((card) => redactCardForPlayer(card, canSeeAllColors)),
  };
}

export function broadcastGameState(io: Server, room: GameRoom) {
  if (!room.game) return;

  for (const player of room.game.players) {
    if (!player.socketId) continue;
    io.to(player.socketId).emit("game:state", redactGameForPlayer(room.game, player));
  }
}

export function broadcastRoomState(io: Server, room: GameRoom) {
  io.to(room.id).emit("room:state", {
    roomId: room.id,
    hostId: room.hostId,
    players: room.players,
  });
}
