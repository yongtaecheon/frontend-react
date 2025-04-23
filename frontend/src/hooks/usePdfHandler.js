import { useState, useCallback } from "react";
import axios from "axios";

export const usePdfHandler = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfKey, setPdfKey] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(async (file) => {
    if (file && file.type === "application/pdf") {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("http://localhost:8000/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const fileUrl = `http://localhost:8000/uploads/${response.data.filename}`;
        setPdfFile(fileUrl);
        setPdfKey((prev) => prev + 1);
        return response.data.toc;
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    }
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  }, []);

  const handleTocClick = useCallback((page) => {
    const pageElement = document.querySelector(`[data-page-number="${page}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  const handleDocumentClick = useCallback((document) => {
    setIsLoading(true);
    const fileUrl = `http://localhost:8000/uploads/${document.filename}`;
    setPdfFile(fileUrl);
    setPdfKey((prev) => prev + 1);
    setPageNumber(0);
    setScale(1.0);
    return document.toc;
  }, []);

  return {
    pdfFile,
    pdfKey,
    setPdfKey,
    numPages,
    pageNumber,
    scale,
    isLoading,
    setScale,
    processFile,
    onDocumentLoadSuccess,
    handleTocClick,
    handleDocumentClick,
    setPdfFile,
  };
};
