import React, { useEffect, useState } from "react";

import Modal from "./modal/Modal";
import VideoInput from "./VideoInput";
import { TranscribeButton } from "./TranscribeButton";
import Constants from "../utils/Constants";
import Progress from "./Progress";

const LANGUAGES = Constants.LANGUAGES;

export function VideoManager(props) {
  const [progress, setProgress] = useState(undefined);
  const [videoData, setVideoData] = useState(undefined);

  const isVideoLoading = progress !== undefined;

  const setVideoFromDownload = async (data, mimeType) => {
    const audioCTX = new AudioContext({
      sampleRate: Constants.SAMPLING_RATE,
    });
    const blobUrl = URL.createObjectURL(new Blob([data], { type: "audio/*" }));
    const decoded = await audioCTX.decodeAudioData(data);
    setVideoData({
      buffer: decoded,
      url: blobUrl,
      source: "URL",
      mimeType: mimeType,
    });
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        <VideoInput
          onVideoLoaded={(videoElement, audioBuffer) => {
            props.transcriber.onInputChange();
            setVideoData({
              buffer: audioBuffer,
              url: videoElement.src,
              source: "VIDEO",
              mimeType: "video/*",
            });
          }}
        />
        {<AudioDataBar progress={isVideoLoading ? progress : +!!videoData} />}
      </div>
      {videoData && (
        <>
          <div className="relative w-full flex justify-center items-center">
            <TranscribeButton
              onClick={() => {
                props.transcriber.start(videoData.buffer);
              }}
              isModelLoading={props.transcriber.isModelLoading}
              isTranscribing={props.transcriber.isBusy}
            />
            <SettingsTile
              className="absolute right-4"
              transcriber={props.transcriber}
              icon={<SettingsIcon />}
            />
          </div>
          {props.transcriber.progressItems.length > 0 && (
            <div className="relative z-10 p-4 w-full">
              <label>Loading model files... (only run once)</label>
              {props.transcriber.progressItems.map((data) => (
                <div key={data.file}>
                  <Progress text={data.file} percentage={data.progress} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function SettingsTile(props) {
  const [showModal, setShowModal] = useState(true);

  const onClick = () => {
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <div className={props.className}>
      <Tile icon={props.icon} onClick={onClick} />
      <SettingsModal
        show={showModal}
        onClose={onClose}
        transcriber={props.transcriber}
      />
    </div>
  );
}

function SettingsModal(props) {
  const names = Object.values(LANGUAGES).map(titleCase);

  const models = {
    "Xenova/whisper-tiny": [41, 152],
    "Xenova/whisper-base": [77, 291],
    "Xenova/whisper-small": [249],
    "Xenova/whisper-medium": [776],
    "distil-whisper/distil-medium.en": [402],
    "distil-whisper/distil-large-v2": [767],
  };

  return (
    <Modal
      show={props.show}
      title={"Settings"}
      content={
        <>
          <label>Select the model to use.</label>
          <select
            className="mt-1 mb-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            defaultValue={props.transcriber.model}
            onChange={(e) => {
              props.transcriber.setModel(e.target.value);
            }}
          >
            {Object.keys(models)
              .filter(
                (key) => props.transcriber.quantized || models[key].length === 2
              )
              .filter(
                (key) =>
                  !props.transcriber.multilingual ||
                  !key.startsWith("distil-whisper/")
              )
              .map((key) => (
                <option key={key} value={key}>{`${key}${
                  props.transcriber.multilingual ||
                  key.startsWith("distil-whisper/")
                    ? ""
                    : ".en"
                } (${
                  models[key][props.transcriber.quantized ? 0 : 1]
                }MB)`}</option>
              ))}
          </select>
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex">
              <input
                id="multilingual"
                type="checkbox"
                checked={props.transcriber.multilingual}
                onChange={(e) => {
                  props.transcriber.setMultilingual(e.target.checked);
                }}
              />
              <label htmlFor={"multilingual"} className="ms-1">
                Multilingual
              </label>
            </div>
            <div className="flex">
              <input
                id="quantize"
                type="checkbox"
                checked={props.transcriber.quantized}
                onChange={(e) => {
                  props.transcriber.setQuantized(e.target.checked);
                }}
              />
              <label htmlFor={"quantize"} className="ms-1">
                Quantized
              </label>
            </div>
          </div>
          {props.transcriber.multilingual && (
            <>
              <label>Select the source language.</label>
              <select
                className="mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                defaultValue={props.transcriber.language}
                onChange={(e) => {
                  props.transcriber.setLanguage(e.target.value);
                }}
              >
                {Object.keys(LANGUAGES).map((key, i) => (
                  <option key={key} value={key}>
                    {names[i]}
                  </option>
                ))}
              </select>
              <label>Select the task to perform.</label>
              <select
                className="mt-1 mb-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                defaultValue={props.transcriber.subtask}
                onChange={(e) => {
                  props.transcriber.setSubtask(e.target.value);
                }}
              >
                <option value={"transcribe"}>Transcribe</option>
                <option value={"translate"}>Translate (to English)</option>
              </select>
            </>
          )}
        </>
      }
      onClose={props.onClose}
      onSubmit={() => {}}
    />
  );
}

function AudioDataBar(props) {
  return <ProgressBar progress={`${Math.round(props.progress * 100)}%`} />;
}

function ProgressBar(props) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
      <div
        className="bg-blue-600 h-1 rounded-full transition-all duration-100"
        style={{ width: props.progress }}
      ></div>
    </div>
  );
}

function Tile(props) {
  return (
    <button
      onClick={props.onClick}
      className="flex items-center justify-center rounded-lg p-2 bg-blue text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
    >
      <div className="w-7 h-7">{props.icon}</div>
      {props.text && (
        <div className="ml-2 break-text text-center text-md w-30">
          {props.text}
        </div>
      )}
    </button>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.25"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function titleCase(str) {
  str = str.toLowerCase();
  return (str.match(/\w+.?/g) || [])
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}
