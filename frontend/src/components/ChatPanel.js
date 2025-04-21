import React from "react";

const ChatPanel = ({ chatHistory, onOptionClick }) => {
  return (
    <div className="chat-container">
      {chatHistory.map((message, index) => (
        <div key={index} className={`chat-message ${message.type}`}>
          <div className="message-content">{message.content}</div>
          {message.options && message.options.length > 0 && (
            <div className="message-options">
              {message.options.map((option, optIndex) => (
                <button key={optIndex} className="option-button" onClick={() => onOptionClick(option)}>
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatPanel;
