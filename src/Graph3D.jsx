import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";

export default function Graph3D() {
  let sceneManager;
  let audioContext, audioElement, dataArray, analyser, source, bufferLength;
  let bars;
  let barsZ = -100;

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

    if (!bars) {
      createBars(barsZ);
    }

    const render = (time) => {
      // analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray);

      // console.log(dataArray)

      for (let i = 0; i < bufferLength; i++) {
        const bar = bars[i];
        bar.scale.y = (dataArray[i] / 128.0) * 20;
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

  function createBars(z) {
    const geometry = new THREE.BoxGeometry(1, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      color: "orange",
      side: THREE.DoubleSide,
    });

    bars = [];

    for (let i = 0; i < bufferLength; i++) {
      const bar = new THREE.Mesh(geometry, material);
      
      bar.position.x = (i * 3) - 125;
      bar.position.y = 0;
      bar.position.z = z;

      bars.push(bar);
      sceneManager.scene.add(bar);
    }
  }

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
    
    console.debug("Bufferlength: " + bufferLength)
    console.debug("AudioContext initialized")
  }
}
