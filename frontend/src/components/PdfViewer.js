import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer = ({ pdfFile, pdfKey, numPages, scale, setScale, onDocumentLoadSuccess, onLoadError }, ref) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState(null);
  const [currentPageObj, setCurrentPageObj] = useState(null);
  const containerRef = useRef(null);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const renderPage = async (num) => {
    if (!pdfDoc) return;
    
    setPageRendering(true);
    try {
      const page = await pdfDoc.getPage(num);
      setCurrentPageObj(page);
      
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      // 텍스트 레이어 렌더링
      const textLayer = textLayerRef.current;
      textLayer.style.height = `${viewport.height}px`;
      textLayer.style.width = `${viewport.width}px`;
      
      const textContent = await page.getTextContent();
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayer,
        viewport: viewport,
        textDivs: []
      });
      
      setPageRendering(false);
      
      if (pageNumPending !== null) {
        setCurrentPage(pageNumPending);
        setPageNumPending(null);
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      setPageRendering(false);
      if (onLoadError) onLoadError(error);
    }
  };

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfFile);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        if (onDocumentLoadSuccess) {
          onDocumentLoadSuccess({ numPages: pdf.numPages });
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        if (onLoadError) onLoadError(error);
      }
    };

    if (pdfFile) {
      loadPdf();
    }
  }, [pdfFile, pdfKey]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc, scale]);

  const goPrevPage = () => {
    if (currentPage <= 1) return;
    setCurrentPage(currentPage - 1);
  };

  const goNextPage = () => {
    if (currentPage >= numPages) return;
    setCurrentPage(currentPage + 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > numPages) return;
    setCurrentPage(pageNumber);
  };

  // 외부에서 페이지 이동을 위한 메서드 노출
  React.useImperativeHandle(ref, () => ({
    goToPage
  }));

  return (
    <div className="pdf-container" ref={containerRef}>
      <div className="pdf-controls">
        <div className="page-controls">
          <button onClick={goPrevPage} className="control-button" disabled={currentPage <= 1}>
            이전
          </button>
          <span>
            {currentPage} / {numPages}
          </span>
          <button onClick={goNextPage} className="control-button" disabled={currentPage >= numPages}>
            다음
          </button>
        </div>
        <div className="zoom-controls">
          <button onClick={zoomOut} className="control-button">
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="control-button">
            +
          </button>
        </div>
      </div>
      <div className="pdf-viewer">
        {!pdfDoc ? (
          <div className="loading-spinner centered">
            <div className="spinner"></div>
            <p>PDF 로딩 중...</p>
          </div>
        ) : (
          <div className="pdf-page-container">
            <canvas ref={canvasRef} className="pdf-page" />
            <div ref={textLayerRef} className="textLayer"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.forwardRef(PdfViewer);
