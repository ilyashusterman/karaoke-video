import React from "react";
import { VideoManager } from "./components/VideoManager";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

import "./App.css";

function App() {
  const transcriber = useTranscriber();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="container flex flex-col justify-center items-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl text-center">
          Make karaoke video
        </h1>
        <h2 className="mt-3 mb-5 px-4 text-center text-1xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          ML-powered karaoke video maker from music video , adds transcript ,
          directly in your browser
        </h2>
        <VideoManager transcriber={transcriber} />
        <Transcript transcribedData={transcriber.output} />
      </div>

      <div className="absolute bottom-4">
        Made with{" "}
        <a
          className="underline"
          href="https://github.com/ilyashusterman/karaoke-video"
        >
          onnx Github
        </a>
      </div>
    </div>
  );
}

export default App;
