import React, { useState, useEffect, useRef, useCallback } from "react";
import { pdfjs } from "react-pdf";
import LandingPage from "./components/LandingPage";
import LeftPanel from "./components/LeftPanel";
import PdfViewer from "./components/PdfViewer";
import ChatPanel from "./components/ChatPanel";
import { usePdfHandler } from "./hooks/usePdfHandler";
import { useChatHandler } from "./hooks/useChatHandler";
import { useDocumentHandler } from "./hooks/useDocumentHandler";
import "./styles/global.css";
import "./styles/components/MainLayout.css";
import "./styles/components/LandingPage.css";
import "./styles/components/Chat.css";
import "./styles/components/PDFViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
  const [isAppActive, setIsAppActive] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [toc, setToc] = useState([]);
  const pdfViewerRef = useRef(null);

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
  } = usePdfHandler();

  const handlePageNavigation = (page) => {
    // Find the page element and scroll to it instantly
    const pageElement = document.querySelector(`[data-page-number="${page}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "auto", block: "start" });
    }
    if (pdfViewerRef.current) {
      pdfViewerRef.current.goToPage(page);
    }
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

  if (!isAppActive) {
    return <LandingPage onFileChange={onFileChange} isLoading={pdfLoading} />;
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
          />
        ) : (
          <div className="no-pdf-message">문서를 선택해주세요.</div>
        )}
        {pdfLoading && <div className="loading-spinner centered overlay"></div>}
      </div>
      <div className="right-panel">
        <ChatPanel chatHistory={chatHistory} onOptionClick={handleOptionClick} ref={chatContainerRef} />
      </div>
    </div>
  );
}

export default App;
