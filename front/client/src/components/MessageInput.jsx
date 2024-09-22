import React, { useState } from "react";
import "../components/components.css";

export default function MessageInput({ socket, currentRoom }) {
    const [message, setMessage] = useState('');
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const sendMessage = () => {
        if (message.trim() && currentRoom) {
            const newMessage = {
                sender: currentUser.username,
                msg: message,
                room: currentRoom,
                timestamp: Date.now()
            };
            socket.emit("chatMessage", {roomName : currentRoom, message: newMessage.msg, username:currentUser.username ,language: currentUser.language});  // Emitir mensagem para a sala
            console.log(newMessage)
            setMessage('');  // Limpa 
        }
    }

    // Evento para enviar a mensagem ao pressionar Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="containerInput">
            <input 
                className="messageInput" 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
            />
            <button className="sendMessage" onClick={sendMessage}>
                Enviar
            </button>
        </div>
    );
}
