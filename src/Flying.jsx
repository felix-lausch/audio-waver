import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import vertexShader from './lib/standard.vert?raw';
import hypnoticVertexShader from './lib/hypnotic.vert?raw';
import fragmentShader from './lib/standard.frag?raw';
import pulsatingFragmentShader from './lib/pulsating.frag?raw';

function Flying() {
  let sceneManager, audioContext, audioElement, dataArray, analyser, source;

  useEffect(() => {
    sceneManager = new SceneInit("threejscanvas");
    sceneManager.initScene();
    sceneManager.camera.rotation.x = -Math.PI / 15;
    sceneManager.camera.position.z = 200;
    sceneManager.camera.position.y = 3;

    sceneManager.animate();
  }, []);

  function play() {
    if (!audioContext) {
      setupAudioContext();
    }
    
    const uniforms = {
      u_time: {
        type: "f",
        value: 1.0,
      },
      u_amplitude: {
        type: "f",
        value: 0.03,
      },
      u_data_arr: {
        type: "float[128]",
        value: dataArray,
      },
    };

    const planeGeo = new THREE.PlaneGeometry(64, 64, 64, 64);
    // const planeMat = new THREE.MeshNormalMaterial({ wireframe: true })
    const planeMat = new THREE.ShaderMaterial({
      uniforms: uniforms, //dataArray, time
      vertexShader: `
        varying float x;
        varying float y;
        varying float z;
        varying vec3 vUv;
        
        uniform float u_time;
        uniform float[128] u_data_arr;
        uniform float u_amplitude;
        
        void main() {
          vUv = position;

          x = abs(position.x);
          y = abs(position.y);
          z = abs(position.z);
      
          // float shifted_x = x + 64.0;
          // float shifted_y = y + 64.0;
          // float shifted_z = z + 64.0;
      
          float shifted_x = x + 0.0;
          float shifted_y = y + 0.0;
          float shifted_z = z + 0.0;

          float amplitude_at_x = u_data_arr[int(shifted_x)];
          float amplitude_at_y = u_data_arr[int(shifted_y)];

          float z = ((amplitude_at_x - 127.0) + (amplitude_at_y - 127.0)) * u_amplitude;

          // float z =  sin(position.x + u_time * 0.003) * .3;
          // float z =  sin((position.y * 0.50) + position.x + u_time * .003) * .3;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
        }
      `,
    //   fragmentShader: `
    //   varying float x;
    //   varying float y;
    //   varying float z;
    //   varying vec3 vUv;
  
    //   uniform float u_time;
  
    //   void main() {
    //     gl_FragColor = vec4((32.0 - abs(x)) / 32.0, (32.0 - abs(y)) / 32.0, (abs(x + y) / 2.0) / 32.0, 1.0);
    //   }
    // `,
      wireframe: true,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);

    // planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4
    planeMesh.rotation.x = Math.PI / 2;
    planeMesh.scale.x = 6;
    planeMesh.scale.y = 6;
    planeMesh.scale.z = 6;
    planeMesh.position.y = -4;

    sceneManager.scene.add(planeMesh);

    const render = (time) => {
      requestAnimationFrame(render);
      // planeMesh.position.z += 0.09;

      analyser.getByteFrequencyData(dataArray)

      uniforms.u_time.value = time
      uniforms.u_data_arr.value = dataArray
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
    source = audioContext.createMediaElementSource(audioElement)
    analyser = audioContext.createAnalyser()
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    analyser.fftSize = 256
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    audioElement.volume = 0.2
    console.log("FrequencyBinCount: " + analyser.frequencyBinCount)
  }
}

export default Flying;
