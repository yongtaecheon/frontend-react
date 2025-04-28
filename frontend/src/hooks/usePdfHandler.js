import { useState, useCallback } from "react";
import axios from "axios";

export const usePdfHandler = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState(null);
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
      console.log(formData);

      try {
        const server_URL = `${process.env.REACT_APP_SERVER_URL}`;
        const response = await axios.post(`${server_URL}/files`, formData, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("post: upload file");
        console.log(response.data);

        setFileName(response.data);
        const fileUrl = `${server_URL}/file?fileName=${response.data}`;
        setPdfFile(fileUrl);
        setPdfKey((prev) => prev + 1);

        const tocResponse = await axios.get(`${server_URL}/search?fileName=${response.data}`);
        console.log("get: toc Response");
        console.log(tocResponse.data);

        return tocResponse.data;
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
    console.log("파일 다운로드 성공");
  }, []);

  const handleTocClick = useCallback((page) => {
    const pageElement = document.querySelector(`[data-page-number="${page}"]`); // 페이지 번호 찾기
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "auto", block: "start" }); // 페이지 요소 스크롤 이동
    }
  }, []);

  const handleDocumentClick = useCallback((document) => {
    setIsLoading(true);
    const fileUrl = `${process.env.REACT_APP_SERVER_URL}/file?fileName=${document.title}`;
    setFileName(document.title);
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
    fileName,
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
