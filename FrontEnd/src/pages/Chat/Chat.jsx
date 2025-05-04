import React, { useRef } from 'react';
import Message from '../../components/Message/Message';
import ChatInput from '../../components/ChatInput/ChatInput';
import Loading from '../../components/Loading/Loading';
import { useChat } from '../../hooks/useChat';
import './Chat.scss';

const Chat = () => {
    const {
        messages,
        sendMessage,
        handleKeyPress,
        inputValue,
        setInputValue,
        loading,
        authStep,
        skipAuth,
        handleSkipAuth,
        handleOptionSelect
    } = useChat();

    return (
        <div id="chat">
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            message={message}
                            index={index}
                            onOptionClick={handleOptionSelect} // Passe a função aqui
                        />
                    ))}
                    {loading && <Loading />}

                    {authStep === 'email' && !skipAuth && (
                        <button className='option-button'
                            onClick={handleSkipAuth}>
                            Continuar sem login
                        </button>
                    )}
                </div>


                <ChatInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onSend={sendMessage}
                    placeholder={
                        authStep === 'email' ? 'Digite seu email ou "cadastrar" ou "continuar sem login"' :
                            authStep === 'password' ? 'Digite sua senha' :
                                'Digite uma mensagem'
                    }
                />
            </div>
        </div>
    );
};

export default Chat;