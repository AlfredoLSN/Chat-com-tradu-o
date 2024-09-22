import React, { useEffect, useState } from "react";
import MessageInput from "../components/MessageInput";
import "../pages/pages.css";
import img1 from "../assets/comments-solid.svg";
import io from "socket.io-client";

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

    useEffect(() => {
        socket.on("message", (data) => {
            const currentUser = JSON.parse(localStorage.getItem("user"));
            const isSender = data.userId === currentUser.userId;

            const newMessage = {
                content: data.message,
                sender: isSender,
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => socket.off("message");
    }, [socket]);

    const handleRoomClick = (roomName) => {
        setCurrentRoom(roomName);
        setMessages([]); // Limpa as mensagens ao trocar de sala
        socket.emit("joinRoom", roomName);
    };

    return (
        <div className="container-type-1">
            <div className="container-type-2">
                <main>
                    <div id="messageList">
                        {messages.map((message, index) => (
                            <p key={index} className={message.sender ? "sender" : "reciver"}>
                                {message.sender ? message.content : `User: ${message.content}`}
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
                </aside>
            </div>
        </div>
    );
}
