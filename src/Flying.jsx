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

    const planeGeo = new THREE.PlaneGeometry(64, 64, 64, 64);
    // const planeMat = new THREE.MeshNormalMaterial({ wireframe: true })
    const planeMat = new THREE.ShaderMaterial({
      // uniforms: uniforms, //dataArray, time
      vertexShader: `
        varying float x;
        varying float y;
        varying float z;

        uniform float u_time;
        uniform float[64] u_data_arr;

        void main() {
          // float z = sin(abs(position.x) + abs(position.y) + u_time * .003);
          float idk = position.x - (2.0 * floor(position.x / 2.0));
          
          if (idk == 0.0){
            float z = 1.0;
          }
          else {
            float z = 0.0
          }

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
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
      planeMesh.position.z += 0.09;
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
