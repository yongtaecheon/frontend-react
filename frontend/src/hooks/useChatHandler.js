import { useState, useRef, useEffect } from "react";

export const useChatHandler = (toc, handlePageNavigation) => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [responsiblePerson, setResponsiblePerson] = useState(null);
  const [isLoadingPerson, setIsLoadingPerson] = useState(false);
  const [jiraIssues, setJiraIssues] = useState(null);
  const [isLoadingJira, setIsLoadingJira] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // 담당자 정보를 가져오는 함수 수정
  const fetchResponsiblePerson = async (message) => {
    if (!message) {
      setResponsiblePerson(null);
      return;
    }

    setIsLoadingPerson(true);
    try {
      // 메시지의 모든 options에서 text를 키워드로 사용
      const keywords = message.options?.map(option => option.text) || [];

      // 메시지 내용에서도 키워드 추출 (문자열인 경우)
      if (typeof message.content === 'string') {
        const match = message.content.match(/^(.*?)\(으\)로 이동했습니다\.$/);
        if (match && match[1]) {
          keywords.push(match[1]);
        } else {
          keywords.push(message.content);
        }
      }

      if (keywords.length === 0) {
        setResponsiblePerson(null);
        return;
      }

      // 모든 키워드에 대한 담당자 정보 수집
      const allPersons = keywords
        .map(keyword => {
          const tocItem = toc.find(item => item.title === keyword);
          if (tocItem && tocItem.persons) {
            return tocItem.persons.map(person => ({
              ...person,
              keyword: tocItem.title
            }));
          }
          return null;
        })
        .filter(Boolean) // null 값 제거
        .flat(); // 중첩 배열 평탄화

      if (allPersons.length > 0) {
        setResponsiblePerson(allPersons);
      } else {
        setResponsiblePerson([]);
      }
    } catch (error) {
      console.error("Error fetching responsible person:", error);
      setResponsiblePerson([]);
    } finally {
      setIsLoadingPerson(false);
    }
  };

  // 아이콘 클릭 핸들러
  const handleIconClick = (message) => {
    if (!message) {
      setResponsiblePerson(null);
      setSelectedKeyword(null);
      // 채팅 컨테이너를 스크롤
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 0);
      return;
    }
    setSelectedKeyword(message);
    fetchResponsiblePerson(message);
  };

  const resetChat = () => {
    setChatHistory([]);

    // TOC가 비어있으면 빈 키워드를 보여줍니다.
    if (!toc || toc.length === 0) {
      setChatHistory([
        {
          type: "bot",
          content: "목차가 없습니다.",
          options: [],
        },
      ]);
      return;
    }

    // level 1 항목의 개수를 확인
    const level1Items = toc.filter((item) => item.level === 1);

    // level 1이 하나만 있는 경우 level 2 항목을 보여줌
    if (level1Items.length === 1) {
      const level2Items = toc.filter((item) => item.level === 2);
      if (level2Items.length > 0) {
        setChatHistory([
          {
            type: "bot",
            content: (
              <div>
                <span>
                  <span className="material-symbols-outlined pets-icon">pets</span>  목차 키워드를 선택하세요 
                </span>
              </div>
            ),
            options: level2Items.map((item) => ({
              text: item.title,
              page: item.page,
              level: item.level,
            })),
          },
        ]);
        return;
      }
    }

    // level 1이 여러 개이거나 level 2가 없는 경우 level 1부터 보여줌
    const topLevelItems = level1Items.length > 0 ? level1Items : toc.filter((item) => item.level === 2);

    if (topLevelItems.length > 0) {
      setChatHistory([
        {
          type: "bot",
          content: (
            <div>
              <span>
              <span className="material-symbols-outlined pets-icon">pets</span> 목차 키워드를 선택하세요
              </span>
            </div>
          ),
          options: topLevelItems.map((item) => ({
            text: item.title,
            page: item.page,
            level: item.level,
          })),
        },
      ]);
    } else {
      // 모든 항목 보여주기 (level 1 제외)
      const nonTitleItems = toc.filter((item) => item.level > 1);
      setChatHistory([
        {
          type: "bot",
          content: (
            <div>
              <span>
                <span className="material-symbols-outlined pets-icon">pets</span> 목차 키워드를 선택하세요 
              </span>
            </div>
          ),
          options: nonTitleItems.map((item) => ({
            text: item.title,
            page: item.page,
            level: item.level,
          })),
        },
      ]);
    }
  };

  const handleOptionClick = (option) => {
    if (option.type === 'addMessages') {
      setChatHistory((prev) => [...prev, ...option.messages]);
      return;
    }

    if (option.text === "reset") {
      resetChat();
      return;
    }
    if (option.isLast === true) {
      // 마지막일 경우 페이지 히스토리 추가 안하고 페이지 이동만 수행함
      handlePageNavigation(option.page, option.text);
      return;
    }
    // Add user's selection to chat history
    setChatHistory((prev) => [...prev, { type: "user", content: option.text }]);

    // Move to the selected page with keyword
    handlePageNavigation(option.page, option.text);

    // Find the index of the current option in the TOC
    const currentIndex = toc.findIndex(
      (t) => t.title === option.text && t.level === option.level && t.page === option.page
    );

    // Find child items (next level items)
    const childItems = [];
    if (currentIndex !== -1) {
      const nextLevel = option.level + 1;
      for (let i = currentIndex + 1; i < toc.length; i++) {
        if (toc[i].level === nextLevel) {
          childItems.push(toc[i]);
        } else if (toc[i].level <= option.level) {
          break; // Stop if we encounter an item at the same or higher level
        }
      }
    }

    if (childItems.length > 0) {
      // Add bot response with child options
      setChatHistory((prev) => [
        ...prev,
        {
          type: "bot",
          content: (
            <div>
              <span>
              <span className="material-symbols-outlined pets-icon">pets</span>  세부 목차를 선택하세요
              </span>
            </div>
          ),
          options: childItems.map((item) => ({
            text: item.title,
            page: item.page,
            level: item.level,
          })),
        },
      ]);
    } else {
      // No child items, just confirm selection
      setChatHistory((prev) => [
        ...prev,
        {
          type: "bot",
          content: `${option.text}(으)로 이동했습니다.`,
          options: [{ 
            ...option, 
            text: "이동하기",
            isLast: true 
          }],
        },
      ]);
    }
  };

  // Jira 이슈 정보를 가져오는 함수 수정
  const fetchJiraIssues = async (message) => {
    if (!message) {
      setJiraIssues(null);
      return;
    }

    setIsLoadingJira(true);
    try {
      const keywords = message.options?.map(option => option.text) || [];

      if (typeof message.content === 'string') {
        const match = message.content.match(/^(.*?)\(으\)로 이동했습니다\.$/);
        if (match && match[1]) {
          keywords.push(match[1]);
        } else {
          keywords.push(message.content);
        }
      }

      if (keywords.length === 0) {
        setJiraIssues(null);
        return;
      }

      // 모든 키워드에 대한 이슈 정보 수집
      const allIssues = keywords
        .map(keyword => {
          const tocItem = toc.find(item => item.title === keyword);
          if (tocItem && tocItem.issues && tocItem.issues.length > 0) {
            return {
              keyword: tocItem.title,
              issues: tocItem.issues.map(issue => ({
                title: issue.title,
                url: issue.url
              }))
            };
          }
          return null;
        })
        .filter(Boolean); // null 값 제거

      if (allIssues.length > 0) {
        setJiraIssues(allIssues);
      } else {
        setJiraIssues(null);
      }
    } catch (error) {
      console.error("Error fetching Jira issues:", error);
      setJiraIssues(null);
    } finally {
      setIsLoadingJira(false);
    }
  };

  // Jira 아이콘 클릭 핸들러
  const handleJiraIconClick = (message) => {
    if (!message) {
      setJiraIssues(null);
      setSelectedKeyword(null);
      return;
    }
    setSelectedKeyword(message);
    fetchJiraIssues(message);
  };

  return {
    chatHistory,
    chatContainerRef,
    resetChat,
    handleOptionClick,
    handleIconClick,
    handleJiraIconClick,
    selectedKeyword,
    responsiblePerson,
    isLoadingPerson,
    jiraIssues,
    isLoadingJira
  };
};
