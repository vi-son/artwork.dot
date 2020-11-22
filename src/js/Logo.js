// node_modules imports
import React, { createRef } from "react";
import ReactDOM from "react-dom";
import p5 from "p5";
import PoissonDiskSampling from "poisson-disk-sampling";
// Local imports
import "../p5/p5.sound.min.js";
// Style imports
import "../sass/logo.sass";

class Logo extends React.Component {
  constructor(props) {
    super(props);
    this.sketchRef = createRef();
  }

  Sketch(p) {
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

    let song;

    p.stopAudio = () => {
      song.stop();
    };

    const setupParameters = (radius = 15) => {
      poissonWidth = 300;
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
      song = p.loadSound("/assets/mp3/logo.exhibition.20201121.mp3");
    };

    p.setup = () => {
      console.log("Setup");
      p.frameRate(60);
      const wrapper = document.querySelector("#logo-canvas-wrapper");
      const size = wrapper.getBoundingClientRect();
      canvas = p.createCanvas(size.width, size.height);
      canvas.parent(wrapper);
      brandColor = p.color(50, 48, 69);
      backgroundColor = p.color(221, 219, 218);
      setupParameters(10);
      // Analysis
      const binSize = 64;
      fft = new p5.FFT(0.0, binSize);
      fft.smooth(0.75);
      sizeX = p.width / 2 / binSize;
      octaveBands = fft.getOctaveBands(1);
      fft.setInput(song);
      song.play();
    };

    p.draw = () => {
      // Fade in
      fadeIn = p.frameCount / 100;
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
          p.lerpColor(dotColor, backgroundColor, 255 - circleRadius * 255)
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
    console.log("Component Did Mount");
    if (this.props.entered === false) {
      return;
    }
    if (this.sketch === undefined) {
      this.sketch = new p5(this.Sketch, this.sketchRef.current);
    }
  }

  render() {
    return (
      <>
        <main
          onClick={() => {
            this.props.onEnter();
          }}
          className="logo-main"
        >
          <div
            ref={this.sketchRef}
            id="logo-canvas-wrapper"
            data-song="mp3/foyer.20201025.mp3"
          ></div>
        </main>
        <nav>
          <button
            className="btn-back"
            onClick={() => {
              this.sketch.stopAudio();
              this.sketch.remove();
              this.props.onBack();
            }}
          >
            Zurück
          </button>
        </nav>
      </>
    );
  }
}

export default Logo;
