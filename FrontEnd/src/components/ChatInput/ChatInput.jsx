// components/ChatInput.jsx
import React from 'react';

const ChatInput = ({ value, onChange, onKeyDown, onSend }) => {
  return (
    <div className="chat-input-container">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Digite sua mensagem..."
      />
      <button onClick={onSend}>Enviar</button>
    </div>
  );
};

export default ChatInput;