const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

const agentLocations = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('locationUpdate', (data) => {
    if (data && data.agent && data.latitude && data.longitude) {
      const { agent, latitude, longitude } = data;
      console.log(`Location update received from ${agent}: Latitude: ${latitude}, Longitude: ${longitude}`);
      agentLocations[agent] = { latitude, longitude };
      io.emit('locationUpdate', { agent, latitude, longitude });
    } else {
      let missingParams = [];
      if (!data) missingParams.push('data');
      if (!data || !data.agent) missingParams.push('agent');
      if (!data || !data.latitude) missingParams.push('latitude');
      if (!data || !data.longitude) missingParams.push('longitude');

      console.log(`Missing parameters: ${missingParams.join(', ')}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
