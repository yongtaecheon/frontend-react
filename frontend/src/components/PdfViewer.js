import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ pdfFile, pdfKey, numPages, scale, setScale, onDocumentLoadSuccess, onLoadError, highlightKeyword }, ref) => {
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('single');
  const [textItems, setTextItems] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.max(prev - 1, 1);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => {
      const newPage = Math.min(prev + 1, numPages);
      scrollToPage(newPage);
      return newPage;
    });
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
      scrollToPage(pageNumber);
    }
  };

  const scrollToPage = (pageNumber) => {
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clearHighlights = () => {
    const textLayer = document.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;
    
    try {
      // Remove all highlights and restore original text
      const allHighlights = textLayer.querySelectorAll('.highlight');
      allHighlights.forEach(highlight => {
        if (highlight && highlight.parentNode) {
          const parent = highlight.parentNode;
          // If the highlight is inside a span, replace the span with its text content
          if (parent.tagName === 'SPAN') {
            if (parent.parentNode) {
              parent.parentNode.replaceChild(document.createTextNode(parent.textContent), parent);
            }
          } else {
            // Otherwise replace the highlight with its text content
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
          }
        }
      });
    } catch (error) {
      console.error("Error clearing highlights:", error);
    }
  };

  const highlightText = (searchText, isSearch = false) => {
    if (!searchText) return;
    
    // First, completely reset the text layer to its original state
    clearHighlights();
    
    const textLayer = document.querySelector('.react-pdf__Page__textContent');
    if (!textLayer) return;
    
    // Get all text nodes
    const textNodes = [];
    const walker = document.createTreeWalker(
      textLayer,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while ((node = walker.nextNode())) {
      if (node && node.textContent) {
        textNodes.push(node);
      }
    }
    
    const results = [];
    
    // Process each text node
    textNodes.forEach(node => {
      if (!node || !node.parentNode) return;
      
      const nodeText = node.textContent;
      const searchLower = searchText.toLowerCase();
      const nodeLower = nodeText.toLowerCase();
      
      if (nodeLower.includes(searchLower)) {
        // Create a new span element
        const span = document.createElement('span');
        
        // Replace the text with highlighted version
        const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedText})`, 'gi');
        span.innerHTML = nodeText.replace(regex, '<span class="highlight' + (isSearch ? ' search' : '') + '">$1</span>');
        
        // Replace the original node with our new span
        try {
          node.parentNode.replaceChild(span, node);
          
          if (isSearch) {
            const highlights = span.querySelectorAll('.highlight.search');
            highlights.forEach(highlight => {
              results.push({
                element: highlight,
                text: highlight.textContent
              });
            });
          }
        } catch (error) {
          console.error("Error replacing node:", error);
        }
      }
    });
    
    if (isSearch) {
      setSearchResults(results);
      if (results.length > 0) {
        setCurrentSearchIndex(0);
        try {
          results[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          results[0].element.classList.add('current');
        } catch (error) {
          console.error("Error scrolling to first result:", error);
        }
      }
    } else {
      const firstHighlight = textLayer.querySelector('.highlight');
      if (firstHighlight) {
        try {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
          console.error("Error scrolling to highlight:", error);
        }
      }
    }
  };
  
  const goToNextSearchResult = () => {
    if (searchResults.length === 0) return;

    // Remove current highlight
    if (currentSearchIndex >= 0) {
      searchResults[currentSearchIndex].element.classList.remove('current');
    }

    // Move to next result
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);

    // Add highlight to new current result and scroll to it
    searchResults[nextIndex].element.classList.add('current');
    searchResults[nextIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToPrevSearchResult = () => {
    if (searchResults.length === 0) return;

    // Remove current highlight
    if (currentSearchIndex >= 0) {
      searchResults[currentSearchIndex].element.classList.remove('current');
    }

    // Move to previous result
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);

    // Add highlight to new current result and scroll to it
    searchResults[prevIndex].element.classList.add('current');
    searchResults[prevIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear highlights if search is empty
    if (!value.trim()) {
      clearHighlights();
      setSearchResults([]);
      setCurrentSearchIndex(-1);
    } else {
      // Reset the text layer before searching
      clearHighlights();
      
      // Now perform the search
      highlightText(value, true);
    }
  };

  const handleSearchKeyPress = (e) => {
    // No need to handle Enter key for search anymore
    // But we can keep this function for other keyboard interactions if needed
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    if (!isSearchOpen) {
      // Focus the search input when opening
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      // Clear search when closing
      setSearchQuery("");
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      
      // Clear highlights
      clearHighlights();
    }
  };

  useEffect(() => {
    if (highlightKeyword) {
      setTimeout(() => highlightText(highlightKeyword), 1000);
    }
  }, [highlightKeyword, currentPage]);

  // Handle Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        toggleSearch();
      } else if (e.key === 'Escape' && isSearchOpen) {
        // Close search on Escape key
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setCurrentSearchIndex(-1);
        
        // Clear highlights
        clearHighlights();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Re-run search when page changes
  useEffect(() => {
    if (isSearchOpen && searchQuery.trim()) {
      // Wait for the page to render and text layer to be ready
      const checkTextLayer = setInterval(() => {
        const textLayer = document.querySelector('.react-pdf__Page__textContent');
        if (textLayer && textLayer.children.length > 0) {
          clearInterval(checkTextLayer);
          clearHighlights();
          highlightText(searchQuery, true);
          
          // If there are search results, scroll to the first one
          if (searchResults.length > 0) {
            setCurrentSearchIndex(0);
            searchResults[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            searchResults[0].element.classList.add('current');
          }
        }
      }, 100);

      // Cleanup interval after 5 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkTextLayer), 5000);
    }
  }, [currentPage, isSearchOpen]);

  React.useImperativeHandle(ref, () => ({
    goToPage,
    goToPrevPage,
    goToNextPage,
    currentPage,
    numPages
  }));

  useEffect(() => {
    const handleScroll = () => {
      if (viewMode === 'grid') {
        const pages = document.querySelectorAll('.react-pdf__Page');
        const containerTop = containerRef.current?.getBoundingClientRect().top;
        
        let closestPage = 1;
        let minDistance = Infinity;
        
        pages.forEach((page) => {
          const pageTop = page.getBoundingClientRect().top - containerTop;
          const distance = Math.abs(pageTop);
          if (distance < minDistance) {
            minDistance = distance;
            closestPage = parseInt(page.getAttribute('data-page-number'));
          }
        });
        
        setCurrentPage(closestPage);
      }
    };

    const container = containerRef.current?.querySelector('.pdf-viewer');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [viewMode]);

  return (
    <div className="pdf-container" ref={containerRef}>
      <div className="pdf-controls">
        <div className="pdf-controls-left">
          <button className="control-button" onClick={() => setViewMode(prev => prev === 'single' ? 'grid' : 'single')}>
            <span className="material-symbols-outlined">
              {viewMode === 'single' ? 'grid_view' : 'article'}
            </span>
          </button>
          <button className="control-button" onClick={toggleSearch}>
            <span className="material-symbols-outlined">search</span>
          </button>
          {isSearchOpen && (
            <div className="search-container">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                placeholder="검색어 입력..."
                className="search-input"
              />
              <div className="search-controls">
                <button onClick={goToPrevSearchResult} className="search-nav-button" disabled={searchResults.length === 0}>
                  <span className="material-symbols-outlined">arrow_upward</span>
                </button>
                <button onClick={goToNextSearchResult} className="search-nav-button" disabled={searchResults.length === 0}>
                  <span className="material-symbols-outlined">arrow_downward</span>
                </button>
                {searchResults.length > 0 && (
                  <span className="search-count">
                    {currentSearchIndex + 1} / {searchResults.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="pdf-controls-center">
          <button className="page-nav-button" onClick={goToPrevPage} disabled={currentPage <= 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="page-display">
            {currentPage} / {numPages}
          </div>
          <button className="page-nav-button" onClick={goToNextPage} disabled={currentPage >= numPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div className="pdf-controls-right">
          <button className="control-button" onClick={zoomOut}>
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="zoom-text">{Math.round(scale * 100)}%</span>
          <button className="control-button" onClick={zoomIn}>
            <span className="material-symbols-outlined">add</span>
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
          {viewMode === 'single' ? (
            <Page
              key={`page_${currentPage}`}
              pageNumber={currentPage}
              scale={scale}
              className="pdf-page"
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          ) : (
            Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                className="pdf-page"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            ))
          )}
        </Document>
      </div>
    </div>
  );
};

export default React.forwardRef(PdfViewer);
