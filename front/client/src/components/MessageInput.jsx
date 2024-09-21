import React, { useState } from "react";
import "../components/components.css";


export default function MessageInput () {
    const [message, setMessage] = useState('');  // armazenar mensagem
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const sendMessage = () => {
        if(message.trim()) {
            const newMessage = {
                sender: currentUser.username,
                msg: message,
                timestamp: Date.now()
            };
            console.log(newMessage.sender, newMessage.msg, new Date(newMessage.timestamp).toLocaleTimeString())
            
            
            setMessage('');
        }
    }

    //evento
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      };
    
    return (
        <div className="containerInput">
            <input className="messageInput" type="text" value={message} 
                onChange={(e)=>setMessage(e.target.value)} 
                onKeyPress={handleKeyPress}
                placeholder="Message"
            />

            <button className="sendMessage" onClick={sendMessage}>Send</button>
        </div>
    );
}