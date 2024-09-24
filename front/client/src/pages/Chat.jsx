import React, { useEffect, useState } from "react";
import MessageInput from "../components/MessageInput";
import "../pages/pages.css";
import img1 from "../assets/comments-solid.svg";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const socket = io("https://chat-back-deploy.onrender.com");

export default function Chat() {
  // Estado para a sala atual
  const [currentRoom, setCurrentRoom] = useState(null);
  // Estado para armazenar as mensagens
  const [messages, setMessages] = useState([]);
  // Estado para armazenar as salas disponíveis
  const [rooms, setRooms] = useState([]);
  // Estado para pesquisa de salas
  const [searchRoom, setSearchRoom] = useState("");
  // Estado para criar uma nova sala
  const [createRoom, setCreateRoom] = useState("");

  // Estado para controlar o modal de pesquisa de sala
  const [showSearchModal, setShowSearchModal] = useState(false);
  // Estado para controlar o modal de criação de sala
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    // Carrega o usuário do localStorage e define as salas associadas
    const user = JSON.parse(localStorage.getItem("user"));
    
    if(!user) {
      navigate('/');
      return;
    }

    if (user && user.rooms) {
      setRooms(user.rooms);
    }
    // Emite a autenticação ao servidor socket
    socket.emit("authenticate", user.userId);
  }, []);

  useEffect(() => {
    // Recebe mensagens do servidor via socket
    socket.on("message", async (data) => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      const isSender = data.userId === currentUser.userId;
      let translate = "";

      try {
        // Faz a tradução da mensagem recebida para a linguagem do usuário atual
        translate = await axios.post(`https://chat-back-deploy.onrender.com/translate`, {
          msg: data.message,
          lang2: currentUser.language,
        });

        // Cria um novo objeto de mensagem traduzida
        const newMessage = {
          content: translate.data.msg,
          sender: isSender,
          type: data.userId,
          username: data.username,
        };

        // Atualiza o estado com a nova mensagem
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } catch (error) {
        console.log("erro: ", error);
      }
    });

   
    return () => socket.off("message");
  }, [socket]);

  // Função para lidar com a troca de salas
  const handleRoomClick = (roomName) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(currentRoom !== roomName){
      socket.emit("stopListen", currentRoom)

      // Define a sala atual e limpa as mensagens anteriores
      setCurrentRoom(roomName);
      setMessages([]);
      
      // Emite a entrada na sala para o servidor
      socket.emit("joinRoom", {
        roomName: roomName,
        username: user.username,
        language: user.language,
      });
    }
    
  };

  // Função para buscar uma sala
  const search = async () => {
    if (searchRoom) {
      try {
        let roomSearch = await axios.get(
          `https://chat-back-deploy.onrender.com/room/${searchRoom}`
        );
        let rooms = roomSearch.data;
        if (rooms.length === 0) {
          window.alert("Sala não encontrada!");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        const exist = user.rooms.find((room) => room._id === rooms[0]._id);

        // Verifica se o usuário já está na sala
        if (exist) {
          window.alert("Você já está na sala.");
          return;
        }

        // Atualiza as salas e o localStorage do usuário
        setRooms((set) => [...set, rooms[0]]);
        user.rooms.push(rooms[0]);
        localStorage.setItem("user", JSON.stringify(user));

        window.alert("Você entrou na sala!");
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Função para criar uma nova sala
  const create = async () => {
    if (createRoom) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await axios.post("https://chat-back-deploy.onrender.com/createRoom", {
          roomName: createRoom,
          userId: user.userId,
        });

        // Tratamento de erros com status 500 ou 400
        if (res.data.status === 500 || res.data.status === 400) {
          window.alert(res.data.message);
          return;
        }

        // Atualiza as salas e o localStorage do usuário
        setRooms((set) => [...set, res.data]);
        user.rooms.push(res.data);
        localStorage.setItem("user", JSON.stringify(user));

        window.alert("Sala criada com sucesso!");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleLogout = () => {
    // Remove o usuário do localStorage
    localStorage.removeItem("user");
    navigate('/') 
  };
  

  return (
    <div className="container-type-1">
      <div className="container-type-2">
        <main>
          <div id="messageList">
            <p>{currentRoom}</p>
            {messages.map((message, index) => (
              <p
                key={index}
                className={
                  message.type === "Geral"
                    ? "global2"
                    : message.sender
                    ? "sender"
                    : "reciver"
                }
              >
                {message.type === "Geral"
                  ? `${message.username} ${message.content}`
                  : message.sender
                  ? message.content
                  : `${message.username}: ${message.content}`}
              </p>
            ))}
          </div>
          <MessageInput socket={socket} currentRoom={currentRoom} />
        </main>
        <aside>
          <div className="asideMessage">
            <div className="headerAside">
              <h3>Salas</h3>
              <button onClick={handleLogout} className="logoutButton">
                Sair
              </button>
            </div>

            <div className={`modal ${showSearchModal ? "show" : ""}`}>
              <input
                id="room"
                type="text"
                placeholder="nome da sala"
                onChange={(e) => setSearchRoom(e.target.value)}
              />
              <button onClick={search}>Entrar</button>
              <button onClick={() => setShowSearchModal(false)}>Fechar</button>
            </div>

            <div className={`modal ${showCreateModal ? "show" : ""}`}>
              <input
                id="createRoom"
                type="text"
                placeholder="nome da sala"
                onChange={(e) => setCreateRoom(e.target.value)}
              />
              <button onClick={create}>Criar</button>
              <button onClick={() => setShowCreateModal(false)}>Fechar</button>
            </div>

            {rooms.map((room) => (
              <div
                className="cardChat"
                key={room._id}
                onClick={() => handleRoomClick(room.name)}
              >
                <img src={img1} style={{ width: "25px", margin: "8px" }} />
                {room.name}
              </div>
            ))}
          </div>
          <div className="buttons">
            <button onClick={() => setShowSearchModal(true)}>Buscar sala</button>
            <button onClick={() => setShowCreateModal(true)}>Criar sala</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
