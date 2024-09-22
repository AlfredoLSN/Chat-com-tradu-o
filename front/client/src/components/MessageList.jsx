import { useEffect, useState } from "react";
import Message from "./Message";

const MessageList = ({ socket }) => {
    const [messages, setMessages] = useState([]); 

    useEffect(() => {
        // Ouvir por mensagens vindas do socket
        if (socket) {
            socket.on("message", (newMessage) => {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        }

        return () => {
            if (socket) {
                socket.off("message");
            }
        };
    }, [socket]);

    return (
        <div style={{ height: '400px', overflowY: 'scroll' }}>
            {messages.map((msg, index) => (
                <Message
                    key={index}
                    sender={msg.sender}
                    msg={msg.msg}
                    timestamp={msg.timestamp}
                />
            ))}
        </div>
    );
};

export default MessageList;
