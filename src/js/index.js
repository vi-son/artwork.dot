import React, { createRef } from "react";
import ReactDOM from "react-dom";
import p5 from "p5";
import "../p5/p5.sound.min.js";
import PoissonDiskSampling from "poisson-disk-sampling";
// Style imports
import "../sass/logo.sass";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.sketchRef = createRef();
  }

  Sketch(p) {
    let song;
    let canvas;
    let brandColor;
    let backgroundColor;

    let center = 0;
    let circleCenterRadius;
    let innerRadius;
    let outerRadius;

    let fadeIn = 0;
    let poissonWidth;
    let sizeX;

    let points;

    let fft;
    let spectrum;
    let spectrumAverages;
    let mic;

    let octaveBands;

    const setupParameters = (radius = 15) => {
      poissonWidth = 500;
      innerRadius = radius;
      outerRadius = innerRadius * 10;
      let p = new PoissonDiskSampling({
        shape: [poissonWidth, poissonWidth],
        minDistance: innerRadius,
        maxDistance: outerRadius,
        tries: 5
      });
      points = p.fill();
    };

    p.preload = () => {
      song = p.loadSound("/assets/mp3/foyer.20201025.mp3");
    };

    p.setup = () => {
      p.frameRate(60);
      const wrapper = document.querySelector("#logo-canvas-wrapper");
      const size = wrapper.getBoundingClientRect();
      canvas = p.createCanvas(size.width, size.height);
      canvas.parent("logo-canvas-wrapper");
      brandColor = p.color(50, 48, 69);
      backgroundColor = p.color(241, 239, 238);
      setupParameters(10);
      // Analysis
      const binSize = 1024;
      fft = new p5.FFT(0.0, binSize);
      fft.setInput(song);
      song.play();
      fft.smooth(0.75);
      sizeX = p.width / 2 / binSize;
      octaveBands = fft.getOctaveBands(1);
    };

    p.draw = () => {
      // Fade in
      fadeIn = 1.0;
      var dotColor = p.lerpColor(backgroundColor, brandColor, fadeIn);
      // Breathing
      let time = p.frameCount / 30.0;
      let breathe = 0.65 + (p.sin(time) * p.cos(time) + 1.0) / 3.0;
      let invBreathe =
        0.75 + (1.0 - (p.sin(time) * p.cos(time) + 1.0) / 2.0) * 10.0;

      // FFT
      spectrum = fft.analyze();
      spectrumAverages = fft.logAverages(octaveBands);
      var spectrumAveragesRev = spectrumAverages.slice().reverse();
      spectrumAverages = spectrumAverages.concat(spectrumAveragesRev);
      center = fft.getEnergy("bass");
      circleCenterRadius = p.map(
        p.pow(center, 2),
        0,
        255 * 255,
        innerRadius,
        innerRadius * 6
      );
      // Clear
      p.background(backgroundColor);
      //
      p.translate(p.width / 2, p.height / 2);
      var waveRadius = outerRadius;
      var radius = breathe * waveRadius;
      for (var pt = 0; pt < points.length; pt++) {
        var point = points[pt];
        var angle = p.atan2(
          point[1] - poissonWidth / 2,
          point[0] - poissonWidth / 2
        );
        let spectralIndex = Math.floor(
          ((((angle + time) % p.PI) + p.PI) / p.TWO_PI) *
            spectrumAverages.length
        );
        var amp = spectrumAverages[spectralIndex] / 512;
        var energy = waveRadius * amp;

        var distance = p.dist(
          poissonWidth / 2,
          poissonWidth / 2,
          point[0],
          point[1]
        );
        if (distance > innerRadius * 40 || distance < circleCenterRadius)
          continue;
        var wavePoint = [
          (radius + energy) * p.cos(angle),
          (radius + energy) * p.sin(angle)
        ];
        var distanceWavePoint = p.dist(0, 0, wavePoint[0], wavePoint[1]);
        var distancePointToWavePoint = p.dist(
          wavePoint[0],
          wavePoint[1],
          point[0] - poissonWidth / 2,
          point[1] - poissonWidth / 2
        );

        //// Poisson points
        p.noStroke();
        let circleRadius = p.map(
          0.5 - distancePointToWavePoint / waveRadius,
          0.3,
          0.5,
          0,
          innerRadius
        );
        p.fill(
          p.lerpColor(
            dotColor,
            p.color(241, 239, 238),
            255 - circleRadius * 255
          )
        );
        p.circle(
          point[0] - poissonWidth / 2,
          point[1] - poissonWidth / 2,
          circleRadius
        );
      }
      p.noStroke();
      p.fill(dotColor);
      p.circle(0, 0, invBreathe + circleCenterRadius);
    };
  }

  componentDidMount() {
    this.sketch = new p5(this.Sketch, this.sketchRef.current);
  }

  render() {
    return (
      <div>
        <div className="ui">
          <button className="button" id="button-song">
            Song
          </button>
          <button className="button" id="button-mic">
            Mic
          </button>
        </div>
        <div id="logo-canvas-wrapper" data-song="mp3/foyer.20201025.mp3"></div>
        <div ref={this.sketchRef}></div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#mount"));
