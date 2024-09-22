import React, { useEffect, useState } from "react";
import MessageInput from "../components/MessageInput";
import "../pages/pages.css";


//TESTE
import io from "socket.io-client";
const socket = io("http://localhost:3333"); 


export default function Chat() {
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [rooms, setRooms] = useState([]); // Salas do usuário

    useEffect(() => {
        // Obter as salas do usuário
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.rooms) {
            setRooms(user.rooms);
        }
    }, []);

    useEffect(() => {
        if (currentRoom) {
            // Ouvir novas mensagens
            socket.on("message", (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            // Limpeza ao sair da sala
            return () => socket.off("message");
        }
    }, [currentRoom]);

    const handleRoomClick = (roomName) => {
        setCurrentRoom(roomName);  // Define a sala atual
        socket.emit("joinRoom", roomName);  // Conecta-se à sala
    };

    return(
        <div className="container-type-1">
            <div className="container-type-2">
                <main>
                    <div>
                        {messages.map((msg, index) => (
                            <Message 
                                key={index} 
                                sender={msg.sender} 
                                msg={msg.msg} 
                                currentUser={JSON.parse(localStorage.getItem("user")).username} 
                            />
                        ))}
                    </div>
                    <MessageInput socket={socket} currentRoom={currentRoom} />
                </main>
                <aside>
                    <h3>Salas</h3>
                    {rooms.map(room => (
                        <div key={room._id} onClick={() => handleRoomClick(room.name)}>
                            {room.name}    
                        </div>
                    ))}
                </aside>
            </div>  
        </div>
    );
}