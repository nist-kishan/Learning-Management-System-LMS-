import { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

const VideoPlayer = ({ videoUrl, onCompleted }) => {
  const videoRef = useRef(null);

  // If videoUrl changes, reload the video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleEnded = () => {
    if (onCompleted) {
      onCompleted();
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/5 shadow-2xl">
      {videoUrl ? (
        <video
          ref={videoRef}
          controls
          onEnded={handleEnded}
          className="w-full h-full object-contain"
          controlsList="nodownload"
        >
          <source src={getFullUrl(videoUrl)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-gray-400 mb-4 animate-pulse">
            <Play className="w-7 h-7" />
          </div>
          <p className="font-semibold text-sm">No Video Selected</p>
          <p className="text-xs text-gray-600 mt-1">Select a lecture from the sidebar to begin watching</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
