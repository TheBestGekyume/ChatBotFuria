import { useState } from 'react';
import axios from 'axios';
import furioso from '../images/furioso.png';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const useChat = () => {

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const addMessagesWithDelay = async (newMessages, delayTime = 200) => {
        for (const msg of newMessages) {
            setMessages(prev => [...prev, msg]);
            await delay(delayTime);
        }
    };


    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            text: 'Olá, eu sou o Furioso. Diga algo para começarmos!',
            from: 'bot',
            img: furioso
        }
    ]);

    const [inputValue, setInputValue] = useState(''); // Adicione esta linha

    const options = [
        { text: 'Próximos jogos', action: 'upcoming' },
        { text: 'Resultados passados', action: 'pastmatches' },
        { text: 'Formação do time', action: 'lineup' }
    ];

    // Mostrar opções como mensagens do bot
    const showOptions = async (showWelcomeMessage = false) => {
        const optionMessages = options.map(option => ({
            text: option.text,
            from: 'bot',
            img: furioso,
            isOption: true
        }));

        const messagesToAdd = showWelcomeMessage
            ? [
                { text: 'E então, o que você quer saber sobre o nosso time da Furia do CS2?', from: 'bot', img: furioso },
                ...optionMessages
            ]
            : optionMessages;

        await addMessagesWithDelay(messagesToAdd, 500);
    };


    // Buscar dados da API
    const fetchData = async (action) => {
        setLoading(true);
        try {
            console.log(`Fetching data for: ${action}`); // Debug
            const response = await api.get(`/scraper/${action}`);
            const data = response.data;
            setLoading(false);
            console.log('Received data:', data); // Debug

            if (action === 'upcoming') {
                await addMessagesWithDelay([
                    { text: 'Aqui estão os Próximos jogos da FURIA!', from: 'bot', img: furioso },
                    ...data.map(item => ({
                        text: `📅 ${item.date}<br />
                        🕒 ${item.time} | ${item.format}<br />
                        🎮 ${item.teams[0].name} vs ${item.teams[1].name}<br />
                        🏆 ${item.tournament.replace('\n', ' ').trim()}<br />
                        🔗 <a href="${item.link}" target="_blank" rel="noopener noreferrer">Mais detalhes</a>`,
                        from: 'bot',
                        img: furioso
                    })),
                    { text: 'Posso te ajudar com algo mais?', from: 'bot', img: furioso }
                ], 500);
                await showOptions();


            } else if (action === 'lineup') {
                // Separa os 5 primeiros (titulares) dos demais
                const startingFive = data.slice(0, 5);
                const staffAndSubstitutes = data.slice(5);

                await addMessagesWithDelay([
                    { text: 'Esta é a formação atual da FURIA:', from: 'bot', img: furioso },
                    {
                        text: '<h4>Jogadores Titulares</h4>' +
                            '<div class="lineup-container">' +
                            startingFive.map(player => `
                                <div class="player-card starter">
                                    <img src="${player.playerImage}" alt="${player.name}" class="player-image" 
                                         onerror="this.src='https://static.draft5.gg/player/player_placeholder.png'"/>
                                    <div class="player-info">
                                        <span class="player-name">${player.name}</span>
                                        <img src="${player.flagImage}" alt="Flag" class="player-flag"/>
                                    </div>
                                </div>
                            `).join('') + '</div>' +
                            (staffAndSubstitutes.length > 0 ?
                                '<h4>Coaches e Reservas:</h4>' +
                                '<div class="lineup-container substitutes">' +
                                staffAndSubstitutes.map(player => `
                                    <div class="player-card substitute">
                                        <img src="${player.playerImage}" alt="${player.name}" class="player-image" 
                                             onerror="this.src='https://static.draft5.gg/player/player_placeholder.png'"/>
                                        <div class="player-info">
                                            <span class="player-name">${player.name}</span>
                                            <img src="${player.flagImage}" alt="Flag" class="player-flag"/>
                                        </div>
                                    </div>
                                `).join('') + '</div>' : ''),
                        from: 'bot',
                        img: furioso
                    },
                    { text: 'Posso te ajudar com algo mais?', from: 'bot', img: furioso }
                ], 500);
                await showOptions();
            } else {
                await addMessagesWithDelay([
                    { text: `Aqui estão os ultimos jogos da Furia!`, from: 'bot', img: furioso },
                    ...data.map(item => ({
                        text: `${item.date}<br />
                        🕒 ${item.time} | ${item.format}<br />
                        🎮 ${item.teams[0].name} (${item.teams[0].score}) vs ${item.teams[1].name} (${item.teams[1].score})<br />
                        🏆 ${item.tournament.replace('\n', ' ').replace('Reveja os lances', '').trim()}<br />
                        🔗 <a href="${item.link}" target="_blank" rel="noopener noreferrer">Assista aqui!</a>`,
                        from: 'bot',
                        img: furioso
                    })),
                    { text: 'Posso te ajudar com algo mais?', from: 'bot', img: furioso }
                ], 250);
                await showOptions();
            }

        } catch (error) {
            setLoading(false);
            console.error('Fetch error:', error);
            console.error(`Erro ao buscar ${action}:`, error);
            setMessages(prev => [
                ...prev,
                { text: 'Erro ao buscar dados. Tente novamente mais tarde.', from: 'bot', img: furioso }
            ]);
        } finally {
            setLoading(false);
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
            showOptions(true); // Mostra mensagem + botões no início
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
            showOptions(); // Mostra só os botões
        }
    };

    // Enviar com Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return {
        messages,
        setMessages,
        sendMessage,
        handleKeyPress,
        inputValue,
        setInputValue,
        fetchData,
        loading,
        options
    };
};

