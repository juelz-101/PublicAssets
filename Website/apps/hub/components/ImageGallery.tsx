import React, { useState, useEffect, useRef } from 'react';
import { Manifest } from '../services/contentService';
import GitHubImage from './GitHubImage';

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

interface ImageGalleryProps {
  images: string[];
  manifest: Manifest | null;
  altPrefix: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, manifest, altPrefix }) => {
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoscrolling, setIsAutoscrolling] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Shuffle images on initial load
  useEffect(() => {
    setShuffledImages([...images].sort(() => Math.random() - 0.5));
  }, [images]);

  // Autoscroll effect
  useEffect(() => {
    if (isAutoscrolling && shuffledImages.length > 1) {
      intervalRef.current = window.setInterval(() => {
        setSelectedIndex(prevIndex => (prevIndex + 1) % shuffledImages.length);
      }, 4000); // Change image every 4 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoscrolling, shuffledImages.length]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    // Stop autoscroll on manual selection and reset the timer if it's restarted
    if(isAutoscrolling) {
        setIsAutoscrolling(false);
        setTimeout(() => setIsAutoscrolling(true), 5000); // Pause for 5s then resume
    }
  };

  if (shuffledImages.length === 0) {
    return null;
  }

  const selectedImage = shuffledImages[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-800 ring-1 ring-white/10 shadow-lg">
        {selectedImage && (
          <GitHubImage
            key={selectedImage} // Use key to force re-render on change for fade effect
            manifest={manifest}
            path={selectedImage}
            alt={`${altPrefix} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-contain animate-fade-in-up"
          />
        )}
      </div>
      
      {/* Thumbnails and Controls */}
      <div className="relative">
        <button
          onClick={() => setIsAutoscrolling(!isAutoscrolling)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-900/60 backdrop-blur-sm rounded-full text-amber-400 hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          aria-label={isAutoscrolling ? 'Pause autoscroll' : 'Start autoscroll'}
        >
          {isAutoscrolling ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="overflow-x-auto flex gap-3 pl-14 pr-4 py-2">
          {shuffledImages.map((imagePath, index) => (
            <button
              key={imagePath}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden transition-all duration-200 ring-2 focus:outline-none focus-visible:ring-amber-300 ${
                index === selectedIndex ? 'ring-amber-400 scale-105 shadow-lg' : 'ring-transparent hover:ring-white/50 opacity-70 hover:opacity-100'
              }`}
            >
              <GitHubImage
                manifest={manifest}
                path={imagePath}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;