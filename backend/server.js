import express from 'express';
//import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {YSocketIO} from 'y-socket.io/dist/server';

const app = express();

app.use(express.static('public'));
//app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, { 
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});

const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();

// Debug connections
io.on('connection', (socket) => {
    console.log('📡 Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });

    socket.on('sync', (msg) => {
        console.log('🔄 Sync message from', socket.id, ':', msg);
    });

    socket.on('error', (err) => {
        console.error('⚠️ Socket error:', err);
    });
});

app.get('/health', (req, res) => {
    res.status(200).json(
        {message: 'Server is healthy!', 
            success: true
        }
    );
});


httpServer.listen(3001, () => {
    console.log('✅ Server is running on port 3001');
    console.log('📡 Waiting for WebSocket connections...');
}); 