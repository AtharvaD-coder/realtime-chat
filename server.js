import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Set up socket.io server
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for messages from the client
    socket.on('message', (message) => {
      console.log('📩 Message received:', message);
      
      // Broadcast the message to all connected clients
      io.emit('message', message);  // This emits the message to all clients
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  // Start the server
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
