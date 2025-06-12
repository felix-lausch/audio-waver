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
  let scene, audioContext, audioElement, frequencies = [], analyser, source, mesh;
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
      value: frequencies,
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

  const [band, setBand] = useState(0)

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

    const bassHistory = [];
    const maxHistory = 2;

    const render = (time) => {
      if (time - lastUpdate >= updateInterval) {
        analyser.getByteFrequencyData(frequencies)
        uniforms.u_time.value = time
        uniforms.u_data_arr.value = frequencies

        // mesh.rotation.z += 0.005

        const melBands = getMelBands(frequencies)

        // const bass = normalizeFrequencies(frequencies.slice(12, 22))
        // const bass = getBass(frequencies)

        const bass = melBands[0] / 255
        const mid = melBands[2] / 255
        const treble = melBands[4] / 255
        // console.log(bass)

        bassHistory.push(bass);
        if (bassHistory.length > maxHistory) bassHistory.shift();

        const smoothedBass = ((bassHistory.reduce((a, b) => a + b, 0) / bassHistory.length) * 100) / 100;

        mesh.scale.setScalar(0.5 + smoothedBass)
        // mesh.rotation.x = -mid
        mesh.rotation.z = treble * 2.7
        // mesh.material.uniforms.u_midEnergy.value = smoothedBass
        lastUpdate = time;
        // console.log(frequencies)
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
    frequencies = new Uint8Array(analyser.frequencyBinCount)
  }

  function getBass(frequencies) {
    const bands = 3;
    let bass = 0;
    for (let i = 0; i < bands; i++) {
      bass += frequencies[i];
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

  function normalizeFrequencies(frequencies) {
    return (frequencies.reduce((a, b) => a + b) / frequencies.length) / 255
  }

  return (
    <div className="bg-orange-300 flex flex-grow flex-col">
      <div className="absolute top-2 left-20">
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
        <button
          className="w-80 bg-white"
          onClick={() => {
            setBand(curr => (curr + 1) % 6)
          }}>
          
            {band}
        </button>
      </div>
      <canvas id={canvasId}></canvas>
    </div>
  )
}

function hzToMel(f) {
  return 2595 * Math.log10(1 + f / 700);
}

function melToHz(m) {
  return 700 * (Math.pow(10, m / 2595) - 1);
}

function getMelBands(dataArray, sampleRate = 44100, fftSize = 1024, melBands = 6) {
  const minHz = 0;
  const maxHz = sampleRate / 2;
  const melMin = hzToMel(minHz);
  const melMax = hzToMel(maxHz);

  const melStep = (melMax - melMin) / melBands;
  const freqBinSize = sampleRate / fftSize;

  let bands = [];

  for (let i = 0; i < melBands; i++) {
    const melStart = melMin + i * melStep;
    const melEnd = melStart + melStep;

    const freqStart = melToHz(melStart);
    const freqEnd = melToHz(melEnd);

    const binStart = Math.floor(freqStart / freqBinSize);
    const binEnd = Math.ceil(freqEnd / freqBinSize);

    let sum = 0;
    for (let j = binStart; j <= binEnd; j++) {
      sum += dataArray[j] || 0;
    }

    bands.push(sum / (binEnd - binStart + 1));
  }

  return bands;
}

// Group (Octave-like)	Frequency Range (Hz)	Approx Bins (fftSize=1024)
// Sub-bass	20–40	0–1
// Bass	40–80	1–2
// Low Mids	80–160	2–4
// Mids	160–320	4–7
// High Mids	320–640	7–15
// Presence	640–1280	15–30
// Brilliance	1280–5120+	30–127

export default App
