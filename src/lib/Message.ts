import { Socket } from "socket.io";

export class Message {
  constructor(
    public senderId: string,
    public content: string,
    public timeStamp: Date = new Date()
  ) {}
}
