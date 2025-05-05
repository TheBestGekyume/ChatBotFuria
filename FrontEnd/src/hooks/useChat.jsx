// hooks/useChat.js
import { useState } from 'react';
import axios from 'axios';
import furioso from '../images/furioso.png';
import { useAuth } from '../hooks/AuthContext';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const useChat = () => {
    const { auth, login } = useAuth();
    const [authStep, setAuthStep] = useState(null); // 'email', 'password', null
    const [email, setEmail] = useState('');
    const [skipAuth, setSkipAuth] = useState(false);
    const [password, setPassword] = useState('');

    const [messages, setMessages] = useState([
        {
            text: 'Olá, eu sou o Furioso, o ChatBot da Furia. Diga algo para começarmos!',
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
            keywords: ['proximo', 'futuro', 'calendario', 'agenda', 'partidas',
             'hoje', 'amanha']
        },
        {
            text: 'Últimos Jogos',
            action: 'pastmatches',
            keywords: ['ultimos', 'resultados', 'historico', 'passados']
        },
        {
            text: 'Formação do time',
            action: 'lineup',
            keywords: ['quem','formação', 'time', 'elenco', 'jogadores', 'lineup', 'line up', 'titulares']
        },
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

        const welcomeMessage = auth?.user
            ? `Olá ${auth.user.username}, o que você quer saber sobre o nosso time da Furia do CS2?`
            : 'E então, o que você quer saber sobre o nosso time da Furia do CS2?';

        const messagesToAdd = showWelcomeMessage
            ? [
                { text: welcomeMessage, from: 'bot', img: furioso },
                ...optionMessages
            ]
            : optionMessages;

        await addMessagesWithDelay(messagesToAdd, 500);
    };

    const createPlayerCards = (players, isSubstitute = false) => {
        return players.map(player => `
          <div class="player-card ${isSubstitute ? 'substitute' : 'starter'}">
            <img src="${player.playerImage}" alt="${player.name}" class="player-image" 
                 onerror="this.src='https://static.draft5.gg/player/player_placeholder.png'"/>
            <div class="player-info">
              <span class="player-name">${player.name}</span>
              <img src="${player.flagImage}" alt="Flag" class="player-flag"/>
            </div>
          </div>
        `).join('');
      };

    const calculateSimilarity = (str1, str2) => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        return (longer.length - calculateEditDistance(longer, shorter)) / parseFloat(longer.length);
    };

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

        // 1. Verifica correspondência exata (normalizada)
        const exactMatch = options.find(opt =>
            normalizeText(opt.text) === inputNormalized
        );
        if (exactMatch) return exactMatch;

        // 2. Verifica palavras-chave (normalizadas)
        const keywordMatch = options.find(opt =>
            opt.keywords.some(keyword =>
                inputNormalized.includes(normalizeText(keyword)))
        )
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
                {
                    text: `Você selecionou: ${options.find(opt => opt.action === action).text}`,
                    from: 'user'
                }
            ]);

            // Processamento dos dados
            let botMessages = [];
            switch (action) {
                case 'upcoming':
                    botMessages = [
                        { text: 'Aqui estão os Próximos jogos da FURIA!', from: 'bot', img: furioso },
                        ...data.map(item => ({
                            text: `📅 ${item.date}<br />🕒 ${item.time} | ${item.format}<br />🎮 ${item.teams[0].name} vs ${item.teams[1].name}<br />🏆 ${item.tournament.replace('\n', ' ').trim()}<br />🔗 <a href="${item.link}" target="_blank" rel="noopener noreferrer">Mais detalhes</a>`,
                            from: 'bot',
                            img: furioso
                        }))
                    ];
                    break;

                case 'lineup':
                    const startingFive = data.slice(0, 5);
                    const staffAndSubstitutes = data.slice(5);

                    botMessages = [
                        {
                            text: 'Esta é a formação atual da FURIA:',
                            from: 'bot',
                            img: furioso
                        },
                        {
                            text: `
                    <div class="lineup-section">
                      <h4>Jogadores Titulares</h4>
                      <div class="lineup-container">
                        ${createPlayerCards(startingFive)}
                      </div>
                    </div>
                    ${staffAndSubstitutes.length > 0 ? `
                      <div class="lineup-section">
                        <h4>Coaches e Reservas</h4>
                        <div class="lineup-container substitutes">
                          ${createPlayerCards(staffAndSubstitutes, true)}
                        </div>
                      </div>
                    ` : ''}
                  `,
                            from: 'bot',
                            img: furioso
                        }
                    ];
                    break;

                case 'pastmatches':
                    botMessages = [
                        { text: 'Aqui estão os últimos jogos da Furia!', from: 'bot', img: furioso },
                        ...data.map(item => ({
                            text: `${item.date}<br />🕒 ${item.time} | ${item.format}<br />🎮 ${item.teams[0].name} (${item.teams[0].score}) vs ${item.teams[1].name} (${item.teams[1].score})<br />🏆 ${item.tournament.replace('\n', ' ').replace('Reveja os lances', '').trim()}<br />🔗 <a href="${item.link}" target="_blank" rel="noopener noreferrer">Assista aqui!</a>`,
                            from: 'bot',
                            img: furioso
                        }))
                    ];
                    break;

                default:
                    throw new Error(`Ação desconhecida: ${action}`);
            }

            await addMessagesWithDelay(botMessages, 300);
            await addMessagesWithDelay([
                {
                    text: auth?.user
                        ? `${auth.user.username}, posso te ajudar com algo mais?`
                        : 'Posso te ajudar com algo mais?',
                    from: 'bot',
                    img: furioso
                }
            ]);
            await showOptions();

        } catch (error) {
            console.error('Fetch error:', error);
            await addMessagesWithDelay([
                { text: error.response?.data?.message || 'Erro ao buscar dados. Tente novamente mais tarde.', from: 'bot', img: furioso }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSkipAuth = async () => {
        setSkipAuth(true);
        setAuthStep(null);
        await addMessagesWithDelay([
            { text: 'Você escolheu continuar sem login. Vamos começar!', from: 'bot', img: furioso }
        ]);
        await showOptions(true);
    };

    const handleAuthResponse = async (input) => {
        if (authStep === 'email' && input.toLowerCase().includes('continuar sem login')) {
            await handleSkipAuth();
            return;
        }

        if (authStep === 'email') {
            setEmail(input);
            setAuthStep('password');
            await addMessagesWithDelay([
                { text: 'Ótimo! Agora digite sua senha:', from: 'bot', img: furioso }
            ]);
        } else if (authStep === 'password') {
            setPassword(input);
            const result = await login(email, input);

            if (result.success) {
                const username = result.user?.username || 'Usuário';
                await addMessagesWithDelay([
                    { text: `Bem vindo ${username}!`, from: 'bot', img: furioso }
                ]);
                setAuthStep(null);
                await showOptions(true);
            } else {
                await addMessagesWithDelay([
                    { text: 'Credenciais inválidas. Vamos tentar novamente.', from: 'bot', img: furioso },
                    { text: 'Digite seu email ou "continuar sem login"', from: 'bot', img: furioso }
                ]);
                setAuthStep('email');
            }
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim() && !skipAuth) return;

        const messageText = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { text: messageText, from: 'user' }]);

        // Fluxo de autenticação
        if (authStep) {
            await handleAuthResponse(messageText);
            return;
        }

        // Primeira interação
        if (messages.length <= 1) {
            if (!auth && !skipAuth) {
                await addMessagesWithDelay([
                    { text: 'Para começar, você pode fazer login digitando o seu email cadastrado!', from: 'bot', img: furioso },
                    { text: 'Se não quiser você pode digitar "continuar sem login"', from: 'bot', img: furioso }
                ]);
                setAuthStep('email');
                return;
            }
            await showOptions(true);
            return;
        }

        // Processamento de mensagens normais
        const matchedOption = findBestMatch(messageText);
        if (matchedOption) {
            await fetchData(matchedOption.action);
        } else {
            await addMessagesWithDelay([
                { text: 'Não entendi. Escolha uma das opções abaixo:', from: 'bot', img: furioso }
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
            setMessages(prev => [...prev, { text: optionText, from: 'user' }]);
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
        authStep,
        skipAuth,
        handleSkipAuth,
        handleOptionSelect
    };
};