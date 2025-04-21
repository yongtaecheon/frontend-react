import React, { useState, useEffect } from "react";
import { pdfjs } from "react-pdf";
import LandingPage from "./components/LandingPage";
import LeftPanel from "./components/LeftPanel";
import PdfViewer from "./components/PdfViewer";
import ChatPanel from "./components/ChatPanel";
import { usePdfHandler } from "./hooks/usePdfHandler";
import { useChatHandler } from "./hooks/useChatHandler";
import { useDocumentHandler } from "./hooks/useDocumentHandler";
import "./App.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
  const [isAppActive, setIsAppActive] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [toc, setToc] = useState([]);

  const {
    pdfFile,
    pdfKey,
    numPages,
    scale,
    isLoading,
    setScale,
    processFile,
    onDocumentLoadSuccess,
    handleTocClick,
    handleDocumentClick,
  } = usePdfHandler();

  const { chatHistory, chatContainerRef, resetChat, handleOptionClick } = useChatHandler(toc, handleTocClick);

  const { documents, loadDocuments } = useDocumentHandler();

  useEffect(() => {
    if (isAppActive) {
      loadDocuments();
    }
  }, [isAppActive, loadDocuments]);

  useEffect(() => {
    if (toc.length > 0) {
      resetChat();
    }
  }, [toc, resetChat]);

  const onFileChange = async (event) => {
    const file = event.target.files[0];
    try {
      const newToc = await processFile(file);
      setToc(newToc);
      setIsAppActive(true);
    } catch (error) {
      alert("파일 업로드 또는 처리 중 오류가 발생했습니다.");
    }
    event.target.value = null;
  };

  const onDocumentSelect = (document) => {
    const newToc = handleDocumentClick(document);
    setToc(newToc);
    setIsAppActive(true);
  };

  if (!isAppActive) {
    return <LandingPage onFileChange={onFileChange} isLoading={isLoading} />;
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
      <div className="collapsed-panel-indicator" onClick={() => setIsPanelCollapsed(false)}>
        <img src="/poby_panel.png" alt="Open Panel" />
      </div>
      <div className="center-panel">
        {pdfFile ? (
          <PdfViewer
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
        {isLoading && <div className="loading-spinner centered overlay"></div>}
      </div>
      <div className="right-panel">
        <ChatPanel chatHistory={chatHistory} onOptionClick={handleOptionClick} ref={chatContainerRef} />
      </div>
    </div>
  );
}

export default App;
