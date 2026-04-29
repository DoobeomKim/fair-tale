const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('Test Server Running');
});

io.on('connection', (socket) => {
  console.log('🔗 CONNECTION ESTABLISHED!', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 DISCONNECTED:', socket.id);
  });
  
  socket.on('test', (data) => {
    console.log('📡 TEST EVENT:', data);
    socket.emit('test-response', { message: 'Hello from server!' });
  });
});

httpServer.listen(4001, () => {
  console.log('Test server running on port 4001');
}); 