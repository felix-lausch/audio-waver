import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import vertexShader from './lib/test.vert?raw';
import fragmentShader from './lib/test.frag?raw';

export default function ShaderTest() {
  let sceneManager;
  let audioContext, audioElement, dataArray, analyser, source, bufferLength;
  let mesh, uniforms;

  useEffect(() => {
    sceneManager = new SceneInit("threejscanvas");
    sceneManager.initScene();
    sceneManager.camera.position.z = 7
    sceneManager.animate();
  }, []);

  let animationId = null;
  let isPlaying = false;

  function play() {
    if (!audioContext) {
      setupAudioContext();
    }

    if (!mesh) {
      setupMesh();
    }

    if (isPlaying === true) return; // Prevent multiple render loops
    isPlaying = true;
    const fps = 60.0
    let lastUpdate = 0

    const render = (time) => {
      if (time - lastUpdate >= 1000.0 / fps) {
        analyser.getByteTimeDomainData(dataArray);
        // analyser.getByteFrequencyData(dataArray);

        // mesh.rotation.x += 0.01

        lastUpdate = updateShaders(time);
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
          onPause={pause}
          autoPlay
        />
      </div>
      <canvas id="threejscanvas"></canvas>
    </div>
  );

  function updateShaders(time) {
    // console.log((time % 10.0) / 10.0)
    uniforms.u_time.value = time;
    uniforms.u_data_arr.value = dataArray;

    return time
  }

  function setupMesh() {
    uniforms = {
      u_time: { value: 1.0 },
      u_radius: { value: 0.2 },
      u_amplitude: { value: 2.0 },
      u_data_arr: { value: dataArray },
    };

    // const geometry = new THREE.PlaneGeometry(2, 2, 10, 10);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      // wireframe: true
    })

    mesh = new THREE.Mesh(geometry, material);
    sceneManager.scene.add(mesh);
    sceneManager.gui.add(material.uniforms.u_radius, "value").min(0).max(1);
  }

  function setupAudioContext() {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("audioPlayer");
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 128;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    console.debug("Bufferlength: " + bufferLength)
    console.debug("AudioContext initialized")
  }
}
