import React, { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const PdfViewer = ({ pdfFile, pdfKey, numPages, scale, setScale, onDocumentLoadSuccess, onLoadError }, ref) => {
  const containerRef = useRef(null);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="pdf-container" ref={containerRef}>
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
          file={pdfFile}
          onLoadSuccess={({ numPages }) => onDocumentLoadSuccess({ numPages })}
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
              className="pdf-page"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default React.forwardRef(PdfViewer);
