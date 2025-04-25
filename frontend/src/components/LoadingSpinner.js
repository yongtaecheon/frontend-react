import React from 'react';
import "../styles/components/LoadingSpinner.css";

const LoadingSpinner = ({ className = '' }) => {
  return (
    <div className={`loading-spinner ${className}`}>
      <img src="/poby_face.png" alt="Loading..." />
    </div>
  );
};

export default LoadingSpinner;