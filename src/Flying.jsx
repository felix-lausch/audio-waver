import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import vertexShader from './lib/standard.vert?raw';
import hypnoticVertexShader from './lib/hypnotic.vert?raw';
import fragmentShader from './lib/standard.frag?raw';
import pulsatingFragmentShader from './lib/pulsating.frag?raw';

function Flying() {
  let sceneManager, audioContext, audioElement, dataArray, dataArrays, analyser, source;
  const bufferLength = 64;

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
      u_data_arr_size: {
        type: "f",
        value: 16,
      },
      u_data_arr: {
        type: "float[16]",
        value: dataArrays[0],
      },
    };

    const uniforms2 = {
      u_time: {
        type: "f",
        value: 1.0,
      },
      u_data_arr_size: {
        type: "f",
        value: 16,
      },
      u_data_arr: {
        type: "float[16]",
        value: dataArrays[1],
      },
    };

    const vertextShader = `
      varying float x;
      varying float y;
      varying float z;
      varying vec3 vUv;
      
      uniform float u_time;
      uniform float[16] u_data_arr;
      uniform float u_data_arr_size;
      
      void main() {
        vUv = position;

        x = position.x + 8.0;

        float amplitude_at_x = u_data_arr[int(x)];

        float fact = step(2., mod(x,5.0));
        float z = amplitude_at_x;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
      }
    `;

    const fragmentShader = `
      varying float x;
      varying float y;
      varying float z;
      varying vec3 vUv;
  
      uniform float u_time;
  
      void main() {
        gl_FragColor = vec4((32.0 - abs(x)) / 32.0, (32.0 - abs(y)) / 32.0, (abs(x + y) / 2.0) / 32.0, 1.0);
        gl_FragColor = vec4(vec3(1.0, 0.1, 0.1), 1.0);
      }
    `

    const planeGeo = new THREE.PlaneGeometry(15, 0.5, 15, 1);
    const planeMat = new THREE.ShaderMaterial({
      uniforms: uniforms, //dataArray, time
      vertexShader: vertextShader,
      fragmentShader: fragmentShader,
      wireframe: true,
    });

    const planeMat2 = new THREE.ShaderMaterial({
      uniforms: uniforms2, //dataArray, time
      vertexShader: vertextShader,
      fragmentShader: fragmentShader,
      wireframe: true,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    const planeMesh2 = new THREE.Mesh(planeGeo, planeMat2);

    // planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4
    planeMesh.rotation.x = Math.PI / -2;
    planeMesh.scale.x = 6;
    planeMesh.scale.y = 6;
    planeMesh.scale.z = 6;
    planeMesh.position.y = -4;

    planeMesh2.position.z += 8;
    planeMesh2.rotation.x = Math.PI / -2;
    planeMesh2.scale.x = 6;
    planeMesh2.scale.y = 6;
    planeMesh2.scale.z = 6;
    planeMesh2.position.y = -4;

    sceneManager.scene.add(planeMesh);
    sceneManager.scene.add(planeMesh2);

    const fps = 10.0;
    let lastUpdate = 0;

    const render = (time) => {
      if (time - lastUpdate >= 1000.0 / fps) {
        
        analyser.getFloatFrequencyData(dataArray)
        
        for (let i = 0; i < dataArrays.length; i++) {
          addToFront(dataArrays[i], dataArray[i], 16)
        }
        lastUpdate = time;
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
          src="./dnb-snippet.mp4"
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
    dataArray = new Float32Array(analyser.frequencyBinCount)
    const rows = 16;
    const cols = 2;
    
    dataArrays = [];
    for (let i = 0; i < rows; i++) {
      dataArrays[i] = [];
      for (let j = 0; j < cols; j++) {
        dataArrays[i][j] = 0; // or any default value
      }
    }
    
    audioElement.volume = 0.2
    console.log("FrequencyBinCount: " + analyser.frequencyBinCount)
  }

  function addToFront(array, value, maxLength) {
    array.unshift(value);
    if (array.length > maxLength) {
      array.pop();
    }
    return array;
  }
}

export default Flying;
