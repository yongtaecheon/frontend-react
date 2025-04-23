import { useState, useRef, useEffect } from "react";

export const useChatHandler = (toc, handlePageNavigation) => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
          //options: [{ text: "처음으로", page: 1, level: 0 }], // Special level for '처음으로'
        },
      ]);
    }
    console.log(chatHistory);
  };

  return {
    chatHistory,
    chatContainerRef,
    resetChat,
    handleOptionClick,
  };
};
