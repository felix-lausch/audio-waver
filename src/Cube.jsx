import { useState, useEffect } from 'react'
import * as THREE from "three";
import SceneInit from "./lib/SceneInit"
import vertexShader from './lib/standard.vert?raw';
import strongVertexShader from './lib/strong.vert?raw';
import hypnoticVertexShader from './lib/hypnotic.vert?raw';
import fragmentShader from './lib/standard.frag?raw';
import pulsatingFragmentShader from './lib/pulsating.frag?raw';

function App() {
  const canvasId = "threejscanvas"
  let scene, audioContext, audioElement, dataArray, analyser, source, mesh;
  let animationId = null;
  let isPlaying = false;

  const uniforms = {
    u_time: {
      type: "f",
      value: 1.0,
    },
    u_amplitude: {
      type: "f",
      value: 2.0,
    },
    u_data_arr: {
      type: "float[64]",
      value: dataArray,
    },
  };

  useEffect(() => {
    const sceneInit = new SceneInit(canvasId)
    sceneInit.initScene()
    sceneInit.camera.position.z = 300
    // test.camera.position.x = 64
    // test.camera.position.y = 64
    sceneInit.animate()

    scene = sceneInit.scene
  }, [])


  let lowestBass = 255
  let highestBass = 0

  function play() {
    if (!audioContext) {
      setupAudioContext()
    }

    if (!mesh) {
      setupMesh()
    }

    if (isPlaying) return; // Prevent multiple render loops
    isPlaying = true;

    let lastUpdate = 0;
    // const updateInterval = 6.9445; // in ms, e.g. 144fps
    const updateInterval = 16.6667; // in ms, e.g. 16.6ms = 60fps
    let smoothedBass = 0;

    const bassHistory = [];
    const maxHistory = 3;

    const render = (time) => {
      if (time - lastUpdate >= updateInterval) {
        analyser.getByteFrequencyData(dataArray)
        uniforms.u_time.value = time
        uniforms.u_data_arr.value = dataArray

        // mesh.rotation.z += 0.005

        const bass = getBass(dataArray)

        bassHistory.push(bass);
        if (bassHistory.length > maxHistory) bassHistory.shift();

        const smoothedBass = bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length;
        const smoothedRoundedBass = (smoothedBass * 100) / 100;

        mesh.scale.setScalar(0.5 + smoothedRoundedBass)
        lastUpdate = time;
      }

      animationId = requestAnimationFrame(render)
    }

    render()
  }

  function pause() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
      isPlaying = false;

      console.log("Highest: " + highestBass)
      console.log("Lowest: " + lowestBass)
    }
  }

  function setupMesh() {
    const geo = new THREE.BoxGeometry(64, 64, 64)
    const mat = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geo, mat)

    mesh.rotation.x = 0.5
    mesh.rotation.y = 0.5

    scene.add(mesh)
    console.log("Mesh added to scene")
  }

  function setupAudioContext() {
    audioContext = new window.AudioContext()

    audioElement = document.getElementById("audioPlayer")
    audioElement.volume = 0.2
    audioElement.currentTime = 0

    source = audioContext.createMediaElementSource(audioElement)
    analyser = audioContext.createAnalyser()
    source.connect(analyser)

    analyser.connect(audioContext.destination)
    analyser.fftSize = 1024
    dataArray = new Uint8Array(analyser.frequencyBinCount)
  }

  function getBass(dataArray) {
    const bands = 5;
    let bass = 0;
    for (let i = 0; i < bands; i++) {
      bass += dataArray[i];
    }

    bass /= bands; // average energy in bass range
    const bassNormalized = bass / 255; // round to two digits

    if (bass < lowestBass && bass > 0) {
      lowestBass = bassNormalized
    }

    if (bass > highestBass) {
      highestBass = bassNormalized
    }

    return bassNormalized
  }

  return (
    <div className="bg-orange-300 flex flex-grow flex-col">
      <div className="absolute bottom-2 right-2">
        <audio
          id="audioPlayer"
          src="./lofi-snippet.mp4"
          // src="./Unknown Artist - Untitled 02.mp3"
          // src="./Orange Shirt Kid Dances To XXXTentacion.mp3"
          className="w-80"
          controls
          autoPlay
          onPlay={play}
          onPause={pause}
        />
      </div>
      <canvas id={canvasId}></canvas>
    </div>
  )
}

export default App
