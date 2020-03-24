var song;
var fft;
var sizeX;

var poissonWidth = 500;
var p = new PoissonDiskSampling({
  shape: [poissonWidth, poissonWidth],
  minDistance: 20,
  maxDistance: 30,
  tries: 3
});
var points = p.fill();

function preload() {
  song = loadSound("mp3/shineon.mp3");
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  // song.play();
  let binSize = 32;
  fft = new p5.FFT(0, 256);
  sizeX = width / binSize;
}

function draw() {
  background(255);
  noStroke();
  fill(0);
  for (var p = 0; p < points.length; p++) {
    var point = points[p];
    var distance = dist(
      width / 2,
      height / 2,
      width / 2 + point[0] - poissonWidth / 2,
      height / 2 + point[1] - poissonWidth / 2
    );
    circle(
      width / 2 + point[0] - poissonWidth / 2,
      height / 2 + point[1] - poissonWidth / 2,
      0.2 + (1 - distance / poissonWidth) * 5
    );
    stroke(0);
    line(
      width / 2,
      height / 2,
      width / 2 + point[0] - poissonWidth / 2,
      height / 2 + point[1] - poissonWidth / 2
    );
  }
  // var spectrum = fft.analyze();
  // for (var i = 0; i < spectrum.length; i += sizeX) {
  //   var amp = spectrum[i];
  //   var y = map(amp, 0, 256, 100, 0);
  //   rect(i, 0, i + sizeX, y);
  // }
}
