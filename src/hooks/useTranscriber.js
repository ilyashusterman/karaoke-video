import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useWorker } from "./useWorker";
import Constants from "../utils/Constants";

export function useTranscriber() {
  const [transcript, setTranscript] = useState(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [progressItems, setProgressItems] = useState([]);

  const webWorker = useWorker((event) => {
    const message = event.data;
    switch (message.status) {
      case "progress":
        setProgressItems((prev) =>
          prev.map((item) => {
            if (item.file === message.file) {
              return { ...item, progress: message.progress };
            }
            return item;
          })
        );
        break;
      case "update":
        const updateMessage = message;
        setTranscript({
          isBusy: true,
          text: updateMessage.data[0],
          chunks: updateMessage.data[1].chunks,
        });
        break;
      case "complete":
        const completeMessage = message;
        setTranscript({
          isBusy: false,
          text: completeMessage.data.text,
          chunks: completeMessage.data.chunks,
        });
        setIsBusy(false);
        break;
      case "initiate":
        setIsModelLoading(true);
        setProgressItems((prev) => [...prev, message]);
        break;
      case "ready":
        setIsModelLoading(false);
        break;
      case "error":
        setIsBusy(false);
        alert(
          `${message.data.message} This is most likely because you are using Safari on an M1/M2 Mac. Please try again from Chrome, Firefox, or Edge.\n\nIf this is not the case, please file a bug report.`
        );
        break;
      case "done":
        setProgressItems((prev) =>
          prev.filter((item) => item.file !== message.file)
        );
        break;
      default:
        break;
    }
  });

  const [model, setModel] = useState(Constants.DEFAULT_MODEL);
  const [subtask, setSubtask] = useState(Constants.DEFAULT_SUBTASK);
  const [quantized, setQuantized] = useState(Constants.DEFAULT_QUANTIZED);
  const [multilingual, setMultilingual] = useState(
    Constants.DEFAULT_MULTILINGUAL
  );
  const [language, setLanguage] = useState(Constants.DEFAULT_LANGUAGE);

  const onInputChange = useCallback(() => {
    setTranscript(undefined);
  }, []);

  const postRequest = useCallback(
    async (audioData) => {
      if (audioData) {
        setTranscript(undefined);
        setIsBusy(true);

        let audio;
        if (audioData.numberOfChannels === 2) {
          const SCALING_FACTOR = Math.sqrt(2);
          let left = audioData.getChannelData(0);
          let right = audioData.getChannelData(1);

          audio = new Float32Array(left.length);
          for (let i = 0; i < audioData.length; ++i) {
            audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
          }
        } else {
          audio = audioData.getChannelData(0);
        }
        const sampleRate = audioData.sampleRate;
        const chunkSize = sampleRate * 10; // 10 seconds worth of samples

        for (let start = 0; start < audio.length; start += chunkSize) {
          const end = Math.min(start + chunkSize, audio.length);
          const audioChunk = audio.slice(start, end);

          webWorker.postMessage({
            audio: audioChunk,
            model,
            multilingual,
            quantized,
            subtask: multilingual ? subtask : null,
            language: multilingual && language !== "auto" ? language : null,
          });

          await new Promise((resolve) => setTimeout(resolve, 1000)); // Ensure messages are sent separately
        }
      }
    },
    [webWorker, model, multilingual, quantized, subtask, language]
  );

  const transcriber = useMemo(() => {
    return {
      onInputChange,
      isBusy,
      isModelLoading,
      progressItems,
      start: postRequest,
      output: transcript,
      model,
      setModel,
      multilingual,
      setMultilingual,
      quantized,
      setQuantized,
      subtask,
      setSubtask,
      language,
      setLanguage,
    };
  }, [
    isBusy,
    isModelLoading,
    progressItems,
    postRequest,
    transcript,
    model,
    multilingual,
    quantized,
    subtask,
    language,
  ]);

  return transcriber;
}
