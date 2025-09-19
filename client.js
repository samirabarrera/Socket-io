import express from 'express'
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const app = express ();
const server = createServer(app)
const io = new Server(server)

const __dirname =dirname(fileURLToPath(import.meta.url))

app.use("/Frontend", express.static(join(__dirname, "Frontend")));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
})

//Guardar el array de los últimos 10 mensajes
const lastMessages = [];

//Avisando conexión de usuario
io.on('connection', (socket) => {
  console.log('User is connected')

  //Para guardar los mensajes (últimos 10)
  lastMessages.forEach(msg => {
    socket.emit('chat message', msg)
  })

  //Notificar conexión
  io.emit('chat message', 'Un nuevo usuario se ha conectado');
  //Recibir mensajes
  socket.on('chat message', (msg) => {
    lastMessages.push(msg);
    if(lastMessages.length > 10) lastMessages.shift();
    io.emit('chat message', msg);
  });

  //Desconexión
  socket.on('disconnect', () => {
    console.log('User has been disconnected')
    io.emit('chat message', 'Usuario se ha desconectado');
  });
});

//Levantando puerto
server.listen(3000, () => {
  console.log('Server running')
})