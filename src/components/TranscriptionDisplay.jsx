import React, { useEffect, useState, useCallback } from "react";

function TranscriptionDisplay({ transcriber }) {
  const [transcription, setTranscription] = useState("");

  useEffect(() => {
    if (transcriber.output) {
      setTranscription(
        (prevTranscription) => prevTranscription + " " + transcriber.output.text
      );
    }
  }, [transcriber.output]);

  return (
    <div className="transcription-display">
      <h2>Transcription Output</h2>
      <div>{transcription}</div>
    </div>
  );
}

export default TranscriptionDisplay;
