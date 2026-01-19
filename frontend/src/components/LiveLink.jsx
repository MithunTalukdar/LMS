import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';

const LiveLink = ({ href, children, className, style, message = "Loading Live Preview...", onClick, logo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);
    setIsLoading(true);

    // Simulate a loading delay (e.g., 1.5 seconds) before navigating
    timeoutRef.current = setTimeout(() => {
      if (href.startsWith('http') || href.startsWith('//')) {
        window.location.href = href;
      } else {
        navigate(href);
        setIsLoading(false); // Reset state so overlay closes even if on same page
      }
    }, 1500);
  };

  const handleCancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
  };

  return (
    <>
      <a href={href} className={className} style={{ cursor: 'pointer', ...style }} onClick={handleClick}>
        {children}
      </a>

      {isLoading && <LoadingOverlay message={message} onCancel={handleCancel} logo={logo} />}
    </>
  );
};

export default LiveLink;