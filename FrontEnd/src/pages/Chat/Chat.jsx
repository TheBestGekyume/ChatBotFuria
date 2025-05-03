import React, { useState } from 'react';
import axios from 'axios';
import './Chat.scss';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Corrigido para porta 5000 (backend)
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const Chat = () => {
    const [messages, setMessages] = useState([
        { text: 'Olá! Como posso te ajudar?', from: 'bot' }
    ]);
    
    const [options] = useState([
        { text: 'Próximos jogos', action: 'upcoming' }, // Action deve corresponder ao endpoint
        { text: 'Resultados passados', action: 'pastmatches' },
        { text: 'Formação do time', action: 'lineup' }
    ]);

    // Função genérica para buscar dados
    const fetchData = async (action) => {
        try {
            const response = await api.get(`/scraper/${action}`);
            const data = response.data;
            
            // Atualiza as mensagens com a resposta
            setMessages(prev => [
                ...prev,
                { text: `Aqui estão os ${action.replace('matches', 'jogos')}...`, from: 'bot' },
                ...data.map(item => ({
                    text: `${item.time} - ${item.teams?.join(' vs ')} - ${item.tournament}`,
                    from: 'bot'
                }))
            ]);
            
        } catch (error) {
            console.error(`Erro ao buscar ${action}:`, error);
            setMessages(prev => [
                ...prev,
                { text: 'Erro ao buscar dados. Tente novamente mais tarde.', from: 'bot' }
            ]);
        }
    };

    const handleUserMessage = (messageText) => {
        // Encontra a opção correspondente ao texto clicado
        const selectedOption = options.find(opt => opt.text === messageText);
        
        // Adiciona mensagem do usuário
        setMessages(prev => [...prev, { text: messageText, from: 'user' }]);
        
        if (selectedOption) {
            // Usa a action da opção selecionada
            fetchData(selectedOption.action);
        } else {
            setMessages(prev => [...prev, { text: 'Desculpe, não entendi.', from: 'bot' }]);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.from}`}>
                            <p>{message.text}</p>
                        </div>
                    ))}
                </div>
                <div className="chat-options">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleUserMessage(option.text)}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Chat;