// hooks/useChat.js
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
    const [messages, setMessages] = useState([
        {
            text: 'Olá, eu sou o Furioso. Diga algo para começarmos!',
            from: 'bot',
            img: furioso
        }
    ]);

    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Função para remover acentos e caracteres especiais
    const normalizeText = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const options = [
        {
            text: 'Próximos jogos',
            action: 'upcoming',
            keywords: ['proximo', 'jogos', 'futuro', 'calendario', 'agenda', 'partidas',
                'joga', 'hoje', 'amanha']
        },
        {
            text: 'Últimos Jogos',
            action: 'pastmatches',
            keywords: ['ultimos', 'jogos', 'resultados', 'historico', 'passados']
        },
        {
            text: 'Formação do time',
            action: 'lineup',
            keywords: ['formação', 'time', 'elenco', 'jogadores', 'lineup', 'line up', 'titulares']
        }
    ];

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const addMessagesWithDelay = async (newMessages, delayTime = 200) => {
        for (const msg of newMessages) {
            setMessages(prev => [...prev, msg]);
            await delay(delayTime);
        }
    };

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

    // Função para calcular similaridade entre strings
    const calculateSimilarity = (str1, str2) => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        return (longer.length - calculateEditDistance(longer, shorter)) / parseFloat(longer.length);
    };

    // Algoritmo de distância de edição (Levenshtein)
    const calculateEditDistance = (s1, s2) => {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    };

    const findBestMatch = (input) => {
        const inputNormalized = normalizeText(input);

        const options = [
            {
                text: 'Próximos jogos',
                action: 'upcoming',
                keywords: ['proximo', 'jogos', 'futuro', 'calendario', 'agenda', 'partidas',
                    'joga', 'hoje', 'amanha', 'amanhã', 'proximos']
            },
            {
                text: 'Últimos Jogos',
                action: 'pastmatches',
                keywords: ['ultimos', 'jogos', 'resultados', 'historico', 'passados', 'ontem', 'passado',
                    'jogaram'
                ]
            },
            {
                text: 'Formação do time',
                action: 'lineup',
                keywords: ['formacao', 'time', 'elenco', 'jogadores', 'lineup', 'titulares']
            }
        ];

        // 1. Verifica correspondência exata (normalizada)
        const exactMatch = options.find(opt =>
            normalizeText(opt.text) === inputNormalized
        );
        if (exactMatch) return exactMatch;

        // 2. Verifica palavras-chave (normalizadas)
        const keywordMatch = options.find(opt =>
            opt.keywords.some(keyword =>
                inputNormalized.includes(normalizeText(keyword))
            )
        );
        if (keywordMatch) return keywordMatch;

        // 3. Verifica similaridade (usando texto normalizado)
        const similarityMatch = options.map(opt => {
            const similarity = calculateSimilarity(normalizeText(opt.text), inputNormalized);
            return { option: opt, similarity };
        }).sort((a, b) => b.similarity - a.similarity)[0];

        return similarityMatch.similarity > 0.6 ? similarityMatch.option : null;
    };

    const fetchData = async (action) => {
        setLoading(true);
        try {
            const response = await api.get(`/scraper/${action}`);
            const data = response.data;

            // Limpa mensagens anteriores (exceto as fixas)
            setMessages(prev => [
                prev[0], // Mantém a mensagem inicial
                ...prev.slice(1).filter(m => m.from === 'user'),
                { text: `Você selecionou: ${options.find(opt => opt.action === action).text}`, from: 'user' }
            ]);

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
                    }))
                ], 300);
            }
            else if (action === 'lineup') {
                const startingFive = data.slice(0, 5);
                const staffAndSubstitutes = data.slice(5);

                await addMessagesWithDelay([
                    { text: 'Esta é a formação atual da FURIA:', from: 'bot', img: furioso },
                    {
                        text: '<div class="lineup-section"><h4>Jogadores Titulares</h4>' +
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
                            `).join('') + '</div></div>' +
                            (staffAndSubstitutes.length > 0 ?
                                '<div class="lineup-section"><h4>Coaches e Reservas</h4>' +
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
                                `).join('') + '</div></div>' : ''),
                        from: 'bot',
                        img: furioso
                    }
                ], 300);
            }
            else {
                await addMessagesWithDelay([
                    { text: `Aqui estão os últimos jogos da Furia!`, from: 'bot', img: furioso },
                    ...data.map(item => ({
                        text: `${item.date}<br />
                        🕒 ${item.time} | ${item.format}<br />
                        🎮 ${item.teams[0].name} (${item.teams[0].score}) vs ${item.teams[1].name} (${item.teams[1].score})<br />
                        🏆 ${item.tournament.replace('\n', ' ').replace('Reveja os lances', '').trim()}<br />
                        🔗 <a href="${item.link}" target="_blank" rel="noopener noreferrer">Assista aqui!</a>`,
                        from: 'bot',
                        img: furioso
                    }))
                ], 250);
            }

            await addMessagesWithDelay([
                { text: 'Posso te ajudar com algo mais?', from: 'bot', img: furioso }
            ]);

            await showOptions();
        } catch (error) {
            console.error('Fetch error:', error);
            await addMessagesWithDelay([
                { text: 'Erro ao buscar dados. Tente novamente mais tarde.', from: 'bot', img: furioso }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const messageText = inputValue.trim();
        setInputValue('');

        // Adiciona mensagem do usuário
        setMessages(prev => [...prev, { text: messageText, from: 'user' }]);

        // Primeira interação
        if (messages.length <= 1) {
            await showOptions(true);
            return;
        }

        // Encontra a melhor correspondência para a mensagem
        const matchedOption = findBestMatch(messageText);

        if (matchedOption) {
            await fetchData(matchedOption.action);
        } else {
            await addMessagesWithDelay([
                { text: 'Não consegui entender completamente. Você quis dizer alguma destas opções?', from: 'bot', img: furioso }
            ]);
            await showOptions();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const handleOptionSelect = async (optionText) => {
        const selectedOption = options.find(opt => opt.text === optionText);
        if (selectedOption) {
            // Adiciona a mensagem do usuário diretamente
            setMessages(prev => [...prev, { text: optionText, from: 'user' }]);
            
            // Processa a mensagem imediatamente
            await fetchData(selectedOption.action);
        }
    };

    return {
        messages,
        sendMessage,
        handleKeyPress,
        inputValue,
        setInputValue,
        loading,
        options,
        handleOptionSelect 
    };
};