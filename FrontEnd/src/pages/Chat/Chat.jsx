import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import furioso from "../../images/furioso.png";
import './Chat.scss';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const Chat = () => {
    const [messages, setMessages] = useState([
        { 
            text: 'Olá! Eu sou o Furioso Bot. Diga "oi" ou escolha uma opção abaixo para começarmos!', 
            from: 'bot', 
            img: furioso 
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const options = [
        { text: 'Próximos jogos', action: 'upcoming' },
        { text: 'Resultados passados', action: 'pastmatches' },
        { text: 'Formação do time', action: 'lineup' }
    ];

    // Auto-scroll para a última mensagem
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Mostrar opções como mensagens do bot
    const showOptions = () => {
        const optionMessages = options.map(option => ({
            text: option.text,
            from: 'bot',
            img: furioso,
            isOption: true
        }));

        setMessages(prev => [
            ...prev,
            { text: 'Como posso te ajudar? Escolha uma opção:', from: 'bot', img: furioso },
            ...optionMessages
        ]);
    };

    // Buscar dados da API
    const fetchData = async (action) => {
        try {
            const response = await api.get(`/scraper/${action}`);
            const data = response.data;

            setMessages(prev => [
                ...prev,
                { text: `Aqui estão os ${action.replace('matches', 'jogos')}...`, from: 'bot', img: furioso },
                ...data.map(item => ({
                    text: `${item.time} - ${item.teams?.join(' vs ')} - ${item.tournament}`,
                    from: 'bot',
                    img: furioso
                })),
                { text: 'Posso te ajudar com algo mais?', from: 'bot', img: furioso }
            ]);

            showOptions();
            
        } catch (error) {
            console.error(`Erro ao buscar ${action}:`, error);
            setMessages(prev => [
                ...prev,
                { text: 'Erro ao buscar dados. Tente novamente mais tarde.', from: 'bot', img: furioso }
            ]);
        }
    };

    // Enviar mensagem
    const sendMessage = () => {
        if (!inputValue.trim()) return;

        const messageText = inputValue.trim();
        setInputValue('');
        
        // Adiciona mensagem do usuário
        setMessages(prev => [...prev, { text: messageText, from: 'user' }]);

        // Primeira interação
        if (messages.length <= 1) {
            showOptions();
            return;
        }

        // Verifica se é uma opção válida
        const selectedOption = options.find(opt => opt.text.toLowerCase() === messageText.toLowerCase());
        
        if (selectedOption) {
            fetchData(selectedOption.action);
        } else {
            setMessages(prev => [
                ...prev,
                { text: 'Desculpe, não entendi. Escolha uma das opções:', from: 'bot', img: furioso }
            ]);
            showOptions();
        }
    };

    // Enviar com Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div id="chat">
            <div className="chat-window">
                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.from}`}>
                            {message.from === "bot" && <img src={furioso} alt="Furioso" />}
                            
                            <p>{message.text}</p>
                            
                            {message.isOption && (
                                <button 
                                    className="option-button"
                                    onClick={() => {
                                        setMessages(prev => [...prev, { text: message.text, from: 'user' }]);
                                        fetchData(options.find(opt => opt.text === message.text).action);
                                    }}
                                >
                                    {message.text}
                                </button>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown ={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                    />
                    <button onClick={sendMessage}>Enviar</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;