import React from "react";
import { VideoManager } from "./components/VideoManager";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
  const transcriber = useTranscriber();
  return (
    <div className="app">
      <h1>Speech Transcription Application</h1>
      <VideoManager transcriber={transcriber} />
      <Transcript transcribedData={transcriber.output} />
    </div>
  );
}

export default App;
