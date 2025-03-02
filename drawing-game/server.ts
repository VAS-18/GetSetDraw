import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        handle(req, res, parse(req.url || "", true));
    });


    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log("A Player Connected: ", socket.id);


        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`Player ${socket.id} joined room ${roomId}`);
        });

        socket.on("send-drawing", (data) => {
            socket.to(data.roomId).emit("receive-drawing", data.stroke);
        });

    });

    httpServer.listen(3001, () => {
        console.log("Server Running on port 3000");
        
    });

});