const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './gemini.env' });

// Import routes
const amaRoutes = require('./routes/ama');
const chatRoutes = require('./routes/chat');
const geminiRoutes = require('./routes/gemini');

// Import database connection
const { pool } = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// API Routes
app.use('/api/ama', amaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/gemini', geminiRoutes);

// Socket.IO connection handling
const connectedUsers = new Map();
const sessionRooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join a session room
  socket.on('join-session', async (data) => {
    const { sessionId, userId, userName } = data;
    
    // Join the session room
    socket.join(`session-${sessionId}`);
    sessionRooms.set(socket.id, sessionId);
    connectedUsers.set(socket.id, { userId, userName, sessionId });
    
    // Notify others in the session
    socket.to(`session-${sessionId}`).emit('user-joined', {
      userId,
      userName,
      timestamp: new Date()
    });
    
    console.log(`${userName} joined session ${sessionId}`);
  });
  
  // Handle chat messages
  socket.on('send-message', async (data) => {
    const { sessionId, userId, userName, message, userRole } = data;
    
    try {
      // Save message to database
      const query = `
        INSERT INTO chat_messages (session_id, user_id, user_name, message, user_role, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        sessionId, userId, userName, message, userRole, new Date()
      ]);
      
      const savedMessage = result.rows[0];
      
      // Broadcast message to all users in the session
      io.to(`session-${sessionId}`).emit('new-message', {
        id: savedMessage.id,
        userId,
        userName,
        message,
        userRole,
        timestamp: savedMessage.timestamp
      });
      
      console.log(`Message sent in session ${sessionId}: ${message}`);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { sessionId, userName, isTyping } = data;
    socket.to(`session-${sessionId}`).emit('user-typing', {
      userName,
      isTyping
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const { sessionId, userName } = userInfo;
      
      // Notify others in the session
      socket.to(`session-${sessionId}`).emit('user-left', {
        userName,
        timestamp: new Date()
      });
      
      // Clean up
      connectedUsers.delete(socket.id);
      sessionRooms.delete(socket.id);
      
      console.log(`${userName} left session ${sessionId}`);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 AMA Sessions backend ready!`);
  console.log(`🔌 Socket.IO server initialized`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    pool.end();
  });
});

