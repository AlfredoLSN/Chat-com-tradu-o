import React, { useEffect, useState } from "react";
import MessageInput from "../components/MessageInput";
import "../pages/pages.css";
import img1 from "../assets/comments-solid.svg";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3333"); 

export default function Chat() {
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [searchRoom, setSearchRoom] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.rooms) {
            setRooms(user.rooms);
        }
        socket.emit("authenticate", user.userId);
    }, []);

    useEffect( () => {
        socket.on("message", async (data) => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            const isSender = data.userId === currentUser.userId;
            let translate = '';


            console.log("lan1: ", data.language);
            console.log("lan2: ", currentUser.language);
            
            try {
                console.log("msg: ", data.message, "lang1: ", data.language, "lang2: ", currentUser.language)
                translate = await axios.get(`http://localhost:3333/translate/${data.message}/${currentUser.language}`);

                console.log("translate", translate);
                
                const newMessage = {
                    content: translate.data.msg,
                    sender: isSender,
                    type: data.userId,
                    username: data.username,
                };

                setMessages((prevMessages) => [...prevMessages, newMessage]);
            } catch (error) {
                console.log("erro: ", error);   
            }
        });

        return () => socket.off("message");
    }, [socket]);

    const handleRoomClick = (roomName) => {
        const user = JSON.parse(localStorage.getItem('user'));

        setCurrentRoom(roomName);
        setMessages([]); // Limpa as mensagens ao trocar de sala
        socket.emit("joinRoom", {roomName: roomName, username: user.username, language: user.language});
    };

    const search = async () => {
        if(searchRoom) {
             console.log(searchRoom)

            try {
                let roomSearch = await axios.get(`http://localhost:3333/room/${searchRoom}`);
                let rooms = roomSearch.data;                 
                if(rooms.length === 0) {
                    window.alert("Sala não encontrada!");
                    return;
                }
                
                
                const user = JSON.parse(localStorage.getItem('user'));
                const exist = user.rooms.find(room => room._id === rooms[0]._id);

                if(exist) {
                    window.alert("Você já está na sala.");
                    return
                }
                socket.emit("joinRoom", {roomName: rooms[0].name, username: user.username, language: user.language});

                setRooms((set) =>([...set, rooms[0]]));
                user.rooms.push(rooms[0]);
                console.log(user);
                localStorage.setItem("user", JSON.stringify(user));

                window.alert("Você entrou na sala!");

            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div className="container-type-1">
            <div className="container-type-2">
                <main>
                    <div id="messageList">
                        <p>{currentRoom}</p>
                        {messages.map((message, index) => (
                            <p key={index} className={message.type === 'Geral' ? 'global' : message.sender ? "sender" : "reciver"}>
                                {message.type === "Geral" ? `${message.username} ${message.content}` : message.sender ? message.content : `${message.username}: ${message.content}`}
                            </p>
                        ))}
                    </div>
                    <MessageInput socket={socket} currentRoom={currentRoom} />
                </main>
                <aside>
                    <h3>Salas</h3>
                    {rooms.map(room => (
                        <div className="cardChat" key={room._id} onClick={() => handleRoomClick(room.name)}>
                            <img src={img1} style={{ width: '25px', margin: "8px" }} />
                            {room.name}
                        </div>
                    ))}

                    <div className="modal">
                        <input id="room" type="texte" placeholder="pesquisar" onChange={(e) => setSearchRoom(e.target.value)}/>
                        <button onClick={search}>Buscar</button>
                    </div>

                    {/*-- pesquisar */}
                    <div>
                        <button id="pesquisar">Pesquisar</button>
                        <button id="criar">Criar sala</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}