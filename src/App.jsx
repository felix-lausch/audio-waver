import { useState, useEffect } from 'react'
import * as THREE from "three";
import SceneInit from "./lib/SceneInit"
import { vertexShader, fragmentShader } from "./lib/Shaders";

function App() {
  let test, audioContext, audioElement, dataArray, analyser, source;

  useEffect(() => {
    test = new SceneInit("threejscanvas")
    test.initScene()
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
    // const planeMat = new THREE.MeshNormalMaterial({ wireframe: true })
    const planeMat = new THREE.ShaderMaterial({
      uniforms: uniforms, //dataArray, time
      vertexShader: vertexShader,
    //   vertexShader: `
    //   varying float x;
    //   varying float y;
    //   varying float z;

    //   uniform float u_time;
    //   uniform float[64] u_data_arr;

    //   void main() {
    //     float z = sin(abs(position.x) + abs(position.y) + u_time * .003);
    //     gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
    //   }
    // `,
      // fragmentShader: fragmentShader,
      wireframe: true,
    })
    const planeMesh = new THREE.Mesh(planeGeo, planeMat)
  
    planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4
    planeMesh.scale.x = 2
    planeMesh.scale.y = 2
    planeMesh.scale.z = 2
    planeMesh.position.y = 8

    test.scene.add(planeMesh)

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
          onPlay={play}
        />
      </div>
      <canvas id="threejscanvas"></canvas>
    </div>
  )

  function setupAudioContext() {
    audioContext = new window.AudioContext()
    audioElement = document.getElementById("audioPlayer")
    audioElement.volume = 0.2
    source = audioContext.createMediaElementSource(audioElement)
    analyser = audioContext.createAnalyser()
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    analyser.fftSize = 1024
    dataArray = new Uint8Array(analyser.frequencyBinCount)
  }
}

export default App
