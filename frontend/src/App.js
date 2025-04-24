import React, { useState, useEffect, useRef, useCallback } from "react";
import { pdfjs } from "react-pdf";
import LandingPage from "./components/LandingPage";
import LeftPanel from "./components/LeftPanel";
import PdfViewer from "./components/PdfViewer";
import ChatPanel from "./components/ChatPanel";
import LoadingSpinner from "./components/LoadingSpinner";
import { usePdfHandler } from "./hooks/usePdfHandler";
import { useChatHandler } from "./hooks/useChatHandler";
import { useDocumentHandler } from "./hooks/useDocumentHandler";
import "./styles/global.css";
import "./styles/components/MainLayout.css";
import "./styles/components/LandingPage.css";
import "./styles/components/Chat.css";
import "./styles/components/PDFViewer.css";
import axios from "axios";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
  const [isAppActive, setIsAppActive] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [toc, setToc] = useState([]);
  const pdfViewerRef = useRef(null);
  const [highlightKeyword, setHighlightKeyword] = useState("");
  const server_URL = `${process.env.REACT_APP_SERVER_URL}`;
  const {
    pdfFile,
    pdfKey,
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
    // Find the page element and scroll to it instantly
    const pageElement = document.querySelector(`[data-page-number="${page}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "auto", block: "start" });
    }
    if (pdfViewerRef.current) {
      pdfViewerRef.current.goToPage(page);
    }
    // Set the keyword to highlight
    setHighlightKeyword(keyword || "");
  };

  const { chatHistory, chatContainerRef, resetChat, handleOptionClick } = useChatHandler(toc, handlePageNavigation);

  const { documents, loadDocuments } = useDocumentHandler();
  const [shouldResetChat, setShouldResetChat] = useState(false);

  const handleLoadDocuments = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (isAppActive) {
      handleLoadDocuments();
    }
  }, [isAppActive, handleLoadDocuments]);

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
      setIsAppActive(true);
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
    setIsAppActive(true);
    setShouldResetChat(true);
    setPdfKey((prev) => prev + 1);
    if (pdfViewerRef.current) {
      pdfViewerRef.current.goToPage(1);
    }
  };

  const updateDocumentTitle = async (doc, newTitle) => {
    try {
      // 서버에 제목 변경 요청 보내기
      const response = await axios.put(`${server_URL}/files?oldName=${doc.title}&newName=${newTitle}`);

      if (response.status === 200) {
        // 성공적으로 업데이트되면 문서 목록 다시 로드
        await handleLoadDocuments();
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
      // 삭제 확인
      if (!window.confirm(`"${doc.title}" 문서를 삭제하시겠습니까?`)) {
        return false;
      }

      // 서버에 삭제 요청 보내기
      const response = await axios.delete(`${server_URL}/files?fileName=${doc.title}`);

      if (response.status === 200) {
        // 성공적으로 삭제되면 문서 목록 다시 로드
        await handleLoadDocuments();
        console.log("삭제 성공");
        // 현재 선택된 문서가 삭제된 경우 처리
        if (pdfFile && pdfFile.includes(doc.filename)) {
          setPdfFile(null);
          setToc([]);
        }

        return true;
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("문서 삭제 중 오류가 발생했습니다.");
    }
    return false;
  };

  if (!isAppActive) {
    return <LandingPage setIsAppActive={setIsAppActive} onFileChange={onFileChange} isLoading={pdfLoading} />;
  }

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
        <ChatPanel chatHistory={chatHistory} onOptionClick={handleOptionClick} ref={chatContainerRef} toc={toc} />
      </div>
    </div>
  );
}

export default App;
