import React, { forwardRef, useState, useRef, useEffect } from "react";

const ChatPanel = forwardRef(({ 
  chatHistory, 
  onOptionClick, 
  toc, 
  handleIconClick, 
  handleJiraIconClick,
  responsiblePerson, 
  isLoadingPerson,
  selectedKeyword,
  jiraIssues,
  isLoadingJira
}, ref) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasOverflow, setHasOverflow] = useState(false);
  const keywordButtonsRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (e.key === 'Enter' && value.trim()) {
      // Add search query as user message
      const userMessage = {
        type: 'user',
        content: `검색: ${value}`,
        options: []
      };

      // Add search results as bot message
      const botMessage = {
        type: 'bot',
        content: '검색 결과:',
        options: filteredKeywords
      };

      // Update chat history
      onOptionClick({ type: 'addMessages', messages: [userMessage, botMessage] });

      // Clear search input
      setSearchQuery("");
    }
  };

  const filteredKeywords = toc
    .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((item) => ({
      text: item.title,
      page: item.page,
      level: item.level,
    }));

  useEffect(() => {
    if (keywordButtonsRef.current) {
      const hasScrollbar = keywordButtonsRef.current.scrollHeight > keywordButtonsRef.current.clientHeight;
      setHasOverflow(hasScrollbar);
    }
  }, [filteredKeywords]);

  const chatContainer = [];
  chatHistory.map((message, index) => {
    chatContainer.push(
        <div key={index} className={`chat-message ${message.type}`}>
        <div className="message-content">
          {message.type === "user" ? (
            '" ' + message.content + ' "'
          ) : (
            <div className="bot-message-content">
              <div className="bot-message-text">{message.content}</div>
              <div className="message-icons">
                <div className="jira-icon" onClick={() => handleJiraIconClick(message)}>
                  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
                    <desc>Jira Streamline Icon: https://streamlinehq.com</desc>
                    <title>Jira</title>
                    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0 -1.005 -1.005zm5.723 -5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0 -1.001 -1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" fill="#000000" strokeWidth="1"></path>
                  </svg>
                </div>
                <div className="message-icon" onClick={() => handleIconClick(message)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" height="14" width="14">
                    <desc>User Multiple Group Streamline Icon: https://streamlinehq.com</desc>
                    <g id="user-multiple-group--close-geometric-human-multiple-person-up-user">
                      <path id="Union" fill="#000000" fillRule="evenodd" d="M8 4.50003c0 1.65685 -1.34315 3 -3 3s-3 -1.34315 -3 -3 1.34315 -3 3 -3 3 1.34315 3 3ZM5 8.5c-2.76142 0 -5 2.2386 -5 5 0 0.2761 0.223858 0.5 0.5 0.5h9c0.27614 0 0.5 -0.2239 0.5 -0.5 0 -2.7614 -2.23858 -5 -5 -5Zm8.5001 5.5h-2.3225c0.0472 -0.1584 0.0725 -0.3263 0.0725 -0.5 0 -2.0411 -0.9784 -3.85363 -2.49178 -4.99426 0.08011 -0.00381 0.16071 -0.00574 0.24176 -0.00574 2.76142 0 5.00002 2.2386 5.00002 5 0 0.2761 -0.2239 0.5 -0.5 0.5ZM9.00008 7.50003c-0.30173 0 -0.59305 -0.04455 -0.86775 -0.12742 0.69409 -0.75643 1.11775 -1.76503 1.11775 -2.87258s-0.42366 -2.11615 -1.11776 -2.87259c0.27471 -0.08287 0.56603 -0.12741 0.86776 -0.12741 1.65682 0 3.00002 1.34315 3.00002 3s-1.3432 3 -3.00002 3Z" clipRule="evenodd" strokeWidth="1"></path>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
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
    );
  });

  if (isLoadingPerson) {
    return (
      <div className="chat-container responsible-person-view">
        <div className="loading-person full-screen">
          <span>담당자 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (isLoadingJira) {
    return (
      <div className="chat-container jira-issues-view">
        <div className="loading-person full-screen">
          <span>Jira 이슈를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (selectedKeyword) {
    if (responsiblePerson) {
      return (
        <div className="chat-container responsible-person-view">
          <div className="responsible-person-info full-screen">
            <div className="responsible-person-header">
              <span className="material-symbols-outlined">person</span>
              <h3>담당자 정보</h3>
              <button className="close-button" onClick={() => handleIconClick(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="responsible-person-content">
              {responsiblePerson ? (
                Array.isArray(responsiblePerson) ? (
                  responsiblePerson.length > 0 ? (
                    responsiblePerson.map((person, index) => (
                      <div key={index} className="person-info-section">
                        <div className="person-keyword">{person.keyword}</div>
                        <div className="info-item">
                          <span className="info-label">이름:</span>
                          <span className="info-value">{person.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">팀:</span>
                          <span className="info-value">{person.team}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">역할:</span>
                          <span className="info-value">{person.role}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">전화번호:</span>
                          <span className="info-value">{person.phoneNumber}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">이메일:</span>
                          <span className="info-value">{person.email}</span>
                        </div>
                        {index < responsiblePerson.length - 1 && <hr className="person-divider" />}
                      </div>
                    ))
                  ) : (
                    <div className="no-person-message">담당자가 없습니다.</div>
                  )
                ) : (
                  <div className="person-info-section">
                    <div className="person-keyword">{responsiblePerson.keyword}</div>
                    <div className="info-item">
                      <span className="info-label">이름:</span>
                      <span className="info-value">{responsiblePerson.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">팀:</span>
                      <span className="info-value">{responsiblePerson.team}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">역할:</span>
                      <span className="info-value">{responsiblePerson.role}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">전화번호:</span>
                      <span className="info-value">{responsiblePerson.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">이메일:</span>
                      <span className="info-value">{responsiblePerson.email}</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="no-person-message">담당자가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (jiraIssues) {
      return (
        <div className="chat-container jira-issues-view">
          <div className="jira-issues-info full-screen">
            <div className="jira-issues-header">
              <span className="material-symbols-outlined">bug_report</span>
              <h3>관련 Jira 이슈</h3>
              <button className="close-button" onClick={() => handleJiraIconClick(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="jira-issues-content">
              {jiraIssues.length > 0 ? (
                jiraIssues.map((item, index) => (
                  <div key={index} className="jira-issue-section">
                    <div className="jira-keyword">{item.keyword}</div>
                    {item.issues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="issue-item">
                        <a href={issue.url} target="_blank" rel="noopener noreferrer" className="issue-title">
                          {issue.title}
                        </a>
                      </div>
                    ))}
                    {index < jiraIssues.length - 1 && <hr className="issue-divider" />}
                  </div>
                ))
              ) : (
                <div className="no-issue-message">Jira 이슈가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={ref}>
        {chatContainer}
      </div>
      <div className="chat-search-bottom">
        <div className="search-header">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="목차를 검색해보세요!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="search-input"
            />
          </div>
          <button className="search-refresh-button" onClick={() => onOptionClick({ text: "reset", page: 1, level: 1 })}>
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
        {searchQuery && (
          <div className={`keyword-buttons ${hasOverflow ? 'overflow' : ''}`} ref={keywordButtonsRef}>
            {filteredKeywords.map((keyword, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => {
                  onOptionClick(keyword);
                  setSearchQuery("");
                }}
              >
                {keyword.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatPanel;
