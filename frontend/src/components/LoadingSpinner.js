import React from 'react';

const LoadingSpinner = ({ className = '' }) => {
  return (
    <div className={`loading-spinner centered ${className}`}>
      <img src="/poby_face.png" alt="Loading..." style={{ width: '100px', height: '100px' }} />
    </div>
  );
};

export default LoadingSpinner;