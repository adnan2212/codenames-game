import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createRoom, joinRoom, getRoom, joinTeam, startGame } from "./rooms/roomManager";
import { giveClue, selectCard, endTurn } from "../../shared/game/gameLogic";
import { PlayerRole, Team } from "../../shared/types/game";
import { broadcastGameState, broadcastRoomState } from "./rooms/broadcast";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // create-room
  socket.on("room:create", (
    { playerName }: { playerName: string }
  ) => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      socket.emit("room:error", {
        message: "Nickname is required"
      });
      return;
    }
  
    const room = createRoom(socket.id, trimmedName);

    socket.join(room.id);

    socket.emit("room:created", {
      roomId: room.id,
    });

    // Send lobby state 
    broadcastRoomState(io, room);

    console.log(`Room created: ${room.id} by ${trimmedName}`);
  });

  // join-room
  socket.on("room:join", 
    ({ roomId, playerName }: { roomId: string, playerName: string }) => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      socket.emit("room:error", {
        message: "Nickname is required",
      });
      return;
    }

    const player = joinRoom(roomId, socket.id, trimmedName);

    if (!player) {
      socket.emit("room:error", {
        message: "Room not found",
      });

      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit("room:error", {
        message: "Room not found",
      });
      return;
    }

    socket.join(roomId);

    socket.emit("room:joined", {
      roomId,
      player,
    });

    // Send updated lobby state to everyone
    broadcastRoomState(io, room);
    console.log(`${player.name} joined room ${roomId}`);
  });

  // room-check
  socket.on("room:check", ({ roomId }: { roomId: string }) => {
    const room = getRoom(roomId);

    if (!room) {
      socket.emit("room:error", {
        message: "Room not found"
      });

      return;
    }

    const existingPlayer = room.players.find((player) => player.socketId === socket.id);

    if (existingPlayer) {
      // already-connected player
      socket.join(roomId);

      broadcastRoomState(io, room);
      return;
    }

    // new player joining existing room
    socket.emit("room:needs-join", {
      roomId
    });

  });

  // join-team
  socket.on("room:join-team", ({ roomId, team, role }: { roomId: string, team: Team, role: PlayerRole }) => {
    const result = joinTeam(roomId, socket.id, team, role);
    if (!result.ok) {
      socket.emit("room:error", { message: result.error });
      return;
    }

    broadcastRoomState(io, result.data)
  });

  // game:start
  socket.on("game:start", ({ roomId }: { roomId: string }) => {
    const result = startGame(roomId, socket.id);
    if (!result.ok) {
      socket.emit("room:error", { message: result.error });
      return;
    }

    broadcastGameState(io, result.data);
  });

  // handle card selection
  socket.on("game:select-card", ({ roomId, cardId }) => {
    console.log("Card selected:", roomId, cardId);
    const room = getRoom(roomId);

    if (!room) {
      socket.emit("room:error", {
        message: "Room not found",
      });
      return;
    }

    if (!room.game) return;

    // 1. Find the player
    const player = room.players.find((player) => player.socketId === socket.id);

    // 2. Validate that player can select a card
    if (!player) {
      socket.emit("room:error", {
        message: "Player is not in this room",
      });
      return;
    }

    // 3. Call selectCard()
    const updateGame = selectCard(room.game, player.id, cardId);

    // 4. Update room.game
    room.game = updateGame;

    // 5. Broadcast new state
    broadcastGameState(io, room);
  });

  // handle clue
  socket.on("game:give-clue", ({ roomId, playerId, word, number }) => {
    const room = getRoom(roomId);

    if (!room) {
      socket.emit("room:error", {
        message: "Room not found",
      });
      return;
    }

    if (!room.game) return;

    // Find the player who gave the clue
    const player = room.players.find((player) => player.socketId === socket.id);

    if (!player) {
      socket.emit("room:error", {
        message: "Player is not in this room",
      });
      return;
    }

    const updateGame = giveClue(room.game, playerId, word, number);

    room.game = updateGame;

    broadcastGameState(io, room);
  });

  // handle turn ending
  socket.on("game:end-turn", ({ roomId }) => {
    const room = getRoom(roomId);

    if (!room) {
      socket.emit("room:error", {
        message: "Room not found",
      });
      return;
    }

    if (!room.game) return;

    const player = room.players.find((player) => player.socketId === socket.id);

    if (!player) {
      socket.emit("room:error", {
        message: "Player is not in this room",
      });
      return;
    }

    const updateGame = endTurn(room.game, player.id);

    room.game = updateGame;

    broadcastGameState(io, room);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
