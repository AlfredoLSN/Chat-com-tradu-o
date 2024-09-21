import { useEffect, useState } from "react";
import Message from "./Message";


const MessageList = () => {
    const [message, setMessage] = useState([]);

    useEffect(() => {
        
    }, []);

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