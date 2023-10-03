import { useState, useEffect } from 'react'
import * as THREE from "three";
import SceneInit from "./lib/SceneInit"
import { vertexShader, hypnoticVertexShader, fragmentShader, pulsatingFragmentShader } from "./lib/Shaders";

function App() {
  let test, audioContext, audioElement, dataArray, analyser, source;

  useEffect(() => {
    test = new SceneInit("threejscanvas")
    test.initScene()
    test.camera.position.z = 200
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
      vertexShader: vertexShader,
      // vertexShader: `
      //   varying float x;
      //   varying float y;
      //   varying float z;
      //   varying vec3 vUv;
        
      //   uniform float u_time;
      //   uniform float[128] u_data_arr;
      //   uniform float u_amplitude;
        
      //   void main() {
      //     vUv = position;

      //     x = abs(position.x);
      //     y = abs(position.y);
      //     z = abs(position.z);
      
      //     // float shifted_x = x + 64.0;
      //     // float shifted_y = y + 64.0;
      //     // float shifted_z = z + 64.0;
      
      //     float shifted_x = x + 0.0;
      //     float shifted_y = y + 0.0;
      //     float shifted_z = z + 0.0;

      //     float amplitude_at_x = u_data_arr[int(shifted_x)];
      //     float amplitude_at_y = u_data_arr[int(shifted_y)];

      //     float z = ((amplitude_at_x - 127.0) + (amplitude_at_y - 127.0)) * u_amplitude;

      //     // float z =  sin(position.x + u_time * 0.003) * .3;
      //     // float z =  sin((position.y * 0.50) + position.x + u_time * .003) * .3;

      //     gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
      //   }
      // `,
      fragmentShader: fragmentShader,
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

    // planeMesh.position.z = 33
    // planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4
    // planeMesh.scale.x = 2
    // planeMesh.scale.y = 2
    // planeMesh.scale.z = 2

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
