// components/GitHubImage.tsx
import React, { useState, useEffect } from 'react';
import { Manifest } from '../services/contentService';
import { incrementImageRequest, getImageRequestCount } from '../services/contentService';

interface GitHubImageProps {
  manifest: Manifest | null;
  path: string;
  alt: string;
  className?: string;
  placeholderCat?: string;
  placeholderType?: string;
}

const buildImageUrl = (manifest: Manifest, path: string): string => {
  const { user, repo, branch } = manifest.data.git;
  return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
};

const GitHubImage: React.FC<GitHubImageProps> = ({ manifest, path, alt, className, placeholderCat, placeholderType }) => {
  const [currentSrc, setCurrentSrc] = useState('');
  const [hasErrored, setHasErrored] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const getPlaceholderUrl = React.useCallback(() => {
    if (!manifest) return '';
    const placeholders = manifest.data.images?.misc?.placeholders;
    if (!placeholders) return '';

    let fallbackPaths: string[] = [];
    if (placeholderCat && placeholderType) {
        const category = placeholders[placeholderCat as keyof typeof placeholders];
        if (category && typeof category === 'object' && !Array.isArray(category)) {
            const typePaths = category[placeholderType as keyof typeof category];
            if (Array.isArray(typePaths) && typePaths.length > 0) {
                fallbackPaths = typePaths;
            }
        }
    }

    if (fallbackPaths.length === 0) fallbackPaths = placeholders.unknown || [];

    if (fallbackPaths.length > 0) {
        const randomPath = fallbackPaths[Math.floor(Math.random() * fallbackPaths.length)];
        return buildImageUrl(manifest, randomPath);
    }
    return '';
  }, [manifest, placeholderCat, placeholderType]);

  useEffect(() => {
    if (!manifest) return;

    const safeMode = manifest.settings.safe_mode;
    const isMasterOn = safeMode.on;
    
    // 1. Check Global Blocks
    if (isMasterOn && safeMode.override.images.block_all_images) {
        setIsBlocked(true);
        setCurrentSrc(getPlaceholderUrl());
        return;
    }

    // 2. Check Low Bandwidth Mode (Forced placeholders)
    if (isMasterOn && safeMode.override.performance.low_bandwidth_mode) {
        setCurrentSrc(getPlaceholderUrl());
        return;
    }

    // 3. Check Request Limits
    if (isMasterOn && safeMode.override.images.limit_image_requests.on) {
        const max = safeMode.override.images.limit_image_requests.max;
        if (getImageRequestCount() >= max) {
            console.warn(`[SAFE_MODE] Image request limit (${max}) reached. Using placeholder for: ${path}`);
            setIsBlocked(true);
            setCurrentSrc(getPlaceholderUrl());
            return;
        }
    }

    // If passed all checks, set source and increment global counter
    if (path) {
        incrementImageRequest();
        setCurrentSrc(buildImageUrl(manifest, path));
        setIsBlocked(false);
    } else {
        setCurrentSrc(getPlaceholderUrl());
    }
    
    setHasErrored(false);
  }, [path, manifest, getPlaceholderUrl]);

  const handleError = () => {
    if (hasErrored) return;
    setHasErrored(true);
    const placeholderUrl = getPlaceholderUrl();
    if (placeholderUrl) setCurrentSrc(placeholderUrl);
  };

  if (!manifest) {
    return <div className={`bg-gray-700 animate-pulse ${className}`} />;
  }
  
  if (!currentSrc) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center text-gray-500 text-xs text-center p-2 ${className}`}>
        <p>{isBlocked ? '[IMAGE BLOCKED]' : alt}</p>
      </div>
    );
  }
  
  return <img src={currentSrc} alt={alt} className={className} loading="lazy" onError={handleError} />;
};

export default GitHubImage;
