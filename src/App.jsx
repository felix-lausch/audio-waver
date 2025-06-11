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
  let test, audioContext, audioElement, dataArray, analyser, source;

  useEffect(() => {
    test = new SceneInit(canvasId)
    test.initScene()
    test.camera.position.z = 900
    test.camera.position.x = 64
    test.camera.position.y = 64
    test.animate()
  }, [])

  function play() {
    if (!audioContext) {
      setupAudioContext()
    }

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

    const planeGeo = new THREE.PlaneGeometry(64, 64, 64, 64)
    const planeMat = new THREE.ShaderMaterial({
      uniforms: uniforms, //dataArray, time
      vertexShader: strongVertexShader,
      fragmentShader: pulsatingFragmentShader,
      wireframe: true,
    })

    const planeMesh = new THREE.Mesh(planeGeo, planeMat)
    
    const planeMesh2 = new THREE.Mesh(planeGeo, planeMat)
    planeMesh2.position.y = 128

    const planeMesh3 = new THREE.Mesh(planeGeo, planeMat)
    planeMesh3.position.x = 128

    const planeMesh4 = new THREE.Mesh(planeGeo, planeMat)
    planeMesh4.position.x = 128
    planeMesh4.position.y = 128

    planeMesh.scale.x = 2
    planeMesh.scale.y = 2
    planeMesh.scale.z = 2

    planeMesh2.scale.x = 2
    planeMesh2.scale.y = 2
    planeMesh2.scale.z = 2

    planeMesh3.scale.x = 2
    planeMesh3.scale.y = 2
    planeMesh3.scale.z = 2

    planeMesh4.scale.x = 2
    planeMesh4.scale.y = 2
    planeMesh4.scale.z = 2

    test.scene.add(planeMesh)
    test.scene.add(planeMesh2)
    test.scene.add(planeMesh3)
    test.scene.add(planeMesh4)

    const render = (time) => {
      analyser.getByteFrequencyData(dataArray)
      uniforms.u_time.value = time
      uniforms.u_data_arr.value = dataArray

      requestAnimationFrame(render)
    }

    render()
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
          autoPlay
          onPlay={play}
        />
      </div>
      <canvas id={canvasId}></canvas>
    </div>
  )

  function setupAudioContext() {
    audioContext = new window.AudioContext()
    audioElement = document.getElementById("audioPlayer")
    audioElement.volume = 0.2
    audioElement.currentTime = 200
    source = audioContext.createMediaElementSource(audioElement)
    analyser = audioContext.createAnalyser()
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    analyser.fftSize = 1024
    dataArray = new Uint8Array(analyser.frequencyBinCount)
  }
}

export default App
