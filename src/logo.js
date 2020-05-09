let canvas;
let song;
let fft;
let mic;
let sizeX;
let center = 0;
let binSize = 64;
let spectrum;
let spectrumAverages;
let logAverages;
let octaveBands;
let buttonSong;
let buttonMic;
let brandcolor;

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
  const wrapper = document.querySelector("#logo-canvas-wrapper");
  const songURL = wrapper.getAttribute("data-song");
  song = loadSound(songURL);
}

function switchToSong() {
  if (mic !== undefined) mic.stop();
  song.play();
  fft.setInput(song);
}

function switchToMic() {
  // Microphone input
  if (song !== null) song.stop();
  mic = new p5.AudioIn();
  mic.start();
  fft.setInput(mic);
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  canvas.parent("logo-canvas-wrapper");
  brandColor = color(50, 48, 69);
  // FFT
  fft = new p5.FFT(0.0, binSize);
  fft.smooth(0.5);
  sizeX = width / binSize;
  octaveBands = fft.getOctaveBands(1);

  const buttonSong = document.querySelector("#button-song");
  buttonSong.addEventListener("click", () => {
    switchToSong();
  });
  const buttonMic = document.querySelector("#button-mic");
  buttonMic.addEventListener("click", () => {
    switchToMic();
  });
}

function draw() {
  // Breathing
  let time = frameCount / 15.0;
  let breathe = 0.75 + (sin(time) * cos(time) + 1.0) / 3.0;
  let invBreathe = 0.75 + (1.0 - (sin(time) * cos(time) + 1.0) / 2.0) * 10.0;

  // FFT
  spectrum = fft.analyze();
  spectrumAverages = fft.linAverages();
  var spectrumAveragesRev = spectrumAverages.slice().reverse();
  spectrumAverages = spectrumAverages.concat(spectrumAveragesRev);
  center = fft.getEnergy("bass");
  circleCenterRadius = map(pow(center, 2), 0, 255 * 255, 5, 30);

  background(241, 239, 238);

  //// Debugging
  // fill(0);
  // textAlign(LEFT);
  // text(`Frame: ${frameCount}`, 100, 100);
  // text(`Spectrum Bin Count: ${spectrum.length * 2}`, 100, 120);

  // noFill();
  // stroke(0);
  // textAlign(CENTER);
  // let baseHeight = 10;
  // for (var i = 0; i < spectrum.length * 2; i++) {
  //   var amp = spectrum[i];
  //   var y = map(amp, 0, 256, 0, height / 2);
  //   rect(i * sizeX, height - y - baseHeight, sizeX, baseHeight + y);
  // }
  //// Debugging

  translate(width / 2 - 50, height / 2);
  var waveRadius = 50;
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

    let spectralIndex = Math.floor(
      ((((angle + time) % PI) + PI) / TWO_PI) * spectrumAverages.length
    );
    var amp = spectrumAverages[spectralIndex] / 255;
    var energy = waveRadius * amp + amp * 50.0;

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
    fill(lerpColor(brandColor, color(241, 239, 238), 255 - circleRadius * 255));
    circle(
      point[0] - poissonWidth / 2,
      point[1] - poissonWidth / 2,
      circleRadius
    );
  }

  noStroke();
  fill(brandColor);
  circle(0, 0, invBreathe + circleCenterRadius);
}

// function keyReleased() {
//   saveCanvas(canvas, new Date().toISOString(), "png");
// }
