import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import LoadingSpinner from "./LoadingSpinner";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// 기본 로딩 스피너 스타일 제거
const customStyles = `
  .react-pdf__Document {
    position: relative;
  }
  .react-pdf__Document .react-pdf__message {
    display: none !important;
  }
  .react-pdf__Page {
    position: relative;
  }
  .react-pdf__Page .react-pdf__message {
    display: none !important;
  }
  .react-pdf__Page__canvas {
    margin: 0 auto;
  }
  .react-pdf__Page__textContent {
    display: none !important;
  }
  .react-pdf__Page__annotations {
    display: none !important;
  }
  .react-pdf__Page__loading {
    display: none !important;
  }
  .react-pdf__Page__loading .react-pdf__message {
    display: none !important;
  }
`;

const PdfViewer = ({ pdfFile, pdfKey, numPages, scale, setScale, onDocumentLoadSuccess, onLoadError }, ref) => {
  const containerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'grid'
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.max(prev - 1, 1);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.min(prev + 1, numPages);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
      scrollToPage(pageNumber);
    }
  };

  const scrollToPage = (pageNumber) => {
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 외부에서 페이지 이동을 제어할 수 있도록 ref 노출
  React.useImperativeHandle(ref, () => ({
    goToPage,
    goToPrevPage,
    goToNextPage,
    currentPage,
    numPages
  }));

  // PDF가 스크롤될 때 현재 페이지 업데이트
  useEffect(() => {
    const handleScroll = () => {
      if (viewMode === 'grid') {
        const pages = document.querySelectorAll('.react-pdf__Page');
        const containerTop = containerRef.current?.getBoundingClientRect().top;

        let closestPage = 1;
        let minDistance = Infinity;

        pages.forEach((page) => {
          const pageTop = page.getBoundingClientRect().top - containerTop;
          const distance = Math.abs(pageTop);
          if (distance < minDistance) {
            minDistance = distance;
            closestPage = parseInt(page.getAttribute('data-page-number'));
          }
        });

        setCurrentPage(closestPage);
      }
    };

    const container = containerRef.current?.querySelector('.pdf-viewer');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [viewMode]);

  useEffect(() => {
    // 커스텀 스타일 추가
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setIsDocumentLoaded(false);
  }, [pdfFile]);

  useEffect(() => {
    let timer;
    if (isDocumentLoaded) {
      // 문서가 로드된 후에도 최소 1초 동안 스피너 표시
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isDocumentLoaded]);

  return (
    <div className="pdf-container" ref={containerRef}>
      <div className="pdf-controls">
        <div className="pdf-controls-left">
          <button className="control-button" onClick={() => setViewMode(prev => prev === 'single' ? 'grid' : 'single')}>
            <span className="material-symbols-outlined">
              {viewMode === 'single' ? 'grid_view' : 'article'}
            </span>
          </button>
          <button className="control-button">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
        <div className="pdf-controls-center">
          <button className="page-nav-button" onClick={goToPrevPage} disabled={currentPage <= 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="page-display">
            {currentPage} / {numPages}
          </div>
          <button className="page-nav-button" onClick={goToNextPage} disabled={currentPage >= numPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div className="pdf-controls-right">
          <button className="control-button" onClick={zoomOut}>
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="zoom-text">{Math.round(scale * 100)}%</span>
          <button className="control-button" onClick={zoomIn}>
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
      <div className="pdf-viewer">
        {isLoading && <LoadingSpinner />}
        <div style={{ display: isLoading ? 'none' : 'block' }}>
          <Document
            file={pdfFile}
            onLoadSuccess={({ numPages }) => {
              onDocumentLoadSuccess({ numPages });
              setIsDocumentLoaded(true);
            }}
            onLoadError={(error) => {
              onLoadError(error);
              setIsDocumentLoaded(true);
            }}
            loading={null}
          >
            {viewMode === 'single' ? (
              <Page
                key={`page_${currentPage}`}
                pageNumber={currentPage}
                scale={scale}
                className="pdf-page"
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={null}
              />
            ) : (
              Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  className="pdf-page"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={null}
                />
              ))
            )}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default React.forwardRef(PdfViewer);
