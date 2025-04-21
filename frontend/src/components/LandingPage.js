import React from "react";

const LandingPage = ({ onFileChange, isLoading }) => {
  return (
    <div className="landing-page-new">
      <h1 className="landing-title-new">FOBI</h1>
      <div className="landing-content-new">
        <img src="/poby.png" alt="Character" className="character-image-new" />
        <div className="landing-text-content">
          <h2>
            Hello, LG Bootcamp 9th.
            <br />
            This is FOBI.
          </h2>
          <button
            className="upload-button-new"
            onClick={() => document.getElementById("landing-file-input-new").click()}
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload"}
          </button>
          <input
            id="landing-file-input-new"
            type="file"
            accept=".pdf"
            onChange={onFileChange}
            style={{ display: "none" }}
            disabled={isLoading}
          />
        </div>
      </div>
      {isLoading && <div className="loading-spinner centered overlay"></div>}
    </div>
  );
};

export default LandingPage;
