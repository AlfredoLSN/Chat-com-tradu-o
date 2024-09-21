import React from "react";
import MessageInput from "../components/MessageInput";
import MessageList from "../components/MessageList";

export default function Chat() {
    return(
        <>
            <h1>Chat</h1>
            
            <MessageList/>
            <MessageInput/>
            
        </>
    );
}