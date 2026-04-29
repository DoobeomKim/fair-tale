import React, { useEffect, useRef } from 'react';

export interface VideoStreamProps {
  pin: string;
  muted?: boolean;
  className?: string;
  stream?: MediaStream | null;
}

export const VideoStream: React.FC<VideoStreamProps> = ({
  pin,
  muted = false,
  className = '',
  stream
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // 스트림 설정
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        <span className="text-gray-400">No video</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}; 