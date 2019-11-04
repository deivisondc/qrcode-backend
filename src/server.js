const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
const multer = require('multer');
const uploadConfig = require('./config/upload');
const path = require('path')

const app = express();
const server = http.Server(app);
const io = socketio(server);
const upload = multer(uploadConfig);

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));

const connectedUsers = {};

io.on('connection', (socket) => {
  const { userId } = socket.handshake.query;

  connectedUsers[userId] = socket.id;
});

app.use((req, res, next) => {
  req.io = io;
  req.connectedUsers = connectedUsers;

  return next();
});

app.post('/upload', upload.single('thumbnail'), (req, resp) => {
  const {filename} = req.file
  req.io.to(connectedUsers['1']).emit('updatePicture', filename)
  return resp.json({})
})

server.listen(3333)