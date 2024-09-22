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
        socket.on("message", async (data) => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            const isSender = data.userId === currentUser.userId;

            console.log(isSender)
            setMessages(data.message);

            
            const insertData = document.getElementById("messageList");
            let messageElement = document.createElement("p");
            if(isSender) {
                messageElement.className = "sender";
                messageElement.innerHTML = `${data.message}`;
            } else {
                messageElement.className = "reciver";
                messageElement.innerHTML = `User: ${data.message}`;
            }
            
            
            insertData.appendChild(messageElement);

            
            
            console.log("passou aqui ",data.message);
        })
       // socket.emit("joinRoom", (message) => {
           // console.log("Mensagem recebida agora:", message);
            //setMessages((prevMessages) => [...prevMessages, message]);
        //});

        // Limpeza ao sair da sala
       return () => socket.off("message");
    }, [socket]);

    
    const handleRoomClick = (roomName) => {
        setCurrentRoom(roomName);  // Define a sala atual
        socket.emit("joinRoom", roomName);  // Conecta-se à sala
        console.log(roomName)
    };

    return(
        <div className="container-type-1">
            <div className="container-type-2">
                <main>
                    <div id="messageList">
                    
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