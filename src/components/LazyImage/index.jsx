import { memo, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation

const LazyImage = ({
  src = "",
  alt = "",
  defaultImage = "/images/img-placeholder.jpg",
  isDynamic = true,
  ...props
}) => {
  const imgRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Disconnect observer once the image is visible
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before coming into view
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current); // Observe the image reference
    }

    return () => {
      observer.disconnect(); // Clean up observer on unmount
    };
  }, [imgRef]);

  const handleContextMenu = (e) => {
    e.preventDefault(); // Disable right-click context menu
  };

  const handleDragStart = (e) => {
    e.preventDefault(); // Disable drag and drop
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const displaySrc = (() => {
    if (hasError) return defaultImage;
    if (!isDynamic) return src || defaultImage;
    return isVisible ? src || defaultImage : defaultImage;
  })();

  return (
    <div 
      ref={imgRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        backgroundColor: isLoaded ? 'transparent' : '#f0f0f0',
        transition: 'background-color 0.3s ease',
        ...props.style
      }}
    >
      <img
        src={displaySrc}
        alt={alt}
        loading={isDynamic ? "lazy" : "eager"}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        {...props}
      />
    </div>
  );
};

// Adding prop types validation
LazyImage.propTypes = {
  src: PropTypes.string, // Validate src prop as a required string
  alt: PropTypes.string, // Validate alt prop as a required string
  defaultImage: PropTypes.string, // Validate defaultImage as an optional string
  isDynamic: PropTypes.bool,
};

export default memo(LazyImage);
