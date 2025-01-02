const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path'); // Require the 'path' module

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = {};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        console.log('Received message:', data); // Log received messages

        if (data.action === 'createRoom') {
            const roomId = Math.random().toString(36).substr(2, 9);
            rooms[roomId] = {
                clients: [ws],
                gameState: {}
            };
            ws.send(JSON.stringify({ action: 'roomCreated', roomId: roomId }));
            console.log(`Room created: ${roomId}`); // Log room creation
        }

        if (data.action === 'joinRoom') {
            const roomId = data.roomId;
            if (rooms[roomId]) {
                rooms[roomId].clients.push(ws);
                ws.send(JSON.stringify({ action: 'joinedRoom', roomId: roomId, gameState: rooms[roomId].gameState }));
                rooms[roomId].clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ action: 'newPlayerJoined' }));
                    }
                });
                console.log(`Client joined room: ${roomId}`); // Log joining room
            } else {
                ws.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
                console.log(`Room not found: ${roomId}`); // Log room not found
            }
        }

        if (data.action === 'startGame') {
            const roomId = data.roomId;
            if (rooms[roomId]) {
                rooms[roomId].gameState = { /* initial game state setup */ };
                rooms[roomId].clients.forEach(client => {
                    client.send(JSON.stringify({ action: 'gameStarted', gameState: rooms[roomId].gameState }));
                });
                console.log(`Game started in room: ${roomId}`); // Log game start
            } else {
                ws.send(JSON.stringify({ action: 'error', message: 'Room not found' }));
                console.log(`Room not found for starting game: ${roomId}`); // Log room not found for starting game
            }
        }
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
