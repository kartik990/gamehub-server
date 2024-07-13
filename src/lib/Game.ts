import { Chess } from "chess.js";
import { Socket } from "socket.io";
import { Message } from "./Message";
import { io } from "..";
import { chessEvents } from "../constants/events";

class Game {
  public gameId: string;
  public player1: Socket;
  public player2: Socket;
  public board: Chess;
  private moves: { from: string; to: string; col: string; piece: string }[];
  private chats: Message[];

  constructor(player1: Socket, player2: Socket) {
    this.gameId = `${player1.id}&&${player2.id}`;
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.chats = [];
  }

  moveHandler(move: { from: string; to: string; promotion?: string }) {
    const currTurn = this.board.turn();

    try {
      this.board.move(move);

      const history = this.board.history({ verbose: true });
      const lastMv = history[history.length - 1];
      const moveToSend = {
        from: lastMv.from,
        to: lastMv.to,
        col: lastMv.color,
        piece: lastMv.piece,
      };
      this.moves.push(moveToSend);
      const nxtTurn = this.board.turn();
      const isCheck = this.board.inCheck();

      io.to(this.gameId).emit(chessEvents.UPDATE_BOARD, {
        board: this.board.board(),
        turn: nxtTurn,
        latestMove: moveToSend,
        isCheck,
      });
    } catch (err: any) {
      if (err.message.startsWith("Invalid move")) {
        const message = "Invalid move please try again";
        io.to(this.gameId).emit(chessEvents.WARNING_MSG, message, currTurn);
        console.log(err);
      }
    }

    // this.board.inCheck();

    // this.board.isCheckmate();

    // this.board.isDraw();
    // this.board.isStalemate();
    // this.board.isGameOver();
    // this.board.isInsufficientMaterial();

    // broadcast the move
  }

  messageHandler(message: Message) {
    this.chats.push(message);
    io.to(this.gameId).emit(chessEvents.ChatFromServer, message);
  }
}

export default Game;
