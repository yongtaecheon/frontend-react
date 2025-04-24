import React, { useRef, useEffect, useState } from "react";
import "../styles/components/LeftPanel.css";

const LeftPanel = ({
  isPanelCollapsed,
  setIsPanelCollapsed,
  onFileChange,
  documents,
  currentPdfFile,
  onDocumentClick,
  onUpdateDocumentTitle,
  onDeleteDocument,
}) => {
  const [editingDocId, setEditingDocId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef(null);

  const isCurrentDocument = (doc) => {
    if (!currentPdfFile || !doc) return false;
    const currentFileName = currentPdfFile.split("=").pop();
    return doc.title === currentFileName;
  };

  const handleEdit = (e, doc) => {
    e.stopPropagation(); // 문서 클릭 이벤트 전파 방지
    setEditingDocId(doc.title);
    setEditTitle(doc.title);

    // 다음 렌더링 후 입력 필드에 포커스
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select(); // 기존 텍스트 선택
      }
    }, 0);
  };

  const handleDelete = async (e, doc) => {
    e.stopPropagation(); // 문서 클릭 이벤트 전파 방지

    if (onDeleteDocument) {
      await onDeleteDocument(doc);
    }
  };

  const handleTitleChange = (e) => {
    setEditTitle(e.target.value);
  };

  const handleTitleKeyDown = (e, doc) => {
    if (e.key === "Enter") {
      saveTitle(doc);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const handleTitleBlur = (doc) => {
    saveTitle(doc);
  };

  const saveTitle = async (doc) => {
    if (editTitle.trim() && editTitle !== doc.title) {
      // 서버에 제목 변경 요청 보내기
      if (onUpdateDocumentTitle) {
        const success = await onUpdateDocumentTitle(doc, editTitle.trim());
        if (!success) {
          // 실패 시 원래 제목으로 복원
          setEditTitle(doc.title);
        }
      }
    }

    setEditingDocId(null);
  };

  const cancelEdit = () => {
    setEditingDocId(null);
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
          파일 업로드
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
              title={doc.title}
            >
              {editingDocId === doc.title ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editTitle}
                  onChange={handleTitleChange}
                  onKeyDown={(e) => handleTitleKeyDown(e, doc)}
                  onBlur={() => handleTitleBlur(doc)}
                  className="document-title-input"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="document-title">{doc.title}</span>
              )}
              <div className="document-actions">
                <button className="document-action-button" onClick={(e) => handleEdit(e, doc)}>
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="document-action-button" onClick={(e) => handleDelete(e, doc)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
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
