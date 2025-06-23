import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import {AudioAnalyzer} from "./lib/AudioAnalyser";

function Flying() {
  let sceneManager, audioContext, audioElement, dataArray, dataArrays, analyser, audioAnalyzer, source, u_time = 1.0, mesh;
  const bufferLength = 300;
  const rows = 8;

  useEffect(() => {
    sceneManager = new SceneInit("threejscanvas");
    sceneManager.initScene();
    sceneManager.camera.rotation.x = -Math.PI / 15;
    sceneManager.camera.position.z = 200;
    sceneManager.camera.position.y = 3;

    sceneManager.animate();
  }, []);

  let animationId = null;
  let isPlaying = false;

  function play() {
    if (!audioContext) {
      setupAudioContext();
    }

    if (!mesh) {
      setupMesh()
    }

    if (isPlaying) return
    isPlaying = true
    
    const fps = 60.0;
    let lastUpdate = 0;

    const render = (time) => {
      if (time - lastUpdate >= 1000.0 / fps) {
        
        // analyser.getByteFrequencyData(dataArray)
        dataArray = audioAnalyzer.getLogFrequencies();

        for (let i = 0; i < dataArrays.length; i++) {
          addToFront(dataArrays[i], dataArray[i], bufferLength)
        }
        u_time = time;
        lastUpdate = time;
      }

      animationId = requestAnimationFrame(render);
    };

    render();
  }

  function pause() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
      isPlaying = false;
    }
  }

  function setupMesh() {
    const vertextShader = `
      varying float x;
      varying float y;
      varying float z;
      varying vec3 vUv;
      
      uniform float u_time;
      uniform float[${bufferLength}] u_data_arr;
      uniform float u_data_arr_size;
      
      void main() {
        vUv = position;

        x = position.x + (u_data_arr_size / 2.0);

        z = (u_data_arr[int(x)] / 255.0);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z * 100.0, 1.0);
      }
    `;

    const fragmentShader = `
      varying float x;
      varying float y;
      varying float z;
      varying vec3 vUv;
  
      uniform float u_time;
      uniform float u_data_arr_size;
  
      void main() {
        float b = 1.0 - (x / u_data_arr_size) + 0.1;
        gl_FragColor = vec4(b, z, 1.0 - z, 1.0);
      }
    `

    const planeGeo = new THREE.PlaneGeometry(bufferLength - 1, 0.5, bufferLength, 10);

    for (let i = 0; i < rows; i++) {
      const uniforms = {
        u_time: {
          type: "f",
          value: u_time,
        },
        u_data_arr_size: {
          type: "f",
          value: bufferLength,
        },
        u_data_arr: {
          type: `float[${bufferLength}]`,
          value: dataArrays[i],
        },
      };

      const planeMat = new THREE.ShaderMaterial({
        uniforms: uniforms, //dataArray, time
        vertexShader: vertextShader,
        fragmentShader: fragmentShader,
        wireframe: true,
      });

      const planeMesh = new THREE.Mesh(planeGeo, planeMat);

      planeMesh.position.z += (i * 14);
      planeMesh.rotation.x = Math.PI / -2;
      planeMesh.position.y = -40;

      sceneManager.scene.add(planeMesh);
      mesh = true;
    }
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
          onPause={pause}
          autoPlay={true}
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

    audioAnalyzer = new AudioAnalyzer(analyser, {
      outputBins: rows,
      scale: "byte"
    });

    dataArray = new Uint8Array(analyser.frequencyBinCount)
    dataArrays = [];
    for (let i = 0; i < bufferLength; i++) {
      dataArrays[i] = [];
      for (let j = 0; j < rows; j++) {
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
