function App() {
  const canvasId = "threejscanvas"
  let audioContext, audioElement, frequencies = [], analyser, source
  let fps = 60.0, pathBufferSize = 20, lineWidth = 0.2
  let r = 0, g = 0, b = 0;
  let animationId = null;
  let isPlaying = false;

  const colors = [
    "rgb(0 0 0)",
    "rgb(255 255 255)",
    "rgb(255 0 0)",
    "rgb(0 255 0)",
    "rgb(0 0 255)",
    "rgb(255 255 0)",
    "rgb(0 255 255)",
    "rgb(255 0 255)",
    "rgb(192 192 192)",
    "rgb(128 128 128)",
    "rgb(128 0 0)",
    "rgb(128 128 0)",
    "rgb(0 128 0)",
    "rgb(128 0 128)",
    "rgb(0 128 128)",
    "rgb(255 165 0)",
    "rgb(210 105 30)",
    "rgb(220 20 60)",
    "rgb(0 191 255)",
    "rgb(138 43 226)",
  ]

  function play() {
    if (!audioContext) {
      setupAudioContext()
    }

    if (isPlaying) return; // Prevent multiple render loops
    isPlaying = true;

    const canvas = document.getElementById(canvasId)
    const canvasCtx = canvas.getContext("2d");
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;

    canvasCtx.fillStyle = "rgb(200 100 200)";
    let reset = 0

    let lastUpdate = 0;
    // const updateInterval = 6.9445; // in ms, e.g. 144fps
    // const updateInterval = 16.6667; // in ms, e.g. 16.6ms = 60fps
    // const updateInterval = 60; // in ms, e.g. 16.6ms = 60fps
    const paths = []
    const byteFrequencies = new Uint8Array(frequencies.length)

    const render = (time) => {
      if (time - lastUpdate >= 1000.0 / fps) {
        analyser.getByteTimeDomainData(frequencies)
        analyser.getByteFrequencyData(byteFrequencies)
  
        canvasCtx.fillStyle = "rgb(200 100 200)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        while (paths.length >= pathBufferSize) {
          paths.shift()
        }

        const sliceWidth = WIDTH / frequencies.length;
        let x = 0;
        const path = new Path2D();
  
        for (let i = 0; i < frequencies.length; i++) {
          const v = frequencies[i] / 128.0;
          const y = v * (HEIGHT / 2);

          if (i === 0) {
            path.moveTo(x, y);
          } else {
            path.lineTo(x, y);
          }
  
          x += sliceWidth;
        }
  
        path.lineTo(WIDTH, HEIGHT / 2);
        paths.push({
          path: path,
          color: colors[0]
        })

        // const barWidth = (WIDTH / byteFrequencies.length) * 3
  
        // let barX = 0
        // let barHeight = 0
        // for (let i = 0; i < byteFrequencies.length; i++) {
        //   barHeight = byteFrequencies[i] / 1;
        //   canvasCtx.fillStyle = `rgb(${barHeight + 80} 50 50)`;
        //   canvasCtx.fillRect(barX, HEIGHT - barHeight / 2, barWidth, barHeight);

        //   barX += barWidth;
        // }

        for (let i = 0; i < paths.length; i++) {
          const alpha = (i / (paths.length - 1));
  
          // Set stroke color (RGB grayscale)
          canvasCtx.strokeStyle = `rgb(${r} ${g} ${b} / ${alpha})`;
          canvasCtx.lineWidth = lineWidth
          canvasCtx.stroke(paths[i].path)
        }

        reset = (reset + 1) % 20
        lastUpdate = time;
      }
      
      animationId = requestAnimationFrame(render)
    }

    render()
  }

  // function play() {
  //   if (!audioContext) {
  //     setupAudioContext()
  //   }

  //   if (isPlaying) return; // Prevent multiple render loops
  //   isPlaying = true;

  //   const canvas = document.getElementById(canvasId)
  //   const canvasCtx = canvas.getContext("2d");
  //   let WIDTH = canvas.width;
  //   let HEIGHT = canvas.height;

  //   canvasCtx.fillStyle = "rgb(200 100 200)";
  //   canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  //   canvasCtx.lineWidth = 2;

  //   let lastUpdate = 0;
  //   let reset = 0
  //   // const updateInterval = 6.9445; // in ms, e.g. 144fps
  //   const updateInterval = 16.6667; // in ms, e.g. 16.6ms = 60fps

  //   const render = (time) => {
  //     if (time - lastUpdate >= updateInterval) {
  //       analyser.getByteFrequencyData(frequencies)
  
  //       if (reset === 0) {
  //         canvasCtx.fillStyle = "rgb(0 0 0)";
  //         canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  //       }
  
  //       const barWidth = (WIDTH / frequencies.length) * 4.5
  
  //       let x = 0
  //       let barHeight = 0
  //       for (let i = 0; i < frequencies.length; i++) {
  //         barHeight = frequencies[i] / 2;
  //         canvasCtx.fillStyle = `rgb(${barHeight + 80} 50 50)`;
  //         canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

  //         x += barWidth;
  //       }
  
  //       lastUpdate = time;
  //     }
      
  //     animationId = requestAnimationFrame(render)
  //   }

  //   render()
  // }

  function pause() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
      isPlaying = false;
    }
  }

  function setupAudioContext() {
    audioContext = new window.AudioContext()

    audioElement = document.getElementById("audioPlayer")
    // audioElement.volume = 0.2
    audioElement.currentTime = 0

    source = audioContext.createMediaElementSource(audioElement)
    analyser = audioContext.createAnalyser()
    source.connect(analyser)

    analyser.connect(audioContext.destination)
    analyser.fftSize = 1024 * 2
    frequencies = new Uint8Array(analyser.frequencyBinCount)
    // frequencies = new Float32Array(analyser.frequencyBinCount)

    const selectElement = document.getElementById('songSelect');

    // Change audio source when selection changes
    selectElement.addEventListener('change', (event) => {
      // Update audio source and play
      audioElement.src = event.target.value;
      audioElement.load(); // Required for some browsers
      audioElement.play().catch(e => console.log('Auto-play prevented:', e));
    });

    // Change audio source when selection changes
    document.getElementById('fpsSelect').addEventListener('change', (event) => {
      fps = event.target.value;
      console.log("Changed fps to: " + fps)
    });

    document.getElementById('pathBufferSize').addEventListener('change', (event) => {
      pathBufferSize = event.target.value
      console.log("Changed path count to:" + pathBufferSize)
    })

    document.getElementById('lineWidth').addEventListener('change', (event) => {
      lineWidth = event.target.value
      console.log("Changed line width to:" + event.target.value)
    })

    document.getElementById('color').addEventListener('change', (event) => {
      const color = event.target.value
      r = parseInt(color.substr(1,2), 16)
      g = parseInt(color.substr(3,2), 16)
      b = parseInt(color.substr(5,2), 16)

      console.log()
      console.log("Changed line color to: rgb(" + `${r} ${g} ${b})`)
    })
  }

  return (
    <div className="bg-orange-300 flex flex-grow flex-col">
      <div className="absolute top-2 left-20 flex flex-row-reverse gap-1">
        <div className="w-20 flex flex-col">
          <label htmlFor="color">Line color:</label>
          <input type="color" id="color" ></input>
        </div>
        <div className="w-20 flex flex-col">
          <label htmlFor="pathBufferSize">Line count:</label>
          <input type="range" id="pathBufferSize" min="1" max="50" defaultValue={pathBufferSize}></input>
        </div>
        <div className="w-20 flex flex-col">
          <label htmlFor="lineWidth">Line width:</label>
          <input type="number" id="lineWidth" min="0.1" max="5" step="0.1" defaultValue={lineWidth}></input>
        </div>
        <select id="fpsSelect" defaultValue={60.0}>
          <option value={144.0}>144</option>
          <option value={60.0}>60</option>
          <option value={30.0}>30</option>
          <option value={20.0}>20</option>
          <option value={10.0}>10</option>
          <option value={5.0}>5</option>
          <option value={3.0}>3</option>
          <option value={2.0}>2</option>
          <option value={1.0}>1</option>
        </select>
        <select id="songSelect">
          <option value="./lofi-snippet.mp4">LoFi</option>
          <option value="./Unknown Artist - Untitled 02.mp3">Untitled</option>
          <option value="./Orange Shirt Kid Dances To XXXTentacion.mp3">XXX</option>
          <option value="./dnb-snippet.mp4">DnB</option>
        </select>
        <audio
          id="audioPlayer"
          src="./lofi-snippet.mp4"
          className="w-80"
          controls
          autoPlay
          onPlay={play}
          onPause={pause}
        />
      </div>
      <canvas id={canvasId}></canvas>
    </div>
  )
}

export default App
