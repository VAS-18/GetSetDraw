import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";

interface Player {
  id: string;
  ready: boolean;
  drawing: string | null;
  score: number;
}

interface Room {
  players: Player[];
  word: string | null;
  gameStarted: boolean;
  gameEnded: boolean;
}

const rooms: Record<string, Room> = {};
const words = ['cat', 'dog'];
const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {

  if (!res.socket) {
    res.status(500).send("Socket not available");
    return;
  }

  if ((res.socket as any).server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  const io = new Server((res.socket as any).server.io);
  (res.socket as any).server.io = io;

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('create-room', () => {
      const roomId = uuidv4().substring(0, 6);
      rooms[roomId] = {
        players: [{ id: socket.id, ready: false, drawing: null, score: 0 }],
        word: null,
        gameStarted: false,
        gameEnded: false
      };

      socket.join(roomId);
      socket.emit("room-created", roomId);
    });

    socket.on("join-room", (roomId: string) => {
      if (!rooms[roomId]) {
        socket.emit("Error", "Room does not exist");
        return;
      }

      if (rooms[roomId].players.length >= 2) {
        socket.emit("Error", "Room is Full");
        return;
      }

      socket.join(roomId);

      rooms[roomId].players.push({ id: socket.id, ready: false, drawing: null, score: 0 })
      socket.emit("room-joined", roomId);
      io.to(roomId).emit("player-joined", rooms[roomId].players.length);
    });

    socket.on("player-ready", (roomId: string) => {
      if (!rooms[roomId]) {
        return;
      }

      const playerIndex = rooms[roomId].players.findIndex(player => player.id == socket.id);

      if (playerIndex == -1) {
        return;
      }

      rooms[roomId].players[playerIndex].ready = true;

      const allReady = rooms[roomId].players.every(player => player.ready);

      if (allReady && rooms[roomId].players.length == 2) {
        startGame(roomId, io);
      }

    });

    socket.on("drawing-data", ({ roomId, drawingData }: { roomId: string, drawingData: string }) => {
      if (!rooms[roomId]) {
        return;
      }

      const playerIndex = rooms[roomId].players.findIndex(player => player.id == socket.id);
      if (playerIndex == -1) {
        return;
      }

      rooms[roomId].players[playerIndex].drawing = drawingData;

      const allSubmited = rooms[roomId].players.every(player => player.drawing != null);

      if (allSubmited) {
        evalulateDrawings(roomId, io);
      }
    })

    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        const playerIndex = rooms[roomId].players.findIndex(player => player.id == socket.id);
        if (playerIndex != 1) {
          rooms[roomId].players.splice(playerIndex, 1);

          if (rooms[roomId].players.length == 0) {
            delete rooms[roomId];
          }
          else {
            io.to(roomId).emit("player-left");
          }
        }
      }
    });

  });

  console.log("Socket Server Started");
  res.end();

};


function startGame(roomId: string, io: Server) {
  const randomWord = words[Math.floor(Math.random() * words.length)];
  rooms[roomId].word = randomWord;
  rooms[roomId].gameStarted = true;


  io.to(roomId).emit("game-started", randomWord);

  //Game Timer

  setTimeout(() => {

    io.to(roomId).emit("time-up");

    const allSubmited = rooms[roomId].players.every(player => player.drawing != null);
    if (!allSubmited) {
      rooms[roomId].players.forEach(player => {
        if (player.drawing == null) {
          player.drawing = "";
        }
      });
      evalulateDrawings(roomId, io);
    }

  }, 120000);

}


async function evalulateDrawings(roomId: string, io: Server) {
  try {
    //TODO: AI evaluation logic
    const AIscore = 0;
    
    //

    let winner = null;

    const player1 = rooms[roomId].players[0];
    const player2 = rooms[roomId].players[1];

    if (player1.score > player2.score) {
      winner = player1;
    }
    else if (player2.score > player1.score) {
      winner = player2;
    }
    else {
      winner = "draw";
    }

    rooms[roomId].gameEnded = true;

    io.to(roomId).emit("game-ended", {
      scores: rooms[roomId].players.map(player => player.score),
      winner: winner
    });

  } catch (error) {
    console.log("Error evaluating drawings: ", error);
    io.to(roomId).emit("error", "failed to eval drawings");
  }
}

export default SocketHandler;