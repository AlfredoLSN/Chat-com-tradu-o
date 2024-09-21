import React from "react";
import "../components/components.css";

export default function Message ({sender, msg, currentUser}) {
    let isSender = sender === currentUser; 
    
    const messageStyle = {
        alignSelf: isSender ? 'flex-end' : 'flex-start', 
        backgroundColor: isSender ? 'rgba(101, 33, 165, 0.904)' : '#e0ffe0',
        color: isSender ? 'rgba(12, 243, 4, 0.904)' : 'rgba(119, 17, 59, 0.904)',
    };
    const containerStyle = {
        justifyContent: isSender ? 'flex-end' : 'flex-start',
    }

    return (
        <div className="container" style={containerStyle}>
            <div className="messageContainer" style={messageStyle}>
                <p><strong>{sender}</strong></p>
                <p className="content">{msg}</p>
            </div>
        </div>
    );
}