import { Socket } from "socket.io";
import { chessEvents } from "../constants/events";
import Game from "./Game";

class GameManager {
  private games: Game[];
  private pendingUser: Socket | null;
  private activePlayers: Socket[];

  constructor() {
    this.games = [];
    this.activePlayers = [];
    this.pendingUser = null;
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
