import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import PdfViewer from "./PdfViewer";
import ChatPanel from "./ChatPanel";
import LoadingSpinner from "./LoadingSpinner";
import { usePdfHandler } from "../hooks/usePdfHandler";
import { useChatHandler } from "../hooks/useChatHandler";
import { useDocumentHandler } from "../hooks/useDocumentHandler";
import axios from "axios";

function MainPage() {
  const navigate = useNavigate();
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [toc, setToc] = useState([]);
  const pdfViewerRef = useRef(null);
  const [highlightKeyword, setHighlightKeyword] = useState("");
  const server_URL = `${process.env.REACT_APP_SERVER_URL}`;

  const {
    pdfFile,
    pdfKey,
    fileName,
    numPages,
    scale,
    isLoading: pdfLoading,
    setScale,
    processFile,
    onDocumentLoadSuccess,
    handleTocClick,
    handleDocumentClick,
    setPdfKey,
    setPdfFile,
  } = usePdfHandler();

  const handlePageNavigation = (page, keyword) => {
    const pageElement = document.querySelector(`[data-page-number="${page}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "auto", block: "start" });
    }
    if (pdfViewerRef.current) {
      pdfViewerRef.current.goToPage(page);
    }
    setHighlightKeyword(keyword || "");
  };

  const {
    chatHistory,
    setChatHistory,
    chatContainerRef,
    resetChat,
    handleOptionClick,
    handleIconClick,
    handleJiraIconClick,
    responsiblePerson,
    isLoadingPerson,
    selectedKeyword,
    jiraIssues,
    isLoadingJira,
  } = useChatHandler(toc, handlePageNavigation);

  const { documents, loadDocuments } = useDocumentHandler();
  const [shouldResetChat, setShouldResetChat] = useState(false);

  const handleLoadDocuments = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    handleLoadDocuments();
  }, [handleLoadDocuments]);

  useEffect(() => {
    if (shouldResetChat) {
      resetChat();
      setShouldResetChat(false);
    }
  }, [toc, shouldResetChat, resetChat]);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const newToc = await processFile(file);
      setToc(newToc);
      setShouldResetChat(true);
      await handleLoadDocuments();
    } catch (error) {
      alert("파일 업로드 또는 처리 중 오류가 발생했습니다.");
    }
    event.target.value = null;
  };

  const onDocumentSelect = async (document) => {
    const newToc = handleDocumentClick(document);
    setToc(newToc);
    setShouldResetChat(true);
    setPdfKey((prev) => prev + 1);
    if (pdfViewerRef.current) {
      pdfViewerRef.current.goToPage(1);
    }
  };

  const updateDocumentTitle = async (doc, newTitle) => {
    try {
      const response = await axios.put(`${server_URL}/files?oldName=${doc.title}&newName=${newTitle}`);

      if (response.status === 200) {
        await handleLoadDocuments();

        // 현재 선택된 문서라면 currentPdfFile도 새 이름으로 갱신
        if (pdfFile && pdfFile.includes(doc.title)) {
          const newFileUrl = `${server_URL}/file?fileName=${newTitle}`;
          setPdfFile(newFileUrl);
        }

        return true;
      }
    } catch (error) {
      console.error("Error updating document title:", error);
      alert("문서 제목 변경 중 오류가 발생했습니다.");
    }
    return false;
  };

  const deleteDocument = async (doc) => {
    try {
      if (!window.confirm(`"${doc.title}" 문서를 삭제하시겠습니까?`)) {
        return false;
      }

      const response = await axios.delete(`${server_URL}/files?fileName=${doc.title}`);

      if (response.status === 200) {
        await handleLoadDocuments();
        console.log("삭제 성공");
        if (pdfFile && pdfFile.includes(doc.title)) {
          setPdfFile(null);
          setToc([]);
          setChatHistory([]);
        }

        return true;
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("문서 삭제 중 오류가 발생했습니다.");
    }
    return false;
  };

  return (
    <div className="app">
      <LeftPanel
        isPanelCollapsed={isPanelCollapsed}
        setIsPanelCollapsed={setIsPanelCollapsed}
        onFileChange={onFileChange}
        documents={documents}
        currentPdfFile={pdfFile}
        onDocumentClick={onDocumentSelect}
        onUpdateDocumentTitle={updateDocumentTitle}
        onDeleteDocument={deleteDocument}
      />
      {isPanelCollapsed && (
        <div className="collapsed-panel-indicator" onClick={() => setIsPanelCollapsed(false)}>
          <img src="/poby_panel.png" alt="Open Panel" />
        </div>
      )}
      <div className="center-panel">
        {pdfFile ? (
          <PdfViewer
            ref={pdfViewerRef}
            pdfFile={pdfFile}
            pdfKey={pdfKey}
            fileName={fileName}
            numPages={numPages}
            scale={scale}
            setScale={setScale}
            onDocumentLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => console.error("Failed to load PDF:", error.message)}
            highlightKeyword={highlightKeyword}
          />
        ) : (
          <div className="no-pdf-message">문서를 선택해주세요.</div>
        )}
        {pdfLoading && !pdfFile && <LoadingSpinner className="overlay" />}
      </div>
      <div className="right-panel">
        <ChatPanel
          chatHistory={chatHistory}
          onOptionClick={handleOptionClick}
          ref={chatContainerRef}
          toc={toc}
          handleIconClick={handleIconClick}
          handleJiraIconClick={handleJiraIconClick}
          responsiblePerson={responsiblePerson}
          isLoadingPerson={isLoadingPerson}
          selectedKeyword={selectedKeyword}
          jiraIssues={jiraIssues}
          isLoadingJira={isLoadingJira}
        />
      </div>
    </div>
  );
}

export default MainPage;
