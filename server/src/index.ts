import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { createRoom, joinRoom, getRoom } from "./rooms/roomManager";
import { endTurn, giveClue, selectCard } from "../../shared/game/gameLogic";

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
  socket.on("room:create", () => {
    const room = createRoom();

    socket.join(room.id);

    socket.emit("room:created", {
      roomId: room.id,
    });

    console.log(`Room created: ${room.id}`);
  });

  // join-room
  socket.on("room:join", ({ roomId }) => {
    const player = joinRoom(roomId, socket.id);

    if (!player) {
      console.error(
        `Player ${socket.id} attempted to join room ${roomId}, but the room was not found.`,
      );
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

    // Send current game state
    io.to(roomId).emit("game:state", room.game);

    console.log(
      `${socket.id} joined ${roomId} as ${player.team} ${player.role}`,
    );
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

    // TODO
    // 1. Find the player
    const player = room.game.players.find((player) => player.id === socket.id);

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
    io.to(roomId).emit("game:state", updateGame);
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

    // Find the player who gave the clue
    const player = room.game.players.find((player) => player.id === socket.id);

    if (!player) {
      socket.emit("room:error", {
        message: "Player is not in this room",
      });
      return;
    }

    const updateGame = giveClue(room.game, playerId, word, number);

    room.game = updateGame;

    io.to(roomId).emit("game:state", updateGame);
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

    const player = room.game.players.find((player) => player.id === socket.id);

    if (!player) {
      socket.emit("room:error", {
        message: "Player is not in this room",
      });
      return;
    }

    const updateGame = endTurn(room.game, player.id);

    room.game = updateGame;

    io.to(roomId).emit("game:state", updateGame);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
