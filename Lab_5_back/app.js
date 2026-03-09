const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3001;

// Opcional: almacenar el estado del tablero para nuevos usuarios
let drawHistory = [];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Asignar color aleatorio al usuario
    const userColor = getRandomColor();
    socket.emit('assignColor', userColor);

    // Enviar historial de dibujo al usuario nuevo
    socket.emit('drawHistory', drawHistory);

    // Evento de dibujo
    socket.on('draw', (data) => {
        drawHistory.push(data);
        socket.broadcast.emit('draw', data);
    });

    // Evento de borrar
    socket.on('clear', () => {
        drawHistory = [];
        io.emit('clear');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

function getRandomColor() {
    // Colores pastel
    const colors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#D5BAFF', '#FFBAED', '#BAFFD9', '#FFD6BA', '#BAF7FF'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

app.get('/', (req, res) => {
    res.send('Tablero colaborativo backend funcionando');
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
