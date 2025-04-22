import React, { forwardRef } from "react";

const ChatPanel = forwardRef(({ chatHistory, onOptionClick }, ref) => {
  return (
    <div className="chat-container" ref={ref}>
      {chatHistory.map((message, index) => (
        <div key={index} className={`chat-message ${message.type}`}>
          <div className="message-content">{message.content}</div>
          {message.options && message.options.length > 0 && (
            <div className="message-options">
              {message.options.map((option, optIndex) => (
                <button 
                  key={optIndex} 
                  className="option-button" 
                  onClick={() => onOptionClick(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export default ChatPanel;
