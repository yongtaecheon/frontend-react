import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useDocumentHandler = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/documents");
      const rawDocuments = response.data;

      const uniqueDocumentsMap = new Map();
      rawDocuments.forEach((doc) => {
        if (!uniqueDocumentsMap.has(doc.title)) {
          uniqueDocumentsMap.set(doc.title, doc);
        }
      });
      const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

      setDocuments(uniqueDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
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
