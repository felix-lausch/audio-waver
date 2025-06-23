import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import { BPMDetector } from "./lib/BPMDetector";

export default function Graph3D() {
  let sceneManager, bpmDetector;
  let audioContext, audioElement, dataArray, analyser, source, bufferLength;

  useEffect(() => {
    sceneManager = new SceneInit("threejscanvas");
    sceneManager.initScene();
    sceneManager.camera.position.z = 190
    sceneManager.animate();
  }, []);

  function play() {
    if (!audioContext) {
      setupAudioContext();
    }

    let sec;
    const render = (time) => {
      const currentTimeMs = performance.now();
      bpmDetector.update(currentTimeMs);

      const currSec = Math.round(currentTimeMs / 1000.0);
      if (sec != currSec && currSec % 1 === 0) {
        const bpm = bpmDetector.getBPM();
        // console.log("BPM: " + bpm)
        console.log(bpm)
        sec = currSec;
      }

      // analyser.getByteTimeDomainData(dataArray);
      // analyser.getByteFrequencyData(dataArray);

      // console.log(dataArray)

      requestAnimationFrame(render);
    };

    render();
  }

  return (
    <div className="bg-orange-300 flex flex-grow flex-col">
      <div className="absolute bottom-2 right-2">
        <audio
          id="audioPlayer"
          src="./Unknown Artist - Untitled 02.mp3"
          // src="./Orange Shirt Kid Dances To XXXTentacion.mp3"
          className="w-80"
          controls
          onPlay={play}
          autoPlay
        />
      </div>
      <canvas id="threejscanvas"></canvas>
    </div>
  );

  function setupAudioContext() {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("audioPlayer");
    audioElement.volume = 1;
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    bpmDetector = new BPMDetector(analyser, { bufferTimeSec: 8 });
    
    console.debug("Bufferlength: " + bufferLength)
    console.debug("AudioContext initialized")
  }
}
