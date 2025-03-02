import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { start } from "repl";

interface Player {
  id:string;
  ready:boolean;
  drawing:string | null;
  score: number;
}

interface Room {
  players: Player[];
  word: string | null;
  gameStarted: boolean;
  gameEnded: boolean;
}

const rooms: Record<string,Room> = {};
const words = ['cat', 'dog'];
const SocketHandler = (req: NextApiRequest,res:NextApiResponse) => {

  if(!res.socket){
    res.status(500).send("Socket not available");
    return;
  }

  if((res.socket as any).server.io){
    console.log("Socket is already running");
    res.end();
    return;    
  }

  const io = new Server((res.socket as any).server.io);
  (res.socket as any).server.io = io;

  io.on('connection', (socket)=> {
    console.log(`Client connected: ${socket.id}`);

    socket.on('create-room', ()=>{
      const roomId = uuidv4().substring(0,6);
      rooms[roomId] = {
        players : [{id: socket.id, ready: false, drawing: null, score:0}],
        word: null,
        gameStarted: false,
        gameEnded: false
      };

      socket.join(roomId);
      socket.emit("room-created", roomId);
    });

    socket.on("join-room", (roomId: string) => {
      if(!rooms[roomId]){
        socket.emit("Error", "Room does not exist");
        return;
      }

      if(rooms[roomId].players.length >= 2){
        socket.emit("Error","Room is Full");
        return;
      }

      socket.join(roomId);

      rooms[roomId].players.push({id: socket.id, ready: false, drawing: null, score:0})
      socket.emit("room-joined", roomId);
      io.to(roomId).emit("player-joined", rooms[roomId].players.length);
    });

    socket.on("player-ready", (roomId: string)=> {
      if(!rooms[roomId]){
        return;
      }

      const playerIndex = rooms[roomId].players.findIndex(player => player.id == socket.id);

      if(playerIndex == -1 ){
        return;
      }

      rooms[roomId].players[playerIndex].ready = true;

      const allReady = rooms[roomId].players.every(player => player.ready);

      if(allReady && rooms[roomId].players.length == 2){
        startGame(roomId,io);
      }

    });

    socket.on("disconnect", () => {
      for (const roomId in rooms){
        const playerIndex = rooms[roomId].players.findIndex( player => player.id == socket.id);
        if(playerIndex != 1){
          rooms[roomId].players.splice(playerIndex,1);

          if(rooms[roomId].players.length == 0){
            delete rooms[roomId];
          }
          else{
            io.to(roomId).emit("player-left");
          }
        }
      }
    });

  });

  console.log("Socket Server Started");
  res.end();

}
