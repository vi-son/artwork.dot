let canvas;
let song;
let fft;
let mic;
let sizeX;
let center = 0;
let binSize = 1024;
let spectrum;
let spuctrumAverages;

let circleCenterRadius;

let poissonWidth = 500;
let p = new PoissonDiskSampling({
  shape: [poissonWidth, poissonWidth],
  minDistance: 5,
  maxDistance: 30,
  tries: 5
});
let points = p.fill();

function preload() {
  // song = loadSound("mp3/shineon.mp3");
  song = loadSound("mp3/dmutr.mp3");
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  // song.play();
  // Microphone input
  // cnv.mousePressed(userStartAudio);
  mic = new p5.AudioIn();
  mic.start();
  // FFT
  fft = new p5.FFT();
  fft.smooth(0.9);
  fft.setInput(mic);
  sizeX = width / binSize;
}

function draw() {
  // Breathing
  let time = frameCount / 30.0;
  let breathe = 0.3 + (sin(time) * cos(time) + 1.0) / 2.0 / 2.0;
  let invBreathe = 0.3 + (1.0 - (sin(time) * cos(time) + 1.0) / 2.0) / 2.0;

  // FFT
  spectrum = fft.analyze();
  spectrumAverages = fft.linAverages(binSize);
  center = fft.getEnergy("bass");
  circleCenterRadius = map(pow(center, 2), 0, 255 * 255, 10, 100);

  background(255);

  //// Debugging
  // fill(0);
  // textAlign(LEFT);
  // text(`Frame: ${frameCount}`, 100, 100);
  // text(`Spectrum Bin Count: ${spectrum.length}`, 100, 120);

  // noFill();
  // stroke(0);
  // textAlign(CENTER);
  // let baseHeight = 10;
  // for (var i = 0; i < spectrum.length; i++) {
  //   var amp = spectrum[i];
  //   var y = map(amp, 0, 256, 0, height / 2);
  //   rect(i * sizeX, height - y - baseHeight, sizeX, baseHeight + y);
  // }

  translate(width / 2, height / 2);
  var waveRadius = 70;
  var radius = breathe * waveRadius;
  for (var p = 0; p < points.length; p++) {
    var point = points[p];
    var angle = atan2(point[1] - poissonWidth / 2, point[0] - poissonWidth / 2);

    //// Visualization description
    // fill(0);
    // let vizRadius = 300 - sin(((angle + PI) / TWO_PI) * 200.0) * 50;
    // text(
    //   `${Math.trunc(((angle + PI) * 180) / PI)}°`,
    //   vizRadius * cos(angle),
    //   vizRadius * sin(angle)
    // );

    let spectralIndex = Math.floor(((angle + PI) / TWO_PI) * spectrum.length);
    var energy = (spectrum[spectralIndex] / 100) * waveRadius;

    var distance = dist(poissonWidth / 2, poissonWidth / 2, point[0], point[1]);
    if (distance > 200 || distance < circleCenterRadius) continue;
    var wavePoint = [
      (radius + energy) * cos(angle),
      (radius + energy) * sin(angle)
    ];
    var distanceWavePoint = dist(0, 0, wavePoint[0], wavePoint[1]);
    var distancePointToWavePoint = dist(
      wavePoint[0],
      wavePoint[1],
      point[0] - poissonWidth / 2,
      point[1] - poissonWidth / 2
    );

    //// Wave
    // fill(0, 0, 255);
    // circle(wavePoint[0], wavePoint[1], 3);

    //// Poisson points
    noStroke();
    let circleRadius = map(
      0.5 - distancePointToWavePoint / waveRadius,
      0.3,
      0.5,
      0,
      5
    );
    fill(255 - circleRadius * 255);
    circle(
      point[0] - poissonWidth / 2,
      point[1] - poissonWidth / 2,
      circleRadius
    );
  }

  noStroke();
  fill(0);
  circle(0, 0, invBreathe + circleCenterRadius);
}

// function keyReleased() {
//   saveCanvas(canvas, new Date().toISOString(), "png");
// }
