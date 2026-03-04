import { useState } from 'react';
import { FaDownload, FaCheck } from "react-icons/fa";
import { cn } from '../components/utils';

// Create a proxy URL for images that don't support CORS
export const getProxyUrl = (url) => {
  if (url.includes('dicebear')) return url; // dicebear supports CORS reliably
  if (url.includes('avataaars.io')) {
    // For avataaars.io, use a proxy which handles SVGs better
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }
  // Use weserv for other images
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
};

export const useAvatarDownload = (avatar, name) => {
  const [downloadStatus, setDownloadStatus] = useState(null); // 'downloading' | 'success' | null

  const handleImageDownload = async (e) => {
    e.stopPropagation();
    try {
      console.log('Setting status to downloading');
      setDownloadStatus('downloading');
      const fileName = `${name.firstName.toLowerCase()}-${name.lastName.toLowerCase()}-${avatar.type}`;
      
      // Create a temporary image to load the proxied URL for download
      const tempImg = new Image();
      const proxiedUrl = getProxyUrl(avatar.url);
      
      tempImg.crossOrigin = 'anonymous';  // Enable this since we're using the proxy
      tempImg.src = proxiedUrl;
      
      await new Promise((resolve, reject) => {
        tempImg.onload = resolve;
        tempImg.onerror = reject;
      });
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match image
      canvas.width = tempImg.naturalWidth;
      canvas.height = tempImg.naturalHeight;
      
      // Draw image onto canvas
      ctx.drawImage(tempImg, 0, 0);
      
      // For SVG (dicebear) or transparent avatars, ensure white background
      if (avatar.url.includes('dicebear') || avatar.url.includes('avataaars.io')) {
        // Save current state
        ctx.save();
        // Draw white background
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Restore state
        ctx.restore();
      }
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Setting status to success');
        setDownloadStatus('success');
        
        // Reset status after 2 seconds - now with no transition
        setTimeout(() => {
          setDownloadStatus(null);
        }, 2000);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error downloading image:', error);
      console.log('Error occurred, setting status to null');
      setDownloadStatus(null);
    }
  };

  return { downloadStatus, handleImageDownload };
};

const AvatarDownloadOverlay = ({ downloadStatus, handleImageDownload }) => {
  return (
    <div 
      onClick={handleImageDownload}
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-full cursor-pointer",
        downloadStatus ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        downloadStatus === 'success' ? "bg-green-500/50" : "bg-black/50",
        // Remove transition for instant disappearance when status changes to null
        downloadStatus === null ? "" : "transition-all duration-300"
      )}
    >
      {downloadStatus === 'downloading' ? (
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      ) : downloadStatus === 'success' ? (
        <FaCheck className="w-8 h-8 text-white" />
      ) : !downloadStatus && (
        <FaDownload className="w-8 h-8 text-white" />
      )}
    </div>
  );
};

export default AvatarDownloadOverlay; 