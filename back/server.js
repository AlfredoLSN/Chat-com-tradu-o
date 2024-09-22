// Importações
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");
const User = require("./models/User");
const cors = require("cors");
// Configurações
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect("mongodb://localhost:27017/chat")
    .then(() => {
        console.log("Conectado ao MongoDB");
    })
    .catch((error) => {
        console.error("Erro ao conectar ao MongoDB:", error);
    });

// Rota de Registro de Usuário
app.post("/register", async (req, res) => {
    const { username, email, password, language } = req.body;
    try {
        const user = new User({ username, email, password, language });
        await user.save();
        res.status(201).send("Usuário registrado com sucesso.");
    } catch (error) {
        res.status(400).send("Erro ao registrar usuário: " + error.message);
    }
});

// Rota de Login de Usuário
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).send("Credenciais inválidas.");
        }
        // Retornar o ID do usuário para o frontend, que usará para identificar a conexão
        const rooms = await Room.find({ users: user._id });
        res.status(200).send({
            userId: user._id,
            username: user.username,
            language: user.language,
            rooms,
        });
    } catch (error) {
        res.status(400).send("Erro ao fazer login: " + error.message);
    }
});

app.post("/createRoom", async (req, res) => {
    const { roomName, userId } = req.body;
    try {
        // Verifica se a sala já existe
        let room = await Room.findOne({ name: roomName });
        if (room) {
            return res.status(400).send("Sala já existe.");
        }

        // Cria uma nova sala e adiciona o usuário à lista de usuários
        room = new Room({ name: roomName, users: [userId] });
        await room.save();

        res.status(201).send(`Sala '${roomName}' criada com sucesso.`);
    } catch (error) {
        res.status(500).send("Erro ao criar a sala: " + error.message);
    }
});

// Evento básico de conexão do socket
io.on("connection", (socket) => {
    console.log("Novo usuário conectado:", socket.id);

    socket.on("authenticate", async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                //TODO
            }
            socket.userId = userId;
            console.log(`Usuario autenticado ${socket.id}`);
        } catch (error) {
            console.log("Erro na autenticação");
        }
    });

    socket.on("joinRoom", async (roomName) => {
        try {
            if (!socket.userId) {
                return;
            }
            let room = await Room.findOne({ name: roomName });
            //TODO
            if (!room) {
                console.log("Sala não Encontrada");
            }
            // Adiciona o usuário à sala no MongoDB
            //room.users.push(socket.id);
            //await room.save();
            if (!room.users.includes(socket.userId)) {
                room.users.push(socket.userId);
                await room.save();
            }
            socket.join(roomName);
            console.log(`Usuario ${socket.userId} entrou na sala: ${roomName}`);
            io.to(roomName).emit("message", `Usuário entrou na sala.`);
        } catch (error) {
            console.error("Erro ao entrar na sala:", error);
        }
    });

    socket.on("leaveRoom", async (roomName) => {
        if (!socket.userId) {
            return;
        }

        try {
            const room = await Room.findOne({ name: roomName });
            if (room) {
                room.users = room.users.filter((id) => id !== socket.userId);
                await room.save();

                if (room.users.length === 0) {
                    await Room.deleteOne({ name: roomName });
                }

                socket.leave(roomName);
                console.log(
                    `Usuário ${socket.userId} saiu da sala: ${roomName}`
                );
                io.to(roomName).emit("message", `Usuário saiu da sala.`);
            }
        } catch (error) {
            console.error("Erro ao sair da sala:", error);
        }
    });

    socket.on("chatMessage", async ({ roomName, message }) => {
        if (!socket.userId) {
            return;
        }
        try {
            console.log(
                `Mensagem na sala ${roomName} de ${socket.userId}: ${message}`
            );
            io.to(roomName).emit("message", { userId: socket.userId, message }); // Envia a mensagem para todos na sala
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            socket.emit("error", "Erro ao enviar mensagem.");
        }
    });

    // Desconexão do usuário
    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
    });
});

const PORT = 3333;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
