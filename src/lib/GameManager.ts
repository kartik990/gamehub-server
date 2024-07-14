import { Socket } from "socket.io";
import { chessEvents } from "../constants/events";
import Game from "./Game";
import { io } from "..";

class GameManager {
  private games: Game[];
  private pendingUser: Socket | null;
  private activePlayers: Socket[];
  private rooms: { roomId: string; waitingPlayer: Socket }[];

  constructor() {
    this.games = [];
    this.activePlayers = [];
    this.pendingUser = null;
    this.rooms = [];
  }

  createRoom(socket: Socket, roomId: string) {
    this.rooms.push({ roomId, waitingPlayer: socket });
  }

  joinRoom(socket: Socket, roomId: string) {
    const room = this.rooms.find((room) => room.roomId === roomId);

    if (!room) {
      socket.emit(chessEvents.ROOM_ERROR, "invalid room id");
      return;
    }

    const game = new Game(room?.waitingPlayer, socket);
    this.games.push(game);

    socket.join(game.gameId);
    room.waitingPlayer.join(game.gameId);

    socket.emit(chessEvents.NEW_GAME, game.gameId, game.board.board(), "w");
    room.waitingPlayer.emit(
      chessEvents.NEW_GAME,
      game.gameId,
      game.board.board(),
      "b"
    );

    this.rooms = this.rooms.filter((room) => room.roomId != roomId);
  }

  addUser(socket: Socket) {
    this.activePlayers.push(socket);
    if (this.pendingUser) {
      this.addGameHandler(socket);
    } else {
      this.pendingUser = socket;
    }
  }

  removeUser(socket: Socket) {
    this.activePlayers = this.activePlayers.filter((id) => id != socket);
    this.rooms = this.rooms.filter((room) => room.waitingPlayer != socket);

    if (this.pendingUser == socket) {
      this.pendingUser = null;
    }

    const game = this.findGameByPlayerId(socket.id);
    if (game) {
      io.to(game.gameId).emit(chessEvents.GAME_OVER, {
        message: "The other player left!",
      });
    }
  }

  findGameByPlayerId(id: string) {
    return this.games.find(
      (game) => game.player1.id === id || game.player2.id === id
    );
  }

  findGameByGameId(id: string) {
    return this.games.find((game) => game.gameId === id);
  }

  private addGameHandler(socket: Socket) {
    if (!this.pendingUser) return;

    const game = new Game(this.pendingUser, socket);
    this.games.push(game);

    socket.join(game.gameId);
    this.pendingUser.join(game.gameId);

    socket.emit(chessEvents.NEW_GAME, game.gameId, game.board.board(), "w");
    this.pendingUser.emit(
      chessEvents.NEW_GAME,
      game.gameId,
      game.board.board(),
      "b"
    );

    this.pendingUser = null;
  }
}

export default GameManager;
