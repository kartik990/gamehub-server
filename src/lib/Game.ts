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
  private moves: { from: string; to: string }[];
  private startTime: Date;
  private chats: Message[];

  constructor(player1: Socket, player2: Socket) {
    this.gameId = `${player1.id}&&${player2.id}`;
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.moves = [];
    this.startTime = new Date();
    this.chats = [];
  }

  moveHandler(
    // player: Socket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // validate move param
    // is it this user's move
    // is the move valid
    // update the board
    // check  for checkmate/stalemate

    try {
      this.board.move(move);
      this.moves.push(move);
      const turn = this.board.turn();
      io.to(this.gameId).emit(
        chessEvents.UPDATE_BOARD,
        this.board.board(),
        turn
      );
    } catch (err: any) {
      if (err.message.startsWith("Invalid move")) {
        //todo warning
      }
    }

    // this.board.moves();

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
