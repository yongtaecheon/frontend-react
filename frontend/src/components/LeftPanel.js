import React, { useRef, useEffect, useState } from "react";
import "../styles/components/LeftPanel.css";

const LeftPanel = ({
  isPanelCollapsed,
  setIsPanelCollapsed,
  onFileChange,
  documents,
  currentPdfFile,
  onDocumentClick,
}) => {
  const isCurrentDocument = (doc) => {
    if (!currentPdfFile || !doc) return false;
    const currentFileName = currentPdfFile.split("/").pop();
    return doc.filename === currentFileName;
  };

  return (
    <>
      <div className={`left-panel ${isPanelCollapsed ? "collapsed" : ""}`}>
        <div className="left-panel-header">
          <h1>FOBI</h1>
          <button className="toggle-panel-button" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}>
            <span className="material-symbols-outlined">keyboard_double_arrow_left</span>
          </button>
        </div>
        <button onClick={() => document.getElementById("file-input").click()} className="file-upload-button">
          File Upload
        </button>
        <input id="file-input" type="file" accept=".pdf" onChange={onFileChange} style={{ display: "none" }} />
        <img src="/poby_leftpanel.png" alt="" className="panel-image" />
        <div className="documents-list">
          <h3>업로드 한 문서</h3>
          {documents.map((doc, index) => (
            <div
              key={index}
              className={`document-item ${isCurrentDocument(doc) ? "active" : ""}`}
              onClick={() => onDocumentClick(doc)}
            >
              {doc.title}
            </div>
          ))}
        </div>
      </div>
      <div className="collapsed-panel-indicator" onClick={() => setIsPanelCollapsed(false)}>
        <img src="/poby_panel.png" alt="Open panel" />
      </div>
    </>
  );
};

export default LeftPanel;
