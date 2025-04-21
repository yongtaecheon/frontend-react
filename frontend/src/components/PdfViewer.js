import React from "react";
import { Document, Page } from "react-pdf";

const PdfViewer = ({ pdfFile, pdfKey, numPages, scale, setScale, onDocumentLoadSuccess, onLoadError }) => {
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="pdf-container">
      <div className="pdf-controls">
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
        <Document
          key={pdfKey}
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onLoadError}
          loading={
            <div className="loading-spinner centered">
              <div className="spinner"></div>
              <p>PDF 로딩 중...</p>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={true}
              data-page-number={index + 1}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
