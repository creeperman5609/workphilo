// Collaborative Cursor System
class CollaborativeCursor {
    constructor() {
        this.userId = this.generateUserId();
        this.remoteCursors = new Map();
        this.throttleDelay = 50; // Send position updates every 50ms
        this.lastSentTime = 0;

        this.init();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Track mouse leaving/entering window
        document.addEventListener('mouseenter', () => this.showLocalCursor());
        document.addEventListener('mouseleave', () => this.hideLocalCursor());

        // Connect to WebSocket server
        this.connectToServer();

        console.log('Collaborative cursor initialized for user:', this.userId);
    }

    handleMouseMove(e) {
        const now = Date.now();
        if (now - this.lastSentTime < this.throttleDelay) return;

        this.lastSentTime = now;

        const position = {
            x: e.clientX,
            y: e.clientY,
            timestamp: now
        };

        // In a real implementation, send to WebSocket server
        this.broadcastCursorPosition(position);
    }

    broadcastCursorPosition(position) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'cursor',
                userId: this.userId,
                position: position
            }));
        }
    }

    receiveRemoteCursor(userId, position) {
        if (userId === this.userId) return; // Don't show our own cursor

        let cursorElement = this.remoteCursors.get(userId);

        if (!cursorElement) {
            cursorElement = this.createRemoteCursor(userId);
            this.remoteCursors.set(userId, cursorElement);
        }

        // Update cursor position
        cursorElement.style.left = position.x + 'px';
        cursorElement.style.top = position.y + 'px';
        cursorElement.style.display = 'block';

        // Add visual feedback for recent movement
        cursorElement.classList.add('cursor-active');
        setTimeout(() => {
            cursorElement.classList.remove('cursor-active');
        }, 100);

        // Auto-hide cursor after inactivity
        clearTimeout(cursorElement.hideTimeout);
        cursorElement.hideTimeout = setTimeout(() => {
            cursorElement.style.display = 'none';
        }, 5000);
    }

    createRemoteCursor(userId) {
        const cursor = document.createElement('div');
        cursor.className = 'remote-cursor';
        cursor.setAttribute('data-user', userId);

        // Create cursor image
        const cursorImg = document.createElement('img');
        cursorImg.src = 'assets/cursor.png';
        cursorImg.alt = 'Remote cursor';
        cursorImg.className = 'cursor-image';

        // Create user label
        const userLabel = document.createElement('div');
        userLabel.className = 'cursor-label';
        userLabel.textContent = userId.split('_')[1]; // Show just the ID part

        cursor.appendChild(cursorImg);
        cursor.appendChild(userLabel);

        document.getElementById('remote-cursors').appendChild(cursor);

        return cursor;
    }

    showLocalCursor() {
        // Optional: Add visual feedback for local cursor
        document.body.style.cursor = 'auto';
    }

    hideLocalCursor() {
        // Optional: Hide local cursor when leaving window
    }

    removeRemoteCursor(userId) {
        const cursorElement = this.remoteCursors.get(userId);
        if (cursorElement) {
            cursorElement.remove();
            this.remoteCursors.delete(userId);
            console.log(`Removed cursor for user: ${userId}`);
        }
    }

    // Connect to WebSocket server
    connectToServer() {
        // Get server URL from environment or use Railway domain
        // After deploying to Railway, update this with your actual URL:
        // e.g., const serverUrl = 'wss://workphilo-production.up.railway.app';
        
        const serverUrl = this.getServerUrl();

        try {
            this.ws = new WebSocket(serverUrl);

            this.ws.onopen = () => {
                console.log('Connected to collaborative cursor server at:', serverUrl);
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'cursor') {
                        this.receiveRemoteCursor(data.userId, data.position);
                    } else if (data.type === 'welcome') {
                        console.log('Server welcome:', data.message);
                        this.userId = data.userId;
                    } else if (data.type === 'user_left') {
                        this.removeRemoteCursor(data.userId);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('Disconnected from cursor server - switching to demo mode');
                this.startDemoMode();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                console.log('Server unavailable - switching to demo mode');
                this.startDemoMode();
            };

        } catch (error) {
            console.error('Failed to connect to WebSocket server');
            console.log('For local development, run: npm start');
            this.startDemoMode();
        }
    }

    getServerUrl() {
        // Production: Use Railway or your deployment URL
        // Change this to your actual deployed server URL!
        const railwayUrl = 'wss://workphilo-production.up.railway.app'; // UPDATE THIS!
        
        // Development: Use localhost
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDev) {
            return 'ws://localhost:8080';
        }
        
        return railwayUrl;
    }

    startDemoMode() {
        // Fallback demo mode when server is not available
        console.log('Server unavailable - running in demo mode with simulated remote users');

        // Create fake remote users
        const fakeUsers = ['remote_user_1', 'remote_user_2', 'remote_user_3'];

        fakeUsers.forEach(userId => {
            // Simulate random cursor movements
            setInterval(() => {
                const position = {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    timestamp: Date.now()
                };
                this.receiveRemoteCursor(userId, position);
            }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
        });
    }
}

// Initialize collaborative cursor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.collaborativeCursor = new CollaborativeCursor();
});