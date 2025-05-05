// components/ChatInput.jsx
import React from 'react';

const ChatInput = ({ value, onChange, onKeyDown, onSend, type = 'text', placeholder = 'Digite uma mensagem...' }) => {
  return (
      <div className="chat-input-container">
          <input
              type={type}
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
          />
          <button onClick={onSend}>Enviar</button>
      </div>
  );
};

export default ChatInput;