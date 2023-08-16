import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";

export default function Graph() {
  let sceneManager;
  let audioContext, audioElement, dataArray, analyser, source, bufferLength;
  let bars = [];

  useEffect(() => {
    sceneManager = new SceneInit("threejscanvas");
    sceneManager.initScene();
    sceneManager.camera.position.z = 200
    sceneManager.animate();
  }, []);

  function play() {
    if (!audioContext) {
      setupAudioContext();
    }

    if (!bars) {
      setupBars();
    }

    const render = (time) => {
      // analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray);

      console.log(dataArray)

      for (let i = 0; i < bufferLength; i++) {
        const bar = bars[i];
        const y = (dataArray[i] / 128.0) * 200;
        bar.scale.y = y;
      }

      requestAnimationFrame(render);
    };

    render();
  }

  return (
    <div className="bg-orange-300 flex flex-grow flex-col">
      <div className="absolute bottom-2 right-2">
        <audio
          id="audioPlayer"
          // src="./Unknown Artist - Untitled 02.mp3"
          src="./Orange Shirt Kid Dances To XXXTentacion.mp3"
          className="w-80"
          controls
          onPlay={play}
          autoPlay
        />
      </div>
      <canvas id="threejscanvas"></canvas>
    </div>
  );

  function setupBars() {
    const geometry = new THREE.PlaneGeometry(1, 4);
    const material = new THREE.MeshBasicMaterial({
      color: "orange",
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < bufferLength; i++) {
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = i * 3;
      bar.position.y = -100;
      bar.position.z = -100;

      bars.push(bar);
      sceneManager.scene.add(bar);
    }
  }

  function setupAudioContext() {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("audioPlayer");
    audioElement.volume = 0.2;
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    console.debug("Bufferlength: " + bufferLength)
    console.debug("AudioContext initialized")
  }
}
