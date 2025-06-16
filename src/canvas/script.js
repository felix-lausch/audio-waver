window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = this.window.innerWidth * 0.8;
  canvas.height = this.window.innerHeight * 0.8;

  ctx.fillStyle = "green";
  // ctx.fillRect(50, 50, 100, 100);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";

  let size = 100;
  let sides = 9;
  let maxCount = 10;
  let spread = 1.4;

  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.scale(1, 1);
  ctx.rotate(0);

  function drawBranch(count) {
    if (count > 4) {
      console.log("drew branchas")
      return
    };

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    ctx.save();
    ctx.translate(size/2.0, size/2.0);
    ctx.rotate(spread);
    ctx.scale(0.8, 0.8);
    drawBranch(count + 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(size/2.0, size/2.0);
    ctx.rotate(-spread);
    ctx.scale(0.8, 0.8);
    drawBranch(count + 1);
    ctx.restore();
  }

  drawBranch(0);
  // for (let i = 0; i < sides; i++) {
  //   drawBranch(0);
  //   ctx.scale(0.80, 0.80);
  //   ctx.translate(30, 50);
  // }


  // ctx.beginPath();
  // ctx.moveTo(0,0);
  // ctx.lineTo(size, 0);
  // ctx.stroke();
  
  // ctx.restore();
});

// function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
