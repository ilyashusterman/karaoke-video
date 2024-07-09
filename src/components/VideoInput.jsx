import React, { useState, useRef, useEffect } from "react";

const VideoInput = ({ onVideoLoaded }) => {
  const [videoSrc, setVideoSrc] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoSrc(videoURL);
    }
  };

  const handleVideoLoaded = async () => {
    if (videoRef.current) {
      const videoBlob = await fetch(videoSrc).then((r) => r.blob());
      const videoBuffer = await videoBlob.arrayBuffer();

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(
        videoBuffer.slice(0)
      );

      onVideoLoaded(videoBuffer, audioBuffer);
    }
  };

  useEffect(() => {
    if (videoSrc) {
      videoRef.current.load();
    }
  }, [videoSrc]);

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          onLoadedData={handleVideoLoaded}
          controls
        />
      )}
    </div>
  );
};

export default VideoInput;
