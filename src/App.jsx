import React, { useState } from "react";
import { VideoManager } from "./components/VideoManager";
import TranscriptionDisplay from "./components/TranscriptionDisplay";
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
  const transcriber = useTranscriber();
  return (
    <div className="app">
      <h1>Speech Transcription Application</h1>
      <VideoManager transcriber={transcriber} />
      <TranscriptionDisplay transcriber={transcriber} />
    </div>
  );
}

export default App;
