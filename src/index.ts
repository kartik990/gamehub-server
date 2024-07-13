import { Server } from "socket.io";
import server from "./server";
import GameManager from "./lib/GameManager";
import { Message } from "./lib/Message";
import { chessEvents } from "./constants/events";

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const gameManager = new GameManager();

// Define socket connection handler
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("error", console.log);

  socket.on(chessEvents.INIT_GAME, () => {
    gameManager.addUser(socket);
  });

  socket.on(
    chessEvents.MOVE,
    (
      gameId: string,
      move: { from: string; to: string; promotion?: string }
    ) => {
      const game = gameManager.findGameByGameId(gameId);
      if (game) {
        game.moveHandler(move);
      }
    }
  );

  socket.on(chessEvents.ChatToServer, (message: Message) => {
    const game = gameManager.findGameByPlayerId(socket.id);
    if (game) {
      game.messageHandler(message);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    gameManager.removeUser(socket);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

export { io };
