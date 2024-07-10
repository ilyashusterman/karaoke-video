import { useEffect, useRef } from "react";

export default function VideoPlayer(props) {
  const videoPlayer = useRef(null);
  const videoSource = useRef(null);

  // Updates src when url changes
  useEffect(() => {
    if (videoPlayer.current && videoSource.current) {
      videoSource.current.src = props.videoUrl;
      videoPlayer.current.load();
    }
  }, [props.videoUrl]);

  return (
    <div className="flex relative z-10 p-4 w-full mt-4">
      <video
        ref={videoPlayer}
        controls
        className="w-full h-56 rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10"
      >
        <source ref={videoSource} type={props.mimeType}></source>
      </video>
    </div>
  );
}
