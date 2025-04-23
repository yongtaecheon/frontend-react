import { useState, useRef, useEffect } from "react";
import axios from "axios";

// For Testing
const MOCK_RESPONSIBLE_PERSONS = {
  "Foreword": {
    name: "김서문",
    team: "편집팀",
    role: "편집 책임자",
    phoneNumber: "010-1234-5678",
    email: "kim.editor@kbs.co.kr"
  },
  "TOTAL CONTENTS": {
    name: "이목차",
    team: "편집팀",
    role: "목차 관리자",
    phoneNumber: "010-2345-6789",
    email: "lee.toc@kbs.co.kr"
  },
  "1. Purpose": {
    name: "박서비스",
    team: "서비스 표준팀",
    role: "서비스 표준 전문가",
    phoneNumber: "010-3456-7890",
    email: "park.service@kbs.co.kr"
  },
  "DATA STRUCTURE AND DEFINITION OF BASICINFORMATION OF SERVICE INFORMATION": {
    name: "최데이터",
    team: "데이터 구조팀",
    role: "데이터 구조 전문가",
    phoneNumber: "010-4567-8901",
    email: "choi.data@kbs.co.kr"
  },
  "DATA STRUCTURE AND DEFINITION OFEXTENSION INFORMATION OFSERVICE INFORMATION": {
    name: "정확장",
    team: "데이터 구조팀",
    role: "확장 정보 전문가",
    phoneNumber: "010-5678-9012",
    email: "jung.extension@kbs.co.kr"
  },
  "GUIDELINE FOR THE OPERATION METHOD OF SI (SERVICE INFORMATION)": {
    name: "강가이드",
    team: "서비스 정보팀",
    role: "SI 운영 가이드라인 담당자",
    phoneNumber: "010-6789-0123",
    email: "kang.guide@kbs.co.kr"
  }
};

export const useChatHandler = (toc, handlePageNavigation) => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [responsiblePerson, setResponsiblePerson] = useState(null);
  const [isLoadingPerson, setIsLoadingPerson] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // 담당자 정보를 가져오는 함수
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
        // 메시지 내용이 "(으)로 이동했습니다." 형식인 경우 처리
        const match = message.content.match(/^(.*?)\(으\)로 이동했습니다\.$/);
        if (match && match[1]) {
          keywords.push(match[1]);
        } else {
          // 그 외의 경우 메시지 내용을 키워드로 추가
          keywords.push(message.content);
        }
      }
      
      if (keywords.length === 0) {
        setResponsiblePerson(null);
        return;
      }

      const uniqueKeywords = [...new Set(keywords)];

      const persons = uniqueKeywords
        .map(keyword => {
          const person = MOCK_RESPONSIBLE_PERSONS[keyword];
          if (person) {
            return { ...person, keyword };
          }
          return undefined;
        })
        .filter(person => person !== undefined);
      
      // 실제 API 호출 대신 setTimeout으로 지연 효과 추가
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (persons.length > 0) {
        setResponsiblePerson(persons);
      } else {
        setResponsiblePerson(null);
      }
    } catch (error) {
      console.error("Error fetching responsible person:", error);
      setResponsiblePerson(null);
    } finally {
      setIsLoadingPerson(false);
    }
  };

  // 아이콘 클릭 핸들러
  const handleIconClick = (message) => {
    if (!message) {
      setResponsiblePerson(null);
      setSelectedKeyword(null);
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

    // Find all level 2 items (first actual TOC items)
    const topLevelItems = toc.filter((item) => item.level === 2);

    if (topLevelItems.length > 0) {
      setChatHistory([
        {
          type: "bot",
          content: (
            <div>
              <span>
                목차 키워드를 선택하세요 <span className="material-symbols-outlined">pets</span>
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
      // If no level 2 items found, show all items except level 1
      const nonTitleItems = toc.filter((item) => item.level > 1);
      setChatHistory([
        {
          type: "bot",
          content: (
            <div>
              <span>
                목차 키워드를 선택하세요 <span className="material-symbols-outlined">pets</span>
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
                세부 목차를 선택하세요 <span className="material-symbols-outlined">pets</span>
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
          options: [{ ...option, isLast: true }],
        },
      ]);
    }
  };

  return {
    chatHistory,
    chatContainerRef,
    resetChat,
    handleOptionClick,
    handleIconClick,
    selectedKeyword,
    responsiblePerson,
    isLoadingPerson
  };
};
