const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

// Evento básico de conexão do socket
io.on("connection", (socket) => {
    console.log("Novo usuário conectado:", socket.id);

    // Desconexão do usuário
    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
    });
});

const PORT = 3333;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
