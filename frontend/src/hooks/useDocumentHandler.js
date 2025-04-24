import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useDocumentHandler = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    //기존에 존재하는 모든 파일들 리스트 가져오기
    try {
      setIsLoading(true);
      const server_URL = `${process.env.REACT_APP_SERVER_URL}`;

      // 파일 이름 리스트 가져오기
      const fileNameListResponse = await axios.get(`${server_URL}/files`);
      console.log(fileNameListResponse.data);

      // Promise.all을 사용하여 모든 비동기 작업이 완료될 때까지 기다림
      const wholeTocList = await Promise.all(
        fileNameListResponse.data.map(async (file) => {
          const tocResponse = await axios.get(`${server_URL}/search?fileName=${file}`);
          return { title: file, toc: tocResponse.data };
        })
      );

      console.log("get: documents");
      console.log(wholeTocList);

      setDocuments(wholeTocList);

      // 중복제거, 수정필요함
      // const rawDocuments = wholeTocList;
      // const uniqueDocumentsMap = new Map();
      // rawDocuments.forEach((doc) => {
      //   if (!uniqueDocumentsMap.has(doc.title)) {
      //     uniqueDocumentsMap.set(doc.title, doc);
      //   }
      // });
      // const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

      // setDocuments(uniqueDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return {
    documents,
    isLoading,
    loadDocuments,
  };
};
