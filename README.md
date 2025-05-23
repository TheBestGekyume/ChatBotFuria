# 💬 Chatbot Interativo da FURIA

Este é um projeto em desenvolvimento de um **chatbot interativo** sobre o time de CS2 da organização FURIA. O bot fornece informações como próximos jogos, últimos resultados e formação atual do time.

---

## 🔧 Tecnologias Utilizadas

### Backend
- Node.js + Express
- MySql
- JWT (JSON Web Token)
- Puppeteer (para Web Scraping)
- dotenv

### Frontend
- Vite + React
- SCSS
- Axios
- React Context API
- React Hooks
- React Router

---

## 📦 Estrutura do Projeto

### Backend (`/server`)
- Servidor criado com **Express**
- Banco de dados **MySql** para gerenciamento de usuários
- Autenticação implementada com **JWT**
- Endpoints disponíveis:
  - `POST /api/auth` – Login de usuário
  - `POST /api/users` – Registro de usuário
  - `GET /api/users` – Exibe todos os usuários
  - `GET /api/users/:id` – Exibe usuários por id
  - `PUT /api/users/:id` – Atualiza informações do usuário
  - `DELETE /api/users/:id` – Deleta o usuário por id

  - `GET /api/scraper/upcoming` – Web Scraping: próximos jogos
  - `GET /api/scraper/pastmatches` – Web Scraping: jogos anteriores
  - `GET /api/scraper/lineup` – Web Scraping: formação do time

> ⚠️ Apenas parte do back foi implementado no front!.

### Frontend (`/client`)
- Aplicação construída com **Vite + React**
- Estilização com **SCSS**
- Comunicação com o backend via **Axios**
- Uso de **Hooks personalizados** e **React Context** para controle de estado
- Interface de chatbot totalmente integrada ao Web Scraping
- Autenticação implementada (login funcional)
- Roteamento com **React Router DOM** – atualmente apenas uma rota no momento
- Projeto com **alguma componentização**, mas ainda em fase de organização

---

## 🤖 Sobre o Chatbot

O chatbot simula uma conversa com o mascote da FURIA, **Furioso**, oferecendo ao usuário informações do time com base em três opções principais:

- 📅 Próximos jogos
- 🏁 Últimos resultados
- 🎮 Formação atual do time

### Lógica de Interpretação de Mensagens

A lógica do bot utiliza:
- Normalização de texto (remoção de acentos e padronização)
- Comparação com palavras-chave
- Algoritmo de similaridade (distância de Levenshtein)

> Caso a mensagem não seja reconhecida, o bot sugere as opções disponíveis.

---

## ✅ Funcionalidades Atuais

- [x] Integração com Web Scraping
- [x] Autenticação com JWT
- [x] Chatbot interativo com opções predefinidas
- [x] Interface com sugestões de interação
- [ ] CRUD completo de usuários
- [ ] Salvamento de mensagens no banco de dados
- [ ] Roteamento multi-página

---

## 🧪 Como Executar o Projeto

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/chatbot-furia.git
cd chatbot-furia

# Backend
cd .\BackEnd\
npm install
node .\index.js  

# Frontend (em outro terminal)
cd .\FrontEnd\
npm install
npm run dev
