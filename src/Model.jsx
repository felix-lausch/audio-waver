import { useRef, useEffect } from "react";
import * as THREE from "three";
import SceneInit from "./lib/SceneInit";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export default function Graph() {
  const modelLoadedRef = useRef(false);
  let sceneManager;
  let mixer;
  let audioContext, audioElement, dataArray, analyser, source, bufferLength, animations;
  let bars;

  useEffect(() => {
    if (modelLoadedRef.current) return; // Skip if already loaded

    sceneManager = new SceneInit("threejscanvas");
    sceneManager.initScene();
    sceneManager.camera.position.z = 20
    sceneManager.camera.position.y += 1
    sceneManager.animate();

    const loader = new GLTFLoader();

    modelLoadedRef.current = true;

    loader.load('/models/model.glb', (model) => {
      sceneManager.scene.add(model.scene);
      animations = model.animations;
      mixer = new THREE.AnimationMixer(model.scene);

      console.log("Model loaded and added to scene");
    });
  }, [])

  let animationId = null;
  let isPlaying = false;
  const clock = new THREE.Clock();

  function play() {
    if (!audioContext) {
      setupAudioContext();
    }

    if (!bars) {
      setupBars();
    }

    if (isPlaying === true) return; // Prevent multiple render loops
    isPlaying = true;

    mixer.clipAction(animations[0]).play();

    const render = (time) => {
      analyser.getByteFrequencyData(dataArray);
      
      for (let i = 0; i < bufferLength; i++) {
        const y = (dataArray[i] / 128.0) * 200;
        const bar = bars[i];
        bar.scale.y = y;
      }
      
      mixer.update((time - lastTime) / 1000.0);
      animationId = requestAnimationFrame(render);
    };

    render();
  }

  function pause() {
    mixer.clipAction(animations[0]).stop()
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
          autoPlay={false}
        />
      </div>
      <canvas id="threejscanvas"></canvas>
    </div>
  );

  function setupBars() {
    const geometry = new THREE.PlaneGeometry(1, 4);
    const material = new THREE.MeshBasicMaterial({
      color: "orange",
      side: THREE.DoubleSide,
    });

    bars = [];

    for (let i = 0; i < bufferLength; i++) {
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = i * 3;
      bar.position.y = -100;
      bar.position.z = -100;

      bars.push(bar);
      sceneManager.scene.add(bar);
    }
  }

  function setupAudioContext() {
    audioContext = new window.AudioContext();
    audioElement = document.getElementById("audioPlayer");
    audioElement.volume = 0.2;
    source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    console.debug("Bufferlength: " + bufferLength)
    console.debug("AudioContext initialized")
  }

  function setupAnimations() {
    if (!sceneManager) return

    const loader = new GLTFLoader();

    loader.load('/models/model.glb', (model) => {
      console.log(model)
      sceneManager.scene.add(model.scene);

      // Play animations if available
      if (model.animations.length == 0) {
        console.warn("no animations found in .glb")
        return
      }

      animations = model.animations;
      mixer = new THREE.AnimationMixer(model.scene);
      console.log(mixer)

      const clipAction = mixer.clipAction(animations[0]);
      clipAction.play();
    });
  }
}