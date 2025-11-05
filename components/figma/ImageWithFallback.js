import React, { useState } from "react";

export const ImageWithFallback = ({
  src,
  alt,
  className,
  fallback,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      fallback || (
        <div
          className={`bg-gray-200 flex items-center justify-center ${className}`}
        >
          <span className="text-gray-500">Image not available</span>
        </div>
      )
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};
