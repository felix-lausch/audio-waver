import { useState, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import { vertexShader, fragmentShader } from "./lib/Shaders";

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
        value: 2.0,
      },
      u_data_arr: {
        type: "float[64]",
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
        uniform float[64] u_data_arr;
        
        void main() {
          vUv = position;

          x = abs(position.x);
          y = abs(position.y);
          z = abs(position.z);
      
          float floor_x = round(x);
          float floor_y = round(y);
          float floor_z = round(z);

          float test = u_data_arr[int(floor_x)] * .01;

          // float z =  sin(position.x + u_time * 0.003) * .3;
          // float z =  sin((position.y * 1.0) + position.x + u_time * .003) * .3;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, test, 1.0);
        }
      `,
      // fragmentShader: fragmentShader,
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
    audioElement.volume = 0.0;
  }
}

export default Flying;
