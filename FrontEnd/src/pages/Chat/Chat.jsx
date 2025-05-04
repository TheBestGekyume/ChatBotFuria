
// components/Chat.jsx
import React, { useRef } from 'react';
import Message from '../../components/Message/Message';
import ChatInput from '../../components/ChatInput/ChatInput';
import Loading from '../../components/Loading/Loading';
import { useChat } from '../../hooks/useChat';
import './Chat.scss';

const Chat = () => {

    const {
        messages,
        setMessages,
        sendMessage,
        handleKeyPress,
        inputValue,
        setInputValue,
        options,
        handleOptionSelect,
        fetchData,
        loading
    } = useChat();


    return (
        <div id="chat">
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            index={index}
                            message={message}
                            onOptionClick={(handleOptionSelect)}
                        />
                    ))}

                    {loading && <Loading />}

                </div>

                <ChatInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
};

export default Chat;