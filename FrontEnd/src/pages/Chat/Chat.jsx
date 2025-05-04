
// components/Chat.jsx
import React, { useRef, useEffect } from 'react';
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
        fetchData,
        loading
    } = useChat();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div id="chat">
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            index={index}
                            message={message}
                            onOptionClick={(optionText) => {
                                const selectedOption = options.find(opt => opt.text === optionText);
                                if (selectedOption) {
                                    setMessages(prev => [...prev, { text: optionText, from: 'user' }]);
                                    fetchData(selectedOption.action);
                                }
                            }}
                        />
                    ))}

                    {loading && <Loading />}

                    <div ref={messagesEndRef} />

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