import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { pdfjs } from "react-pdf";
import LandingPage from "./components/LandingPage";
import MainPage from "./components/MainPage";
import "./styles/global.css";
import "./styles/components/MainLayout.css";
import "./styles/components/LandingPage.css";
import "./styles/components/Chat.css";
import "./styles/components/PDFViewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
