import { useState, useRef, useEffect } from "react";

export const useChatHandler = (toc, handleTocClick) => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const resetChat = () => {
    setChatHistory([]);
    const documentTitle = toc.find((item) => item.level === 1)?.title || "";
    const secondLevelItems = toc.filter((item) => item.level === 2);

    if (secondLevelItems.length > 0) {
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
          options: secondLevelItems.map((item) => ({
            text: item.title,
            page: item.page,
            level: item.level,
          })),
        },
      ]);
    } else {
      setChatHistory([
        {
          type: "bot",
          content: "문서의 목차를 찾을 수 없거나 최상위 레벨 목차가 없습니다. 직접 페이지를 탐색해주세요.",
          options: [],
        },
      ]);
    }
  };

  const handleOptionClick = (option) => {
    if (option.text === "처음으로") {
      resetChat();
      return;
    }

    setChatHistory((prev) => [...prev, { type: "user", content: option.text }]);

    handleTocClick(option.page);

    const currentIndex = toc.findIndex(
      (t) => t.title === option.text && t.level === option.level && t.page === option.page
    );
    const childItems = [];

    if (currentIndex !== -1) {
      const nextLevel = option.level + 1;
      for (let i = currentIndex + 1; i < toc.length; i++) {
        if (toc[i].level === nextLevel) {
          childItems.push(toc[i]);
        } else if (toc[i].level <= option.level) {
          break;
        }
      }
    }

    if (childItems.length > 0) {
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
      setChatHistory((prev) => [
        ...prev,
        {
          type: "bot",
          content: `${option.text}(으)로 이동했습니다.`,
          options: [{ text: "처음으로", page: 1, level: 0 }],
        },
      ]);
    }
  };

  return {
    chatHistory,
    chatContainerRef,
    resetChat,
    handleOptionClick,
  };
};
