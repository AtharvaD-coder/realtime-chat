import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, 
  },
};


// Prevent multiple Socket.IO instances in dev mode
let io: any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    
    const socket: any = res.socket;
    console.log('🔍 Checking for existing Socket.IO instance...');

    // Initialize Socket.IO if not already initialized
    if (!io) {
      console.log('🔌 Starting Socket.IO server...');

      io = new Server(socket.server, {
        path: "/api/socket",
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"]
        }
      });

      io.on('connection', (client: any) => {
        console.log('✅ User connected:', client.id);

        client.on('message', (message: any) => {
          console.log("📩 New Message Received:", message);
          io.emit('message', message);
        });

        client.on('disconnect', (reason: any) => {
          console.log(`❌ User disconnected: ${client.id} due to ${reason}`);
        });
      });

      socket.server.io = io; // Store instance to avoid multiple instances in dev mode
    } else {
      console.log("⚠️ Socket.IO server already running");
    }

    res.end(); 
  } catch (error: any) {
    console.error('🔥 Error in handler:', error);
    res.status(500).send('Internal Server Error');
  }
}
