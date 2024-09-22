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
            const translate = '';


            console.log("lan1: ", data.language);
            console.log("lan2: ", currentUser.language);
            
            try {
                translate = await axios.get("http://localhost:3333/translate", {
                    params: {
                        msg: data.message,
                        lang1: data.language,
                        lang2: currentUser.language,
                    },
                });

                console.log("translate", translate);
                
                const newMessage = {
                    content: translate,
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

    return (
        <div className="container-type-1">
            <div className="container-type-2">
                <main>
                    <div id="messageList">
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

                    {/*-- pesquisar */}
                    <div>
                        teste
                    </div>
                </aside>
            </div>
        </div>
    );
}