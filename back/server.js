// Importações
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const deepl = require("deepl-node");
const Room = require("./models/Room");
const User = require("./models/User");

// Configurações
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permite todas as origens
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com MongoDB
mongoose
    .connect(
        "mongodb+srv://alfredo:6roEKa5nx28TLX2E@chat.ngyli.mongodb.net/?retryWrites=true&w=majority&appName=chat"
    )
    .then(() => console.log("Conectado ao MongoDB"))
    .catch((error) => console.error("Erro ao conectar ao MongoDB:", error));

// Funções de Utilidade
const authKey = "1233c090-3cd2-4ed9-98c9-ee81b3bc5001:fx";
const translator = new deepl.Translator(authKey);

// Rotas de API
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

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.status(401).send("Credenciais inválidas.");
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

app.get("/rooms", async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(400).send("Erro ao obter salas: " + error.message);
    }
});

app.get("/room/:roomName", async (req, res) => {
    try {
        const room = await Room.find({ name: req.params.roomName });
        res.status(200).json(room);
    } catch (error) {
        res.status(400).send("Erro ao obter sala: " + error.message);
    }
});

app.get("/room/:userId", async (req, res) => {
    try {
        const rooms = await Room.find({ users: req.params.userId });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(400).send("Erro ao obter salas: " + error.message);
    }
});

app.post("/createRoom", async (req, res) => {
    const { roomName, userId } = req.body;
    try {
        let room = await Room.findOne({ name: roomName });
        if (room) return res.status(400).send({ message: "Sala já existe." });
        room = new Room({ name: roomName, users: [userId] });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar sala!" });
    }
});

app.post("/translate", async (req, res) => {
    try {
        const { msg, lang2 } = req.body;
        const msgTraduzida = await translator.translateText(msg, null, lang2);
        res.send({ msg: msgTraduzida.text });
    } catch (error) {
        res.status(500).send("Erro ao traduzir mensagem.");
    }
});

// Configuração do Socket.io
io.on("connection", (socket) => {
    console.log("Novo usuário conectado:", socket.id);

    socket.on("authenticate", async (userId) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                console.log("Usuário não encontrado!");
                return;
            }
            socket.userId = userId;
            console.log(`Usuário autenticado: ${socket.userId}`);
        } catch (error) {
            console.log("Erro na autenticação");
        }
    });

    socket.on("joinRoom", async ({ roomName, username, language }) => {
        try {
            if (!socket.userId) return;
            let room = await Room.findOne({ name: roomName });
            if (!room) return console.log("Sala não Encontrada");
            if (!room.users.includes(socket.userId)) {
                room.users.push(socket.userId);
                await room.save();
                socket.join(roomName);
                console.log(
                    `Usuário ${socket.userId} entrou na sala: ${roomName}`
                );
                io.to(roomName).emit("message", {
                    userId: "Geral",
                    message: "Entrou na sala",
                    username,
                    language,
                });
                return;
            }
            socket.join(roomName);
            console.log(
                `Usuário ${socket.userId} já está na sala: ${roomName}`
            );
        } catch (error) {
            console.error("Erro ao entrar na sala:", error);
        }
    });

    socket.on("leaveRoom", async (roomName) => {
        if (!socket.userId) return;
        try {
            const room = await Room.findOne({ name: roomName });
            if (room) {
                room.users = room.users.filter((id) => id !== socket.userId);
                await room.save();
                if (room.users.length === 0)
                    await Room.deleteOne({ name: roomName });
                socket.leave(roomName);
                console.log(
                    `Usuário ${socket.userId} saiu da sala: ${roomName}`
                );
                io.to(roomName).emit("message", {
                    userId: "Geral",
                    message: "Saiu da sala",
                });
            }
        } catch (error) {
            console.error("Erro ao sair da sala:", error);
        }
    });

    socket.on("stopListen", async (roomName) => {
        if (!socket.userId) return;
        try {
            const room = await Room.findOne({ name: roomName });
            if (room) {
                socket.leave(roomName);
                console.log(
                    `Usuário ${socket.userId} parou de escutar a sala: ${roomName}`
                );
            }
        } catch (error) {
            console.error("Erro ao parar de escutar a sala:", error);
        }
    });

    socket.on(
        "chatMessage",
        async ({ roomName, message, username, language }) => {
            if (!socket.userId) return;
            try {
                console.log(
                    `Mensagem na sala ${roomName} de ${socket.userId}: ${message}`
                );
                io.to(roomName).emit("message", {
                    userId: socket.userId,
                    message,
                    username,
                    language,
                });
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                socket.emit("error", "Erro ao enviar mensagem.");
            }
        }
    );

    socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
    });
});

// Servidor rodando na porta especificada
const PORT = 3333;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
