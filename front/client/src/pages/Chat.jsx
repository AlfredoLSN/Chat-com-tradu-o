import React, { useEffect, useState } from "react";
import MessageInput from "../components/MessageInput";
import "../pages/pages.css";
import img1 from "../assets/comments-solid.svg"

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

        socket.emit("authenticate", user.userId);
    }, []);

    useEffect(() => {
        
        socket.emit("joinRoom", (message) => {
            console.log("Mensagem recebida agora:", message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Limpeza ao sair da sala
        return () => socket.off("message");
    }, [currentRoom]);

    const handleRoomClick = (roomName) => {
        setCurrentRoom(roomName);  // Define a sala atual
        socket.emit("joinRoom", roomName);  // Conecta-se à sala
        console.log(roomName)
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
                        <div className="cardChat" key={room._id} onClick={() => handleRoomClick(room.name)}>
                            <img src={img1} style={{width:'25px', margin:"8px"}}/>
                            {room.name}    
                        </div>
                    ))}
                </aside>
            </div>  
        </div>
    );
}