import React, { forwardRef } from "react";
import { useState } from "react";

const ChatPanel = forwardRef(({ chatHistory, onOptionClick }, ref) => {
  const [isDim, setIsDim] = useState(false);

  const chatContainer = [];
  chatHistory.map((message, index) =>
    chatContainer.push(
      <div key={index} className={`chat-message ${message.type}`}>
        <div className="message-content">
          {message.type === "user" ? '" ' + message.content + ' "' : message.content}
        </div>
        {message.options && message.options.length > 0 && (
          <div className="message-options">
            {message.options.map((option, optIndex) => (
              <button
                key={optIndex}
                className={`option-button ${isDim % 2 === 0 ? "dim" : "light"}`}
                onClick={() => onOptionClick(option)}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  );

  return (
    <div className="chat-container" ref={ref}>
      {chatContainer}
    </div>
  );
});

export default ChatPanel;
