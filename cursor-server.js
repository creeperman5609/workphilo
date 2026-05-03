// Simple WebSocket server for collaborative cursors
// Run with: node cursor-server.js

const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Collaborative Cursor Server Running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws) => {
    // Generate unique user ID
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    clients.set(userId, ws);

    console.log(`User ${userId} connected. Total users: ${clients.size}`);

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        userId: userId,
        message: 'Connected to collaborative cursor server'
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'cursor') {
                // Broadcast cursor position to all other clients
                const cursorData = {
                    type: 'cursor',
                    userId: data.userId,
                    position: data.position
                };

                // Send to all clients except sender
                clients.forEach((client, clientId) => {
                    if (clientId !== data.userId && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(cursorData));
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected. Total users: ${clients.size}`);

        // Notify other clients that user left
        const leaveData = {
            type: 'user_left',
            userId: userId
        };

        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(leaveData));
            }
        });
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        clients.delete(userId);
    });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Collaborative cursor server running on port ${PORT}`);
    console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});