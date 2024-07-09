import React from "react";
import AudioInput from "./components/AudioInput";
import TranscriptionDisplay from "./components/TranscriptionDisplay";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Speech Transcription Application</h1>
      <AudioInput />
      <TranscriptionDisplay />
    </div>
  );
}

export default App;
