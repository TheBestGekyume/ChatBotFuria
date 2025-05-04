// components/Message/Message.jsx
import React from 'react';
import './Message.scss'; // Crie este arquivo se necessário

const Message = ({ message, onOptionClick, index }) => {
  return (
    <div 
      className={`message ${message.from}`}
      style={{ '--i': index }} // Usado para atraso progressivo
    >
      {message.from === "bot" && !message.isOption && (
        <img src={message.img} alt="Bot" className="furioso-img" />
      )}
      
      {message.isOption ? (
        <button 
          className="option-button"
          onClick={() => onOptionClick(message.text)}
        >
          {message.text}
        </button>
      ) : (
        <p dangerouslySetInnerHTML={{ __html: message.text }} />
      )}
    </div>
  );
};

export default Message;