import React from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { usePdfHandler } from "../hooks/usePdfHandler";

const LandingPage = () => {
  const navigate = useNavigate();
  const { processFile, isLoading } = usePdfHandler();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await processFile(file);
      navigate("/main");
    } catch (error) {
      alert("파일 업로드 또는 처리 중 오류가 발생했습니다.");
    }
    event.target.value = null;
  };

  return (
    <div className="landing-page-new">
      <div className="landing-title-container">
        <h1>File Oriented Bot Interface</h1>
        <span>
          LG Electronics. Bootcamp 9th{" "}
          <a href="https://github.com/2025-LG-Bootcamp-FOBI">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-github"
              viewBox="0 0 16 16"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
            </svg>
          </a>
        </span>
      </div>
      <div className="landing-content-new">
        <img src="/poby_landing.png" alt="Character" className="character-image-new" />
        <div className="landing-text-content">
          <h2>
            안녕하세요, LG전자 부트캠프 9기.
            <br />
            FOBI 입니다.
          </h2>
          <p>
            포비는 목차 기반 검색을 통한 문서 도우미입니다.
            <br />
            파일을 업로드하여 포비의 도움을 받아보세요.
          </p>
          <div className="upload-button-container">
            <button
              className="upload-button-new"
              onClick={() => document.getElementById("landing-file-input-new").click()}
              disabled={isLoading}
            >
              {isLoading ? "파일 업로드 중..." : "파일 업로드"}
            </button>
            <button className="upload-button-new" onClick={() => navigate("/main")}>
              바로 시작하기
            </button>
          </div>
          <input
            id="landing-file-input-new"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={isLoading}
          />
        </div>
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner />
        </div>
      )}
      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        input[type="file"]::-webkit-file-upload-button {
          display: none;
        }
        input[type="file"] {
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
