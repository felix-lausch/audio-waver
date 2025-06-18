window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = this.window.innerWidth;
  canvas.height = this.window.innerHeight;

  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 5;
  ctx.shadowBlur = 10;

  //fractal variables
  let size = canvas.width < canvas.height ? canvas.width * 0.3 : canvas.height * 0.3;
  const maxLevel = 4;
  const branches = 2;
  let sides = 5;
  let scale = 0.7;
  let spread = 0.9;
  let color = 'hsl(' + Math.random() * 360 + ', 100%, 50%)';

  //controls
  const randomizeButton = this.document.getElementById("randomizeButton");
  const resetButton = this.document.getElementById("resetButton");

  const sidesSlider = this.document.getElementById("sides");
  const sidesLabel = this.document.querySelector('[htmlFor="sides"]');
  
  const spreadSlider = this.document.getElementById("spread");
  const spreadLabel = this.document.querySelector('[htmlFor="spread"]');

  function drawBranch(level) {
    if (level > maxLevel) return

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    for (let i = 0; i < branches; i++) {
      ctx.save();
      ctx.translate(size - (size/branches) * i, 0);
      ctx.scale(scale , scale);

      ctx.save();
      ctx.rotate(spread);
      drawBranch(level + 1);
      ctx.restore();
      ctx.restore();
    }

    ctx.beginPath()
    ctx.arc(0,size, size * 0.1, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawFractal() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.translate(canvas.width/2, canvas.height/2);

    for(let i = 0; i < sides; i++) {
      ctx.rotate((Math.PI * 2)/sides);
      drawBranch(0);
    }

    ctx.restore();
  }

  drawFractal();

  randomizeButton.addEventListener("click", () => {
    randomizeFractal();
    drawFractal();
  })

  resetButton.addEventListener("click", () => {
    resetFractal()
    drawFractal()
  })

  sidesSlider.addEventListener("change", (e) => {
    sides = e.target.value
    updateSliders()
    drawFractal()
  })

  spreadSlider.addEventListener("change", (e) => {
    spread = e.target.value
    updateSliders()
    drawFractal()
  })

  function randomizeFractal() {
    sides = Math.floor(Math.random() * 13 + 2);
    scale = Math.random() * 0.4 + 0.4;
    spread = Math.random() * 6.2 - 3.1;
    color = 'hsl(' + Math.random() * 360 + ', 100%, 50%)';
    updateSliders()
  }

  function resetFractal() {
    sides = 5;
    scale = 0.5;
    spread = 0.7;
    color = 'hsl(290, 100%, 50%)';
    updateSliders()
  }

  function updateSliders() {
    sidesLabel.innerText = 'Sides: ' + Number(sides).toFixed(1)
    sidesSlider.value = sides;

    spreadLabel.innerText = 'Spread: ' + Number(spread).toFixed(2)
    spreadSlider.value = spread;
  }

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // size = window.innerWidth < window.innerHeight ? window.innerWidth * 0.3 : window.innerHeight * 0.3;
    drawFractal()
  })
});

